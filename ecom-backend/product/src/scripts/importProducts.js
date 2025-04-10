'use strict';

import 'dotenv/config';
import xlsx from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Product from '../models/product.js';
import database from '../config/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

class ProductImporter {
    #workbook;
    #worksheet;
    #products = [];

    constructor(filePath) {
        try {
            this.#workbook = xlsx.readFile(filePath || '/Users/msc/Downloads/products_with_colors.xlsx');
            this.#worksheet = this.#workbook.Sheets[this.#workbook.SheetNames[0]];
        } catch (error) {
            console.error('Excel Read Error:', error);
            throw error;
        }
    }

    #transformRow(row) {
        try {
            const transformed = {
                name: row.prod_name?.toString().trim(),
                price: Number(row.price) || 0,
                max_price: Number(row.max_price) || Number(row.price) || 0,
                stock: Number(row.stock) || 10,
                images: [],
                category_name: row.category_name?.toString().trim(),
                category_id: Number(row.category_id) || null,
                subcat: Number(row.subcat) || null,
                subcat_name: row.subcat_name?.toString().trim() || null,
                pack_qt: Number(row.pack_qt) || 0,
                is_active: true,
                color:row.color.toString()
            };

            // Validate required fields
            if (!transformed.name || !transformed.category_name) {
                throw new Error('Missing required fields');
            }

            return transformed;
        } catch (error) {
            console.error('Transform Error:', error);
            throw error;
        }
    }

    async #processRows() {
        try {
            const rows = xlsx.utils.sheet_to_json(this.#worksheet, {
                raw: false,
                defval: null
            });

            console.log('Total Excel Rows:', rows.length);

            for (const row of rows) {
                try {
                    const transformedRow = this.#transformRow(row);
                    this.#products.push(transformedRow);
                } catch (error) {
                    console.error('Row Processing Error:', error);
                }
            }

            console.log('Valid Products to Import:', this.#products.length);
        } catch (error) {
            console.error('Process Rows Error:', error);
            throw error;
        }
    }

    async import() {
        try {
            await this.#processRows();

            if (this.#products.length === 0) {
                throw new Error('No valid products to import');
            }

            console.log('MongoDB Connection State:', mongoose.connection.readyState);
            console.log('Database Name:', mongoose.connection.db.databaseName);
            console.log('Collection Name:', mongoose.connection.collection);

            let inserted = 0;
            for (const productData of this.#products) {
                try {
                    console.log('\n--- Attempting to save product ---');
                    console.log('Product Data:', JSON.stringify(productData, null, 2));

                    // Try direct MongoDB insert first to verify connection
                    const rawResult = await mongoose.connection.db
                        .collection('products')
                        .insertOne(productData);
                    
                    console.log('Raw MongoDB Insert Result:', rawResult);

                    if (rawResult.insertedId) {
                        inserted++;
                        console.log(`Saved Product ${inserted} with ID:`, rawResult.insertedId);
                    }

                } catch (error) {
                    console.error('Product Save Error:', {
                        message: error.message,
                        code: error.code,
                        name: error.name
                    });
                    
                    if (error.errors) {
                        Object.entries(error.errors).forEach(([field, error]) => {
                            console.error(`${field}:`, error.message);
                        });
                    }
                }
            }

            // Print final statistics
            console.log('\n--- Import Summary ---');
            console.log('Total Products Processed:', this.#products.length);
            console.log('Successfully Inserted:', inserted);
            console.log('Failed:', this.#products.length - inserted);

            return { total: this.#products.length, inserted };
        } catch (error) {
            console.error('Import Error:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

const run = async () => {
    try {
        // Ensure MongoDB is connected
        await database.connect();
        
        // Verify connection details
        const db = mongoose.connection;
        console.log('\n--- MongoDB Connection Details ---');
        console.log('Connection State:', db.readyState);
        console.log('Database Name:', db.name);
        console.log('Host:', db.host);
        console.log('Port:', db.port);

        const importer = new ProductImporter();
        const result = await importer.import();
        
        console.log('\n--- Final Result ---');
        console.log(result);
    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        await database.disconnect();
        process.exit(0);
    }
};

// Add more detailed error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', {
        message: error.message,
        stack: error.stack
    });
    process.exit(1);
});

run(); 