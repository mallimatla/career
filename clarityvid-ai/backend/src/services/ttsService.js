const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate speech from text using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {object} options - Voice options
 * @returns {Buffer} - Audio buffer
 */
exports.generateSpeech = async (text, options = {}) => {
  try {
    const {
      voice = 'alloy', // alloy, echo, fable, onyx, nova, shimmer
      model = 'tts-1', // tts-1 or tts-1-hd
      speed = 1.0,
    } = options;

    const mp3 = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
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
        audioBuffer,
        text: scene.narration,
        duration: scene.duration || 5,
      });
    }

    return audioSegments;
  } catch (error) {
    console.error('Scene Audio Generation Error:', error);
    throw new Error('Failed to generate scene audio: ' + error.message);
  }
};

/**
 * Get available voices
 * @returns {array} - List of available voices
 */
exports.getAvailableVoices = () => {
  return [
    { id: 'alloy', name: 'Alloy', gender: 'neutral', language: 'en' },
    { id: 'echo', name: 'Echo', gender: 'male', language: 'en' },
    { id: 'fable', name: 'Fable', gender: 'neutral', language: 'en' },
    { id: 'onyx', name: 'Onyx', gender: 'male', language: 'en' },
    { id: 'nova', name: 'Nova', gender: 'female', language: 'en' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', language: 'en' },
  ];
};

/**
 * Calculate audio duration from text
 * @param {string} text - Text content
 * @param {number} speed - Speech speed
 * @returns {number} - Estimated duration in seconds
 */
exports.estimateAudioDuration = (text, speed = 1.0) => {
  // Average speaking rate: ~150 words per minute
  const words = text.split(/\s+/).length;
  const baseMinutes = words / 150;
  const seconds = (baseMinutes * 60) / speed;
  return Math.ceil(seconds);
};

/**
 * Split long text into chunks for TTS
 * @param {string} text - Long text
 * @param {number} maxLength - Maximum characters per chunk
 * @returns {array} - Array of text chunks
 */
exports.splitTextForTTS = (text, maxLength = 4000) => {
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
};
