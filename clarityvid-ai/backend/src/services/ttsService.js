const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const googleTTS = require('google-tts-api');

/**
 * Generate speech from text using Google TTS
 * @param {string} text - Text to convert to speech
 * @param {object} options - Voice options
 * @returns {Buffer} - Audio buffer
 */
exports.generateSpeech = async (text, options = {}) => {
  try {
    const {
      language = 'en',
      speed = 1.0,
      voice = 'default',
    } = options;

    // Get audio URL from Google TTS
    const url = googleTTS.getAudioUrl(text, {
      lang: language,
      slow: speed < 1.0,
      host: 'https://translate.google.com',
    });

    // Fetch the audio
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer;
  } catch (error) {
    console.error('TTS Generation Error:', error);
    throw new Error('Failed to generate speech: ' + error.message);
  }
};

/**
 * Generate speech for multiple scenes
 * @param {array} scenes - Array of scene objects with narration
 * @param {object} options - Voice options
 * @returns {array} - Array of audio buffers with timing
 */
exports.generateSceneAudio = async (scenes, options = {}) => {
  try {
    const audioSegments = [];

    for (const scene of scenes) {
      if (!scene.narration) continue;

      const audioBuffer = await exports.generateSpeech(scene.narration, options);

      audioSegments.push({
        sceneId: scene.id,
        audio: audioBuffer,
        duration: scene.duration || estimateAudioDuration(scene.narration),
        text: scene.narration,
      });
    }

    return audioSegments;
  } catch (error) {
    console.error('Scene Audio Generation Error:', error);
    throw new Error('Failed to generate scene audio: ' + error.message);
  }
};

/**
 * Estimate audio duration based on text length
 * @param {string} text - Text to estimate
 * @returns {number} - Estimated duration in seconds
 */
exports.estimateAudioDuration = (text) => {
  // Average speaking rate: 150 words per minute
  const words = text.split(/\s+/).length;
  const minutes = words / 150;
  const seconds = Math.ceil(minutes * 60);

  // Add buffer for pauses
  return seconds + Math.ceil(seconds * 0.1);
};

/**
 * Save audio to file
 * @param {Buffer} audioBuffer - Audio buffer
 * @param {string} outputPath - Output file path
 * @returns {string} - File path
 */
exports.saveAudioFile = async (audioBuffer, outputPath) => {
  try {
    await fs.writeFile(outputPath, audioBuffer);
    return outputPath;
  } catch (error) {
    console.error('Save Audio File Error:', error);
    throw new Error('Failed to save audio file: ' + error.message);
  }
};

/**
 * Generate audio file from text
 * @param {string} text - Text to convert
 * @param {string} outputDir - Output directory
 * @param {object} options - Voice options
 * @returns {string} - File path
 */
exports.generateAudioFile = async (text, outputDir, options = {}) => {
  try {
    const audioBuffer = await exports.generateSpeech(text, options);
    const fileName = `audio-${uuidv4()}.mp3`;
    const filePath = path.join(outputDir, fileName);

    await exports.saveAudioFile(audioBuffer, filePath);

    return filePath;
  } catch (error) {
    console.error('Generate Audio File Error:', error);
    throw new Error('Failed to generate audio file: ' + error.message);
  }
};

/**
 * Merge multiple audio segments
 * @param {array} audioSegments - Array of audio buffers
 * @returns {Buffer} - Merged audio buffer
 */
exports.mergeAudioSegments = async (audioSegments) => {
  try {
    // Simple concatenation - for production, use ffmpeg for proper merging
    const buffers = audioSegments.map(segment => segment.audio);
    const merged = Buffer.concat(buffers);
    return merged;
  } catch (error) {
    console.error('Merge Audio Error:', error);
    throw new Error('Failed to merge audio segments: ' + error.message);
  }
};

// Helper function reference for compatibility
const estimateAudioDuration = exports.estimateAudioDuration;

module.exports = exports;
