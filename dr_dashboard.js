import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize using the imported central config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Authentication Check
const activeUser = localStorage.getItem("activeUser"); 
const activeRole = localStorage.getItem("activeRole"); 
const docName = localStorage.getItem("activeDocName"); 

if (!activeUser || activeRole !== "Doctor") {
    window.location.href = "index.html"; 
}
document.getElementById('doc-profile-name').innerHTML = `<b>${docName}</b>`;

// Logout Setup
window.logout = function() {
    localStorage.removeItem("activeUser");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("activeDocName");
    window.location.href = "index.html";
};

// Global Variables
let currentPatientDocId = null;
let currentPatientData = null;

// CLEAR DASHBOARD (RESET)
window.clearDashboard = function() {
    document.getElementById('search-username').value = '';
    document.getElementById('search-error').classList.add('hidden');
    document.getElementById('consultation-section').classList.add('hidden');
    
    document.getElementById('diag-notes').value = '';
    document.getElementById('diet-notes').value = '';
    document.getElementById('follow-up-date').value = '';
    document.getElementById('medicines-container').innerHTML = '';
    
    document.getElementById('btn-save-consult').classList.remove('hidden');
    document.getElementById('btn-print-rx').classList.add('hidden');

    currentPatientDocId = null;
    currentPatientData = null;
};

