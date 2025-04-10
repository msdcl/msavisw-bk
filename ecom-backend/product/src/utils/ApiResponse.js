'use strict';

class ApiResponse {
    #statusCode;
    #success;
    #message;
    #data;

    constructor(statusCode, data, message = 'Success') {
        this.#statusCode = statusCode;
        this.#success = statusCode < 400;
        this.#message = message;
        this.#data = data;
    }

    static send(statusCode, data, message) {
        return new ApiResponse(statusCode, data, message);
    }

    toJSON() {
        return {
            success: this.#success,
            statusCode: this.#statusCode,
            message: this.#message,
            data: this.#data
        };
    }
}

export default ApiResponse; 