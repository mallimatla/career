const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const CDN_URL = process.env.AWS_CLOUDFRONT_URL;

/**
 * Upload file to S3
 * @param {object} file - File object (from multer)
 * @param {string} folder - S3 folder path
 * @returns {object} - Upload result with URL
 */
exports.uploadToS3 = async (file, folder = 'uploads') => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();

    return {
      ...result,
      CDNUrl: CDN_URL ? `${CDN_URL}/${fileName}` : result.Location,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3: ' + error.message);
  }
};

/**
 * Upload buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - File name with extension
 * @param {string} contentType - MIME type
 * @param {string} folder - S3 folder path
 * @returns {object} - Upload result with URL
 */
exports.uploadBufferToS3 = async (buffer, fileName, contentType, folder = 'videos') => {
  try {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();

    return {
      ...result,
      CDNUrl: CDN_URL ? `${CDN_URL}/${key}` : result.Location,
    };
  } catch (error) {
    console.error('S3 Buffer Upload Error:', error);
    throw new Error('Failed to upload buffer to S3: ' + error.message);
  }
};

/**
 * Delete file from S3
 * @param {string} fileUrl - S3 file URL or key
 * @returns {boolean} - Success status
 */
exports.deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    let key = fileUrl;
    if (fileUrl.includes('amazonaws.com')) {
      key = fileUrl.split('.com/')[1];
    } else if (fileUrl.includes(CDN_URL)) {
      key = fileUrl.replace(CDN_URL + '/', '');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return false;
  }
};

/**
 * Get signed URL for private file access
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} - Signed URL
 */
exports.getSignedUrl = (key, expiresIn = 3600) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
  };

  return s3.getSignedUrl('getObject', params);
};

/**
 * Check if file exists in S3
 * @param {string} key - S3 object key
 * @returns {boolean} - Exists status
 */
exports.fileExists = async (key) => {
  try {
    await s3.headObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

/**
 * Copy file within S3
 * @param {string} sourceKey - Source object key
 * @param {string} destinationKey - Destination object key
 * @returns {object} - Copy result
 */
exports.copyFile = async (sourceKey, destinationKey) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
      ACL: 'public-read',
    };

    const result = await s3.copyObject(params).promise();
    return result;
  } catch (error) {
    console.error('S3 Copy Error:', error);
    throw new Error('Failed to copy file: ' + error.message);
  }
};
