const express = require('express');
const { auth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// Get calendar events (appointments)
router.get('/events', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get appointments for the user
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { userId: userId },
          { providerId: userId }
        ],
        startTime: dateFilter
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessProfile: {
              select: {
                businessName: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Format appointments as calendar events
    const events = appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.service.name,
      start: appointment.startTime,
      end: appointment.endTime,
      status: appointment.status,
      description: appointment.notes,
      customer: appointment.user,
      provider: appointment.provider,
      service: appointment.service
    }));

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots for a specific date
router.get('/availability/:providerId', auth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date, serviceId } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Get provider's business profile for working hours
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      include: {
        businessProfile: true
      }
    });

    if (!provider || !provider.businessProfile) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const service = serviceId ? await prisma.service.findUnique({
      where: { id: serviceId }
    }) : null;

    const serviceDuration = service ? service.duration : 60; // Default 60 minutes

    const workingHours = provider.businessProfile.workingHours ? 
      JSON.parse(provider.businessProfile.workingHours) : 
      getDefaultWorkingHours();

    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.isOpen) {
      return res.json({ availableSlots: [] });
    }

    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId: providerId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      }
    });

    const availableSlots = generateTimeSlots(
      date,
      daySchedule.start,
      daySchedule.end,
      serviceDuration,
      existingAppointments
    );

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// helper function to get default working hours
function getDefaultWorkingHours() {
  return {
    monday: { start: '09:00', end: '17:00', isOpen: true },
    tuesday: { start: '09:00', end: '17:00', isOpen: true },
    wednesday: { start: '09:00', end: '17:00', isOpen: true },
    thursday: { start: '09:00', end: '17:00', isOpen: true },
    friday: { start: '09:00', end: '17:00', isOpen: true },
    saturday: { start: '09:00', end: '17:00', isOpen: false },
    sunday: { start: '09:00', end: '17:00', isOpen: false }
  };
}

// helper function to generate time slots
function generateTimeSlots(date, startTime, endTime, duration, existingAppointments) {
  const slots = [];
  const start = moment(`${date} ${startTime}`);
  const end = moment(`${date} ${endTime}`);
  
  let current = start.clone();
  
  while (current.clone().add(duration, 'minutes').isSameOrBefore(end)) {
    const slotStart = current.clone();
    const slotEnd = current.clone().add(duration, 'minutes');
    
    const isConflict = existingAppointments.some(appointment => {
      const appointmentStart = moment(appointment.startTime);
      const appointmentEnd = moment(appointment.endTime);
      
      return slotStart.isBefore(appointmentEnd) && slotEnd.isAfter(appointmentStart);
    });
    
    if (!isConflict && slotStart.isAfter(moment())) {
      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: true
      });
    }
    
    current.add(duration, 'minutes');
  }
  
  return slots;
}

module.exports = router;
