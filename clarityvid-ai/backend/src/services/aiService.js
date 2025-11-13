const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate video script from source text
 * @param {string} sourceText - The input text to convert to script
 * @param {string} language - Target language
 * @returns {object} - Generated script with scenes
 */
exports.generateScript = async (sourceText, language = 'en') => {
  try {
    const prompt = `You are an expert whiteboard explainer video scriptwriter. Convert the following text into an engaging whiteboard animation script.

Source Text:
${sourceText}

Create a structured script with:
1. Clear narration text for voiceover
2. Scene-by-scene breakdown with visual descriptions
3. Timing estimates for each scene
4. Annotations for key points, diagrams, charts, or equations that should be drawn
5. Transitions between scenes

Format the output as JSON with this structure:
{
  "text": "Full narration script",
  "scenes": [
    {
      "id": 1,
      "narration": "Text to be spoken",
      "visualDescription": "What should be drawn/shown",
      "duration": 10,
      "elements": ["text", "diagram", "chart"],
      "keyPoints": ["point 1", "point 2"]
    }
  ],
  "estimatedDuration": 120,
  "language": "${language}"
}

Keep it clear, concise, and educational. Focus on simplifying complex concepts.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in creating educational whiteboard animation scripts. You excel at breaking down complex topics into simple, visual narratives.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return result;
  } catch (error) {
    console.error('AI Script Generation Error:', error);
    throw new Error('Failed to generate script using AI: ' + error.message);
  }
};

/**
 * Analyze document structure and extract key information
 * @param {string} text - Document text
 * @returns {object} - Structured analysis
 */
exports.analyzeDocument = async (text) => {
  try {
    const prompt = `Analyze this document and extract:
1. Main topics/sections
2. Key concepts
3. Important data/statistics
4. Diagrams or charts mentioned
5. Recommended visual elements for video

Document:
${text.substring(0, 5000)}

Return as JSON with structure:
{
  "title": "Document title",
  "topics": ["topic1", "topic2"],
  "keyConcepts": ["concept1", "concept2"],
  "dataPoints": ["stat1", "stat2"],
  "suggestedVisuals": ["chart type", "diagram type"],
  "complexity": "simple|medium|advanced"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Document Analysis Error:', error);
    throw new Error('Failed to analyze document: ' + error.message);
  }
};

/**
 * Generate scene-specific visual descriptions
 * @param {string} sceneNarration - Narration for the scene
 * @returns {object} - Visual description and drawing instructions
 */
exports.generateSceneVisuals = async (sceneNarration) => {
  try {
    const prompt = `For this narration, describe what should be drawn in a whiteboard animation:

"${sceneNarration}"

Return JSON:
{
  "elements": ["text", "diagram", "icon", "chart"],
  "drawingInstructions": "Step by step what to draw",
  "layout": "description of layout",
  "colors": ["color1", "color2"],
  "animations": ["fade", "draw", "highlight"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Scene Visual Generation Error:', error);
    return {
      elements: ['text'],
      drawingInstructions: sceneNarration,
      layout: 'centered',
      colors: ['black'],
      animations: ['draw'],
    };
  }
};

/**
 * Translate script to different language
 * @param {string} script - Original script
 * @param {string} targetLanguage - Target language code
 * @returns {string} - Translated script
 */
exports.translateScript = async (script, targetLanguage) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following script to ${targetLanguage}. Maintain the tone and style suitable for educational videos.`,
        },
        {
          role: 'user',
          content: script,
        },
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Translation Error:', error);
    throw new Error('Failed to translate script: ' + error.message);
  }
};
