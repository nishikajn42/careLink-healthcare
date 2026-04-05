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
  function switchTab(role, btn) { // 'btn' parameter add kiya
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active'); // Current button ko active karo
    document.getElementById('tab-' + role).classList.add('active');
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


// =========================================
// PROTOTYPE CREDENTIALS & LOGIN LOGIC
// =========================================

// Pre-defined Hardcoded Credentials
const VALID_EMPLOYEE = { username: "EMP-01", password: "123" };

const VALID_DOCTORS = [
    { username: "DOC-01", password: "123", name: "Dr. Ramesh Khanna", spec: "Cardiologist" },
    { username: "DOC-02", password: "123", name: "Dr. Aastha Nayak", spec: "Psychiatrist" },
    { username: "DOC-03", password: "123", name: "Dr. Aarya Nayak", spec: "Pediatrician" },
    { username: "DOC-04", password: "123", name: "Dr. Sanchita Jain", spec: "Neurologist" },
    { username: "DOC-05", password: "123", name: "Dr. Salini Yadav", spec: "General Physician" },
    { username: "DOC-06", password: "123", name: "Dr. Aashi Singhai", spec: "Orthopedist" },
    { username: "DOC-07", password: "123", name: "Dr. Vikram Singh", spec: "Dentist" },
    { username: "DOC-08", password: "123", name: "Dr. Saloni Yadav", spec: "ENT Specialist" }
];

// --- Staff Flow (Role -> User/Pass -> Login) ---
function loginStaff(role) {
    let user = "";
    let pass = "";

    // Role ke hisaab se correct input boxes se value nikalna
    if (role === 'Employee') {
        user = document.getElementById('emp-username').value.trim();
        pass = document.getElementById('emp-password').value.trim();
    } else if (role === 'Doctor') {
        user = document.getElementById('doc-username').value.trim();
        pass = document.getElementById('doc-password').value.trim();
    }

    // Khali fields check karna
    if(user === '' || pass === '') {
        alert('Please enter both Username and Password.');
        return;
    }

    // 1. Employee Login Check
    if (role === 'Employee') {
        if (user === VALID_EMPLOYEE.username && pass === VALID_EMPLOYEE.password) {
            alert("Employee Login Successful! Redirecting to dashboard...");
            
            // LocalStorage mein save kar rahe hain taaki next page par pata chale kaun login hai
            localStorage.setItem("activeUser", user);
            localStorage.setItem("activeRole", "Employee");
            
            // Redirecting to the employee dashboard
            window.location.href = "employee.html";
        } else {
            alert("Invalid Employee credentials. Try Username: EMP-01 | Pass: 123");
        }
    } 
    // 2. Doctor Login Check
    else if (role === 'Doctor') {
        // Find if the doctor username and password match any array entry
        const matchedDoctor = VALID_DOCTORS.find(doc => doc.username === user && doc.password === pass);

        if (matchedDoctor) {
            alert(`Welcome ${matchedDoctor.name}! Redirecting to dashboard...`);
            
            localStorage.setItem("activeUser", matchedDoctor.username);
            localStorage.setItem("activeRole", "Doctor");
            localStorage.setItem("activeDocName", matchedDoctor.name); 
            
            // Redirecting to the doctor dashboard
            window.location.href = "dr_dashboard.html";
        } else {
            alert("Invalid Doctor credentials. Try a username between DOC-01 and DOC-08 with Password: 123");
        }
    }
}