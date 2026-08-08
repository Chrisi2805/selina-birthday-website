const toast = document.querySelector('.toast');
const year = document.querySelector('#year');
year.textContent = new Date().getFullYear();

document.querySelectorAll('.surprise-button').forEach(button => {
  button.addEventListener('click', () => {
    toast.classList.add('show');
    celebrate();
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  });
});

function celebrate() {
  const colors = ['#f08cae', '#f3c978', '#9ba9ff', '#ffffff'];
  for (let i = 0; i < 48; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * .35}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2300);
  }
}
