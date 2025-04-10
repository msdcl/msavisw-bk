'use strict';

import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './environment.js';

class Database {
    #instance;
    #isConnected = false;
    #connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4
    };

    constructor() {
        if (this.#instance) {
            return this.#instance;
        }
        this.#instance = this;

        mongoose.set('strictQuery', false);

        // Monitor pool events
        mongoose.connection.on('connected', () => {
            this.#isConnected = true;
            logger.info('MongoDB connected successfully');
            this.#logPoolInfo();
        });

        mongoose.connection.on('error', (err) => {
            this.#isConnected = false;
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            this.#isConnected = false;
            logger.warn('MongoDB disconnected');
        });

        // Monitor connection pool events
        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
            this.#logPoolInfo();
        });

        // Connection pool monitoring
        setInterval(() => {
            if (this.#isConnected) {
                this.#logPoolInfo();
            }
        }, 300000); // Log pool stats every 5 minutes

        // Handle process termination
        process.on('SIGINT', this.#gracefulShutdown.bind(this));
        process.on('SIGTERM', this.#gracefulShutdown.bind(this));
    }

    async #logPoolInfo() {
        const db = this.getConnection();
        if (db) {
            try {
                const stats = await db.db.command({ serverStatus: 1 });
                logger.info('MongoDB Connection Pool Stats:', {
                    active: stats.connections.active,
                    available: stats.connections.available,
                    current: stats.connections.current,
                    totalCreated: stats.connections.totalCreated
                });
            } catch (error) {
                logger.error('Error getting pool stats:', error);
            }
        }
    }

    async connect() {
        if (this.#isConnected) {
            console.log('Using existing MongoDB connection');
            return;
        }

        try {
            const uri = config.get('MONGODB_URI');
            console.log('Attempting to connect to MongoDB:', uri);

            const connection = await mongoose.connect(uri, this.#connectionOptions);
            
            if (connection) {
                this.#isConnected = true;
                console.log('MongoDB Connected Successfully to:', connection.connection.host);
                console.log('Database Name:', connection.connection.name);
            }

        } catch (error) {
            console.error('MongoDB Connection Error:', error);
            throw error;
        }
    }

    async disconnect() {
        if (!this.#isConnected) return;

        try {
            await mongoose.disconnect();
            this.#isConnected = false;
            console.log('MongoDB Disconnected');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    async #gracefulShutdown() {
        try {
            logger.info('Closing MongoDB connection pool...');
            await this.disconnect();
            process.exit(0);
        } catch (error) {
            logger.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    }

    getConnection() {
        return mongoose.connection;
    }

    isConnected() {
        return this.#isConnected;
    }

    // Get current pool statistics
    async getPoolStats() {
        if (!this.#isConnected) {
            return null;
        }

        const db = this.getConnection();
        try {
            const stats = await db.db.command({ serverStatus: 1 });
            return {
                active: stats.connections.active,
                available: stats.connections.available,
                current: stats.connections.current,
                totalCreated: stats.connections.totalCreated
            };
        } catch (error) {
            logger.error('Error getting pool stats:', error);
            return null;
        }
    }
}

// Create and export singleton instance
const database = new Database();
export default database; 