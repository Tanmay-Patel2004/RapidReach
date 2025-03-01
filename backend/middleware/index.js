const { protect, authorize } = require('./authMiddleware');
const { errorHandler } = require('./errorMiddleware');
const { checkPermission } = require('./permissionMiddleware');
const { uploadProductFiles, uploadProfilePicture } = require('./uploadMiddleware');
const { getHandlerResponse } = require('./responseMiddleware');

module.exports = {
    // Auth middleware
    protect,
    authorize,
    
    // Error handling
    errorHandler,
    
    // Permission middleware
    checkPermission,
    
    // Upload middleware
    uploadProductFiles,
    uploadProfilePicture,

    // Response middleware
    getHandlerResponse
};
