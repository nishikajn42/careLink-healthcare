// employee.js / dr_dashboard.js
import { firebaseConfig } from './firebase-config.js'; // Config yahan se aayega
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize using the imported config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Authentication & Setup
const activePatientUser = localStorage.getItem("activeUser"); // e.g. HIM90-2632
if (!activePatientUser) {
    window.location.href = "index.html"; // Redirect agar login nahi hai
}

document.getElementById('nav-patient-id').innerText = `ID: ${activePatientUser}`;

// Logout Logic
window.logoutPatient = function() {
    localStorage.removeItem("activeUser");
    localStorage.removeItem("activeRole");
    window.location.href = "index.html";
};

// =====================================
// 3. PROFILE PHOTO UPLOAD LOGIC (Local Storage for speed)
// =====================================
window.uploadProfilePhoto = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            document.getElementById('profile-img').src = imageData;
            localStorage.setItem(`profilePhoto_${activePatientUser}`, imageData);
        };
        reader.readAsDataURL(file);
    }
};

// Load saved photo on startup
const savedPhoto = localStorage.getItem(`profilePhoto_${activePatientUser}`);
if (savedPhoto) {
    document.getElementById('profile-img').src = savedPhoto;
}

// =====================================
// 4. FIREBASE DATA FETCHING LOGIC
// =====================================
async function loadPatientData() {
    try {
        // Firebase se us specific patient ka data nikalna
        const q = query(collection(db, "patients"), where("username", "==", activePatientUser));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const patientData = querySnapshot.docs[0].data();

            // Set Profile Details on UI
            document.getElementById('p-name').innerText = patientData.name;
            document.getElementById('p-age-val').innerText = patientData.age;
            
            // Check if prescription exists
            if (patientData.prescription && patientData.prescription.medicines) {
                processMedicines(patientData.prescription.medicines);
            } else {
                showEmptyState("Doctor is yet to upload your prescription.");
            }
        } else {
            showEmptyState("No patient record found in database.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        showEmptyState("Error connecting to server.");
    }
}

// =====================================
// 5. TIME CALCULATION & REMINDER LOGIC
// =====================================
function processMedicines(medicinesList) {
    const timeMap = {
        "Morning": "09:00",
        "Afternoon": "14:00",
        "Night": "20:00" // 8 PM
    };

    let todaysSchedule = [];

    // Frequency (1-0-1 etc.) ko actual time mein convert karna
    medicinesList.forEach(med => {
        let times = [];
        let f = med.freq.toLowerCase();
        
        if(f.includes("morning & night") || f.includes("1 - 0 - 1") || f.includes("twice")) {
            times.push(timeMap["Morning"], timeMap["Night"]);
        } else if(f.includes("thrice") || f.includes("1 - 1 - 1")) {
            times.push(timeMap["Morning"], timeMap["Afternoon"], timeMap["Night"]);
        } else if(f.includes("night") || f.includes("0 - 0 - 1")) {
            times.push(timeMap["Night"]);
        } else {
            times.push(timeMap["Morning"]); // Default
        }

        // List mein add karna
        times.forEach(t => {
            todaysSchedule.push({
                time: t,
                name: med.name,
                instruction: med.instruction,
                qty: "1 Dose"
            });
        });
    });

    // Time ke hisaab se Sort karna (Subah se Raat tak)
    todaysSchedule.sort((a, b) => a.time.localeCompare(b.time));
    populateDashboard(todaysSchedule);
}

// =====================================
// 6. POPULATE UI (NEXT & UPCOMING)
// =====================================
function populateDashboard(schedule) {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    let nextMed = null;
    let upcomingMeds = [];
    let scheduleTableHTML = "";

    schedule.forEach(med => {
        let isPast = med.time < currentTime;
        let statusBadge = isPast ? '<span class="status-badge taken">Taken</span>' : '<span class="status-badge">Pending</span>';
        
        // Table row build karna
        scheduleTableHTML += `
            <tr>
                <td style="font-weight: bold; color: #0f2942;">${formatAMPM(med.time)}</td>
                <td>${med.name} <br> <small style="color: #666;">${med.instruction}</small></td>
                <td>${med.qty}</td>
                <td>${statusBadge}</td>
            </tr>
        `;

        // Next aur Upcoming separate karna
        if (!isPast) {
            if (!nextMed) {
                nextMed = med; // Immediate next medicine
            } else {
                upcomingMeds.push(med); // Uske baad wali saari medicines
            }
        }
    });

    document.getElementById('schedule-tbody').innerHTML = scheduleTableHTML;

    // NEXT REMINDER Box Update
    if (nextMed) {
        document.getElementById('next-med-time').innerText = formatAMPM(nextMed.time);
        document.getElementById('next-med-name').innerText = nextMed.name;
        document.getElementById('next-med-instruction').innerText = nextMed.instruction;
    } else {
        document.getElementById('next-med-time').innerText = "Done!";
        document.getElementById('next-med-name').innerText = "All medicines taken";
        document.getElementById('next-med-instruction').innerText = "Rest well for today. See you tomorrow!";
    }

    // UPCOMING REMINDERS List Update
    const upcomingContainer = document.getElementById('upcoming-list-container');
    if (upcomingMeds.length > 0) {
        let upHTML = "";
        upcomingMeds.forEach(m => {
            upHTML += `
                <div class="upcoming-box">
                    <div>
                        <div class="up-med">${m.name}</div>
                        <small style="color:#666;">${m.instruction}</small>
                    </div>
                    <div class="up-time">${formatAMPM(m.time)}</div>
                </div>
            `;
        });
        upcomingContainer.innerHTML = upHTML;
    } else {
        upcomingContainer.innerHTML = "<p style='text-align:center; color:#666; padding: 20px 0;'>No other upcoming medicines today.</p>";
    }
}

// State jab koi data na ho
function showEmptyState(message) {
    document.getElementById('next-med-time').innerText = "--:--";
    document.getElementById('next-med-name').innerText = "No Prescription";
    document.getElementById('next-med-instruction').innerText = message;
    document.getElementById('upcoming-list-container').innerHTML = `<p style='text-align:center;'>${message}</p>`;
    document.getElementById('schedule-tbody').innerHTML = `<tr><td colspan='4' style='text-align:center;'>${message}</td></tr>`;
}

// Time formatter (24hr to 12hr AM/PM)
function formatAMPM(time24) {
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours);
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 baje ko 12 banana
    return `${hours}:${minutes} ${ampm}`;
}

// Execute Script when page loads
window.onload = loadPatientData;