const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, businessOwnerAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// get all services
router.get('/', async (req, res) => {
  try {
    const { businessId, isActive } = req.query;
    
    const where = {};
    if (businessId) where.businessProfileId = businessId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const services = await prisma.service.findMany({
      where,
      include: {
        businessProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        businessProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// create service
router.post('/', [
  businessOwnerAuth,
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('duration').isInt({ min: 1 }),
  body('price').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, duration, price } = req.body;

    // Get business profile for the authenticated user
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found. Please create a business profile first.' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        businessProfileId: businessProfile.id
      },
      include: {
        businessProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// update service
router.put('/:id', [
  businessOwnerAuth,
  body('name').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, duration, price, isActive } = req.body;

    // Check if service exists and belongs to the authenticated user
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        businessProfile: true
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.businessProfile.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (duration) updateData.duration = parseInt(duration);
    if (price) updateData.price = parseFloat(price);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedService = await prisma.service.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        businessProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete service
router.delete('/:id', businessOwnerAuth, async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        businessProfile: true
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.businessProfile.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if service has any active appointments
    const activeAppointments = await prisma.appointment.findFirst({
      where: {
        serviceId: req.params.id,
        status: { not: 'CANCELLED' }
      }
    });

    if (activeAppointments) {
      return res.status(400).json({ 
        message: 'Cannot delete service with active appointments. Please cancel all appointments first.' 
      });
    }

    await prisma.service.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get services for a business owner
router.get('/my-services', businessOwnerAuth, async (req, res) => {
  try {
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const services = await prisma.service.findMany({
      where: {
        businessProfileId: businessProfile.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ services });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;