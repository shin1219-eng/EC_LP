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

// Scroll Reveal Animation
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
});

// --- Three.js WebGL Market Visualization ---
function initWebGLMarketFlow() {
  const container = document.getElementById('webgl-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf4f6f9, 0.0015);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
  camera.position.z = 180;
  camera.position.y = 20;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Particles
  const particleCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const colorSmall = new THREE.Color(0x8a95a5); // Silver/slate
  const colorLarge = new THREE.Color(0x3a4b63); // Deeper slate/blue

  for (let i = 0; i < particleCount; i++) {
    // 0.44T sphere (Left)
    if (i < 400) {
      const radius = Math.random() * 15;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = -60 + radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      colorSmall.toArray(colors, i * 3);
      sizes[i] = Math.random() * 1.5 + 0.5;
    }
    // Flowing stream (Middle)
    else if (i < 800) {
      positions[i * 3] = -60 + Math.random() * 120; // x between -60 and +60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      colorSmall.lerp(colorLarge, Math.random()).toArray(colors, i * 3);
      sizes[i] = Math.random() * 1.2 + 0.3;
    }
    // 15.2T sphere (Right)
    else {
      const radius = Math.random() * 45; // Much larger
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = 60 + radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      colorLarge.toArray(colors, i * 3);
      sizes[i] = Math.random() * 2.0 + 1.0;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom Shader Material for glowy points
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;
      void main() {
        vColor = color;
        vec3 pos = position;
        // Add waving motion to stream particles
        if (pos.x > -50.0 && pos.x < 50.0) {
          pos.y += sin(pos.x * 0.05 + time * 2.0) * 5.0;
          pos.z += cos(pos.x * 0.05 + time * 1.5) * 5.0;
        }
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        // Soft edge
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `,
    blending: THREE.NormalBlending,
    depthWrite: false,
    transparent: true
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // HTML Overlays creation (Simplified labels, numbers handled via HTML or removed)
  const overlayHTML = `
    <div style="position: absolute; top: 20px; left: 15%; transform: translateX(-50%); text-align: center; pointer-events: none;">
      <div style="font-size: 14px; color: #5F6773; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">越境EC市場</div>
    </div>
    <div style="position: absolute; top: 180px; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; background: rgba(255,255,255,0.9); padding: 12px 24px; border-radius: 999px; box-shadow: 0 4px 12px rgba(18,22,33,0.06); border: 1px solid rgba(226,231,240,0.8);">
      <div style="font-size: 18px; font-weight: 700; color: #111419; letter-spacing: 0.02em;">RePrompt Localization</div>
    </div>
    <div style="position: absolute; top: 20px; left: 85%; transform: translateX(-50%); text-align: center; pointer-events: none;">
      <div style="font-size: 14px; color: #5F6773; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">日本国内EC市場</div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', overlayHTML);

  let mouseX = 0;
  let mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    material.uniforms.time.value = time;

    // Slowly rotate the entire system
    particles.rotation.y = Math.sin(time * 0.1) * 0.2;
    particles.rotation.x = Math.cos(time * 0.1) * 0.1;

    // Interactive camera movement
    camera.position.x += (mouseX * 20 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 20 + 20 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Stream movement logic (moving particles from left to right)
    const pos = geometry.attributes.position.array;
    for (let i = 400; i < 800; i++) {
      pos[i * 3] += 0.5; // move right
      if (pos[i * 3] > 60) {
        // Reset to left
        pos[i * 3] = -60;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

document.addEventListener('DOMContentLoaded', initWebGLMarketFlow);
