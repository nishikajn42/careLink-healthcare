// ==========================================
// 1. AUTHENTICATION & UI SETUP
// ==========================================
const activeUser = localStorage.getItem("activeUser");
const activeRole = localStorage.getItem("activeRole");
const docName = localStorage.getItem("activeDocName");

if (!activeUser || activeRole !== "Doctor") {
    window.location.href = "index.html"; 
}

document.getElementById('doc-profile-name').innerHTML = `<b>${docName}</b> (${activeUser})`;

// function logout() {
//     localStorage.clear(); // Yeh villain hai jisne data delete kiya!
//     window.location.href = "index.html";
// }

function logout() {
    // Sirf login ki details delete karo
    localStorage.removeItem("activeUser");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("activeDocName");
    
    // Patient data delete nahi hoga!
    window.location.href = "index.html";
}

function openChat() { document.getElementById('chatModal').classList.remove('hidden'); }
function closeChat() { document.getElementById('chatModal').classList.add('hidden'); }

// --- Tab Switching Logic ---
function switchDocTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');

    if(tabId === 'view-old-patients') {
        loadDocOldPatients();
    }
}

// ==========================================
// 2. CLEAR DASHBOARD (NEXT PATIENT)
// ==========================================
function clearDashboard() {
    // 1. Clear search bar
    document.getElementById('search-username').value = '';
    document.getElementById('search-error').classList.add('hidden');
    
    // 2. Hide consultation form
    document.getElementById('consultation-section').classList.add('hidden');
    
    // 3. Clear text areas and dates
    document.getElementById('diag-notes').value = '';
    document.getElementById('diet-notes').value = '';
    document.getElementById('follow-up-date').value = '';
    
    // 4. Remove all medicine rows
    document.getElementById('medicines-container').innerHTML = '';
    
    // 5. Reset buttons
    document.getElementById('btn-save-consult').classList.remove('hidden');
    document.getElementById('btn-print-rx').classList.add('hidden');

    currentPatient = null;
    patientIndex = -1;
}

// ==========================================
// 3. FETCH PATIENT LOGIC
// ==========================================
let currentPatient = null;
let patientIndex = -1;

function fetchPatient() {
    const username = document.getElementById('search-username').value.trim().toLowerCase();
    const errorMsg = document.getElementById('search-error');
    if(!username) return;

    let savedPatients = JSON.parse(localStorage.getItem('medicare_patients_db')) || [];
    patientIndex = savedPatients.findIndex(p => p.username === username);

    if(patientIndex !== -1) {
        currentPatient = savedPatients[patientIndex];
        errorMsg.classList.add('hidden');
        
        document.getElementById('pat-name').innerText = currentPatient.name;
        document.getElementById('pat-age').innerText = currentPatient.age;
        document.getElementById('pat-phone').innerText = currentPatient.phone;
        document.getElementById('pat-symptoms').innerText = currentPatient.symptoms;

        document.getElementById('consultation-section').classList.remove('hidden');
        
        if(document.querySelectorAll('.medicine-row').length === 0) { addMedicineRow(); }
    } else {
        errorMsg.classList.remove('hidden');
        document.getElementById('consultation-section').classList.add('hidden');
    }
}

