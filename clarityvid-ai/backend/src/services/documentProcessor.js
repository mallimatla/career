const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { marked } = require('marked');

/**
 * Extract text from uploaded file based on type
 * @param {object} file - Multer file object
 * @param {string} sourceType - File type
 * @returns {string} - Extracted text
 */
exports.extractTextFromFile = async (file, sourceType) => {
  try {
    const buffer = file.buffer;

    switch (sourceType) {
      case 'pdf':
        return await extractFromPDF(buffer);

      case 'docx':
        return await extractFromDOCX(buffer);

      case 'pptx':
        return await extractFromPPTX(buffer);

      case 'txt':
      case 'text':
        return buffer.toString('utf-8');

      case 'md':
      case 'markdown':
        const mdText = buffer.toString('utf-8');
        return marked(mdText, { mangle: false, headerIds: false });

      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Document extraction error:', error);
    throw new Error('Failed to extract text from document: ' + error.message);
  }
};

/**
 * Extract text from PDF
 */
const extractFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  }
};

/**
 * Extract text from DOCX
 */
const extractFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to parse DOCX: ' + error.message);
  }
};

/**
 * Extract text from PPTX
 */
const extractFromPPTX = async (buffer) => {
  try {
    // For PPTX, we'll use a simple approach
    // In production, use a library like 'officegen' or 'pptx-parser'
    const JSZip = require('jszip');
    const zip = await JSZip.loadAsync(buffer);

    let text = '';
    const slideFiles = Object.keys(zip.files).filter(name =>
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );

    for (const slideFile of slideFiles) {
      const content = await zip.file(slideFile).async('string');
      // Extract text between <a:t> tags
      const matches = content.match(/<a:t>(.*?)<\/a:t>/g);
      if (matches) {
        matches.forEach(match => {
          const extractedText = match.replace(/<\/?a:t>/g, '');
          text += extractedText + '\n';
        });
      }
    }

    return text.trim();
  } catch (error) {
    throw new Error('Failed to parse PPTX: ' + error.message);
  }
};

/**
 * Parse structured content (headings, lists, etc.)
 * @param {string} text - Raw text
 * @returns {object} - Structured content
 */
exports.parseStructuredContent = (text) => {
  const lines = text.split('\n');
  const structure = {
    title: '',
    sections: [],
    bullets: [],
    numbers: [],
  };

  let currentSection = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Detect title (first non-empty line or all caps)
    if (!structure.title && trimmed && index < 5) {
      structure.title = trimmed;
    }

    // Detect headings (lines in all caps or starting with #)
    if (trimmed.match(/^#{1,6}\s/) || (trimmed === trimmed.toUpperCase() && trimmed.length > 3)) {
      currentSection = {
        heading: trimmed.replace(/^#{1,6}\s/, ''),
        content: [],
      };
      structure.sections.push(currentSection);
    }

    // Detect bullet points
    if (trimmed.match(/^[•\-\*]\s/)) {
      structure.bullets.push(trimmed.replace(/^[•\-\*]\s/, ''));
      if (currentSection) {
        currentSection.content.push(trimmed);
      }
    }

    // Detect numbered lists
    if (trimmed.match(/^\d+[\.\)]\s/)) {
      structure.numbers.push(trimmed);
      if (currentSection) {
        currentSection.content.push(trimmed);
      }
    }

    // Regular content
    if (currentSection && trimmed && !trimmed.match(/^[•\-\*#\d]/)) {
      currentSection.content.push(trimmed);
    }
  });

  return structure;
};

/**
 * Detect charts, tables, and visual elements in text
 * @param {string} text - Source text
 * @returns {array} - List of detected elements
 */
exports.detectVisualElements = (text) => {
  const elements = [];

  // Detect tables
  if (text.match(/\|.*\|/g)) {
    elements.push({ type: 'table', confidence: 'high' });
  }

  // Detect charts/graphs mentions
  const chartKeywords = ['chart', 'graph', 'diagram', 'figure', 'plot', 'visualization'];
  chartKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    if (regex.test(text)) {
      elements.push({ type: 'chart', keyword, confidence: 'medium' });
    }
  });

  // Detect equations
  if (text.match(/\$.*?\$|\\[.*?\\]|\=|\+|\-|\÷|\×/g)) {
    elements.push({ type: 'equation', confidence: 'high' });
  }

  // Detect code blocks
  if (text.match(/```[\s\S]*?```|`[^`]+`/g)) {
    elements.push({ type: 'code', confidence: 'high' });
  }

  return elements;
};
