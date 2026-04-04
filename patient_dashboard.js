import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const activePatientUser = localStorage.getItem("activeUser"); 
if (!activePatientUser) window.location.href = "index.html"; 

let html5QrCode;
window.expectedMedID = null;
window.expectedMedName = null;
window.expectedStorageKey = null; // Specially added to track exact day & medicine

function speakBeti(text) {
    const bubble = document.getElementById('beti-bubble');
    bubble.innerHTML = `<i class="fa-solid fa-robot"></i> ${text}`;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    synth.speak(utterance);
}

async function loadPatientData() {
    try {
        document.getElementById('nav-patient-id').innerText = `ID: ${activePatientUser}`;
        const q = query(collection(db, "patients"), where("username", "==", activePatientUser));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const patientData = querySnapshot.docs[0].data();

            document.getElementById('p-name').innerText = patientData.name || "Unknown";
            document.getElementById('p-age-val').innerText = `Age: ${patientData.age || "--"}`;
            document.getElementById('p-doctor').innerText = patientData.doctorName || "Assigned Doctor";

            if (patientData.prescription && patientData.prescription.medicines) {
                // NAYA LOGIC: Default 3 din agar doctor ne nahi diya hai
                const durationDays = patientData.prescription.durationDays || 3; 
                renderMultiDayGrid(patientData.prescription.medicines, durationDays);
            } else {
                document.getElementById('dose-grid-container').innerHTML = "<p>Koi dawai assign nahi hui hai.</p>";
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// THE NEW CALENDAR MAP LOGIC
function renderMultiDayGrid(medicinesList, durationDays) {
    const container = document.getElementById('dose-grid-container');
    container.innerHTML = ""; 

    // Poore course ke liye loop chalayenge
    for(let day = 1; day <= durationDays; day++) {
        
        // Day ka header lagana optional hai, par accha lagega
        const dayHeader = document.createElement('h4');
        dayHeader.style.gridColumn = "1 / -1"; // Takes full width
        dayHeader.style.color = "#00766c";
        dayHeader.style.borderBottom = "1px solid #ddd";
        dayHeader.innerText = `Day ${day}`;
        container.appendChild(dayHeader);

        medicinesList.forEach((med, index) => {
            // Har din ki har dawai ke liye ek unique key
            const storageKey = `taken_${activePatientUser}_day_${day}_med_${index}`;
            const isTaken = localStorage.getItem(storageKey) === 'true';
            
            const statusClass = isTaken ? 'taken' : 'pending';
            const generatedId = med.name.toLowerCase().replace(/\s+/g, '_');

            const box = document.createElement('div');
            box.className = `dose-box ${statusClass}`;
            box.innerHTML = `
                <h4 style="margin: 0; font-size: 14px;">${med.name}</h4>
                <p style="font-size:11px; margin-top:5px; color:#666;">${med.instruction || med.freq}</p>
            `;
            
            if(!isTaken) {
                // Hum current Day aur specific medicine dono bhejenge
                box.onclick = () => window.triggerScanner(generatedId, med.name, storageKey);
            }

            container.appendChild(box);
        });
    }
}

window.triggerScanner = function(medId, medName, storageKey) {
    window.expectedMedID = medId;
    window.expectedMedName = medName;
    window.expectedStorageKey = storageKey;

    document.getElementById('dashboard-view').style.display = "none";
    document.getElementById('scanner-view').style.display = "flex";
    document.getElementById('scanner-title').innerText = `Scan ${medName}`;
    
    speakBeti(`Dadaji, kripya ${medName} scan karein.`);

    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, window.onScanSuccess)
    .catch(err => alert("Camera blocked or not available."));
}

window.onScanSuccess = function(decodedText) {
    try {
        const scannedData = JSON.parse(decodedText);
        html5QrCode.stop(); 

        if (scannedData.id === window.expectedMedID) {
            speakBeti(`Ji Dadaji! Yeh ${window.expectedMedName} hi hai.`);
            document.getElementById('beti-bubble').style.backgroundColor = "#28a745";
            
            // Mark THAT SPECIFIC DAY and DOSE as taken
            localStorage.setItem(window.expectedStorageKey, 'true');

            setTimeout(() => { 
                window.closeScannerView(); 
                loadPatientData(); // Wapas grid load karo (tick lag jayega)
            }, 4000);

        } else {
            speakBeti(`Rukiye! Yeh galat dawai hai.`);
            document.getElementById('beti-bubble').style.backgroundColor = "#dc3545";
            setTimeout(() => { window.closeScannerView(); }, 4000);
        }
    } catch (e) {
        console.log("Invalid QR Data");
    }
}

window.closeScannerView = function() {
    if(html5QrCode) html5QrCode.stop().catch(e => console.log(e));
    document.getElementById('scanner-view').style.display = "none";
    document.getElementById('dashboard-view').style.display = "block";
    document.getElementById('beti-bubble').style.backgroundColor = "var(--pink-beti)";
}

window.onload = loadPatientData;