// ==========================================
// 4. DYNAMIC MEDICINE BUILDER
// ==========================================
function addMedicineRow() {
    const container = document.getElementById('medicines-container');
    const rowId = `med-${Date.now()}`; 
    const rowHTML = `
        <div class="medicine-row" id="${rowId}">
            <div><small>Medicine Name</small><input type="text" class="med-name" placeholder="e.g., Paracetamol"></div>
            <div><small>Instruction</small>
                <select class="med-instruction">
                    <option value="After Meal">After Meal</option>
                    <option value="Before Meal">Before Meal</option>
                    <option value="With Milk">With Milk</option>
                </select>
            </div>
            <div><small>Frequency</small>
                <select class="med-freq">
                    <option value="Morning">Morning</option>
                    <option value="Night">Night</option>
                    <option value="Twice a day">Twice a day</option>
                    <option value="Thrice a day">Thrice a day</option>
                </select>
            </div>
            <div><small>Time</small><input type="time" class="med-time"></div>
            <div><small>Days</small><input type="number" class="med-days" placeholder="5" min="1"></div>
            <div style="margin-top: 15px;"><button class="btn-remove" onclick="removeMedicineRow('${rowId}')"><i class="fa-solid fa-trash"></i></button></div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);
}

function removeMedicineRow(rowId) { document.getElementById(rowId).remove(); }

// ==========================================
// 5. SAVE CONSULTATION
// ==========================================
function saveConsultation() {
    const diagnosis = document.getElementById('diag-notes').value;
    const diet = document.getElementById('diet-notes').value;
    const followUp = document.getElementById('follow-up-date').value;

    const medicineRows = document.querySelectorAll('.medicine-row');
    let medicinesList = [];

    medicineRows.forEach(row => {
        const name = row.querySelector('.med-name').value;
        if(name.trim() !== "") {
            medicinesList.push({
                name: name, instruction: row.querySelector('.med-instruction').value,
                freq: row.querySelector('.med-freq').value, time: row.querySelector('.med-time').value,
                days: row.querySelector('.med-days').value
            });
        }
    });

    currentPatient.prescription = {
        doctor: docName, date: new Date().toLocaleDateString(),
        diagnosis: diagnosis, medicines: medicinesList, diet: diet, followUp: followUp
    };

    let savedPatients = JSON.parse(localStorage.getItem('medicare_patients_db'));
    savedPatients[patientIndex] = currentPatient;
    localStorage.setItem('medicare_patients_db', JSON.stringify(savedPatients));

    alert("✅ Consultation Saved! You can now print the Parcha.");
    
    document.getElementById('btn-save-consult').classList.add('hidden');
    document.getElementById('btn-print-rx').classList.remove('hidden');
    populatePrintTemplate(currentPatient);
}



// ==========================================
// 7. LOAD OLD PATIENTS FOR THIS DOCTOR
// ==========================================
function loadDocOldPatients() {
    const listEl = document.getElementById('doc-old-patients-list');
    listEl.innerHTML = ""; 

    let savedPatients = JSON.parse(localStorage.getItem('medicare_patients_db')) || [];
    let myPatients = savedPatients.filter(p => p.prescription && p.prescription.doctor === docName);

    if(myPatients.length === 0) {
        listEl.innerHTML = "<tr><td colspan='6'>You have not treated any patients yet.</td></tr>";
        return;
    }

    myPatients.reverse().forEach((p) => {
        let followUpText = p.prescription.followUp ? new Date(p.prescription.followUp).toLocaleDateString() : 'None';
        listEl.innerHTML += `
            <tr>
                <td>${p.prescription.date}</td>
                <td><b>${p.username}</b></td>
                <td>${p.name}</td>
                <td>${p.prescription.diagnosis || 'N/A'}</td>
                <td style="color: #ef4444; font-weight: bold;">${followUpText}</td>
                <td><button class="btn-view" onclick="viewPastRx('${p.username}')"><i class="fa-solid fa-eye"></i> View</button></td>
            </tr>
        `;
    });
}

// ==========================================
// 8. VIEW PAST PRESCRIPTION MODAL LOGIC
// ==========================================
window.viewPastRx = function(username) {
    let savedPatients = JSON.parse(localStorage.getItem('medicare_patients_db')) || [];
    let patient = savedPatients.find(p => p.username === username);

    if(!patient || !patient.prescription) return;

    let rx = patient.prescription;
    let medRows = '';
    
    // Build the medicine rows
    rx.medicines.forEach(med => {
        let formattedTime = med.time ? `at ${med.time}` : '';
        medRows += `<tr>
            <td><b>${med.name}</b></td>
            <td>${med.freq} <small><i>${formattedTime}</i></small></td>
            <td>${med.instruction}</td>
            <td>${med.days} days</td>
        </tr>`;
    });

    // Inject the data into the modal HTML
    let detailsHTML = `
        <div class="info-grid" style="margin-bottom: 20px;">
            <div><small>Patient Name:</small> <strong style="font-size:1.1rem">${patient.name}</strong></div>
            <div><small>Age / Phone:</small> <strong>${patient.age} Yrs | ${patient.phone}</strong></div>
            <div><small>Consult Date:</small> <strong>${rx.date}</strong></div>
        </div>

        <div class="history-section">
            <h4>Diagnosis & Observations</h4>
            <p>${rx.diagnosis || 'No diagnosis recorded.'}</p>
        </div>

        <div class="history-section">
            <h4>Prescribed Medicines</h4>
            ${medRows ? `
            <table class="history-med-table">
                <thead><tr><th>Medicine</th><th>Dosage</th><th>Instruction</th><th>Duration</th></tr></thead>
                <tbody>${medRows}</tbody>
            </table>` : '<p>No medicines prescribed during this visit.</p>'}
        </div>

        <div class="history-section">
            <h4>Diet & Lifestyle Advice</h4>
            <p>${rx.diet || 'No specific advice given.'}</p>
        </div>
    `;

    // Show the modal
    document.getElementById('past-rx-details').innerHTML = detailsHTML;
    document.getElementById('pastRxModal').classList.remove('hidden');
};

// Close Modal Function
window.closePastRx = function() {
    document.getElementById('pastRxModal').classList.add('hidden');
};