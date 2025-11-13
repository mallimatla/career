const { getTemplate } = require('./templateService');
const { uploadFile } = require('./firebaseStorage');
const JSZip = require('jszip');

/**
 * Generate website from content
 */
exports.generateWebsite = async (websiteData) => {
  const { id, content, templateId, title, websiteType, pages } = websiteData;

  try {
    // Get template
    const template = getTemplate('websites', templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate website structure
    const siteStructure = await generateSiteStructure(content, websiteType, template);

    // Create website files
    const files = await createWebsiteFiles(siteStructure, template, title);

    // Create ZIP archive
    const zipBuffer = await createZipArchive(files);

    // Upload to S3
    const uploadResult = await uploadBufferToS3(
      zipBuffer,
      `website-${id}.zip`,
      'application/zip',
      'websites'
    );

    // Generate and upload individual HTML for preview
    const indexHTML = files.find(f => f.name === 'index.html');
    if (indexHTML) {
      const htmlUpload = await uploadBufferToS3(
        Buffer.from(indexHTML.content),
        `website-${id}/index.html`,
        'text/html',
        'websites'
      );

      // Upload preview image
      const previewBuffer = await generatePreview(siteStructure, template);
      const previewResult = await uploadBufferToS3(
        previewBuffer,
        `preview-${id}.png`,
        'image/png',
        'previews'
      );

      return {
        fileUrl: uploadResult.CDNUrl || uploadResult.Location,
        deploymentUrl: htmlUpload.CDNUrl || htmlUpload.Location,
        previewUrl: previewResult.CDNUrl || previewResult.Location,
        pages: siteStructure.pages,
        pageCount: siteStructure.pages.length,
      };
    }

    return {
      fileUrl: uploadResult.CDNUrl || uploadResult.Location,
      pages: siteStructure.pages,
      pageCount: siteStructure.pages.length,
    };
  } catch (error) {
    console.error('Website Generation Error:', error);
    throw new Error('Failed to generate website: ' + error.message);
  }
};

/**
 * Generate site structure using AI
 */
const generateSiteStructure = async (content, websiteType, template) => {
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are an expert web designer. Create a ${websiteType} website structure from the following content.

Content:
${content}

Template: ${template.name}
Sections: ${template.sections.join(', ')}

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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert web designer who creates modern, responsive websites.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
};

/**
 * Create website files
 */
const createWebsiteFiles = async (siteStructure, template, title) => {
  const files = [];
  const { colors, fonts } = template;

  // Create CSS file
  const cssContent = generateCSS(template);
  files.push({ name: 'style.css', content: cssContent });

  // Create JavaScript file
  const jsContent = generateJavaScript();
  files.push({ name: 'script.js', content: jsContent });

  // Create HTML pages
  siteStructure.pages.forEach(page => {
    const htmlContent = generateHTML(page, template, title);
    files.push({ name: `${page.name}.html`, content: htmlContent });
  });

  return files;
};

/**
 * Generate CSS
 */
const generateCSS = (template) => {
  const { colors, fonts } = template;

  return `
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --accent: ${colors.accent};
  --background: ${colors.background};
  --text: ${colors.text};
}

body {
  font-family: ${fonts.body};
  line-height: 1.6;
  color: var(--text);
  background: var(--background);
}

/* Header */
header {
  background: var(--background);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

nav a {
  text-decoration: none;
  color: var(--text);
  font-weight: 500;
  transition: color 0.3s;
}

nav a:hover { color: var(--primary); }

/* Hero Section */
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
}

.hero-content {
  max-width: 800px;
}

.hero h1 {
  font-family: ${fonts.heading};
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: white;
  color: var(--primary);
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Features Section */
.features {
  padding: 5rem 2rem;
  background: var(--background);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: var(--primary);
  margin-bottom: 1rem;
}

/* Footer */
footer {
  background: #1a1a1a;
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

footer a {
  color: var(--accent);
  text-decoration: none;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 { font-size: 2.5rem; }
  .hero p { font-size: 1.2rem; }
  nav ul { flex-direction: column; gap: 1rem; }
  .features-grid { grid-template-columns: 1fr; }
}
`;
};

/**
 * Generate JavaScript
 */
const generateJavaScript = () => {
  return `
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Navbar scroll effect
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > lastScroll && currentScroll > 100) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }
  lastScroll = currentScroll;
});
`;
};

/**
 * Generate HTML for a page
 */
const generateHTML = (page, template, siteTitle) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title} - ${siteTitle}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${siteTitle}</div>
            <ul>
                ${template.pages?.map(p => `<li><a href="${p}.html">${p.charAt(0).toUpperCase() + p.slice(1)}</a></li>`).join('') || ''}
            </ul>
        </nav>
    </header>

    <main>
        ${page.sections.map(section => generateSection(section)).join('\n')}
    </main>

    <footer>
        <p>&copy; 2025 ${siteTitle}. All rights reserved.</p>
        <p>Generated by ClarityVid AI</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
};

/**
 * Generate HTML for a section
 */
const generateSection = (section) => {
  if (section.type === 'hero') {
    return `
    <section class="hero">
        <div class="hero-content">
            <h1>${section.heading}</h1>
            <p>${section.subheading}</p>
            <a href="#" class="btn">${section.cta || 'Get Started'}</a>
        </div>
    </section>`;
  }

  if (section.type === 'features') {
    return `
    <section class="features">
        <div class="container">
            <h2 class="section-title">${section.heading}</h2>
            <div class="features-grid">
                ${section.items?.map(item => `
                    <div class="feature-card">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                `).join('') || ''}
            </div>
        </div>
    </section>`;
  }

  return '';
};

/**
 * Create ZIP archive
 */
const createZipArchive = async (files) => {
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.name, file.content);
  });

  return await zip.generateAsync({ type: 'nodebuffer' });
};

/**
 * Generate preview
 */
const generatePreview = async (siteStructure, template) => {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(1200, 800);
  const ctx = canvas.getContext('2d');

  const { colors } = template;

  // Background
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, 1200, 800);

  // Site title
  if (siteStructure.pages[0]?.sections[0]) {
    const hero = siteStructure.pages[0].sections[0];
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(hero.heading || 'Website', 600, 400);
  }

  return canvas.toBuffer('image/png');
};

module.exports = { generateWebsite };