// FETCH PATIENT FROM FIREBASE
window.fetchPatient = async function() {
    const username = document.getElementById('search-username').value.trim().toUpperCase();
    const errorMsg = document.getElementById('search-error');
    const fetchBtn = document.getElementById('fetchBtn');
    
    if(!username) return;

    fetchBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Fetching...";
    
    try {
        const q = query(collection(db, "patients"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const patientDoc = querySnapshot.docs[0];
            currentPatientDocId = patientDoc.id;
            currentPatientData = patientDoc.data();

            errorMsg.classList.add('hidden');
            
            document.getElementById('pat-name').innerText = currentPatientData.name;
            document.getElementById('pat-age').innerText = currentPatientData.age;
            document.getElementById('pat-phone').innerText = currentPatientData.phone;
            document.getElementById('pat-symptoms').innerText = currentPatientData.symptoms;

            document.getElementById('consultation-section').classList.remove('hidden');
            
            if(document.querySelectorAll('.medicine-row').length === 0) { 
                addMedicineRow(); 
            }
        } else {
            errorMsg.classList.remove('hidden');
            document.getElementById('consultation-section').classList.add('hidden');
        }
    } catch (error) {
        console.error("Error fetching patient:", error);
        alert("Error connecting to database!");
    } finally {
        fetchBtn.innerHTML = "<i class='fa-solid fa-magnifying-glass'></i> Fetch Record";
    }
};

// MEDICINE ROWS BUILDER
window.addMedicineRow = function() {
    const container = document.getElementById('medicines-container');
    const rowId = `med-${Date.now()}`; 
    const rowHTML = `
        <div class="medicine-row" id="${rowId}">
            <div><small>Medicine Name</small><input type="text" class="med-name" placeholder="e.g., Paracetamol 500mg"></div>
            <div><small>Instruction</small>
                <select class="med-instruction">
                    <option value="After Meal">After Meal</option>
                    <option value="Before Meal">Before Meal</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                </select>
            </div>
            <div><small>Frequency</small>
                <select class="med-freq">
                    <option value="1 - 0 - 1">Morning & Night (1-0-1)</option>
                    <option value="1 - 1 - 1">Thrice a day (1-1-1)</option>
                    <option value="1 - 0 - 0">Morning Only (1-0-0)</option>
                    <option value="0 - 0 - 1">Night Only (0-0-1)</option>
                </select>
            </div>
            <div><small>Duration</small><input type="text" class="med-days" placeholder="e.g., 5 days"></div>
            <div style="text-align: right;"><button class="btn-remove" onclick="removeMedicineRow('${rowId}')"><i class="fa-solid fa-trash"></i></button></div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHTML);
};

window.removeMedicineRow = function(rowId) { 
    document.getElementById(rowId).remove(); 
};

// SAVE CONSULTATION TO FIREBASE
window.saveConsultation = async function() {
    if(!currentPatientDocId) return;

    const saveBtn = document.getElementById('btn-save-consult');
    saveBtn.innerText = "Saving to Database...";

    const diagnosis = document.getElementById('diag-notes').value;
    const diet = document.getElementById('diet-notes').value;
    const followUp = document.getElementById('follow-up-date').value;
    const todayStr = new Date().toLocaleDateString();

    const medicineRows = document.querySelectorAll('.medicine-row');
    let medicinesList = [];
    medicineRows.forEach(row => {
        const name = row.querySelector('.med-name').value;
        if(name.trim() !== "") {
            medicinesList.push({
                name: name, 
                instruction: row.querySelector('.med-instruction').value,
                freq: row.querySelector('.med-freq').value, 
                days: row.querySelector('.med-days').value
            });
        }
    });

    const prescriptionData = {
        doctor: docName,
        date: todayStr,
        diagnosis: diagnosis,
        medicines: medicinesList,
        diet: diet,
        followUp: followUp
    };

    try {
        const patientRef = doc(db, "patients", currentPatientDocId);
        await updateDoc(patientRef, {
            prescription: prescriptionData
        });

        alert("✅ Consultation Saved Successfully! You can now print the Parcha.");
        
        saveBtn.classList.add('hidden');
        document.getElementById('btn-print-rx').classList.remove('hidden');
        
        setupPrintTemplate(currentPatientData, prescriptionData);

    } catch (error) {
        console.error("Error saving prescription:", error);
        alert("Failed to save to database. Please try again.");
    } finally {
        saveBtn.innerText = "Save Consultation to Database";
    }
};

// SETUP PRINT TEMPLATE
function setupPrintTemplate(patient, rx) {
    document.getElementById('print-username').innerText = patient.username;
    document.getElementById('print-doc-name').innerText = docName;
    document.getElementById('print-doc-spec').innerText = patient.spec || "Specialist";
    
    document.getElementById('print-p-name').innerText = patient.name;
    document.getElementById('print-p-age').innerText = patient.age + " Yrs";
    document.getElementById('print-p-date').innerText = rx.date;
    document.getElementById('print-diag').innerText = rx.diagnosis || "N/A";

    const medTableBody = document.querySelector('#print-med-list tbody');
    medTableBody.innerHTML = '';
    rx.medicines.forEach(med => {
        medTableBody.innerHTML += `
            <tr>
                <td><strong>${med.name}</strong></td>
                <td>${med.freq}</td>
                <td>${med.instruction}</td>
                <td>${med.days}</td>
            </tr>
        `;
    });

    document.getElementById('print-diet').innerText = rx.diet || "Normal Diet";
    
    let fDate = rx.followUp;
    if(fDate) {
        let dateObj = new Date(fDate);
        fDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    document.getElementById('print-followup-date').innerText = fDate || "As needed";
}

// LOAD OLD PATIENTS HISTORY
window.loadOldPatients = async function() {
    const listEl = document.getElementById('doc-old-patients-list');
    listEl.innerHTML = "<tr><td colspan='5' style='text-align: center;'>Loading...</td></tr>"; 

    try {
        const q = query(collection(db, "patients"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        
        let htmlStr = "";
        let count = 0;

        snapshot.forEach((doc) => {
            const p = doc.data();
            if (p.prescription && p.prescription.doctor === docName) {
                count++;
                let fDate = p.prescription.followUp ? new Date(p.prescription.followUp).toLocaleDateString() : 'None';
                htmlStr += `
                    <tr>
                        <td>${p.prescription.date}</td>
                        <td><b>${p.username}</b></td>
                        <td>${p.name}</td>
                        <td>${p.prescription.diagnosis || 'N/A'}</td>
                        <td style="color: #e63946; font-weight: bold;">${fDate}</td>
                    </tr>
                `;
            }
        });

        if (count === 0) {
            listEl.innerHTML = "<tr><td colspan='5' style='text-align: center;'>You have no consulted patients yet.</td></tr>";
        } else {
            listEl.innerHTML = htmlStr;
        }

    } catch (error) {
        console.error("Error loading history:", error);
        listEl.innerHTML = "<tr><td colspan='5' style='text-align: center; color: red;'>Failed to load history.</td></tr>";
    }
};