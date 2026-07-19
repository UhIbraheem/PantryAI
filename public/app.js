// confirm before destructive submits
document.addEventListener('submit', (e) => {
  const msg = e.target.dataset.confirm;
  if (msg && !window.confirm(msg)) {
    e.preventDefault();
  }
});

// let flash messages fade out
const flash = document.querySelector('.flash');
if (flash) {
  setTimeout(() => {
    flash.style.transition = 'opacity 300ms ease-out';
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 300);
  }, 4500);
}
