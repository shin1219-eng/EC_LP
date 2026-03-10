const blob = document.querySelector('.silver-blob');

function syncButtonRings() {
  document.querySelectorAll('.liquid-btn .ring').forEach((svg) => {
    const btn = svg.closest('.liquid-btn');
    const base = svg.querySelector('.ring-base');
    const glow = svg.querySelector('.ring-glow');
    if (!btn || !base || !glow) return;

    const w = btn.clientWidth;
    const h = btn.clientHeight;
    const inset = 2;
    const rx = Math.max(10, h / 2 - inset);

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    [base, glow].forEach((rect) => {
      rect.setAttribute('x', inset);
      rect.setAttribute('y', inset);
      rect.setAttribute('width', Math.max(1, w - inset * 2));
      rect.setAttribute('height', Math.max(1, h - inset * 2));
      rect.setAttribute('rx', rx);
      rect.setAttribute('ry', rx);
      rect.setAttribute('pathLength', '100');
    });
  });
}

window.addEventListener('pointermove', (e) => {
  if (!blob) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 16;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  blob.style.filter = `blur(${10 + Math.abs(y) * 0.4}px) saturate(92%)`;
  blob.style.transform = `translateX(${x - 10}%) translateY(${y * 0.35 + 3}%) rotate(${-7 + x * 0.35}deg)`;
});

window.addEventListener('load', syncButtonRings);
window.addEventListener('resize', syncButtonRings);
