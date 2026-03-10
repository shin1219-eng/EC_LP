const blob = document.querySelector('.silver-blob');

window.addEventListener('pointermove', (e) => {
  if (!blob) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 16;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  blob.style.filter = `blur(${10 + Math.abs(y) * 0.4}px) saturate(92%)`;
  blob.style.transform = `translateX(${x - 10}%) translateY(${y * 0.35 + 3}%) rotate(${-7 + x * 0.35}deg)`;
});
