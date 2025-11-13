const { storage } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Upload file to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Storage folder (videos, presentations, documents, websites)
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Public URL of uploaded file
 */
exports.uploadFile = async (fileBuffer, fileName, folder, userId) => {
  try {
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `${folder}/${userId}/${uniqueFileName}`;

    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType: getContentType(fileExtension),
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
      public: true,
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return publicUrl;
  } catch (error) {
    console.error('Firebase Storage Upload Error:', error);
    throw new Error('Failed to upload file: ' + error.message);
  }
};

/**
 * Upload multiple files
 * @param {Array} files - Array of {buffer, name} objects
 * @param {string} folder - Storage folder
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} - Array of public URLs
 */
exports.uploadMultipleFiles = async (files, folder, userId) => {
  try {
    const uploadPromises = files.map(file =>
      this.uploadFile(file.buffer, file.name, folder, userId)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error('Failed to upload multiple files: ' + error.message);
  }
};

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl - Public URL of file
 * @returns {Promise<boolean>}
 */
exports.deleteFile = async (fileUrl) => {
  try {
    const bucket = storage.bucket();
    const fileName = extractFilePathFromUrl(fileUrl);

    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const file = bucket.file(fileName);
    await file.delete();

    return true;
  } catch (error) {
    console.error('Firebase Storage Delete Error:', error);
    throw new Error('Failed to delete file: ' + error.message);
  }
};

/**
 * Delete folder and all its contents
 * @param {string} folderPath - Folder path (e.g., 'videos/userId/videoId')
 * @returns {Promise<boolean>}
 */
exports.deleteFolder = async (folderPath) => {
  try {
    const bucket = storage.bucket();
    await bucket.deleteFiles({
      prefix: folderPath,
    });

    return true;
  } catch (error) {
    console.error('Firebase Storage Delete Folder Error:', error);
    throw new Error('Failed to delete folder: ' + error.message);
  }
};

/**
 * Get signed URL for temporary access
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - Expiration time in minutes (default: 60)
 * @returns {Promise<string>} - Signed URL
 */
exports.getSignedUrl = async (filePath, expiresIn = 60) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 60 * 1000,
    });

    return url;
  } catch (error) {
    console.error('Firebase Storage Signed URL Error:', error);
    throw new Error('Failed to get signed URL: ' + error.message);
  }
};

/**
 * Check if file exists
 * @param {string} filePath - File path in storage
 * @returns {Promise<boolean>}
 */
exports.fileExists = async (filePath) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    return false;
  }
};

/**
 * Get file metadata
 * @param {string} filePath - File path in storage
 * @returns {Promise<object>} - File metadata
 */
exports.getFileMetadata = async (filePath) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    return metadata;
  } catch (error) {
    throw new Error('Failed to get file metadata: ' + error.message);
  }
};

/**
 * Upload from local file path
 * @param {string} localFilePath - Local file path
 * @param {string} destinationPath - Destination path in storage
 * @returns {Promise<string>} - Public URL
 */
exports.uploadFromLocalFile = async (localFilePath, destinationPath) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(destinationPath);

    await bucket.upload(localFilePath, {
      destination: destinationPath,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
      public: true,
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    return publicUrl;
  } catch (error) {
    throw new Error('Failed to upload from local file: ' + error.message);
  }
};

/**
 * Download file to buffer
 * @param {string} filePath - File path in storage
 * @returns {Promise<Buffer>} - File buffer
 */
exports.downloadFile = async (filePath) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    return buffer;
  } catch (error) {
    throw new Error('Failed to download file: ' + error.message);
  }
};

// Helper functions

/**
 * Get content type from file extension
 * @param {string} extension - File extension
 * @returns {string} - MIME type
 */
function getContentType(extension) {
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.zip': 'application/zip',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Extract file path from public URL
 * @param {string} url - Public URL
 * @returns {string|null} - File path or null
 */
function extractFilePathFromUrl(url) {
  try {
    const match = url.match(/storage\.googleapis\.com\/[^\/]+\/(.+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

module.exports = exports;
