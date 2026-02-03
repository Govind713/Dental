// Common footer injection
document.addEventListener('DOMContentLoaded', function(){
  const footerHTML = `
    <!-- Footer -->
    <footer class="site-footer bg-dark text-white pt-5">
        <div class="container">
            <div class="row gy-4">
                <div class="col-md-4 footer-about">
                    <h5 class="mb-2">Contact Address</h5>
                    <p class="text-muted small">Dr. Anoop's Anupam Dental Clinic</p>
                    <p class="text-muted small">
                    West Gate, Vaikom 686141
                    </p>
                    
                    <p class="text-muted small">
                        Kottayam Dist
                    </p>
                    <div class="social mt-2 d-flex align-items-center">
                        <a href="https://twitter.com/" aria-label="Twitter" class="me-3" target="_blank" rel="noreferrer"> 
                            <img src="/assets/images/social-twitter.svg" alt="twitter">
                        </a>
                        <a href="https://facebook.com/" aria-label="Facebook" class="me-3" target="_blank" rel="noreferrer"> 
                            <img src="/assets/images/social-facebook.svg" alt="facebook">
                        </a>
                        <a href="https://instagram.com/" aria-label="Instagram" class="me-3" target="_blank" rel="noreferrer"> 
                            <img src="/assets/images/social-instagram.svg" alt="instagram">
                        </a>
                        <a href="https://youtube.com/" aria-label="YouTube" target="_blank" rel="noreferrer"> 
                            <img src="/assets/images/social-youtube.svg" alt="youtube">
                        </a>
                    </div>
                </div>
                <div class="col-md-3">
                    <h6>Quick Links</h6>
                    <ul class="list-unstyled text-muted small">
                        <li><a href="/index.html" class="text-muted">Home</a></li>
                        <li><a href="/services.html" class="text-muted">Services</a></li>
                        <li><a href="/patients.html" class="text-muted">Patients</a></li>
                        <li><a href="/appointment.html" class="text-muted">Appointment</a></li>
                        <li><a href="/index.html#contact" class="text-muted">Contact</a></li>
                        <li><a href="/developer.html" class="text-muted">About Developer</a></li>
                    </ul>
                </div>
                <div class="col-md-3">
                    <h6>Contact</h6>
                    <address class="text-muted small">
                    Phone: +91 9446046868<br>
                    Email: <a href="mailto:anoopkranupam@gmail.com" class="text-muted">anoopkranupam@gmail.com</a><br>
                    Time: Mon - Sat: 10:00AM - 8:00PM<br>
                    ️Tuesday Holiday
                    </address>
                    
                </div>
                <div class="col-md-2">
                    <div class="mt-2">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.1803698359204!2d76.38949637450591!3d9.750784377274469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b08790dc53983ab%3A0x59b38e8f04d5b667!2sDr.Anoop&#39;s%20Anupam%20Dental%20Clinic!5e0!3m2!1sen!2sin!4v1766057882617!5m2!1sen!2sin" width="100%" height="120" style="border:0;border-radius:8px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-3 border-top d-flex justify-content-between small text-muted">
                <div>© 2025 Anupam Dental Clinic</div>
                <div>Designed with care</div>
            </div>
        </div>
    </footer>
  `;

  // Insert footer before closing body tag
  const body = document.querySelector('body');
  if(body){
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = footerHTML;
    body.appendChild(footerDiv);
  }
});
