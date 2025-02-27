const s3 = require('../config/s3Config');
const { v4: uuidv4 } = require('uuid');

const uploadToS3 = async (file, folder = 'general') => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${folder}/${uuidv4()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        console.log('🚀 Attempting S3 upload with params:', {
            Bucket: params.Bucket,
            Key: params.Key,
            ContentType: params.ContentType,
            FileSize: file.buffer.length
        });

        const result = await s3.upload(params).promise();
        console.log('✅ S3 Upload successful:', result.Location);
        return result.Location;
    } catch (error) {
        console.error('❌ Detailed S3 Upload Error:', {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            requestId: error.requestId
        });
        throw new Error(`S3 Upload Failed: ${error.message}`);
    }
};

module.exports = uploadToS3; 