const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { businessOwnerAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// get business profile
router.get('/profile', businessOwnerAuth, async (req, res) => {
  try {
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        services: true
      }
    });

    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    res.json({ businessProfile });
  } catch (error) {
    console.error('Get business profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update business profile
router.post('/profile', businessOwnerAuth, [
  body('businessName').notEmpty().trim(),
  body('businessType').notEmpty().trim(),
  body('description').optional().trim(),
  body('address').optional().trim(),
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail().normalizeEmail(),
  body('workingHours').isJSON().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      businessName, businessType, description, address,
      phone, email, workingHours
    } = req.body;

    const data = {
      businessName,
      businessType,
      description,
      address,
      phone,
      email,
      workingHours: workingHours ? JSON.parse(workingHours) : undefined
    };

    const businessProfile = await prisma.businessProfile.upsert({
      where: { userId: req.user.userId },
      update: data,
      create: {
        ...data,
        userId: req.user.userId
      },
      include: {
        services: true
      }
    });

    res.json({
      message: 'Business profile saved successfully',
      businessProfile
    });
  } catch (error) {
    console.error('Create/Update business profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// get all businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await prisma.businessProfile.findMany({
      include: {
        user: true
      }
    });

    res.json({ businesses });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// get a specific business
router.get('/:id', async (req, res) => {
  try {
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { id: req.params.id },
      include: {
        services: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    res.json({ businessProfile });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

