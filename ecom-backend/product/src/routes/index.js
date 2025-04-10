'use strict';

import { Router } from 'express';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const router = Router();

const apiRoutes = {
    products: '/products',
    categories: '/categories'
};

// Register API routes
router.use(apiRoutes.products, productRoutes);
router.use(apiRoutes.categories, categoryRoutes);

export { apiRoutes };
export default router; 