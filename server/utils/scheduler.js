const { PrismaClient } = require('@prisma/client');
const { sendAppointmentReminder } = require('./emailService');
const cron = require('node-cron');
const moment = require('moment');

const prisma = new PrismaClient();

// Check upcoming appointments and send reminders
const scheduleNotifications = () => {
  cron.schedule('0 8 * * *', async () => { // Every day at 8 am
    try {
      const tomorrow = moment().add(1, 'days').startOf('day');
      const dayAfterTomorrow = moment().add(2, 'days').startOf('day');

      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: tomorrow.toDate(),
            lt: dayAfterTomorrow.toDate(),
          },
          status: 'CONFIRMED',
        },
        include: {
          user: true,
          provider: {
            include: {
              businessProfile: true,
            },
          },
          service: true,
        },
      });

      for (const appointment of appointments) {
        const appointmentDetails = {
          userName: `${appointment.user.firstName} ${appointment.user.lastName}`,
          serviceName: appointment.service.name,
          date: moment(appointment.startTime).format('MMMM DD, YYYY'),
          time: moment(appointment.startTime).format('HH:mm'),
          businessName: appointment.provider.businessProfile.businessName,
          businessAddress: appointment.provider.businessProfile.address,
        };

        await sendAppointmentReminder(appointment.user.email, appointmentDetails);
      }

      console.log('Reminders sent for upcoming appointments');
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata", // Replace 'Your/Timezone' with your actual timezone
  });
};

module.exports = {
  scheduleNotifications,
};
