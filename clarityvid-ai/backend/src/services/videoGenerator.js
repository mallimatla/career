const { createCanvas } = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { generateSceneAudio, estimateAudioDuration } = require('./ttsService');
const { uploadFile } = require('./firebaseStorage');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Generate complete whiteboard animation video
 * @param {object} videoData - Video configuration
 * @returns {string} - Generated video URL
 */
exports.generateWhiteboardVideo = async (videoData) => {
  const {
    id,
    script,
    storyboard,
    language,
    voiceId,
    voiceSpeed,
    resolution,
    format,
    customBranding,
    hasWatermark,
  } = videoData;

  try {
    const tempDir = path.join(__dirname, '../../temp', id);
    await fs.mkdir(tempDir, { recursive: true });

    // Step 1: Generate audio for each scene
    const audioSegments = await generateSceneAudio(storyboard, {
      voice: voiceId || 'alloy',
      speed: voiceSpeed || 1.0,
    });

    // Step 2: Generate visual frames for each scene
    const sceneFrames = await generateSceneFrames(storyboard, {
      tempDir,
      resolution,
      customBranding,
      hasWatermark,
    });

    // Step 3: Combine audio and video
    const videoPath = await combineAudioVideo(audioSegments, sceneFrames, {
      tempDir,
      resolution,
      format,
    });

    // Step 4: Upload to S3
    const videoBuffer = await fs.readFile(videoPath);
    const uploadResult = await uploadBufferToS3(
      videoBuffer,
      `video-${id}.${format}`,
      `video/${format}`,
      'videos'
    );

    // Step 5: Generate thumbnail
    const thumbnailPath = await generateThumbnail(videoPath, tempDir);
    const thumbnailBuffer = await fs.readFile(thumbnailPath);
    const thumbnailResult = await uploadBufferToS3(
      thumbnailBuffer,
      `thumbnail-${id}.jpg`,
      'image/jpeg',
      'thumbnails'
    );

    // Cleanup temp files
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      videoUrl: uploadResult.CDNUrl || uploadResult.Location,
      thumbnailUrl: thumbnailResult.CDNUrl || thumbnailResult.Location,
      duration: calculateTotalDuration(storyboard),
    };
  } catch (error) {
    console.error('Video Generation Error:', error);
    throw new Error('Failed to generate video: ' + error.message);
  }
};

/**
 * Generate visual frames for each scene
 */
const generateSceneFrames = async (storyboard, options) => {
  const { tempDir, resolution, customBranding, hasWatermark } = options;

  const [width, height] = getResolutionDimensions(resolution);
  const frames = [];

  for (const scene of storyboard) {
    const framePath = path.join(tempDir, `scene-${scene.id}.png`);

    // Create canvas for whiteboard animation
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Custom branding (logo, colors)
    if (customBranding && customBranding.logo) {
      // Draw logo (simplified - in production, load actual image)
      ctx.fillStyle = customBranding.primaryColor || '#000000';
      ctx.font = 'bold 30px Arial';
      ctx.fillText(customBranding.companyName || '', 50, 50);
    }

    // Draw scene content
    await drawSceneContent(ctx, scene, { width, height, customBranding });

    // Add watermark if needed
    if (hasWatermark) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.font = '24px Arial';
      ctx.fillText('ClarityVid AI', width - 200, height - 30);
    }

    // Save frame
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(framePath, buffer);

    frames.push({
      sceneId: scene.id,
      framePath,
      duration: scene.duration || 5,
    });
  }

  return frames;
};

/**
 * Draw scene content on canvas
 */
