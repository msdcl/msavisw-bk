'use strict';

import { Router } from 'express';
import productController from '../controllers/productController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const routes = {
    list: '/',
    detail: '/:id',
    toggleStatus: '/:id/status'
};

// Middleware to handle query parameters
const handleQueryParams = (req, res, next) => {
    // Convert category_id to string and set default
    req.query.category_id = (req.query.category_id || '1').toString();
    
    // Convert pagination params to numbers with defaults
    req.query.page = parseInt(req.query.page, 10) || 1;
    req.query.limit = parseInt(req.query.limit, 10) || 10;
    
    next();
};

const productRoutes = {
    /**
     * @route GET /api/v1/products
     * @route POST /api/v1/products
     */
    [routes.list]: {
        get: {
            handler: productController.getAll,
            middleware: [handleQueryParams]
        },
        post: {
            handler: productController.create,
            middleware: []
        }
    },

    /**
     * @route GET /api/v1/products/:id
     * @route PUT /api/v1/products/:id
     * @route DELETE /api/v1/products/:id
     */
    [routes.detail]: {
        get: {
            handler: productController.getById,
            middleware: []
        },
        put: {
            handler: productController.update,
            middleware: []
        },
        delete: {
            handler: productController.delete,
            middleware: []
        }
    },

    /**
     * @route PATCH /api/v1/products/:id/status
     */
    [routes.toggleStatus]: {
        patch: {
            handler: productController.toggleStatus,
            middleware: []
        }
    }
};

// Register routes
Object.entries(productRoutes).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, { handler, middleware }]) => {
        router[method](
            path,
            ...middleware,
            asyncHandler(handler)
        );
    });
});

export { routes as productRoutes };
export default router; 