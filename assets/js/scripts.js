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
      {id: 'cleaning', name: 'Specialty Consultation', price: 500, duration: '15 min'},
      {id: 'root-canal', name: 'Root Canal Treatment', price: 4000, duration: '60 min'},
      {id: 'whitening', name: 'Flap Surgery', price: 5000, duration: '30 min'},
      {id: 'fillings', name: 'Metal Crown', price: 3000, duration: '120 min'},
      {id: 'extraction', name: 'Tooth Extraction', price: 1000, duration: '30 min'},
      {id: 'orthodontics', name: 'Fixed Ortho', price: 20000, duration: '30 min'}
    ];
    
    const doctors = [
      {id: 'dr-anoop', name: 'Dr. Anoop'},
      {id: 'dr-terry', name: 'Dr. Terry Thomas Edathotty'},
      {id: 'dr-krishna', name: 'Dr. KrishnaKumar'},
      {id: 'dr-justin', name: 'Dr. Justin Mathew'},
      {id: 'dr-renjith', name: 'Dr. Renjith Raj'},
      {id: 'dr-joseph', name: 'Dr. Joseph J Pulikkottil'},
      {id: 'dr-sijo', name: 'Dr. Sijo P Mathew'},
      {id: 'dr-shibu', name: 'Dr. Shibu Sreedhar'}
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
            setTimeout(()=>{ if(feedback) feedback.classList.add('d-none') },49152);
        }
        });
    }

    attachNewsletter('newsletterForm','newsletterEmail','newsletterBtn','newsletterFeedback');
    attachNewsletter('newsletterFormServices','newsletterEmailServices','newsletterBtnServices','newsletterFeedbackServices');
    attachNewsletter('newsletterFormApp','newsletterEmailApp','newsletterBtnApp','newsletterFeedbackApp');
    attachNewsletter('newsletterFormFooter','newsletterEmailFooter','newsletterBtnFooter','newsletterFeedbackFooter');

    // Team Modal Functionality
    const teamCards = document.querySelectorAll('.team-card');
    const teamModal = new bootstrap.Modal(document.getElementById('teamModal'));

    // Team member data
    const teamData = {
        'Dr. Anoopkumar R': {
            specialty: 'BDS-Chief Dental',
            regNo: 'Reg No: 1732',
            bio: `
              Dr. Anoopkumar Ravindranath is a trusted and experienced dentist with over three decades of clinical practice, caring for patients since 1994.
              
              He completed his dental graduation from CODS, KMC, Mangalore.

              Well-versed in all types of dental treatments, Dr. Anoop believes that the best care begins with clear communication and ethical practice. He takes time to explain dental problems and treatment options, ensuring patients feel comfortable and confident.

              He has served the Indian Dental Association in various official roles for over 15 years, reflecting his commitment to the profession and ethical dentistry.

              “We don’t just treat teeth—we create smiles that shine.”
              This philosophy guides Dr. Anoop’s approach to care, focusing on long-term oral health, trust, and patient satisfaction.
            `
        },
        'Dr. Terry Thomas Edathotty': {
            specialty: 'MDS-Orthodontist',
            regNo: 'Reg No: 4807',
            bio: 'Dr. Terry Thomas Edathotty is our specialist orthodontist with advanced training in orthodontics. He provides expert treatment for malocclusion, jaw alignment issues, and aesthetic dental corrections using modern orthodontic techniques and appliances.'
        },
        'Dr.krishnaKumar': {
            specialty: 'MDS-Paedodontist',
            regNo: 'Reg No: 7729',
            bio: 'Dr. KrishnaKumar specializes in pediatric dentistry, providing gentle and comprehensive dental care for children. His expertise includes preventive care, early intervention treatments, and creating positive dental experiences for young patients.'
        },
        'Dr.Renjith Raj': {
            specialty: 'MDS-Endodontist',
            regNo: 'Reg No: 8171',
            bio: 'Dr. Renjith Raj is our endodontic specialist, focusing on root canal treatments and procedures related to the dental pulp. He uses advanced techniques and technology to provide comfortable and effective endodontic care.'
        },
        'Dr.Jistin Mathew': {
            specialty: 'MDS-Oral & Maxillio Facial Surgeon',
            regNo: 'Reg No: 5492',
            bio: 'Dr. Jistin Mathew is our oral and maxillofacial surgeon, specializing in surgical procedures of the mouth, jaws, and face. He provides expert care for complex dental surgeries, implants, and facial trauma treatments.'
        },
        'Dr.Joseph J Pulikkottil': {
            specialty: 'MDS-Periodontist & Implantologist',
            regNo: 'Reg No: 2418',
            bio: 'Dr. Joseph J Pulikkottil is our periodontist and implantologist, specializing in gum health and dental implants. He provides comprehensive treatment for periodontal diseases and expert implant placement for tooth replacement.'
        },
        'Dr.Sijo P Mathew': {
            specialty: 'MDS-Conservative and Endodontist',
            regNo: 'Reg No: 8982',
            bio: `Dr. Sijo P. Mathew is a caring and experienced dentist known for his expertise in painless root canal treatments and cosmetic dental care.
                  He completed his dental education at Govt. Dental College, Pariyaram, and went on to specialize in Conservative Dentistry & Endodontics.
                  He works as a Consultant Endodontist at several well-known clinics in Ernakulam and Kottayam, and has previously been associated with leading hospitals and dental centers.
                  Patients appreciate his calm approach, attention to detail, and focus on preserving natural teeth.
                  Special Areas of Care:
                  Single-Visit Root Canal Treatments
                  Treatment of Severely Damaged Teeth
                  Cosmetic Dentistry
                  Minimally Invasive Dental Care
                  Dr. Sijo is an active member of national and state dental associations and is committed to providing gentle, high-quality treatment with a patient-first approach.`
    
        },
        'Dr.Shibu Sreedhar': {
            specialty: 'MDS-Endodontist',
            regNo: 'Reg No: 1561-A',
            bio: `Dr. Shibu Sreedhar is a skilled endodontist specializing in root canal treatments and dental pulp care. With advanced training and a patient-centered approach, he ensures comfortable and effective endodontic procedures using the latest techniques and technology.`
        }      
      };

    teamCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const name = this.querySelector('.card-title').textContent.trim();
            const memberData = teamData[name];

            if (memberData) {
                document.getElementById('modalImage').src = this.querySelector('img').src;
                document.getElementById('modalName').textContent = name;
                document.getElementById('modalSpecialty').textContent = memberData.specialty;
                document.getElementById('modalRegNo').textContent = memberData.regNo;
                document.getElementById('modalBio').textContent = memberData.bio;

                teamModal.show();
            }
        });
    });
    });