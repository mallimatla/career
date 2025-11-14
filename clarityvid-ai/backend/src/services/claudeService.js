const Anthropic = require('@anthropic-ai/sdk');

// Get API key from environment variable
// When deployed to Firebase Functions, this will be automatically populated from the secret
// For local development, it will come from the .env file
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('WARNING: ANTHROPIC_API_KEY environment variable is not set.');
  console.warn('For Firebase Functions: Ensure the secret is configured using Firebase Secrets Manager.');
  console.warn('For local development: Set ANTHROPIC_API_KEY in your .env file.');
}

const anthropic = new Anthropic({
  apiKey: apiKey || 'dummy-key', // Use dummy key to prevent initialization errors
});

/**
 * Generate video script from source text using Claude
 * @param {string} sourceText - The input text to convert to script
 * @param {string} language - Target language
 * @returns {object} - Generated script with scenes
 */
exports.generateScript = async (sourceText, language = 'en') => {
  // Check API key availability
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not configured. Please configure it in Firebase Functions to enable script generation.');
  }

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

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text;

    // Extract JSON from response (Claude sometimes wraps it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    return result;
  } catch (error) {
    console.error('Claude Script Generation Error:', error);
    throw new Error('Failed to generate script using Claude: ' + error.message);
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

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
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

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
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
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Translate the following script to ${targetLanguage}. Maintain the tone and style suitable for educational videos:\n\n${script}`,
        },
      ],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Translation Error:', error);
    throw new Error('Failed to translate script: ' + error.message);
  }
};

/**
 * Generate presentation slides using Claude
 */
exports.generateSlideContent = async (content, templateStyle) => {
  try {
    const prompt = `You are an expert presentation designer. Create a professional slide deck from the following content.

Content:
${content}

Template Style: ${templateStyle}

Create slides with:
1. Title slide with main title and subtitle
2. Content slides with headings, bullet points, and key messages
3. Visual suggestions for each slide
4. Conclude with a call-to-action or summary slide

Format as JSON array of slides:
{
  "slides": [
    {
      "type": "title",
      "title": "Main Title",
      "subtitle": "Subtitle or tagline",
      "layout": "centered"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "visual": "chart|image|icon",
      "layout": "two-column"
    }
  ]
}

Aim for 8-12 slides. Keep text concise and impactful.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    return result.slides || [];
  } catch (error) {
    console.error('Slide Generation Error:', error);
    throw new Error('Failed to generate slides: ' + error.message);
  }
};

/**
 * Structure document content using Claude
 */
exports.structureDocument = async (content, documentType) => {
  try {
    const prompt = `You are an expert document formatter. Structure the following content into a professional ${documentType}.

Content:
${content}

Create a well-organized document with:
1. Title and executive summary (if applicable)
2. Main sections with appropriate headings
3. Subsections as needed
4. Conclusion or summary

Format as JSON:
{
  "title": "Document Title",
  "sections": [
    {
      "heading": "Section Heading",
      "level": 1,
      "content": "Section content...",
      "subsections": [
        {
          "heading": "Subsection",
          "level": 2,
          "content": "Content..."
        }
      ]
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    return result.sections || [];
  } catch (error) {
    console.error('Document Structuring Error:', error);
    throw new Error('Failed to structure document: ' + error.message);
  }
};

/**
 * Generate website structure using Claude
 */
exports.generateWebsiteStructure = async (content, websiteType) => {
  try {
    const prompt = `You are an expert web designer. Create a ${websiteType} website structure from the following content.

Content:
${content}

Create a website with appropriate pages and sections. Format as JSON:
{
  "pages": [
    {
      "name": "home",
      "title": "Home",
      "sections": [
        {
          "type": "hero",
          "heading": "Main Heading",
          "subheading": "Subheading",
          "cta": "Get Started",
          "image": "hero-image"
        },
        {
          "type": "features",
          "heading": "Features",
          "items": [
            {"title": "Feature 1", "description": "Description", "icon": "icon-name"}
          ]
        }
      ]
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
  } catch (error) {
    console.error('Website Structure Generation Error:', error);
    throw new Error('Failed to generate website structure: ' + error.message);
  }
};

// Export all functions
module.exports = exports;
