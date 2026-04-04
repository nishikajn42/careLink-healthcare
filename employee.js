import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Apni API key yaha daliye
const firebaseConfig = {
    apiKey: "AIzaSyBkG-MkMl9dT92MsS4rzHFv0PCmd_XuFug",
    authDomain: "carelink-c5e57.firebaseapp.com",
    projectId: "carelink-c5e57",
    storageBucket: "carelink-c5e57.firebasestorage.app",
    messagingSenderId: "233978283967",
    appId: "1:233978283967:web:116a9c40d443364947830a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const doctors = [
    { name: "Dr. Ramesh Khanna", spec: "Cardiologist", cabin: "Block A - 102", keywords: ["heart", "chest pain", "bp", "blood pressure"] },
    { name: "Dr. Aastha Nayak", spec: "Psychiatrist", cabin: "Block C - 301", keywords: ["mind", "stress", "depression", "anxiety", "sleep"] },
    { name: "Dr. Aarya Nayak", spec: "Pediatrician", cabin: "Block B - 205", keywords: ["child", "baby", "kid", "vaccine"] },
    { name: "Dr. Sanchita Jain", spec: "Neurologist", cabin: "Block A - 108", keywords: ["brain", "nerve", "headache", "migraine", "spine"] },
    { name: "Dr. Salini Yadav", spec: "General Physician", cabin: "Ground - 001", keywords: ["cough", "cold", "fever", "flu", "stomach"] },
    { name: "Dr. Aashi Singhai", spec: "Orthopedist", cabin: "Block D - 401", keywords: ["bone", "joint", "fracture", "muscle", "back pain"] },
    { name: "Dr. Vikram Singh", spec: "Dentist", cabin: "Block E - 505", keywords: ["teeth", "tooth", "gum", "cavity", "mouth"] },
    { name: "Dr. Saloni Yadav", spec: "ENT Specialist", cabin: "Block B - 210", keywords: ["ear", "nose", "throat", "hearing"] }
];

// Logout Logic
document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "index.html"; // Jaisa aapne manga tha
});

