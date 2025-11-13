const templates = {
  presentations: {
    'modern-business': {
      name: 'Modern Business',
      description: 'Clean and professional for corporate presentations',
      category: 'business',
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1e293b',
        textLight: '#64748b',
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
      },
      slideLayouts: [
        {
          type: 'title',
          name: 'Title Slide',
          template: 'centered',
        },
        {
          type: 'content',
          name: 'Content',
          template: 'two-column',
        },
        {
          type: 'image',
          name: 'Image Focus',
          template: 'image-right',
        },
      ],
    },
    'creative-bold': {
      name: 'Creative Bold',
      description: 'Vibrant and eye-catching for creative industries',
      category: 'creative',
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#fbbf24',
        background: '#1e293b',
        text: '#ffffff',
        textLight: '#cbd5e1',
      },
      fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif',
      },
      slideLayouts: [
        {
          type: 'title',
          name: 'Bold Title',
          template: 'diagonal-split',
        },
        {
          type: 'content',
          name: 'Dynamic Content',
          template: 'asymmetric',
        },
      ],
    },
    'minimalist-clean': {
      name: 'Minimalist Clean',
      description: 'Simple and elegant with lots of whitespace',
      category: 'minimal',
      colors: {
        primary: '#000000',
        secondary: '#404040',
        accent: '#808080',
        background: '#ffffff',
        text: '#000000',
        textLight: '#666666',
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Source Sans Pro, sans-serif',
      },
      slideLayouts: [
        {
          type: 'title',
          name: 'Minimal Title',
          template: 'centered-minimal',
        },
        {
          type: 'content',
          name: 'Clean Content',
          template: 'single-column',
        },
      ],
    },
    'tech-startup': {
      name: 'Tech Startup',
      description: 'Modern and innovative for tech companies',
      category: 'tech',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: '#0f172a',
        text: '#f8fafc',
        textLight: '#cbd5e1',
      },
      fonts: {
        heading: 'Space Grotesk, sans-serif',
        body: 'Inter, sans-serif',
      },
      slideLayouts: [
        {
          type: 'title',
          name: 'Tech Title',
          template: 'gradient-overlay',
        },
        {
          type: 'content',
          name: 'Feature Grid',
          template: 'grid-layout',
        },
      ],
    },
    'academic-professional': {
      name: 'Academic Professional',
      description: 'Formal and structured for academic use',
      category: 'academic',
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1e293b',
        textLight: '#475569',
      },
      fonts: {
        heading: 'Merriweather, serif',
        body: 'Lato, sans-serif',
      },
      slideLayouts: [
        {
          type: 'title',
          name: 'Academic Title',
          template: 'formal-centered',
        },
        {
          type: 'content',
          name: 'Research Content',
          template: 'structured-layout',
        },
      ],
    },
  },

  documents: {
    'professional-doc': {
      name: 'Professional Document',
      description: 'Clean business document format',
      category: 'business',
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        background: '#ffffff',
        text: '#1e293b',
      },
      fonts: {
        heading: 'Georgia, serif',
        body: 'Arial, sans-serif',
      },
      margins: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      },
      headerFooter: true,
      tableOfContents: true,
    },
    'modern-report': {
      name: 'Modern Report',
      description: 'Contemporary report with visual elements',
      category: 'business',
      colors: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        background: '#ffffff',
        text: '#0f172a',
      },
      fonts: {
        heading: 'Helvetica, sans-serif',
        body: 'Helvetica, sans-serif',
      },
      margins: {
        top: '1in',
        bottom: '1in',
        left: '1.25in',
        right: '1.25in',
      },
      headerFooter: true,
      tableOfContents: true,
      coloredHeaders: true,
    },
    'minimal-whitepaper': {
      name: 'Minimal Whitepaper',
      description: 'Clean and focused whitepaper design',
      category: 'technical',
      colors: {
        primary: '#000000',
        secondary: '#404040',
        background: '#ffffff',
        text: '#1a1a1a',
      },
      fonts: {
        heading: 'Times New Roman, serif',
        body: 'Times New Roman, serif',
      },
      margins: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      },
      headerFooter: true,
      tableOfContents: true,
      footnotes: true,
    },
    'creative-proposal': {
      name: 'Creative Proposal',
      description: 'Engaging proposal with visual flair',
      category: 'creative',
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        background: '#ffffff',
        text: '#1e293b',
      },
      fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif',
      },
      margins: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      },
      headerFooter: true,
      coverPage: true,
      coloredSections: true,
    },
  },

  websites: {
    'modern-landing': {
      name: 'Modern Landing Page',
      description: 'Clean and conversion-focused landing page',
      category: 'landing',
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1e293b',
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
      },
      sections: ['hero', 'features', 'testimonials', 'cta', 'footer'],
      responsive: true,
      animations: true,
    },
    'saas-product': {
      name: 'SaaS Product',
      description: 'Complete SaaS website with multiple pages',
      category: 'saas',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: '#ffffff',
        text: '#1e293b',
      },
      fonts: {
        heading: 'Space Grotesk, sans-serif',
        body: 'Inter, sans-serif',
      },
      sections: ['hero', 'features', 'pricing', 'faq', 'footer'],
      pages: ['home', 'features', 'pricing', 'about', 'contact'],
      responsive: true,
      darkMode: true,
    },
    'creative-portfolio': {
      name: 'Creative Portfolio',
      description: 'Stunning portfolio for creatives',
      category: 'portfolio',
      colors: {
        primary: '#000000',
        secondary: '#404040',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#000000',
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Raleway, sans-serif',
      },
      sections: ['hero', 'work', 'about', 'contact', 'footer'],
      gallery: true,
      animations: true,
    },
    'business-corporate': {
      name: 'Business Corporate',
      description: 'Professional corporate website',
      category: 'business',
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1e293b',
      },
      fonts: {
        heading: 'Lato, sans-serif',
        body: 'Lato, sans-serif',
      },
      sections: ['hero', 'services', 'about', 'team', 'contact', 'footer'],
      pages: ['home', 'services', 'about', 'blog', 'contact'],
      responsive: true,
    },
    'ecommerce-store': {
      name: 'E-commerce Store',
      description: 'Modern online store layout',
      category: 'ecommerce',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#ffffff',
        text: '#1e293b',
      },
      fonts: {
        heading: 'Poppins, sans-serif',
        body: 'Roboto, sans-serif',
      },
      sections: ['hero', 'products', 'categories', 'testimonials', 'footer'],
      pages: ['home', 'shop', 'product', 'cart', 'checkout'],
      productGrid: true,
      responsive: true,
    },
  },
};

// Get template by ID
const getTemplate = (type, templateId) => {
  return templates[type]?.[templateId] || null;
};

// Get all templates of a type
const getTemplatesByType = (type) => {
  return templates[type] || {};
};

// Get templates by category
const getTemplatesByCategory = (type, category) => {
  const allTemplates = templates[type] || {};
  return Object.entries(allTemplates)
    .filter(([_, template]) => template.category === category)
    .reduce((acc, [id, template]) => {
      acc[id] = template;
      return acc;
    }, {});
};

// Get default template for each type
const getDefaultTemplate = (type) => {
  const defaults = {
    presentations: 'modern-business',
    documents: 'professional-doc',
    websites: 'modern-landing',
  };
  return defaults[type];
};

module.exports = {
  templates,
  getTemplate,
  getTemplatesByType,
  getTemplatesByCategory,
  getDefaultTemplate,
};
