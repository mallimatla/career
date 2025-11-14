const { Video, Subscription } = require('../models');
const { uploadFile, deleteFile } = require('../services/firebaseStorage');
const { extractTextFromFile } = require('../services/documentProcessor');
const { generateScript } = require('../services/claudeService');
const { queueVideoGeneration } = require('../services/videoQueue');

// @desc    Create new video
// @route   POST /api/videos
// @access  Private
exports.createVideo = async (req, res) => {
  try {
    const { title, description, sourceType, sourceText, language, voiceGender, customBranding } = req.body;

    let sourceFileUrl = null;
    let extractedText = sourceText;

    // If file uploaded, process it
    if (req.file) {
      // Upload to Firebase Storage
      sourceFileUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'source-documents',
        req.user.id
      );

      // Extract text from file
      extractedText = await extractTextFromFile(req.file, sourceType);
    }

    // Calculate estimated credits (10% for script generation)
    const scriptCredits = 0.1;

    // Check if user has enough credits
    if (req.availableCredits < scriptCredits) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits for video generation',
      });
    }

    // Create video record
    const video = await Video.create({
      userId: req.user.id,
      title,
      description,
      sourceType: sourceType || (req.file ? req.file.mimetype.split('/')[1] : 'text'),
      sourceFileUrl,
      sourceText: extractedText,
      language: language || 'en',
      voiceGender: voiceGender || 'neutral',
      customBranding: customBranding || {},
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      video,
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message,
    });
  }
};

// @desc    Generate script for video
// @route   POST /api/videos/:id/generate-script
// @access  Private
exports.generateVideoScript = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check ownership
    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      });
    }

    if (!video.sourceText) {
      return res.status(400).json({
        success: false,
        message: 'No source text available for script generation',
      });
    }

    // Generate script using AI
    const script = await generateScript(video.sourceText, video.language);

    // Deduct 10% credit for script generation
    await Subscription.update(req.subscription.id, {
      creditsUsed: req.subscription.creditsUsed + 0.1,
    });

    // Update video with script
    await Video.update(video.id, {
      script: script.text,
      storyboard: script.scenes,
      duration: script.estimatedDuration,
    });

    res.json({
      success: true,
      message: 'Script generated successfully',
      script: script.text,
      scenes: script.scenes,
      estimatedDuration: script.estimatedDuration,
      estimatedCredits: Math.ceil(script.estimatedDuration / 60),
    });
  } catch (error) {
    console.error('Generate script error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating script',
      error: error.message,
    });
  }
};

// @desc    Update video script
// @route   PUT /api/videos/:id/script
// @access  Private
exports.updateScript = async (req, res) => {
  try {
    const { id } = req.params;
    const { script, storyboard } = req.body;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      });
    }

    const updatedVideo = await Video.update(video.id, {
      script,
      storyboard: storyboard || video.storyboard,
    });

    res.json({
      success: true,
      message: 'Script updated successfully',
      video: updatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating script',
      error: error.message,
    });
  }
};

// @desc    Generate video
// @route   POST /api/videos/:id/generate
// @access  Private
exports.generateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, format } = req.body;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      });
    }

    if (!video.script) {
      return res.status(400).json({
        success: false,
        message: 'Please generate a script first',
      });
    }

    // Calculate credits needed (1 credit = 1 minute)
    const creditsNeeded = Math.ceil(video.duration / 60);

    if (req.availableCredits < creditsNeeded) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. You need ${creditsNeeded} credits but only have ${req.availableCredits} available.`,
      });
    }

    // Update video status and settings
    await Video.update(video.id, {
      status: 'queued',
      resolution: resolution || '1080p',
      format: format || 'mp4',
      hasWatermark: req.subscription.plan === 'free',
    });

    // Queue video for generation
    await queueVideoGeneration(video.id);

    // Reserve credits
    await Subscription.update(req.subscription.id, {
      creditsUsed: req.subscription.creditsUsed + creditsNeeded,
    });

    await Video.update(video.id, {
      creditsUsed: creditsNeeded,
    });

    const updatedVideo = await Video.findById(video.id);

    res.json({
      success: true,
      message: 'Video generation started. You will be notified when it\'s ready.',
      video: updatedVideo,
      creditsUsed: creditsNeeded,
    });
  } catch (error) {
    console.error('Generate video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting video generation',
      error: error.message,
    });
  }
};

// @desc    Get all videos for user
// @route   GET /api/videos
// @access  Private
exports.getVideos = async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;

    let videos = await Video.findByUserId(req.user.id, parseInt(limit));

    // Filter by status if provided
    if (status) {
      videos = videos.filter(v => v.status === status);
    }

    res.json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message,
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
exports.getVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (video.userId !== req.user.id && !video.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      });
    }

    res.json({
      success: true,
      video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message,
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video',
      });
    }

    // Delete from Firebase Storage
    if (video.videoUrl) await deleteFile(video.videoUrl);
    if (video.sourceFileUrl) await deleteFile(video.sourceFileUrl);
    if (video.thumbnailUrl) await deleteFile(video.thumbnailUrl);

    await Video.delete(video.id);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message,
    });
  }
};

// @desc    Get video status
// @route   GET /api/videos/:id/status
// @access  Private
exports.getVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      });
    }

    res.json({
      success: true,
      status: video.status,
      progress: video.processingProgress,
      errorMessage: video.errorMessage,
      videoUrl: video.videoUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching video status',
      error: error.message,
    });
  }
};
