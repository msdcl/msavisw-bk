'use strict';

import Product from '../models/product.js';
import AppError from '../utils/appError.js';

class ProductStore {
    async create(data) {
        try {
            return await Product.create(data);
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new AppError(error.message, 400);
            }
            throw new AppError('Failed to create product', 400);
        }
    }

    async findById(id) {
        const product = await Product.findById(id)
            .populate('category')
            .populate('brand');

        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    }

    async findAll(query = {}) {
        const { 
            page = 1, 
            limit = 10, 
            ...filters 
        } = query;

        const queryObj = { ...filters };
       
        // Build query
        // if (category) queryObj.category = category;
        // if (brand) queryObj.brand = brand;
        // if (minPrice || maxPrice) {
        //     queryObj.price = {};
        //     if (minPrice) queryObj.price.$gte = minPrice;
        //     if (maxPrice) queryObj.price.$lte = maxPrice;
        // }
        // if (search) {
        //     queryObj.$text = { $search: search };
        // }

        // Execute query
        const total = await Product.countDocuments(queryObj);
        const products = await Product.find(queryObj)
            .populate('category_name')
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            rows: products,
            count: total
        };
    }

    async update(id, data) {
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: data },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('category').populate('brand');

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return product;
    }

    async delete(id) {
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return true;
    }

    async updateStock(id, quantity) {
        const product = await this.findById(id);
        return await product.updateStock(quantity);
    }

    async findByCategory(categoryId) {
        return await Product.findByCategory(categoryId);
    }

    async findActive() {
        return await Product.findActiveProducts();
    }
}

export default new ProductStore();
