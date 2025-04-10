'use strict';

// Import config first to ensure it's available globally
import config from './src/config/environment.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandlers.js';
import routes, { apiRoutes } from './src/routes/index.js';
import database from './src/config/database.js';
import logger from './src/utils/logger.js';
//


class Server {
    #app;
    #server;

    constructor() {
        this.#app = express();
        this.port = config.get('PORT');
        this.env = config.get('env');

        this.#setupProcessHandlers();
        this.#initializeMiddleware();
        this.#initializeRoutes();
        this.#initializeErrorHandling();
    }

    #setupProcessHandlers() {
        ['uncaughtException', 'unhandledRejection'].forEach(event => {
            process.on(event, (err) => {
                logger.error(`${event.toUpperCase()}! 💥`);
                logger.error(err.name, err.message);
                logger.error(err.stack);
                process.exit(1);
            });
        });

        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            if (this.#server) {
                this.#gracefulShutdown();
            }
        });
    }

    #initializeMiddleware() {
        // Security middleware
        this.#app.use(helmet({
            contentSecurityPolicy: config.get('IS_PROD') ? undefined : false
        }));
        
        // CORS configuration
        this.#app.use(cors(config.get('cors')));

        // Rate limiting
        this.#app.use('/api', rateLimit(config.get('RATE_LIMIT')));

        // Body parsing
        this.#app.use(express.json({ 
            limit: '10kb',
            verify: (req, res, buf) => { req.rawBody = buf }
        }));
        this.#app.use(express.urlencoded({ 
            extended: true, 
            limit: '10kb' 
        }));
        this.#app.use(cookieParser());

        // Data sanitization
        this.#app.use(mongoSanitize());
        this.#app.use(xss());
        this.#app.use(hpp());

        // Performance
        this.#app.use(compression({
            filter: (req, res) => {
                if (req.headers['x-no-compression']) return false;
                return compression.filter(req, res);
            },
            level: 6
        }));

        // Logging
        if (this.env === 'development') {
            this.#app.use((req, res, next) => {
                logger.debug({
                    method: req.method,
                    url: req.url,
                    query: req.query,
                    body: req.body
                });
                next();
            });
        }

        // Health check
        this.#app.get('/health', (req, res) => {
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Server is healthy',
                data: {
                    environment: this.env,
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage()
                }
            });
        });
    }

    #initializeRoutes() {
        // API routes
        this.#app.use('/api/v1', routes);

        // API documentation
        this.#app.get('/api/v1/docs', (req, res) => {
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'API Routes',
                data: {
                    version: 'v1',
                    basePath: '/api/v1',
                    routes: {
                        products: {
                            base: apiRoutes.products,
                            endpoints: {
                                list: {
                                    get: 'Get all products',
                                    post: 'Create a new product'
                                },
                                detail: {
                                    get: 'Get product by ID',
                                    put: 'Update product',
                                    delete: 'Delete product'
                                },
                                toggleStatus: {
                                    patch: 'Toggle product status'
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    #initializeErrorHandling() {
        this.#app.use(notFoundHandler);
        this.#app.use(errorHandler);
    }

    #gracefulShutdown() {
        this.#server?.close(async () => {
            logger.info('HTTP server closed');
            await database.disconnect();
            process.exit(0);
        });
    }

    async start() {
        try {
            // Connect to MongoDB
            await database.connect();

            this.#server = this.#app.listen(this.port, () => {
                logger.info(`
                    Server running in ${this.env} mode on port ${this.port}
                    Health check: http://localhost:${this.port}/health
                    API docs: http://localhost:${this.port}/api/v1/docs
                    MongoDB Status: ${database.isConnected() ? 'Connected' : 'Disconnected'}
                `);
            });
        } catch (error) {
            logger.error('Unable to start server:', error);
            process.exit(1);
        }
    }
}

const server = new Server();
server.start().catch(err => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});
