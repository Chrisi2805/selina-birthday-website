const toast = document.querySelector('.toast');
const year = document.querySelector('#year');
year.textContent = new Date().getFullYear();

const heartStyle = document.createElement('style');
heartStyle.textContent = `
  .heart-display{position:fixed;right:clamp(5%,9vw,13%);top:48%;width:clamp(90px,13vw,170px);height:clamp(90px,13vw,170px);transform:rotate(-45deg);z-index:-1;opacity:.72;filter:drop-shadow(0 0 26px #f08cae88);animation:heartPulse 2.8s ease-in-out infinite;pointer-events:none}
  .heart-display:before,.heart-display:after{content:'';position:absolute;width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#ffb4c9,#e36d9e 65%,#a94d9a)}
  .heart-display:before{top:-50%;left:0}.heart-display:after{top:0;left:50%}
  .heart-display{background:linear-gradient(135deg,#ffb4c9,#d65c98 65%,#914bba)}
  .heart-spark{position:fixed;right:clamp(4%,7vw,12%);top:42%;font-size:1rem;color:#f3c978;z-index:-1;opacity:.8;animation:sparkFloat 3s ease-in-out infinite}
  @keyframes heartPulse{0%,100%{scale:1;opacity:.58}50%{scale:1.1;opacity:.9}}
  @keyframes sparkFloat{0%,100%{transform:translate(0,0) rotate(0);opacity:.25}50%{transform:translate(16px,-18px) rotate(25deg);opacity:1}}
  @media(max-width:700px){.heart-display{right:8%;top:32%;width:64px;height:64px;opacity:.45}.heart-spark{right:12%;top:29%;font-size:.75rem}}
  @media(prefers-reduced-motion:reduce){.heart-display,.heart-spark{animation:none}}
`;
document.head.appendChild(heartStyle);

const heart = document.createElement('div');
heart.className = 'heart-display';
heart.setAttribute('aria-hidden', 'true');
document.body.appendChild(heart);

const spark = document.createElement('div');
spark.className = 'heart-spark';
spark.textContent = '✦';
spark.setAttribute('aria-hidden', 'true');
document.body.appendChild(spark);

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
