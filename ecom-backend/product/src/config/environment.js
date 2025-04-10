'use strict';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment-specific .env file
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: join(__dirname, '../../', envFile) });
// Load default .env file as fallback
dotenv.config({ path: join(__dirname, '../../.env') });

class Config {
    static #instance;
    #config;

    constructor() {
        if (Config.#instance) {
            return Config.#instance;
        }
        Config.#instance = this;
        this.#initializeConfig();
    }

    #initializeConfig() {
        this.#config = {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                credentials: true,
                maxAge: 86400
            },
            MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
            MONGODB_NAME: process.env.MONGODB_NAME || 'new_products',
            PORT: parseInt(process.env.PORT, 10) || 3001,
            RATE_LIMIT: {
                windowMs: 15 * 60 * 1000,
                max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
                message: 'Too many requests from this IP, please try again later.',
                standardHeaders: true,
                legacyHeaders: false
            },
            IS_PROD: process.env.NODE_ENV === 'production',
            env: process.env.NODE_ENV || 'development'
        };

        // Freeze configuration to prevent modifications
        Object.freeze(this.#config);
    }

    get(key) {
        if (!this.#config[key] && this.#config[key] !== false) {
            throw new Error(`Configuration key not found: ${key}`);
        }
        return this.#config[key];
    }

    getAll() {
        return { ...this.#config };
    }
}

// Create and export singleton instance
const config = new Config();

// Make config globally available
globalThis.Config = config;

export default config;