// Google Analytics Integration
// Initialize analytics tracking with your Google Analytics ID
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace G-XXXXXXXXXX with your actual Google Analytics ID

// Track page views
document.addEventListener('DOMContentLoaded', function(){
  gtag('event', 'page_view', {
    'page_title': document.title,
    'page_path': window.location.pathname,
    'page_location': window.location.href
  });
});

// Track form submissions
function trackFormSubmission(formName) {
  gtag('event', 'form_submission', {
    'form_name': formName,
    'timestamp': new Date().toISOString()
  });
}

// Track button clicks
function trackButtonClick(buttonName) {
  gtag('event', 'button_click', {
    'button_name': buttonName
  });
}

// Track custom events
function trackEvent(eventName, eventData) {
  gtag('event', eventName, eventData);
}

// Example: Track appointment submissions
document.addEventListener('DOMContentLoaded', function(){
  const appointmentForm = document.getElementById('appointmentForm');
  if(appointmentForm){
    appointmentForm.addEventListener('submit', function(){
      trackFormSubmission('appointment_form');
    });
  }
});

// Example: Track contact form submissions
document.addEventListener('DOMContentLoaded', function(){
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(){
      trackFormSubmission('contact_form');
    });
  }
});
