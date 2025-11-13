const Queue = require('bull');
const { Video } = require('../models');
const { generateWhiteboardVideo, generateAudioOnly } = require('./videoGenerator');

// Create video processing queue
const videoQueue = new Queue('video-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/**
 * Add video to generation queue
 */
exports.queueVideoGeneration = async (videoId) => {
  try {
    const video = await Video.findByPk(videoId);

    if (!video) {
      throw new Error('Video not found');
    }

    await videoQueue.add('generate-video', {
      videoId: video.id,
      userId: video.userId,
    }, {
      priority: video.priority || 5,
      timeout: 900000, // 15 minutes
    });

    return true;
  } catch (error) {
    console.error('Queue Video Error:', error);
    throw error;
  }
};

/**
 * Process video generation jobs
 */
videoQueue.process('generate-video', async (job) => {
  const { videoId } = job.data;

  try {
    const video = await Video.findByPk(videoId);

    if (!video) {
      throw new Error('Video not found');
    }

    // Update status to processing
    await video.update({ status: 'processing', processingProgress: 0 });

    // Progress: 10% - Starting
    job.progress(10);
    await video.update({ processingProgress: 10 });

    // Progress: 30% - Generating audio
    job.progress(30);
    await video.update({ processingProgress: 30 });

    // Progress: 50% - Generating visuals
    job.progress(50);
    await video.update({ processingProgress: 50 });

    // Generate video
    const result = await generateWhiteboardVideo(video.toJSON());

    // Progress: 90% - Uploading
    job.progress(90);
    await video.update({ processingProgress: 90 });

    // Update video with results
    await video.update({
      status: 'completed',
      processingProgress: 100,
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
    });

    // Send completion notification (email, webhook, etc.)
    // await sendCompletionNotification(video);

    job.progress(100);

    return { success: true, videoUrl: result.videoUrl };
  } catch (error) {
    console.error('Video Processing Error:', error);

    // Update video status to failed
    await Video.update(
      {
        status: 'failed',
        errorMessage: error.message,
      },
      {
        where: { id: videoId },
      }
    );

    throw error;
  }
});

/**
 * Get queue statistics
 */
exports.getQueueStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    videoQueue.getWaitingCount(),
    videoQueue.getActiveCount(),
    videoQueue.getCompletedCount(),
    videoQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
};

/**
 * Get job status
 */
exports.getJobStatus = async (jobId) => {
  const job = await videoQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  return {
    id: job.id,
    progress: job.progress(),
    state: await job.getState(),
    attemptsMade: job.attemptsMade,
    data: job.data,
  };
};

/**
 * Clean completed jobs older than 24 hours
 */
exports.cleanOldJobs = async () => {
  await videoQueue.clean(24 * 3600 * 1000, 'completed');
  await videoQueue.clean(7 * 24 * 3600 * 1000, 'failed');
};

// Event listeners
videoQueue.on('completed', (job, result) => {
  console.log(`Video generation completed: ${job.data.videoId}`);
});

videoQueue.on('failed', (job, error) => {
  console.error(`Video generation failed: ${job.data.videoId}`, error);
});

videoQueue.on('progress', (job, progress) => {
  console.log(`Video ${job.data.videoId} progress: ${progress}%`);
});

module.exports = videoQueue;
