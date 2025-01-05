export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
  }
}

export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

export function initializeModal(modalId, onSubmit) {
  const modal = document.getElementById(modalId);
  const form = modal.querySelector('form');
  const closeBtn = modal.querySelector('.close-modal');

  closeBtn.addEventListener('click', () => hideModal(modalId));
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal(modalId);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await onSubmit(e);
  });
}