'use strict';

import categoryStore from '../stores/categoryStore.js';
import ApiResponse from '../utils/ApiResponse.js';

class CategoryController {
    /**
     * Get all categories
     * @route GET /api/v1/categories
     */
    async getAllCategories(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sort = 'category_name',
                active,
                search 
            } = req.query;

            const result = await categoryStore.findAll({
                page,
                limit,
                sort,
                active,
                search
            });

            res.status(200).json(
                ApiResponse.send(200, result)
            );
        } catch (error) {
            console.error('Get Categories Error:', error);
            res.status(500).json(
                ApiResponse.send(500, null, 'Error fetching categories')
            );
        }
    }

    /**
     * Get active categories
     * @route GET /api/v1/categories/active
     */
    async getActiveCategories(req, res) {
        try {
            const categories = await categoryStore.findActive();
            
            res.status(200).json(
                ApiResponse.send(200, { categories })
            );
        } catch (error) {
            console.error('Get Active Categories Error:', error);
            res.status(500).json(
                ApiResponse.send(500, null, 'Error fetching active categories')
            );
        }
    }

    /**
     * Search categories by name
     * @route GET /api/v1/categories/search
     */
    async searchCategories(req, res) {
        try {
            const { q } = req.query;
            
            const categories = await categoryStore.search(q);

            res.status(200).json(
                ApiResponse.send(200, { categories })
            );
        } catch (error) {
            console.error('Search Categories Error:', error);
            
            if (error.message === 'Search query is required') {
                return res.status(400).json(
                    ApiResponse.send(400, null, error.message)
                );
            }

            res.status(500).json(
                ApiResponse.send(500, null, 'Error searching categories')
            );
        }
    }
}

export default new CategoryController(); 