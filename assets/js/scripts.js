    document.addEventListener('DOMContentLoaded', function(){
    // Enhanced client-side behavior: form submission to backend + smooth scroll + AOS init handled in HTML
    const contactForm = document.getElementById('contactForm');
    const contactFeedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');

    async function postJSON(url, data){
        try{
        const resp = await fetch(url, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data)
        });
        return resp;
        }catch(err){
        console.warn('Network error', err);
        throw err;
        }
    }

    if(contactForm){
        contactForm.addEventListener('submit', async function(e){
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const info = document.getElementById('contactInfo').value.trim();
        const message = document.getElementById('message').value.trim();
        if(!name || !info){
            contactFeedback.classList.remove('d-none');
            contactFeedback.classList.remove('text-success');
            contactFeedback.classList.add('text-danger');
            contactFeedback.textContent = 'Please enter your name and contact details.';
            return;
        }
        // disable button
        if(submitBtn) submitBtn.disabled = true;
        contactFeedback.classList.remove('d-none');
        contactFeedback.classList.remove('text-danger');
        contactFeedback.classList.add('text-muted');
        contactFeedback.textContent = 'Sending...';

        // Attempt to post to backend; fallback to local success message
        try{
            const res = await postJSON('/api/contact', {name, info, message});
            if(res && res.ok){
            contactFeedback.classList.remove('text-muted');
            contactFeedback.classList.add('text-success');
            contactFeedback.textContent = "Thanks — we'll contact you soon.";
            contactForm.reset();
            }else{
            throw new Error('Server error');
            }
        }catch(err){
            contactFeedback.classList.remove('text-muted');
            contactFeedback.classList.remove('text-success');
            contactFeedback.classList.add('text-warning');
            contactFeedback.textContent = 'Could not send — please try calling us or use email.';
        }finally{
            if(submitBtn) submitBtn.disabled = false;
            setTimeout(()=>{contactFeedback.classList.add('d-none')},4200);
        }
        });
    }

    // Appointment form with enhanced features
    const appForm = document.getElementById('appointmentForm');
    const appFeedback = document.getElementById('appFeedback');
    const appSubmit = document.getElementById('appSubmit');
    
    // Appointment data
    const services = [
      {id: 'cleaning', name: 'Teeth Cleaning', price: 2000, duration: '30 min'},
      {id: 'root-canal', name: 'Root Canal Treatment', price: 5000, duration: '60 min'},
      {id: 'whitening', name: 'Teeth Whitening', price: 3500, duration: '45 min'},
      {id: 'fillings', name: 'Cavity Fillings', price: 2500, duration: '40 min'},
      {id: 'extraction', name: 'Tooth Extraction', price: 1500, duration: '20 min'},
      {id: 'orthodontics', name: 'Orthodontics Consultation', price: 1000, duration: '30 min'}
    ];
    
    const doctors = [
      {id: 'dr-anoop', name: 'Dr. Anoop'},
      {id: 'dr-seema', name: 'Dr. Seema'},
      {id: 'dr-rahul', name: 'Dr. Rahul'},
      {id: 'dr-priya', name: 'Dr. Priya'}
    ];
    
    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    
    let selectedService = null;
    let selectedDoctor = null;
    let selectedDate = null;
    let selectedTime = null;
    
    // Render services
    const servicesList = document.getElementById('servicesList');
    if(servicesList){
      services.forEach(svc => {
        const div = document.createElement('div');
        div.className = 'service-card';
        div.innerHTML = `
          <div class="service-header">
            <div>
              <h6 class="mb-1">${svc.name}</h6>
              <small class="text-muted">${svc.duration}</small>
            </div>
            <div class="service-price">₹${svc.price}</div>
          </div>
        `;
        div.addEventListener('click', () => {
          document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
          div.classList.add('selected');
          selectedService = svc;
          updateSummary();
        });
        servicesList.appendChild(div);
      });
    }
    
    // Render doctors
    const doctorsList = document.getElementById('doctorsList');
    if(doctorsList){
      doctors.forEach(doc => {
        const badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'doctor-badge';
        badge.textContent = doc.name;
        badge.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('.doctor-badge').forEach(b => b.classList.remove('selected'));
          badge.classList.add('selected');
          selectedDoctor = doc;
          updateSummary();
        });
        doctorsList.appendChild(badge);
      });
    }
    
    // Date change handler
    const appDate = document.getElementById('appDate');
    if(appDate){
      appDate.addEventListener('change', function(){
        selectedDate = this.value;
        renderTimeSlots();
        updateSummary();
      });
    }
    
    // Render time slots
    function renderTimeSlots(){
        const container = document.getElementById('slotsContainer');
        if(!container) return;
        container.innerHTML = '';
        
        timeSlots.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn';
            btn.textContent = slot;
            btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTime = slot;
            document.getElementById('appTime').value = slot;
            updateSummary();
            });
            container.appendChild(btn);
        });
    }
    
    // Update booking summary
    function updateSummary(){
      document.getElementById('summaryService').textContent = selectedService ? `${selectedService.name} (₹${selectedService.price})` : 'Not selected';
      document.getElementById('summaryPrice').textContent = selectedService ? `₹${selectedService.price}` : '—';
      document.getElementById('summaryDoctor').textContent = selectedDoctor ? selectedDoctor.name : 'Not selected';
      
      if(selectedDate && selectedTime){
        const dateObj = new Date(selectedDate);
        const dateStr = dateObj.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
        document.getElementById('summaryDateTime').textContent = `${dateStr} at ${selectedTime}`;
      } else {
        document.getElementById('summaryDateTime').textContent = 'Not selected';
      }
    }
    
    if(appForm){
      appForm.addEventListener('submit', async function(e){
        e.preventDefault();
        
        const name = document.getElementById('appName').value.trim();
        const contact = document.getElementById('appContact').value.trim();
        const notes = document.getElementById('appNotes').value.trim();
        
        if(!name || !contact){
          appFeedback.classList.remove('d-none');
          appFeedback.classList.add('text-danger');
          appFeedback.textContent = 'Please enter your name and contact details.';
          return;
        }
        
        if(!selectedService || !selectedDoctor || !selectedDate || !selectedTime){
          appFeedback.classList.remove('d-none');
          appFeedback.classList.add('text-danger');
          appFeedback.textContent = 'Please complete all appointment details.';
          return;
        }
        
        if(appSubmit) appSubmit.disabled = true;
        appFeedback.classList.remove('d-none');
        appFeedback.classList.remove('text-success', 'text-danger');
        appFeedback.classList.add('text-muted');
        appFeedback.textContent = 'Confirming appointment...';
        
        try{
          const res = await postJSON('/api/appointment', {
            name,
            contact,
            service: selectedService.name,
            servicePrice: selectedService.price,
            doctor: selectedDoctor.name,
            date: selectedDate,
            time: selectedTime,
            notes
          });
          
          if(res && res.ok){
            appFeedback.classList.remove('text-muted');
            appFeedback.classList.add('text-success');
            appFeedback.textContent = "✓ Appointment confirmed! Check your email for details.";
            appForm.reset();
            selectedService = null;
            selectedDoctor = null;
            selectedDate = null;
            selectedTime = null;
            document.querySelectorAll('.service-card, .doctor-badge, .slot-btn').forEach(el => el.classList.remove('selected'));
            document.getElementById('slotsContainer').innerHTML = '';
            updateSummary();
          } else throw new Error('Server error');
        }catch(err){
          appFeedback.classList.remove('text-muted');
          appFeedback.classList.add('text-warning');
          appFeedback.textContent = 'Could not confirm. Please call us at +91 98765 43210';
        }finally{
          if(appSubmit) appSubmit.disabled = false;
          setTimeout(()=>{appFeedback.classList.add('d-none')}, 5000);
        }
      });
    }

    // Smooth scroll for internal links (only for same-page anchors)
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
        a.addEventListener('click', function(e){
        const target = document.querySelector(this.getAttribute('href'));
        if(target){
            e.preventDefault();
            target.scrollIntoView({behavior:'smooth', block:'start'});
        }
        });
    });

    // Newsletter handlers for footer forms (graceful local fallback)
    function attachNewsletter(formId, emailId, btnId, feedbackId){
        const form = document.getElementById(formId);
        const feedback = document.getElementById(feedbackId);
        if(!form) return;
        form.addEventListener('submit', async function(e){
        e.preventDefault();
        const email = document.getElementById(emailId).value.trim();
        const btn = document.getElementById(btnId);
        if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
            if(feedback){ feedback.classList.remove('d-none'); feedback.classList.add('text-danger'); feedback.textContent = 'Enter a valid email.'; }
            return;
        }
        if(btn) btn.disabled = true;
        if(feedback){ feedback.classList.remove('d-none'); feedback.classList.remove('text-danger'); feedback.classList.add('text-muted'); feedback.textContent = 'Subscribing...'; }
        try{
            // attempt to post to backend (if available)
            await postJSON('/api/newsletter', {email});
            if(feedback){ feedback.classList.remove('text-muted'); feedback.classList.add('text-success'); feedback.textContent = "Thanks — you're subscribed."; }
            form.reset();
        }catch(err){
            if(feedback){ feedback.classList.remove('text-muted'); feedback.classList.add('text-success'); feedback.textContent = "Thanks — you're subscribed."; }
        }finally{
            if(btn) btn.disabled = false;
            setTimeout(()=>{ if(feedback) feedback.classList.add('d-none') },3000);
        }
        });
    }

    attachNewsletter('newsletterForm','newsletterEmail','newsletterBtn','newsletterFeedback');
    attachNewsletter('newsletterFormServices','newsletterEmailServices','newsletterBtnServices','newsletterFeedbackServices');
    attachNewsletter('newsletterFormApp','newsletterEmailApp','newsletterBtnApp','newsletterFeedbackApp');
    attachNewsletter('newsletterFormFooter','newsletterEmailFooter','newsletterBtnFooter','newsletterFeedbackFooter');
    });