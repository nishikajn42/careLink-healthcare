// ── Carousel ──────────────────────────────────
  let current = 0;
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('dots');
  let autoTimer;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i===0?' active':'');
    d.onclick = () => goTo(i);
    dotsContainer.appendChild(d);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }
  function changeSlide(dir) { clearInterval(autoTimer); goTo(current + dir); startAuto(); }
  function startAuto() { autoTimer = setInterval(() => goTo(current+1), 4500); }
  startAuto();

  // ── Hamburger Menu ────────────────────────────
  function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const ham  = document.getElementById('hamburger');
    menu.classList.toggle('open');
    ham.classList.toggle('open');
  }
  // close mobile menu on link click
  document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', toggleMenu));

  // ── Modals ────────────────────────────────────
  function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
  }
  function closeOnOverlay(e, id) { if(e.target === e.currentTarget) closeModal(id); }
  document.addEventListener('keydown', e => {
    if(e.key==='Escape') { closeModal('patientModal'); closeModal('staffModal'); }
  });

  // ── Staff Tabs ────────────────────────────────
  function switchTab(role) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('tab-' + role).classList.add('active');
  }

  // ── OTP ───────────────────────────────────────
  function sendOtp() {
    const pid = document.getElementById('patientId').value.trim();
    if(!pid) { alert('Please enter your Patient ID first.'); return; }
    const btn = event.currentTarget;
    btn.textContent = 'Sent ✓';
    btn.style.background = 'var(--teal)';
    btn.style.color = 'white';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Resend';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 30000);
  }

  // ── Scroll Reveal ─────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── Radial SVG Lines ──────────────────────────
  function drawLines() {
    const diagram = document.getElementById('radialDiagram');
    const svg     = document.getElementById('connectorSvg');
    const center  = diagram.querySelector('.center-circle');
    const features = diagram.querySelectorAll('.feature-circle');
    const dr = diagram.getBoundingClientRect();
    const cr = center.getBoundingClientRect();
    const cx = cr.left - dr.left + cr.width/2;
    const cy = cr.top  - dr.top  + cr.height/2;
    const W  = dr.width;
    const H  = dr.height;

    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    features.forEach(fc => {
      const fr = fc.getBoundingClientRect();
      const fx = fr.left - dr.left + fr.width/2;
      const fy = fr.top  - dr.top  + fr.height/2;
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', fx); line.setAttribute('y2', fy);
      line.setAttribute('stroke', 'rgba(14,157,140,0.25)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '5,4');
      svg.appendChild(line);
    });
  }

  window.addEventListener('load',   drawLines);
  window.addEventListener('resize', drawLines);
  setTimeout(drawLines, 300);