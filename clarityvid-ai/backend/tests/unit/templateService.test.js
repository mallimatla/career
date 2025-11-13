const {
  getTemplate,
  getTemplatesByType,
  getTemplatesByCategory,
  getDefaultTemplate,
} = require('../../src/services/templateService');

describe('Template Service', () => {
  describe('getTemplate', () => {
    it('should return a valid presentation template', () => {
      const template = getTemplate('presentations', 'modern-business');

      expect(template).toBeDefined();
      expect(template.name).toBe('Modern Business');
      expect(template.colors).toBeDefined();
      expect(template.fonts).toBeDefined();
    });

    it('should return a valid document template', () => {
      const template = getTemplate('documents', 'professional-doc');

      expect(template).toBeDefined();
      expect(template.name).toBe('Professional Document');
    });

    it('should return a valid website template', () => {
      const template = getTemplate('websites', 'modern-landing');

      expect(template).toBeDefined();
      expect(template.name).toBe('Modern Landing Page');
    });

    it('should return null for invalid template', () => {
      const template = getTemplate('presentations', 'nonexistent');

      expect(template).toBeNull();
    });
  });

  describe('getTemplatesByType', () => {
    it('should return all presentation templates', () => {
      const templates = getTemplatesByType('presentations');

      expect(Object.keys(templates).length).toBeGreaterThan(0);
      expect(templates['modern-business']).toBeDefined();
      expect(templates['creative-bold']).toBeDefined();
    });

    it('should return all document templates', () => {
      const templates = getTemplatesByType('documents');

      expect(Object.keys(templates).length).toBeGreaterThan(0);
      expect(templates['professional-doc']).toBeDefined();
    });

    it('should return all website templates', () => {
      const templates = getTemplatesByType('websites');

      expect(Object.keys(templates).length).toBeGreaterThan(0);
      expect(templates['modern-landing']).toBeDefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates filtered by category', () => {
      const businessTemplates = getTemplatesByCategory('presentations', 'business');

      expect(Object.keys(businessTemplates).length).toBeGreaterThan(0);
      Object.values(businessTemplates).forEach(template => {
        expect(template.category).toBe('business');
      });
    });

    it('should return creative templates', () => {
      const creativeTemplates = getTemplatesByCategory('presentations', 'creative');

      expect(Object.keys(creativeTemplates).length).toBeGreaterThan(0);
      Object.values(creativeTemplates).forEach(template => {
        expect(template.category).toBe('creative');
      });
    });
  });

  describe('getDefaultTemplate', () => {
    it('should return default presentation template', () => {
      const defaultId = getDefaultTemplate('presentations');

      expect(defaultId).toBe('modern-business');
    });

    it('should return default document template', () => {
      const defaultId = getDefaultTemplate('documents');

      expect(defaultId).toBe('professional-doc');
    });

    it('should return default website template', () => {
      const defaultId = getDefaultTemplate('websites');

      expect(defaultId).toBe('modern-landing');
    });
  });
});
