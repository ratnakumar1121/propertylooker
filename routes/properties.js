// routes/properties.js
const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth'); // Assuming this is your JWT auth middleware

// Get all properties
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.json(properties);
    } catch (err) {
        console.error("Error fetching all properties:", err);
        res.status(500).json({ message: "Server error while fetching properties." });
    }
});

// Search properties
router.get('/search', async (req, res) => {
    try {
        const { price, facing, location, area } = req.query;
        let query = {};

        if (price) {
            const numPrice = Number(price);
            if (!isNaN(numPrice)) {
                query.price = { $lte: numPrice };
            }
        }
        if (facing) {
            query.facing = facing;
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (area) {
            const numArea = Number(area);
            if (!isNaN(numArea)) {
                // This search query now correctly targets the numerical 'area' field.
                // The unit is not directly part of the search query here,
                // as the 'area' field in the DB is already a normalized number.
                // If you wanted to search for area in a specific unit,
                // you'd need to either:
                // 1. Assume all DB areas are in a base unit and convert the search 'area' to that base unit.
                // 2. Add an 'areaUnit' to the search query and filter by both area and areaUnit.
                // For simplicity, we are searching by the numerical value only.
                query.area = { $lte: numArea };
            }
        }

        const properties = await Property.find(query).sort({ createdAt: -1 });
        res.json(properties);
    } catch (err) {
        console.error("Error searching properties:", err);
        res.status(500).json({ message: "Server error while searching properties." });
    }
});

// Add new property (admin only)
router.post('/', auth, async (req, res) => {
    const {
        title,
        description,
        price,
        location,
        area,         // Expect numerical area
        areaUnit,     // Expect area unit string
        facing,
        imageUrls,
        features
    } = req.body;

    // Basic validation (can be more robust with a library like Joi or express-validator)
    if (!title || !description || price == null || !location || !facing) {
        return res.status(400).json({ message: "Missing required fields: title, description, price, location, facing." });
    }

    const propertyData = {
        title,
        description,
        price: Number(price),
        location,
        facing,
        imageUrls: Array.isArray(imageUrls) ? imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '') : [],
        features: Array.isArray(features) ? features.filter(f => f && typeof f === 'string') : []
    };

    // Handle area and areaUnit
    if (area != null && area !== '') {
        const numArea = Number(area);
        if (isNaN(numArea) || numArea < 0) {
            return res.status(400).json({ message: "Area must be a valid non-negative number." });
        }
        propertyData.area = numArea;
        if (areaUnit) { // Only add areaUnit if area is present
            propertyData.areaUnit = areaUnit;
        } else if (propertyData.area != null) { // If area is present but no unit, Mongoose default might apply or validation fail
            return res.status(400).json({ message: "Area unit is required if area is provided." });
        }
    } else {
        // If area is not provided, ensure areaUnit is not sent or is null
        // The Mongoose model schema `required: function() { ... }` for areaUnit handles this.
    }


    const property = new Property(propertyData);

    try {
        const newProperty = await property.save();
        res.status(201).json(newProperty);
    } catch (err) {
        console.error("Error saving new property:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        res.status(400).json({ message: "Failed to add property. " + err.message });
    }
});

// Delete property (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json({ message: 'Property deleted successfully' });
    } catch (err) {
        console.error("Error deleting property:", err);
        res.status(500).json({ message: "Server error while deleting property." });
    }
});

// Update property (admin only)
router.put('/:id', auth, async (req, res) => {
    const {
        title,
        description,
        price,
        location,
        area,
        areaUnit,
        facing,
        imageUrls,
        features
    } = req.body;

    const updateData = {};

    // Selectively add fields to updateData to avoid overwriting with undefined
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (location !== undefined) updateData.location = location;
    if (facing !== undefined) updateData.facing = facing;
    if (imageUrls !== undefined) updateData.imageUrls = Array.isArray(imageUrls) ? imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '') : [];
    if (features !== undefined) updateData.features = Array.isArray(features) ? features.filter(f => f && typeof f === 'string') : [];

    // Handle area and areaUnit for update
    if (area !== undefined && area !== null && area !== '') {
        const numArea = Number(area);
        if (isNaN(numArea) || numArea < 0) {
            return res.status(400).json({ message: "Area must be a valid non-negative number." });
        }
        updateData.area = numArea;
        if (areaUnit) { // If area is updated, areaUnit should also be considered
            updateData.areaUnit = areaUnit;
        } else { // If area is provided but no unit, this might be an issue depending on schema
             // If you want to allow unsetting area, set it to null/undefined
             // and also handle unsetting areaUnit
            return res.status(400).json({ message: "Area unit is required if area is provided." });
        }
    } else if (area === null || area === '') { // Explicitly unsetting area
        updateData.area = null; // or undefined, based on how you want to store "no area"
        updateData.areaUnit = null; // Also unset or set to default if area is removed
    }


    try {
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { $set: updateData }, // Use $set to only update provided fields
            { new: true, runValidators: true } // new: true returns the updated doc, runValidators ensures schema rules apply
        );
        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found for update' });
        }
        res.json(updatedProperty);
    } catch (err) {
        console.error("Error updating property:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        res.status(400).json({ message: "Failed to update property. " + err.message });
    }
});

module.exports = router;