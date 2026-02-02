// Simple Node/Express backend to receive contact and appointment requests and forward via email
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');

// Serve frontend static files from project root so frontend and API share same origin
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;

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

app.post('/api/appointment', async (req,res)=>{
  const {name, contact, service, servicePrice, doctor, date, time, notes} = req.body || {};
  if(!name || !contact) return res.status(400).json({error:'Missing name or contact info'});
  const transporter = createTransport();
  if(!transporter) return res.status(500).json({error:'SMTP not configured. See README.'});
  const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  
  // Email to clinic
  const clinicText = `New Appointment Request:\n\nName: ${name}\nContact: ${contact}\nService: ${service} (₹${servicePrice})\nDoctor: ${doctor}\nDate: ${date}\nTime: ${time}\nNotes: ${notes || '(none)'}\nSubmitted: ${new Date().toISOString()}`;
  
  // Confirmation email to patient
  const patientText = `Dear ${name},\n\nYour appointment has been confirmed! Here are your details:\n\n📋 Service: ${service}\n💰 Price: ₹${servicePrice}\n👨‍⚕️ Doctor: ${doctor}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nPlease call +91 98765 43210 if you need to reschedule.\n\nThank you for choosing Anupam Dental Clinic!\n\nBest regards,\nAnupam Dental Team`;
  
  try{
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
    
    return res.json({ok:true});
  }catch(err){
    console.error('sendMail error', err);
    return res.status(500).json({error:'Failed to send email'});
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
  const toEmail = 'scholigencedb@gmail.com';
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
