const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// Get all properties
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search properties
router.get('/search', async (req, res) => {
    try {
        const { price, facing, location, area } = req.query;
        let query = {};

        if (price) {
            query.price = { $lte: Number(price) };
        }
        if (facing) {
            query.facing = facing;
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (area) {
            query.area = { $lte: Number(area) };
        }

        const properties = await Property.find(query);
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new property (admin only)
router.post('/', auth, async (req, res) => {
    const property = new Property({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,
        area: req.body.area,
        facing: req.body.facing,
        imageUrls: Array.isArray(req.body.imageUrls) ? req.body.imageUrls : (req.body.imageUrls ? [req.body.imageUrls] : (req.body.imageUrl ? [req.body.imageUrl] : [])),
        features: req.body.features
    });

    try {
        const newProperty = await property.save();
        res.status(201).json(newProperty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete property (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update property (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const updated = await Property.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                imageUrls: Array.isArray(req.body.imageUrls) ? req.body.imageUrls : (req.body.imageUrls ? [req.body.imageUrls] : (req.body.imageUrl ? [req.body.imageUrl] : [])),
            },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 