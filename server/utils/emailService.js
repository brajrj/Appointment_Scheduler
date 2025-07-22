const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (userEmail, appointmentDetails) => {
  const subject = 'Appointment Confirmation';
  const text = `
    Dear ${appointmentDetails.userName},
    
    Your appointment has been confirmed!
    
    Service: ${appointmentDetails.serviceName}
    Date: ${appointmentDetails.date}
    Time: ${appointmentDetails.time}
    Duration: ${appointmentDetails.duration} minutes
    
    Business: ${appointmentDetails.businessName}
    Address: ${appointmentDetails.businessAddress}
    Phone: ${appointmentDetails.businessPhone}
    
    Please arrive 10 minutes early for your appointment.
    
    If you need to reschedule or cancel, please contact us at least 24 hours in advance.
    
    Thank you for choosing our services!
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Appointment Confirmation</h2>
      <p>Dear ${appointmentDetails.userName},</p>
      <p>Your appointment has been confirmed!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Appointment Details</h3>
        <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
        <p><strong>Date:</strong> ${appointmentDetails.date}</p>
        <p><strong>Time:</strong> ${appointmentDetails.time}</p>
        <p><strong>Duration:</strong> ${appointmentDetails.duration} minutes</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Business Information</h3>
        <p><strong>Business:</strong> ${appointmentDetails.businessName}</p>
        <p><strong>Address:</strong> ${appointmentDetails.businessAddress}</p>
        <p><strong>Phone:</strong> ${appointmentDetails.businessPhone}</p>
      </div>
      
      <p style="color: #666;">Please arrive 10 minutes early for your appointment.</p>
      <p style="color: #666;">If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
      
      <p>Thank you for choosing our services!</p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
};

// Send appointment reminder email
const sendAppointmentReminder = async (userEmail, appointmentDetails) => {
  const subject = 'Appointment Reminder - Tomorrow';
  const text = `
    Dear ${appointmentDetails.userName},
    
    This is a reminder that you have an appointment tomorrow.
    
    Service: ${appointmentDetails.serviceName}
    Date: ${appointmentDetails.date}
    Time: ${appointmentDetails.time}
    
    Business: ${appointmentDetails.businessName}
    Address: ${appointmentDetails.businessAddress}
    
    Please arrive 10 minutes early.
    
    If you need to reschedule or cancel, please contact us immediately.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Appointment Reminder</h2>
      <p>Dear ${appointmentDetails.userName},</p>
      <p>This is a reminder that you have an appointment <strong>tomorrow</strong>.</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">Appointment Details</h3>
        <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
        <p><strong>Date:</strong> ${appointmentDetails.date}</p>
        <p><strong>Time:</strong> ${appointmentDetails.time}</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Business Information</h3>
        <p><strong>Business:</strong> ${appointmentDetails.businessName}</p>
        <p><strong>Address:</strong> ${appointmentDetails.businessAddress}</p>
      </div>
      
      <p style="color: #666;">Please arrive 10 minutes early.</p>
      <p style="color: #dc3545;">If you need to reschedule or cancel, please contact us immediately.</p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
};
