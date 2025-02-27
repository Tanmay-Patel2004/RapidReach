const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'images') {
        // Handle image files
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image type. Only JPEG, JPG and PNG files are allowed.'), false);
        }
    } else if (file.fieldname === 'video') {
        // Handle video files
        const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video type. Only MP4, MPEG, and MOV videos are allowed.'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB file size limit
    }
});

// Create middleware for different upload scenarios
const uploadProductFiles = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]);

const uploadProfilePicture = upload.single('profilePicture');

module.exports = {
    uploadProductFiles,
    uploadProfilePicture
}; 