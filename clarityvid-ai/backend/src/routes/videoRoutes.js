const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controllers/videoController');
const { protect, checkCredits } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/markdown'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, PPTX, TXT, and MD files are allowed.'));
    }
  },
});

// Wrapper to handle optional file upload errors gracefully
const optionalFileUpload = (req, res, next) => {
  const uploadMiddleware = upload.single('file');
  uploadMiddleware(req, res, (err) => {
    if (err) {
      // If it's a busboy/multer parsing error and no file was intended, ignore it
      if (err.message && err.message.includes('Unexpected end of form')) {
        console.log('Multipart parsing issue, treating as no file upload');
        return next();
      }
      // For other errors, pass them along
      return next(err);
    }
    next();
  });
};

// Routes
router.post('/', protect, checkCredits, optionalFileUpload, videoController.createVideo);
router.get('/', protect, videoController.getVideos);
router.get('/:id', protect, videoController.getVideo);
router.delete('/:id', protect, videoController.deleteVideo);
router.post('/:id/generate-script', protect, checkCredits, videoController.generateVideoScript);
router.put('/:id/script', protect, videoController.updateScript);
router.post('/:id/generate', protect, checkCredits, videoController.generateVideo);
router.get('/:id/status', protect, videoController.getVideoStatus);

module.exports = router;
