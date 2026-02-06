// Simple Node/Express backend to receive contact and appointment requests and forward via email
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');

// Serve frontend static files from project root so frontend and API share same origin
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;

// Doctor availability map: { doctorId: { dayOfWeek: [availableTimeSlots] } }
// 0 = Sunday, 1 = Monday, 2 = Tuesday, ... 6 = Saturday
const doctorAvailability = {
  'dr-anoop': { 0: [], 1: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 3: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'], 4: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 5: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'], 6: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'] },
  'dr-terry': { 0: [], 1: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'], 2: ['09:00', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 3: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 4: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 5: ['09:00', '09:30', '10:00', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'], 6: [] },
  'dr-krishna': { 0: [], 1: ['09:00', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'], 3: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 4: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 5: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'], 6: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'] },
  'dr-justin': { 0: [], 1: ['09:00', '09:30', '10:00', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '15:00', '15:30', '16:00', '16:30'], 3: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 4: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'], 5: ['09:00', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 6: [] },
  'dr-renjith': { 0: [], 1: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'], 3: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 4: ['09:00', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 5: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'], 6: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'] },
  'dr-joseph': { 0: [], 1: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 3: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'], 4: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 5: ['09:00', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30'], 6: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'] },
  'dr-sijo': { 0: [], 1: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 3: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 4: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'], 5: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'], 6: ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30'] },
  'dr-shibu': { 0: [], 1: ['09:00', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 2: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], 3: ['09:00', '09:30', '10:00', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 4: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'], 5: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'], 6: [] }
};

// Function to validate doctor availability
function isDoctorAvailable(doctorId, dateString, timeSlot) {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const availableSlots = doctorAvailability[doctorId]?.[dayOfWeek] || [];
  return availableSlots.includes(timeSlot);
}

// Mapping between frontend doctor IDs and database doctor names
const doctorNameMapping = {
  'dr-anoop': 'Dr. Anoop',
  'dr-terry': 'Dr. Terry Thomas Edathotty',
  'dr-krishna': 'Dr. KrishnaKumar',
  'dr-justin': 'Dr. Justin Mathew',
  'dr-renjith': 'Dr. Renjith Raj',
  'dr-joseph': 'Dr. Joseph J Pulikkottil',
  'dr-sijo': 'Dr. Sijo P Mathew',
  'dr-shibu': 'Dr. Shibu Sreedhar'
};

// Reverse mapping for convenience
const reverseNameMapping = Object.fromEntries(
  Object.entries(doctorNameMapping).map(([key, value]) => [value, key])
);

// Function to get doctor ID by frontend doctor key
async function getDoctorByFrontendId(frontendId) {
  const doctorName = doctorNameMapping[frontendId];
  if (!doctorName) return null;
  
  const doctorList = await db.getDoctors();
  return doctorList.find(d => d.name === doctorName) || null;
}

function createTransport(){
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if(!host || !user || !pass){
    return null;
  }
  return nodemailer.createTransport({
    host, port, secure: port===465, auth:{user, pass}
  });
}

app.get('/api/ping', (req,res)=> res.json({ok:true, ts:Date.now()}));

// Doctor endpoints
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await db.getDoctors();
    res.json(doctors || []);
  } catch (err) {
    console.error('getDoctors error', err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await db.getDoctorById(parseInt(req.params.id));
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    console.error('getDoctor error', err);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

app.post('/api/doctors', async (req, res) => {
  const { name, specialization, contact, license } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing doctor name' });
  try {
    const doctor = await db.addDoctor(name, specialization || '', contact || '', license || '');
    res.json({ ok: true, doctor });
  } catch (err) {
    console.error('addDoctor error', err);
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  const { name, specialization, contact, license } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing doctor name' });
  try {
    const doctor = await db.updateDoctor(parseInt(req.params.id), name, specialization || '', contact || '', license || '');
    res.json({ ok: true, doctor });
  } catch (err) {
    console.error('updateDoctor error', err);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    await db.deleteDoctor(parseInt(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteDoctor error', err);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// Doctor patient history
app.get('/api/doctors/:id/history', async (req, res) => {
  try {
    const history = await db.getDoctorPatientHistory(parseInt(req.params.id));
    res.json(history || []);
  } catch (err) {
    console.error('getDoctorHistory error', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Appointments endpoints
app.get('/api/appointments', async (req, res) => {
  try {
    const filters = {};
    if (req.query.doctorId) filters.doctorId = parseInt(req.query.doctorId);
    if (req.query.patientId) filters.patientId = parseInt(req.query.patientId);
    if (req.query.date) filters.date = req.query.date;
    if (req.query.status) filters.status = req.query.status;
    
    const appointments = await db.getAppointments(filters);
    res.json(appointments || []);
  } catch (err) {
    console.error('getAppointments error', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await db.getAppointmentById(parseInt(req.params.id));
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    console.error('getAppointment error', err);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { patientId, doctorId, name, contact, service, servicePrice, date, time, notes } = req.body;
  
  // Validate required fields
  if (!name || !contact) return res.status(400).json({ error: 'Missing name or contact info' });
  if (!service || !date || !time) return res.status(400).json({ error: 'Missing service, date, or time' });
  
  // Validate doctor availability if doctorId provided
  if (doctorId) {
    const doctorIdStr = `dr-${doctorId}`;
    if (!isDoctorAvailable(doctorIdStr, date, time)) {
      return res.status(400).json({ error: `Selected doctor is not available on ${date} at ${time}. Please choose another time or doctor.` });
    }
  }
  
  try {
    // Add patient if needed
    let finalPatientId = patientId;
    if (!patientId && name) {
      const patient = await db.addPatient(name, null, contact, notes || '');
      finalPatientId = patient.id;
    }
    
    // Add appointment (with conflict checking)
    const appointment = await db.addAppointment(finalPatientId, doctorId ? parseInt(doctorId) : null, service, servicePrice || 0, date, time, notes || '', contact);
    
    // Send emails
    const transporter = createTransport();
    if (transporter) {
      try {
        const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
        let doctorName = 'Available Doctor';
        if (doctorId) {
          const doc = await db.getDoctorById(parseInt(doctorId));
          if (doc) doctorName = doc.name;
        }
        
        // Email to clinic
        const clinicText = `New Appointment Request:\n\nName: ${name}\nContact: ${contact}\nService: ${service} (₹${servicePrice})\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}\nNotes: ${notes || '(none)'}\nSubmitted: ${new Date().toISOString()}`;
        
        // Confirmation email to patient
        const patientText = `Dear ${name},\n\nYour appointment has been confirmed! Here are your details:\n\n📋 Service: ${service}\n💰 Price: ₹${servicePrice}\n👨‍⚕️ Doctor: ${doctorName}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nPlease call +91 98765 43210 if you need to reschedule.\n\nThank you for choosing Anupam Dental Clinic!\n\nBest regards,\nAnupam Dental Team`;
        
        // Send to clinic
        await transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject: `New Appointment: ${name} - ${date} at ${time}`,
          text: clinicText
        });
        
        // Send confirmation to patient (if email provided)
        if (contact.includes('@')) {
          await transporter.sendMail({
            from: fromEmail,
            to: contact,
            subject: `Appointment Confirmed - Anupam Dental`,
            text: patientText
          });
        }
      } catch (mailErr) {
        console.error('Email send error', mailErr);
      }
    }
    
    res.json({ ok: true, appointment });
  } catch (err) {
    console.error('addAppointment error', err);
    res.status(400).json({ error: err.message || 'Failed to add appointment' });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const { patientId, doctorId, service, servicePrice, date, time, notes, status } = req.body;
  
  if (!patientId || !service || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const appointment = await db.updateAppointment(parseInt(req.params.id), patientId, doctorId, service, servicePrice, date, time, notes, status || 'pending');
    res.json({ ok: true, appointment });
  } catch (err) {
    console.error('updateAppointment error', err);
    res.status(400).json({ error: err.message || 'Failed to update appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await db.deleteAppointment(parseInt(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteAppointment error', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

app.post('/api/ping', (req,res)=> res.json({ok:true, ts:Date.now()}));

app.post('/api/contact', async (req,res)=>{
  const {name, info, message} = req.body || {};
  if(!name || !info) return res.status(400).json({error:'Missing name or contact info'});
  const transporter = createTransport();
  if(!transporter) return res.status(500).json({error:'SMTP not configured. See README.'});
  const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;
  const text = `New contact request:\nName: ${name}\nContact: ${info}\nMessage: ${message || '(none)'}\nTime: ${new Date().toISOString()}`;
  try{
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    await transporter.sendMail({from: fromEmail, to: toEmail, subject:`Contact request — ${name}`, text});
    return res.json({ok:true});
  }catch(err){
    console.error('sendMail error', err);
    return res.status(500).json({error:'Failed to send email'});
  }
});

// Legacy endpoint (deprecated, use POST /api/appointments instead)
app.post('/api/appointment', async (req,res)=>{
  const {name, contact, service, servicePrice, doctor, doctorId: frontendDoctorId, date, time, notes} = req.body || {};
  if(!name || !contact) return res.status(400).json({error:'Missing name or contact info'});
  
  try {
    // Resolve doctor information
    let doctorId = null;
    let doctorAvailabilityKey = frontendDoctorId;
    let displayDoctorName = doctor;
    
    if (frontendDoctorId) {
      // Use frontend doctor ID for availability validation and lookup
      const foundDoctor = await getDoctorByFrontendId(frontendDoctorId);
      if (foundDoctor) {
        doctorId = foundDoctor.id;
        displayDoctorName = foundDoctor.name;
      }
    } else if (doctor) {
      // Fallback: look up by doctor name
      const doctorList = await db.getDoctors();
      const foundDoctor = doctorList.find(d => d.name.toLowerCase() === doctor.toLowerCase());
      if (foundDoctor) {
        doctorId = foundDoctor.id;
        doctorAvailabilityKey = reverseNameMapping[foundDoctor.name];
        displayDoctorName = foundDoctor.name;
      }
    }
    
    // Validate doctor availability
    if (doctorAvailabilityKey) {
      if (!isDoctorAvailable(doctorAvailabilityKey, date, time)) {
        return res.status(400).json({ error: `${displayDoctorName} is not available on ${date} at ${time}. Please select another time or doctor.` });
      }
    }
    
    // Use new appointment endpoint logic
    const patientList = await db.getPatients();
    let patientId = patientList.find(p => p.contact === contact)?.id;
    
    const appointment = await db.addAppointment(patientId || null, doctorId, service, servicePrice, date, time, notes);
    
    const transporter = createTransport();
    if(transporter) {
      try {
        const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
        
        // Email to clinic
        const clinicText = `New Appointment Request:\n\nName: ${name}\nContact: ${contact}\nService: ${service} (₹${servicePrice})\nDoctor: ${displayDoctorName}\nDate: ${date}\nTime: ${time}\nNotes: ${notes || '(none)'}\nSubmitted: ${new Date().toISOString()}`;
        
        // Confirmation email to patient
        const patientText = `Dear ${name},\n\nYour appointment has been confirmed! Here are your details:\n\n📋 Service: ${service}\n💰 Price: ₹${servicePrice}\n👨‍⚕️ Doctor: ${displayDoctorName}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nPlease call +91 98765 43210 if you need to reschedule.\n\nThank you for choosing Anupam Dental Clinic!\n\nBest regards,\nAnupam Dental Team`;
        
        // Send to clinic
        await transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject: `New Appointment: ${name} - ${date} at ${time}`,
          text: clinicText
        });
        
        // Send confirmation to patient (if email provided)
        if(contact.includes('@')){
          await transporter.sendMail({
            from: fromEmail,
            to: contact,
            subject: `Appointment Confirmed - Anupam Dental`,
            text: patientText
          });
        }
      } catch (mailErr) {
        console.error('Email send error', mailErr);
      }
    }
    
    return res.json({ok:true, appointment});
  } catch(err){
    console.error('appointment error', err);
    return res.status(400).json({error: err.message || 'Failed to create appointment'});
  }
});

// Newsletter endpoint (simple handling). If SMTP configured, send notification email; otherwise just accept.
app.post('/api/newsletter', async (req,res)=>{
  const {email} = req.body || {};
  if(!email) return res.status(400).json({error:'Missing email'});
  const transporter = createTransport();
  const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;
  const text = `Newsletter signup: ${email}\nTime: ${new Date().toISOString()}`;
  if(transporter){
    try{
      const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
      await transporter.sendMail({from: fromEmail, to: toEmail, subject:`Newsletter signup — ${email}`, text});
      return res.json({ok:true});
    }catch(err){
      console.error('newsletter sendMail error', err);
      // still return ok to not break UX
      return res.status(200).json({ok:false, error:'Failed to send email, but accepted.'});
    }
  }
  // no transporter configured, accept for now
  return res.json({ok:true, msg:'accepted locally'});
});

// Developer feedback endpoint
app.post('/api/feedback', async (req,res)=>{
  const {name, email, message} = req.body || {};
  if(!name || !email || !message) return res.status(400).json({error:'Missing required fields'});
  const transporter = createTransport();
  const toEmail = 'govindmyguardian@gmail.com';
  const text = `Developer Feedback:\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nTime: ${new Date().toISOString()}`;
  if(transporter){
    try{
      const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
      await transporter.sendMail({from: fromEmail, to: toEmail, subject:`Developer Feedback — ${name}`, text});
      return res.json({ok:true});
    }catch(err){
      console.error('feedback sendMail error', err);
      // still return ok to not break UX
      return res.status(200).json({ok:true, msg:'Feedback accepted'});
    }
  }
  // no transporter configured, accept for now
  return res.json({ok:true, msg:'Feedback accepted'});
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});
