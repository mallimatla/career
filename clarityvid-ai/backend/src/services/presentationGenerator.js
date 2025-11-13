const PptxGenJs = require('pptxgenjs');
const { getTemplate } = require('./templateService');
const { generateScript } = require('./claudeService');
const { uploadFile } = require('./firebaseStorage');

/**
 * Generate presentation from content
 */
exports.generatePresentation = async (presentationData) => {
  const { id, content, templateId, title, format } = presentationData;

  try {
    // Get template
    const template = getTemplate('presentations', templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate slide content using AI
    const slideContent = await generateSlideContent(content, template);

    // Create presentation based on format
    let fileBuffer;
    if (format === 'pptx') {
      fileBuffer = await createPPTX(slideContent, template, title);
    } else if (format === 'pdf') {
      fileBuffer = await createPDFFromSlides(slideContent, template, title);
    } else if (format === 'html') {
      fileBuffer = await createHTMLPresentation(slideContent, template, title);
    }

    // Upload to S3
    const uploadResult = await uploadBufferToS3(
      fileBuffer,
      `presentation-${id}.${format}`,
      getMimeType(format),
      'presentations'
    );

    // Generate preview
    const previewBuffer = await generatePreview(slideContent, template);
    const previewResult = await uploadBufferToS3(
      previewBuffer,
      `preview-${id}.png`,
      'image/png',
      'previews'
    );

    return {
      fileUrl: uploadResult.CDNUrl || uploadResult.Location,
      previewUrl: previewResult.CDNUrl || previewResult.Location,
      slides: slideContent,
      slideCount: slideContent.length,
    };
  } catch (error) {
    console.error('Presentation Generation Error:', error);
    throw new Error('Failed to generate presentation: ' + error.message);
  }
};

/**
 * Generate slide content using AI
 */
const generateSlideContent = async (content, template) => {
  const prompt = `You are an expert presentation designer. Create a professional slide deck from the following content.

Content:
${content}

Template Style: ${template.name}
Category: ${template.category}

Create slides with:
1. Title slide with main title and subtitle
2. Content slides with headings, bullet points, and key messages
3. Visual suggestions for each slide
4. Conclude with a call-to-action or summary slide

Format as JSON array of slides:
[
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

Aim for 8-12 slides. Keep text concise and impactful.`;

  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert presentation designer who creates engaging slide decks.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content);
  return result.slides || [];
};

/**
 * Create PPTX file
 */
const createPPTX = async (slides, template, title) => {
  const pptx = new PptxGenJs();

  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'ClarityVid AI';
  pptx.title = title;
  pptx.subject = 'AI Generated Presentation';

  // Apply template theme
  const { colors, fonts } = template;

  // Create slides
  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();

    if (slideData.type === 'title') {
      // Title slide
      slide.background = { color: colors.primary };

      slide.addText(slideData.title, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: colors.background,
        align: 'center',
        fontFace: fonts.heading,
      });

      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 0.5,
          y: 4.2,
          w: 9,
          h: 0.8,
          fontSize: 24,
          color: colors.background,
          align: 'center',
          fontFace: fonts.body,
        });
      }
    } else if (slideData.type === 'content') {
      // Content slide
      slide.background = { color: colors.background };

      // Title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: colors.primary,
        fontFace: fonts.heading,
      });

      // Content
      if (Array.isArray(slideData.content)) {
        const bulletText = slideData.content.map(item => ({
          text: item,
          options: { bullet: true, fontSize: 20, color: colors.text },
        }));

        slide.addText(bulletText, {
          x: 0.5,
          y: 1.5,
          w: 8.5,
          h: 4,
          fontFace: fonts.body,
        });
      } else {
        slide.addText(slideData.content, {
          x: 0.5,
          y: 1.5,
          w: 8.5,
          h: 4,
          fontSize: 18,
          color: colors.text,
          fontFace: fonts.body,
        });
      }

      // Add slide number
      slide.addText(`${index + 1}`, {
        x: 9.2,
        y: 5.3,
        w: 0.5,
        h: 0.3,
        fontSize: 14,
        color: colors.textLight,
        align: 'right',
      });
    }
  });

  // Generate buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
};

