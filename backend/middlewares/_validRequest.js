import Joi from 'joi';
import responseHandler from '../utils/index.js';
import HttpStatus from 'http-status-codes';

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return responseHandler(res, HttpStatus.BAD_REQUEST, 'error', error.details[0].message);
        }
        next();
    };
};

export default validateRequest;
