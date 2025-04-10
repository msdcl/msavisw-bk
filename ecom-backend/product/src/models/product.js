'use strict';

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0
    },
    max_price: {
        type: Number,
        required: [true, 'Product max price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    images: [{
        type: String,
    }],
    category_name: {
        type: String,
        required: [true, 'Category is required']
    },
    category_id: {
        type: Number
    },
    subcat: {
        type: Number
    },
    subcat_name: {
        type: String
    },
    pack_qt: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes
productSchema.index({ name: 'text' });
productSchema.index({ category_id: 1 });
productSchema.index({ subcat: 1 });
productSchema.index({ isActive: 1 });



// Pre-save middleware
productSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Custom logic for new products
    }
    next();
});

// Instance methods


// Static methods
productSchema.statics.findByCategory = function(categoryId) {
    return this.find({ category: categoryId, isActive: true })
               .populate('category')
               .populate('brand');
};

productSchema.statics.findActiveProducts = function() {
    return this.find({ isActive: true })
               .populate('category')
               .populate('brand');
};

const Product = mongoose.model('products', productSchema);

export default Product;
