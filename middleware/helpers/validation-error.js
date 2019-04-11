'use strict'

module.exports = class ValidationError extends Error {
    constructor(details) {
        super(getValidationMessage(details));

        this.name = this.constructor.name;
        this.status = 400;

        if (typeof details === 'object') {
            this.details = details;
        }
    }

    get statusCode() {
        return this.status;
    }

    set statusCode(value) {
        this.status = value;
    }
};

/**
 * get validation messages
 * @param {*} details 
 * @returns {*} error
 */
function getValidationMessage(details) {
    if (typeof details === 'string') {
        return details;
    } else if (Array.isArray(details) && details.length > 0 && details[0].message !== null) {
        return details[0].message;
    } else if (details !== null && details.message !== null) {
        return details.message;
    }
    return 'Validation error';
}
