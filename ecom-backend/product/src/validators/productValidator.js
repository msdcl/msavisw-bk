'use strict';

import Joi from 'joi';

export const validateProduct = (data, isUpdate = false) => {
    const schema = Joi.object({
        name: isUpdate ? Joi.string() : Joi.string().required(),
        description: Joi.string().allow('', null),
        price: Joi.number().min(0),
        stock: Joi.number().integer().min(0),
        images: Joi.array().items(Joi.string().uri()),
        thumbnail: Joi.string().uri().allow('', null),
        category_id: isUpdate ? Joi.number() : Joi.number().required(),
        sub_category_id: Joi.number().allow(null),
        brand_id: Joi.number().allow(null),
        weight: Joi.number().min(0).allow(null),
        is_active: Joi.boolean()
    }).options({ stripUnknown: true });

    return schema.validate(data);
}; 