// Modal Elements
const modal = document.getElementById("regModal");
const btn = document.getElementById("registerBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = () => { modal.style.display = "block"; document.getElementById("actionSection").style.display = "none"; }
span.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Logic to auto-assign doctor
function findDoctor(symptoms) {
    let lowerSymptoms = symptoms.toLowerCase();
    for (let doc of doctors) {
        for (let keyword of doc.keywords) {
            if (lowerSymptoms.includes(keyword)) return doc;
        }
    }
    return { name: "Dr. Salini Yadav", spec: "General Physician", cabin: "Ground - 001" };
}

// Generate Username Logic (Pehle 3 letter name ke + Age + Random 4 digits)
function generateUsername(name, age) {
    let cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 3);
    let randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${age}-${randomNum}`; // e.g. RAH45-8192
}

// Global variable to hold current patient data temporarily
let currentPatientData = null;

// 1. Assign Doctor Button Click
document.getElementById("assignBtn").addEventListener("click", function() {
    const name = document.getElementById("pName").value;
    const age = document.getElementById("pAge").value;
    const symptoms = document.getElementById("pSymptoms").value;

    if(!name || !age || !symptoms) {
        alert("Please fill name, age, and symptoms first!");
        return;
    }

    const assignedDoc = findDoctor(symptoms);
    const username = generateUsername(name, age);

    // Save temporarily for Save & Print buttons
    currentPatientData = {
        username: username,
        name: name,
        age: age,
        phone: document.getElementById("pPhone").value,
        relative: document.getElementById("pRelative").value,
        symptoms: symptoms,
        doctorName: assignedDoc.name,
        spec: assignedDoc.spec,
        cabin: assignedDoc.cabin
    };

    // Show details on UI
    document.getElementById("displayUsername").innerText = username;
    document.getElementById("displayDoctor").innerText = `${assignedDoc.name} (${assignedDoc.spec})`;
    document.getElementById("displayCabin").innerText = assignedDoc.cabin;
    
    // Hide Assign button, Show Save & Print buttons
    this.style.display = "none";
    document.getElementById("actionSection").style.display = "block";
});

// 2. Print Receipt Logic (A4 Format)
document.getElementById("printBtn").addEventListener("click", function() {
    if(!currentPatientData) return;
    
    // Create a new window for printing
    let printWindow = window.open('', '_blank', 'width=800,height=900');
    
    // A4 CSS & HTML Structure
    let printHTML = `
        <html>
        <head>
            <title>Prescription - ${currentPatientData.username}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
                .a4-page { width: 210mm; min-height: 297mm; margin: auto; padding: 40mm 20mm; box-sizing: border-box; position: relative; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #008b74; padding-bottom: 20px; margin-bottom: 30px; }
                .hospital-info { max-width: 60%; }
                .hospital-name { color: #0f2942; font-size: 36px; font-weight: 800; margin: 0; letter-spacing: 1px; }
                .tagline { color: #008b74; font-size: 16px; font-style: italic; margin-top: 5px; font-weight: 500; }
                .username-box { text-align: right; }
                .user-id { font-size: 28px; font-weight: bold; color: #0f2942; background: #f4f7f6; padding: 10px 20px; border-radius: 8px; border: 1px dashed #ccc; }
                .patient-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 30px; }
                .patient-details div { border-bottom: 1px dotted #ccc; padding-bottom: 5px; }
                .doctor-section { background: #f4f7f6; padding: 15px; border-left: 5px solid #008b74; margin-bottom: 40px; }
                .doctor-section h3 { margin: 0 0 5px 0; color: #0f2942; }
                .rx-symbol { font-size: 80px; color: #0f2942; opacity: 0.8; margin-bottom: 20px; font-weight: bold; }
                .footer { position: absolute; bottom: 30mm; left: 20mm; right: 20mm; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="a4-page">
                <div class="header">
                    <div class="hospital-info">
                        <h1 class="hospital-name">SANJEEVNI HOSPITAL</h1>
                        <div class="tagline">"Healing with Compassion, Caring with Technology"</div>
                    </div>
                    <div class="username-box">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Patient ID</div>
                        <div class="user-id">${currentPatientData.username}</div>
                    </div>
                </div>
                
                <div class="patient-details">
                    <div><strong>Patient Name:</strong> ${currentPatientData.name}</div>
                    <div><strong>Age:</strong> ${currentPatientData.age} Years</div>
                    <div><strong>Phone No:</strong> ${currentPatientData.phone}</div>
                    <div><strong>Guardian/Relative:</strong> ${currentPatientData.relative}</div>
                    <div style="grid-column: span 2;"><strong>Initial Symptoms:</strong> ${currentPatientData.symptoms}</div>
                </div>

                <div class="doctor-section">
                    <h3>${currentPatientData.doctorName} <span style="font-size:14px; color:#666;">(${currentPatientData.spec})</span></h3>
                    <p style="margin: 0;"><strong>Cabin:</strong> ${currentPatientData.cabin}</p>
                </div>

                <div class="rx-symbol">&#8471;</div>
                
                <div class="footer">
                    Sanjeevni Hospital, Gwalior | Contact: +91-XXXXXXXXXX | Emergency: 108<br>
                    This is a computer-generated receipt.
                </div>
            </div>
            <script>
                // Automatically print when page loads
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
});

// 3. Save to Firebase Logic
document.getElementById("patientForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    if(!currentPatientData) return;

    const submitBtn = document.getElementById("saveBtn");
    submitBtn.innerText = "Saving...";

    const now = new Date();
    const currentHour = now.getHours();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient = {
        username: currentPatientData.username,
        name: currentPatientData.name,
        phone: currentPatientData.phone,
        symptoms: currentPatientData.symptoms,
        doctorName: currentPatientData.doctorName,
        cabin: currentPatientData.cabin,
        time: timeString,
        hour: currentHour,
        isNew: true,
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, "patients"), newPatient);
        
        // Reset Everything
        this.reset();
        document.getElementById("actionSection").style.display = "none";
        document.getElementById("assignBtn").style.display = "block";
        modal.style.display = "none";
        alert(`Successfully Saved!`);
        
        // Refresh Dashboard (Aapka purana updateDashboard function call hoga)
        if(typeof updateDashboard === "function") updateDashboard();
        
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error saving data to Firebase!");
    } finally {
        submitBtn.innerText = "Save to Database";
    }
});

// ... (Baaki chart aur updateDashboard ka function as it is rakhna) ...