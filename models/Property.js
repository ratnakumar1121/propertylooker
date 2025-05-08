const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const PropertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    area: {
        type: Number,
        required: false
    },
    areaUnit: { // Stores the unit for the area
        type: String,
        required: function() { return this.area != null && this.area !== undefined; }, // Required only if area is provided
        enum: ['sqft', 'sqyd', 'sqmt', 'acre'], // Define your allowed units
        default: 'sqft' // Optional: set a default unit
    },
    facing: {
        type: String,
        required: true,
        enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']
    },
    imageUrls: [{
        type: String,
        required: false
    }],
    features: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    propertyId: {
        type: Number,
        unique: true
    }
});

PropertySchema.plugin(AutoIncrement, { inc_field: 'propertyId' });

module.exports = mongoose.model('Property', PropertySchema); 