'use strict';

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    category_id: {
        type: Number,
        required: [true, 'Category ID is required'],
        unique: true
    },
    image_url: {
        type: String,
        validate: {
            validator: function(v) {
                // Basic URL validation
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid image URL format'
        }
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
categorySchema.index({ category_name: 'text' });
categorySchema.index({ category_id: 1 }, { unique: true });
categorySchema.index({ is_active: 1 });

// Pre-save middleware to ensure category_name is title case
categorySchema.pre('save', function(next) {
    if (this.category_name) {
        this.category_name = this.category_name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    next();
});

// Static methods
categorySchema.statics.findByName = function(name) {
    return this.findOne({ 
        category_name: new RegExp(name, 'i'),
        is_active: true 
    });
};

categorySchema.statics.findActiveCategories = function() {
    return this.find({ is_active: true })
        .sort('category_name');
};

// Instance methods
categorySchema.methods.toggleStatus = function() {
    this.is_active = !this.is_active;
    return this.save();
};

const Category = mongoose.model('category', categorySchema);

export default Category; 