/**
 * Create PDF from slides
 */
const createPDFFromSlides = async (slides, template, title) => {
  // For PDF, we'd use puppeteer or similar to render HTML to PDF
  // This is a simplified implementation
  const htmlContent = await createHTMLPresentation(slides, template, title);

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(htmlContent.toString());
  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
};

/**
 * Create HTML presentation
 */
const createHTMLPresentation = async (slides, template, title) => {
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
            background: ${colors.background};
            color: ${colors.text};
        }
        .presentation {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }
        .slide {
            width: 100%;
            height: 100%;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 4rem;
        }
        .slide.active { display: flex; }
        .slide.title-slide {
            background: ${colors.primary};
            color: ${colors.background};
        }
        .slide h1 {
            font-family: ${fonts.heading};
            font-size: 3rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        .slide h2 {
            font-family: ${fonts.heading};
            font-size: 2rem;
            margin-bottom: 2rem;
            color: ${colors.primary};
        }
        .slide.title-slide h2 {
            color: ${colors.background};
            opacity: 0.9;
        }
        .content {
            font-size: 1.5rem;
            line-height: 1.8;
            max-width: 900px;
        }
        .content ul {
            list-style: none;
            padding-left: 0;
        }
        .content li {
            margin-bottom: 1rem;
            padding-left: 2rem;
            position: relative;
        }
        .content li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: ${colors.accent};
            font-size: 2rem;
        }
        .controls {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            display: flex;
            gap: 1rem;
        }
        button {
            padding: 1rem 2rem;
            font-size: 1rem;
            background: ${colors.primary};
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover { opacity: 0.9; }
        .slide-number {
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            font-size: 1rem;
            color: ${colors.textLight};
        }
    </style>
</head>
<body>
    <div class="presentation">
        ${slides.map((slide, index) => `
            <div class="slide ${slide.type === 'title' ? 'title-slide' : ''} ${index === 0 ? 'active' : ''}" data-slide="${index}">
                ${slide.type === 'title' ? `
                    <h1>${slide.title}</h1>
                    ${slide.subtitle ? `<h2>${slide.subtitle}</h2>` : ''}
                ` : `
                    <h2>${slide.title}</h2>
                    <div class="content">
                        ${Array.isArray(slide.content)
                            ? `<ul>${slide.content.map(item => `<li>${item}</li>`).join('')}</ul>`
                            : `<p>${slide.content}</p>`
                        }
                    </div>
                `}
            </div>
        `).join('')}
    </div>

    <div class="slide-number">
        <span id="current-slide">1</span> / ${slides.length}
    </div>

    <div class="controls">
        <button onclick="previousSlide()">← Previous</button>
        <button onclick="nextSlide()">Next →</button>
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            document.getElementById('current-slide').textContent = currentSlide + 1;
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function previousSlide() { showSlide(currentSlide - 1); }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
        });
    </script>
</body>
</html>`;

  return Buffer.from(html);
};

/**
 * Generate preview image
 */
const generatePreview = async (slides, template) => {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  const { colors, fonts } = template;

  // Background
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, 1200, 675);

  // Title from first slide
  if (slides[0]) {
    ctx.fillStyle = colors.background;
    ctx.font = `bold 60px ${fonts.heading}`;
    ctx.textAlign = 'center';
    ctx.fillText(slides[0].title || 'Untitled', 600, 300);

    if (slides[0].subtitle) {
      ctx.font = `30px ${fonts.body}`;
      ctx.fillText(slides[0].subtitle, 600, 380);
    }
  }

  // Slide count
  ctx.font = `20px ${fonts.body}`;
  ctx.fillText(`${slides.length} slides`, 600, 600);

  return canvas.toBuffer('image/png');
};

/**
 * Get MIME type for format
 */
const getMimeType = (format) => {
  const types = {
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pdf: 'application/pdf',
    html: 'text/html',
  };
  return types[format] || 'application/octet-stream';
};

module.exports = { generatePresentation };
