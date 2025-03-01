const getHandlerResponse = (status, code, message, data) => {
    return {
        status,
        code,
        message,
        data
    }
};

module.exports = {
    getHandlerResponse
}; 