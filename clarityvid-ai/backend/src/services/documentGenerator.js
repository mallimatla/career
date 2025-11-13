const { Document: DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType } = require('docx');
const { getTemplate } = require('./templateService');
const { uploadFile } = require('./firebaseStorage');
const marked = require('marked');

/**
 * Generate document from content
 */
exports.generateDocument = async (documentData) => {
  const { id, content, templateId, title, documentType, format } = documentData;

  try {
    // Get template
    const template = getTemplate('documents', templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Parse and structure content
    const structuredContent = await structureContent(content, documentType);

    // Generate document based on format
    let fileBuffer;
    if (format === 'docx') {
      fileBuffer = await createDOCX(structuredContent, template, title);
    } else if (format === 'pdf') {
      fileBuffer = await createPDF(structuredContent, template, title);
    } else if (format === 'html') {
      fileBuffer = await createHTML(structuredContent, template, title);
    } else if (format === 'markdown') {
      fileBuffer = Buffer.from(createMarkdown(structuredContent, title));
    }

    // Upload to S3
    const uploadResult = await uploadBufferToS3(
      fileBuffer,
      `document-${id}.${format}`,
      getMimeType(format),
      'documents'
    );

    // Generate preview
    const previewBuffer = await generatePreview(structuredContent, template, title);
    const previewResult = await uploadBufferToS3(
      previewBuffer,
      `preview-${id}.png`,
      'image/png',
      'previews'
    );

    // Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 250); // Approx 250 words per page

    return {
      fileUrl: uploadResult.CDNUrl || uploadResult.Location,
      previewUrl: previewResult.CDNUrl || previewResult.Location,
      sections: structuredContent,
      wordCount,
      pageCount,
    };
  } catch (error) {
    console.error('Document Generation Error:', error);
    throw new Error('Failed to generate document: ' + error.message);
  }
};

/**
 * Structure content into sections
 */
const structureContent = async (content, documentType) => {
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert document formatter and technical writer.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content);
  return result.sections || [];
};

/**
 * Create DOCX file
 */
const createDOCX = async (sections, template, title) => {
  const { colors, fonts, margins } = template;

  const doc = new DocxDocument({
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            size: 32,
            bold: true,
            color: colors.primary.replace('#', ''),
            font: fonts.heading,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            size: 28,
            bold: true,
            color: colors.secondary.replace('#', ''),
            font: fonts.heading,
          },
          paragraph: {
            spacing: { before: 200, after: 100 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Generate content
          ...generateDocxContent(sections),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};

/**
 * Generate DOCX content from sections
 */
const generateDocxContent = (sections) => {
  const paragraphs = [];

  sections.forEach(section => {
    // Section heading
    paragraphs.push(
      new Paragraph({
        text: section.heading,
        heading: section.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );

    // Section content
    const contentParagraphs = section.content.split('\n\n');
    contentParagraphs.forEach(para => {
      if (para.trim()) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(para.trim())],
            spacing: { after: 120 },
          })
        );
      }
    });

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      paragraphs.push(...generateDocxContent(section.subsections));
    }
  });

  return paragraphs;
};

/**
 * Create PDF from content
 */
const createPDF = async (sections, template, title) => {
  // Use puppeteer to convert HTML to PDF
  const htmlContent = await createHTML(sections, template, title);

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(htmlContent.toString());
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      top: '1in',
      bottom: '1in',
      left: '1in',
      right: '1in',
    },
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
};

/**
 * Create HTML document
 */
const createHTML = async (sections, template, title) => {
  const { colors, fonts } = template;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: ${fonts.body};
            line-height: 1.8;
            color: ${colors.text};
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: ${colors.background};
        }
        h1 {
            font-family: ${fonts.heading};
            font-size: 2.5rem;
            color: ${colors.primary};
            margin-bottom: 2rem;
            text-align: center;
        }
        h2 {
            font-family: ${fonts.heading};
            font-size: 2rem;
            color: ${colors.primary};
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        h3 {
            font-family: ${fonts.heading};
            font-size: 1.5rem;
            color: ${colors.secondary};
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        p {
            margin-bottom: 1rem;
            text-align: justify;
        }
        @media print {
            body { max-width: 100%; }
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${sections.map(section => `
        <section>
            <h${section.level + 1}>${section.heading}</h${section.level + 1}>
            ${section.content.split('\n\n').map(para => `<p>${para}</p>`).join('')}
            ${section.subsections ? section.subsections.map(sub => `
                <h${sub.level + 1}>${sub.heading}</h${sub.level + 1}>
                ${sub.content.split('\n\n').map(para => `<p>${para}</p>`).join('')}
            `).join('') : ''}
        </section>
    `).join('')}
</body>
</html>`;

  return Buffer.from(html);
};

/**
 * Create Markdown document
 */
const createMarkdown = (sections, title) => {
  let markdown = `# ${title}\n\n`;

  sections.forEach(section => {
    markdown += `${'#'.repeat(section.level + 1)} ${section.heading}\n\n`;
    markdown += `${section.content}\n\n`;

    if (section.subsections) {
      section.subsections.forEach(sub => {
        markdown += `${'#'.repeat(sub.level + 1)} ${sub.heading}\n\n`;
        markdown += `${sub.content}\n\n`;
      });
    }
  });

  return markdown;
};

/**
 * Generate preview image
 */
const generatePreview = async (sections, template, title) => {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(800, 1000);
  const ctx = canvas.getContext('2d');

  const { colors } = template;

  // Background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, 800, 1000);

  // Document styling
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 400, 100);

  // Show first few sections
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  let y = 180;

  sections.slice(0, 3).forEach(section => {
    ctx.fillStyle = colors.primary;
    ctx.fillText(section.heading, 50, y);
    y += 40;

    ctx.fillStyle = colors.text;
    ctx.font = '18px Arial';
    const preview = section.content.substring(0, 100) + '...';
    ctx.fillText(preview, 50, y);
    y += 80;
    ctx.font = '24px Arial';
  });

  return canvas.toBuffer('image/png');
};

/**
 * Get MIME type
 */
const getMimeType = (format) => {
  const types = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    html: 'text/html',
    markdown: 'text/markdown',
  };
  return types[format] || 'application/octet-stream';
};

module.exports = { generateDocument };
