'use strict';

import productStore from '../stores/productStore.js';
import ApiResponse from '../utils/ApiResponse.js';
import AppError from '../utils/appError.js';
import { validateProduct } from '../validators/productValidator.js';

class ProductController {
    #store;

    constructor() {
        this.#store = productStore;
    }

    /**
     * Create a new product
     * @route POST /api/v1/products
     */
    create = async (req, res) => {
        const { error, value } = validateProduct(req.body);
        
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const product = await this.#store.create(value);
        
        res.status(201).json(
            ApiResponse.send(201, product, 'Product created successfully')
        );
    };

    /**
     * Get all products with pagination and filters
     * @route GET /api/v1/products
     */
    getAll = async (req, res) => {
        const { page, limit, ...filters } = req.query;
        
        const { rows: products, count: total } = await this.#store.findAll({
            page,
            limit,
            ...filters
        });

        res.status(200).json(
            ApiResponse.send(200, {
                products,
                pagination: {
                    page,
                    limit,
                    total
                }
            })
        );
    };

    /**
     * Get a single product by ID
     * @route GET /api/v1/products/:id
     */
    getById = async (req, res) => {
        const product = await this.#store.findById(req.params.id);
        
        res.status(200).json(
            ApiResponse.send(200, product)
        );
    };

    /**
     * Update a product
     * @route PUT /api/v1/products/:id
     */
    update = async (req, res) => {
        const { error, value } = validateProduct(req.body, true);
        
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const product = await this.#store.update(req.params.id, value);
        
        res.status(200).json(
            ApiResponse.send(200, product, 'Product updated successfully')
        );
    };

    /**
     * Delete a product
     * @route DELETE /api/v1/products/:id
     */
    delete = async (req, res) => {
        await this.#store.delete(req.params.id);
        
        res.status(200).json(
            ApiResponse.send(200, null, 'Product deleted successfully')
        );
    };

    
    /**
     * Toggle product active status
     * @route PATCH /api/v1/products/:id/toggle-status
     */
    toggleStatus = async (req, res) => {
        const product = await this.#store.findById(req.params.id);
        const updatedProduct = await this.#store.update(req.params.id, {
            is_active: !product.is_active
        });
        
        res.status(200).json(
            ApiResponse.send(
                200, 
                updatedProduct, 
                `Product ${updatedProduct.is_active ? 'activated' : 'deactivated'} successfully`
            )
        );
    };
}

export default new ProductController(); 