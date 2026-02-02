// Feedback Widget - Floating Button with Modal Form
document.addEventListener('DOMContentLoaded', function(){
  const feedbackHTML = `
    <!-- Feedback Floating Button -->
    <button id="feedbackBtn" class="feedback-floating-btn" title="Send us your feedback">
      💬 Feedback
    </button>

    <!-- Feedback Modal -->
    <div id="feedbackModal" class="feedback-modal">
      <div class="feedback-modal-content">
        <button class="feedback-close-btn">&times;</button>
        <h5 class="mb-3">Send us your Feedback</h5>
        <p class="small text-muted mb-3">Help us improve! Share your suggestions or report issues.</p>
        
        <form id="feedbackForm">
          <div class="mb-3">
            <label class="form-label small">Name</label>
            <input type="text" class="form-control form-control-sm" id="feedbackName" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label small">Email</label>
            <input type="email" class="form-control form-control-sm" id="feedbackEmail" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label small">Feedback / Suggestion</label>
            <textarea class="form-control form-control-sm" id="feedbackMessage" rows="4" placeholder="Tell us what we can improve..." required></textarea>
          </div>
          
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-sm">Submit Feedback</button>
          </div>
          
          <div id="feedbackStatus" class="mt-2 small text-success d-none"></div>
        </form>
      </div>
    </div>

    <!-- Feedback Modal Overlay -->
    <div id="feedbackOverlay" class="feedback-overlay"></div>
  `;

  // Insert feedback widget HTML
  const body = document.querySelector('body');
  if(body){
    const feedbackDiv = document.createElement('div');
    feedbackDiv.innerHTML = feedbackHTML;
    body.appendChild(feedbackDiv);
  }

  // Get elements
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const closeBtn = document.querySelector('.feedback-close-btn');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackStatus = document.getElementById('feedbackStatus');

  // Open modal
  feedbackBtn.addEventListener('click', function(){
    feedbackModal.classList.add('active');
    feedbackOverlay.classList.add('active');
  });

  // Close modal
  function closeModal(){
    feedbackModal.classList.remove('active');
    feedbackOverlay.classList.remove('active');
  }

  closeBtn.addEventListener('click', closeModal);
  feedbackOverlay.addEventListener('click', closeModal);

  // Handle form submission
  feedbackForm.addEventListener('submit', async function(e){
    e.preventDefault();
    
    const name = document.getElementById('feedbackName').value.trim();
    const email = document.getElementById('feedbackEmail').value.trim();
    const message = document.getElementById('feedbackMessage').value.trim();

    if(!name || !email || !message){
      feedbackStatus.classList.add('text-danger');
      feedbackStatus.classList.remove('d-none', 'text-success');
      feedbackStatus.textContent = 'Please fill in all fields.';
      return;
    }

    feedbackStatus.classList.remove('d-none', 'text-danger', 'text-success');
    feedbackStatus.classList.add('text-muted');
    feedbackStatus.textContent = 'Sending...';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, message})
      });

      if(response.ok){
        feedbackStatus.classList.remove('text-muted');
        feedbackStatus.classList.add('text-success');
        feedbackStatus.textContent = 'Thank you! Your feedback has been received.';
        feedbackForm.reset();
        
        setTimeout(() => {
          closeModal();
          feedbackStatus.classList.add('d-none');
        }, 2000);
      } else {
        throw new Error('Server error');
      }
    } catch(err){
      feedbackStatus.classList.remove('text-muted');
      feedbackStatus.classList.add('text-warning');
      feedbackStatus.textContent = 'Could not send feedback. Please try again.';
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closeModal();
    }
  });
});