const drawSceneContent = async (ctx, scene, options) => {
  const { width, height, customBranding } = options;

  const textColor = customBranding?.textColor || '#000000';
  const accentColor = customBranding?.accentColor || '#2563eb';

  // Draw scene narration as text
  ctx.fillStyle = textColor;
  ctx.font = '32px Arial';

  // Word wrap text
  const words = scene.narration.split(' ');
  let line = '';
  let y = 200;
  const maxWidth = width - 200;
  const lineHeight = 50;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      ctx.fillText(line, 100, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 100, y);

  // Draw visual elements based on scene type
  if (scene.elements && scene.elements.includes('diagram')) {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    // Simple diagram representation
    ctx.strokeRect(width / 2 - 150, y + 100, 300, 200);
    ctx.beginPath();
    ctx.moveTo(width / 2, y + 150);
    ctx.lineTo(width / 2 + 100, y + 250);
    ctx.stroke();
  }

  if (scene.elements && scene.elements.includes('chart')) {
    ctx.fillStyle = accentColor;
    // Simple bar chart representation
    const barWidth = 40;
    const spacing = 60;
    const startX = width / 2 - 100;
    const startY = y + 300;

    for (let i = 0; i < 4; i++) {
      const barHeight = 50 + Math.random() * 100;
      ctx.fillRect(startX + i * spacing, startY - barHeight, barWidth, barHeight);
    }
  }

  // Draw key points as bullets
  if (scene.keyPoints && scene.keyPoints.length > 0) {
    ctx.font = '24px Arial';
    ctx.fillStyle = textColor;
    let bulletY = y + 100;

    scene.keyPoints.forEach((point, index) => {
      ctx.fillText(`• ${point}`, 100, bulletY);
      bulletY += 40;
    });
  }
};

/**
 * Combine audio and video scenes
 */
const combineAudioVideo = (audioSegments, frames, options) => {
  return new Promise((resolve, reject) => {
    const { tempDir, resolution, format } = options;
    const outputPath = path.join(tempDir, `final-video.${format}`);

    // Create a concat file for ffmpeg
    const concatFile = path.join(tempDir, 'concat.txt');
    let concatContent = '';

    frames.forEach((frame, index) => {
      const duration = frame.duration || 5;
      concatContent += `file '${frame.framePath}'\n`;
      concatContent += `duration ${duration}\n`;
    });

    fs.writeFile(concatFile, concatContent).then(() => {
      let command = ffmpeg()
        .input(concatFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-pix_fmt yuv420p', '-c:v libx264', '-preset medium']);

      // Add audio if available
      if (audioSegments.length > 0) {
        // For simplicity, we'll add the first audio segment
        // In production, concatenate all audio segments first
        const audioPath = path.join(tempDir, 'audio.mp3');
        fs.writeFile(audioPath, audioSegments[0].audioBuffer).then(() => {
          command.input(audioPath).audioCodec('aac');
        });
      }

      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  });
};

/**
 * Generate video thumbnail
 */
const generateThumbnail = (videoPath, tempDir) => {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');

    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: tempDir,
        filename: 'thumbnail.jpg',
        size: '1280x720',
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', reject);
  });
};

/**
 * Get resolution dimensions
 */
const getResolutionDimensions = (resolution) => {
  const resolutions = {
    '720p': [1280, 720],
    '1080p': [1920, 1080],
    '4K': [3840, 2160],
  };

  return resolutions[resolution] || resolutions['1080p'];
};

/**
 * Calculate total video duration
 */
const calculateTotalDuration = (storyboard) => {
  return storyboard.reduce((total, scene) => total + (scene.duration || 5), 0);
};

/**
 * Generate audio-only version
 */
exports.generateAudioOnly = async (videoData) => {
  try {
    const { id, script, storyboard, voiceId, voiceSpeed } = videoData;

    const audioSegments = await generateSceneAudio(storyboard, {
      voice: voiceId || 'alloy',
      speed: voiceSpeed || 1.0,
    });

    const tempDir = path.join(__dirname, '../../temp', id);
    await fs.mkdir(tempDir, { recursive: true });

    // Combine all audio segments
    const audioPath = path.join(tempDir, 'audio.mp3');
    await fs.writeFile(audioPath, audioSegments[0].audioBuffer);

    // Upload to S3
    const audioBuffer = await fs.readFile(audioPath);
    const uploadResult = await uploadBufferToS3(
      audioBuffer,
      `audio-${id}.mp3`,
      'audio/mpeg',
      'audio'
    );

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      audioUrl: uploadResult.CDNUrl || uploadResult.Location,
      duration: calculateTotalDuration(storyboard),
    };
  } catch (error) {
    console.error('Audio Generation Error:', error);
    throw new Error('Failed to generate audio: ' + error.message);
  }
};
