const express = require('express');
const prisma = require('../lib/prisma');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/properties
// @desc    Create a new property (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      name,
      location,
      brochure,
      image,
      model3d,
      availableApartments,
      status
    } = req.body;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        message: 'Name and location are required'
      });
    }

    // Create new property
    const property = await prisma.property.create({
      data: {
        name,
        location,
        brochure: brochure || null,
        image: image || null,
        model3d: model3d || null,
        availableApartments: availableApartments || 0,
        status: status || 'available'
      }
    });

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({
      message: 'Server error during property creation',
      error: error.message
    });
  }
});

// @route   GET /api/properties
// @desc    Get all properties with optional pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.property.count();

    // Get properties with pagination
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      skip: skip,
      take: limit
    });

    res.json({
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        message: 'Property not found'
      });
    }

    res.json({
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property (Admin only)
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      brochure,
      image,
      model3d,
      availableApartments,
      status
    } = req.body;

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        message: 'Property not found'
      });
    }

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        name: name || existingProperty.name,
        location: location || existingProperty.location,
        brochure: brochure !== undefined ? brochure : existingProperty.brochure,
        image: image !== undefined ? image : existingProperty.image,
        model3d: model3d !== undefined ? model3d : existingProperty.model3d,
        availableApartments: availableApartments !== undefined ? availableApartments : existingProperty.availableApartments,
        status: status || existingProperty.status
      }
    });

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Property update error:', error);
    res.status(500).json({
      message: 'Server error during property update',
      error: error.message
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property (Admin only)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        message: 'Property not found'
      });
    }

    // Delete property
    await prisma.property.delete({
      where: { id }
    });

    res.json({
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Property deletion error:', error);
    res.status(500).json({
      message: 'Server error during property deletion',
      error: error.message
    });
  }
});

module.exports = router;
