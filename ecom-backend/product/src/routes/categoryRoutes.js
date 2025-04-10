'use strict';

import { Router } from 'express';
import categoryController from '../controllers/categoryController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const routes = {
    list: '/',
    active: '/active',
    search: '/search'
};


const categoryRoutes = {
    /**
     * @route GET /api/v1/categories
     * @desc Get all categories with pagination and filters
     */
    [routes.list]: {
        get: {
            handler: categoryController.getAllCategories,
            middleware: []
        }
    },

    /**
     * @route GET /api/v1/categories/active
     * @desc Get all active categories
     */
    [routes.active]: {
        get: {
            handler: categoryController.getActiveCategories,
            middleware: []
        }
    },

    /**
     * @route GET /api/v1/categories/search
     * @desc Search categories by name
     */
    [routes.search]: {
        get: {
            handler: categoryController.searchCategories,
            middleware: []
        }
    }
};

// Register routes
Object.entries(categoryRoutes).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, { handler, middleware }]) => {
        router[method](
            path,
            ...middleware,
            asyncHandler(handler)
        );
    });
});

export { routes as categoryRoutes };
export default router; 