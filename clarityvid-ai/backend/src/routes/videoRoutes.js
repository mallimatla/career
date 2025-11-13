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

// Routes
router.post('/', protect, checkCredits, upload.single('file'), videoController.createVideo);
router.get('/', protect, videoController.getVideos);
router.get('/:id', protect, videoController.getVideo);
router.delete('/:id', protect, videoController.deleteVideo);
router.post('/:id/generate-script', protect, checkCredits, videoController.generateVideoScript);
router.put('/:id/script', protect, videoController.updateScript);
router.post('/:id/generate', protect, checkCredits, videoController.generateVideo);
router.get('/:id/status', protect, videoController.getVideoStatus);

module.exports = router;
