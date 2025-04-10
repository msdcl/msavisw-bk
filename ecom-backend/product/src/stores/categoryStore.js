'use strict';

import Category from '../models/category.js';
import mongoose from 'mongoose';

class CategoryStore {
    async findAll(query = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                ...filters 
            } = query;
    
            const queryObj = { ...filters };

            // Execute query with pagination
        
            
            const categories = [
                { "category_id": 23, "category_name": "snacks", "color": "#FF5733" },
                { "category_id": 2, "category_name": "fruits", "color": "#4CAF50" },
                { "category_id": 38, "category_name": "beverages", "color": "#2196F3" },
                { "category_id": 40, "category_name": "sweets", "color": "#FFC107" },
                { "category_id": 34, "category_name": "bakery", "color": "#795548" },
                { "category_id": 41, "category_name": "cooking", "color": "#FF9800" },
                { "category_id": 21, "category_name": "drinks", "color": "#3F51B5" },
                { "category_id": 48, "category_name": "nuts", "color": "#8D6E63" },
                { "category_id": 37, "category_name": "body care", "color": "#E91E63" },
                { "category_id": 24, "category_name": "beauty", "color": "#F44336" },
                { "category_id": 43, "category_name": "hygiene", "color": "#009688" },
                { "category_id": 36, "category_name": "dental", "color": "#00BCD4" },
                { "category_id": 44, "category_name": "grooming", "color": "#673AB7" },
                { "category_id": 51, "category_name": "baby care", "color": "#FFEB3B" },
                { "category_id": 39, "category_name": "cleaning", "color": "#4DB6AC" },
                { "category_id": 49, "category_name": "pets", "color": "#CDDC39" },
                { "category_id": 10, "category_name": "flora", "color": "#FF4081" },
                { "category_id": 47, "category_name": "office", "color": "#607D8B" }
            ]
          
            // Get total count
            
            const total=20
            return {
                categories,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Category Store - Find All Error:', error);
            throw error;
        }
    }

    async findActive() {
        try {
            return await Category.findActiveCategories();
        } catch (error) {
            console.error('Category Store - Find Active Error:', error);
            throw error;
        }
    }

    async search(searchQuery) {
        try {
            if (!searchQuery) {
                throw new Error('Search query is required');
            }

            return await Category.find(
                { $text: { $search: searchQuery } },
                { score: { $meta: 'textScore' } }
            )
            .sort({ score: { $meta: 'textScore' } });
        } catch (error) {
            console.error('Category Store - Search Error:', error);
            throw error;
        }
    }
}

export default new CategoryStore(); 