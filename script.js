const blob = document.querySelector('.silver-blob');

window.addEventListener('pointermove', (e) => {
  if (!blob) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 8;
  const y = (e.clientY / window.innerHeight - 0.5) * 6;
  blob.style.filter = `blur(${12 + Math.abs(y) * 0.25}px) saturate(85%)`;
  blob.style.transform = `translateX(${x - 6}%) translateY(${y * 0.25 + 2}%) rotate(${-6 + x * 0.2}deg)`;
});
