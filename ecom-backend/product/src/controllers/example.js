const ApiResponse = require('../utils/ApiResponse');
const { AppError } = require('../middleware/errorHandlers');

const exampleController = {
    async getData(req, res) {
        try {
            const data = { items: [1, 2, 3] };
            
            res.status(200).json(
                ApiResponse.send(200, data, 'Data retrieved successfully')
            );
        } catch (error) {
            throw new AppError('Failed to fetch data', 500);
        }
    },

    async createItem(req, res) {
        try {
            const newItem = { id: 1, ...req.body };
            
            res.status(201).json(
                ApiResponse.send(201, newItem, 'Item created successfully')
            );
        } catch (error) {
            throw new AppError('Failed to create item', 400);
        }
    }
};

module.exports = exampleController; 