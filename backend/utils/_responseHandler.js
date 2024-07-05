import HttpStatus from 'http-status-codes';

const responseHandler = (res, httpCode, type, message, data = {}) => (
    res.status(httpCode).json({
        type,
        message,
        ...data
    })
);

export default responseHandler;
