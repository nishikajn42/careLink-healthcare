// figuring out the doctor based on symptoms, generating the username, setting up the print layout, and saving to Firebase.  
  
// // <---------------------------------------------------------------------->>
// // <---------------------------------------------------------------------->>

// ==========================================
// 0. AUTHENTICATION CHECK & LOGOUT
// ==========================================
const activeUser = localStorage.getItem("activeUser");
const activeRole = localStorage.getItem("activeRole");

if (!activeUser) {
    window.location.href = "index.html"; // Kick out if not logged in
}

document.addEventListener('DOMContentLoaded', () => {
    const userDisplay = document.querySelector('.dash-user span');
    if (userDisplay && activeUser) {
        userDisplay.innerHTML = `${activeRole} ID: <b>${activeUser}</b>`;
    }
});

document.querySelector('.btn-logout').addEventListener('click', () => {
    localStorage.removeItem("activeUser");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("activeDocName");
    window.location.href = "index.html";
});

// ==========================================
// 1. DOCTOR DATABASE
// ==========================================
const doctors = [
    { name: "Dr. Ramesh Khanna", spec: "Cardiologist", cabin: "Block A - 102", keywords: ["heart", "chest pain", "bp", "blood pressure"] },
    { name: "Dr. Aastha Nayak", spec: "Psychiatrist", cabin: "Block C - 301", keywords: ["mind", "stress", "depression", "anxiety", "sleep"] },
    { name: "Dr. Aarya Nayak", spec: "Pediatrician", cabin: "Block B - 205", keywords: ["child", "baby", "kid", "vaccine"] },
    { name: "Dr. Sanchita Jain", spec: "Neurologist", cabin: "Block A - 108", keywords: ["brain", "nerve", "headache", "migraine", "spine"] },
    { name: "Dr. Salini Yadav", spec: "General Physician", cabin: "Ground - 001", keywords: ["cough", "cold", "fever", "flu", "stomach"] }
    { name: "Dr. Aashi Singhai", spec: "Orthopedist", cabin: "Block D - 401", keywords: ["bone", "joint", "fracture", "muscle", "back pain"] },
    { name: "Dr. Vikram Singh", spec: "Dentist", cabin: "Block E - 505", keywords: ["teeth", "tooth", "gum", "cavity", "mouth"] },
    { name: "Dr. Saloni Yadav", spec: "ENT Specialist", cabin: "Block B - 210", keywords: ["ear", "nose", "throat", "hearing"] },
];

let assignedPatientData = null;

// ==========================================
// 2. UI TAB SWITCHING
// ==========================================
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');

    if(tabId === 'old-patients') {
        loadOldPatients();
    }
}

// ==========================================
// 3. ASSIGN DOCTOR & GENERATE USERNAME
// ==========================================
window.generateAssignment = function() {
    const name = document.getElementById('p-name').value.trim();
    const age = document.getElementById('p-age').value.trim();
    const symptoms = document.getElementById('p-symptoms').value.toLowerCase();

    if(!name || !age || !symptoms) {
        alert("Please fill Name, Age, and Symptoms first.");
        return;
    }

    const username = name.replace(/\s+/g, '').toLowerCase() + age;

    let matchedDoc = doctors[7]; // Default Dentist
    for(let doc of doctors) {
        if(doc.keywords.some(kw => symptoms.includes(kw))) {
            matchedDoc = doc;
            break;
        }
    }

    assignedPatientData = {
        username: username,
        name: name,
        age: age,
        phone: document.getElementById('p-phone').value,
        altPhone: document.getElementById('p-alt-phone').value,
        guardian: document.getElementById('p-guardian').value,
        address: document.getElementById('p-address').value,
        symptoms: symptoms,
        doctorName: matchedDoc.name,
        doctorSpec: matchedDoc.spec,
        cabin: matchedDoc.cabin,
        date: new Date().toLocaleDateString()
    };

    document.getElementById('display-username').innerText = username;
    document.getElementById('display-doc').innerText = matchedDoc.name;
    document.getElementById('display-spec').innerText = matchedDoc.spec;
    document.getElementById('display-cabin').innerText = matchedDoc.cabin;
    
    document.getElementById('assignment-box').classList.remove('hidden');
    document.getElementById('btn-save').classList.remove('hidden');
    document.getElementById('btn-print').classList.remove('hidden');

    populatePrintTemplate(assignedPatientData);
}

// ==========================================
// 4. SAVE TO LOCAL STORAGE (SURVIVES REFRESH)
// ==========================================
window.savePatientData = function() {
    if(!assignedPatientData) {
        alert("No patient data to save!");
        return;
    }

    // 1. Fetch existing patients from browser memory (or create empty array if none exist)
    let savedPatients = JSON.parse(localStorage.getItem('medicare_patients_db')) || [];

    // 2. Add the new patient to the array
    savedPatients.push(assignedPatientData);

    // 3. Save the updated array back into browser memory
    localStorage.setItem('medicare_patients_db', JSON.stringify(savedPatients));

    alert("✅ SUCCESS! Patient saved to system.");
    
    // Hide save button
    document.getElementById('btn-save').classList.add('hidden'); 
}

// ==========================================
// 5. POPULATE PRINT TEMPLATE
// ==========================================
function populatePrintTemplate(data) {
    document.getElementById('print-username').innerText = data.username;
    document.getElementById('print-doc-name').innerText = data.doctorName;
    document.getElementById('print-doc-spec').innerText = data.doctorSpec;
    document.getElementById('print-doc-cabin').innerText = data.cabin;
    
    document.getElementById('print-p-name').innerText = data.name;
    document.getElementById('print-p-address').innerText = data.address;
    document.getElementById('print-p-age').innerText = data.age;
    document.getElementById('print-p-date').innerText = data.date;
    document.getElementById('print-p-symptoms').innerText = data.symptoms;
}

// ==========================================
// 6. LOAD OLD PATIENTS FROM LOCAL STORAGE
// ==========================================
window.loadOldPatients = function() {
    const listEl = document.getElementById('patients-list');
    listEl.innerHTML = ""; 

    // Fetch patients from browser memory
    let savedPatients = JSON.parse(localStorage.getItem('medicare_patients_db')) || [];
    
    if(savedPatients.length === 0) {
        listEl.innerHTML = "<tr><td colspan='4'>No patients registered yet.</td></tr>";
        return;
    }

    // Reverse the array so the newest patients show up at the top of the list
    savedPatients.reverse().forEach((data) => {
        listEl.innerHTML += `
            <tr>
                <td><b>${data.username}</b></td>
                <td>${data.name}</td>
                <td>${data.doctorName}</td>
                <td>${data.date}</td>
            </tr>
        `;
    });
}


// // <---------------------------------------------------------------------->>
// // <---------------------------------------------------------------------->>


////////------------------------------------------------------------///////
////////------------------------------------------------------------///////
////////------------------------------------------------------------///////

// ==========================================
// 0. AUTHENTICATION CHECK & LOGOUT
// ==========================================

// // Check who logged in using localStorage
// const activeUser = localStorage.getItem("activeUser");
// const activeRole = localStorage.getItem("activeRole");

// // Optional: If no one is logged in, kick them back to the home page (security for prototype)
// if (!activeUser) {
//     window.location.href = "index.html";
// }

// // Update the UI to show the correct ID
// document.addEventListener('DOMContentLoaded', () => {
//     const userDisplay = document.querySelector('.dash-user span');
//     if (userDisplay && activeUser) {
//         userDisplay.innerHTML = `${activeRole} ID: <b>${activeUser}</b>`;
//     }
// });

// // Logout Logic
// document.querySelector('.btn-logout').addEventListener('click', () => {
//     // Clear the saved login state
//     localStorage.removeItem("activeUser");
//     localStorage.removeItem("activeRole");
    
//     // Redirect back to home page
//     window.location.href = "index.html";
// });

// // <---------------------------------------------------------------------->>
// // <---------------------------------------------------------------------->>


// // Import Firebase logic (Modules)
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// // ==========================================
// // 1. YOUR FIREBASE CONFIGURATION
// // PASTE YOUR KEYS FROM FIREBASE CONSOLE HERE
// // ==========================================
// const firebaseConfig = {
//   apiKey: "AIzaSyAvcSYT1cJWGO_rj0376NXKmte7Xtlad7w",
//   authDomain: "medicare-db-d99c9.firebaseapp.com",
//   projectId: "medicare-db-d99c9.firebaseapp.com",
//   storageBucket: "medicare-db-d99c9.firebasestorage.app",
//   messagingSenderId: "840729383082",
//   appId: "1:840729383082:web:d5d0d0d214568a9f82c0d3"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);


// // ==========================================
// // 2. HARDCODED DOCTOR DATABASE (8 Doctors)
// // ==========================================
// const doctors = [
//     { name: "Dr. Maran", spec: "Cardiologist", cabin: "Block A - 102", keywords: ["heart", "chest", "bp", "blood pressure"] },
//     { name: "Dr. Suganthi", spec: "Pediatrician", cabin: "Block B - 205", keywords: ["child", "baby", "kid", "vaccine"] },
//     { name: "Dr. JohnDurai", spec: "Psychiatrist", cabin: "Block C - 301", keywords: ["mind", "stress", "depression", "anxiety", "sleep"] },
//     { name: "Dr. Emily Chen", spec: "Neurologist", cabin: "Block A - 108", keywords: ["brain", "nerve", "headache", "migraine", "spine"] },
//     { name: "Dr. Ali Khan", spec: "Orthopedist", cabin: "Block D - 401", keywords: ["bone", "joint", "fracture", "muscle", "back pain"] },
//     { name: "Dr. Sarah Lee", spec: "Dentist", cabin: "Block E - 505", keywords: ["teeth", "tooth", "gum", "cavity", "mouth"] },
//     { name: "Dr. Raj Patel", spec: "ENT Specialist", cabin: "Block B - 210", keywords: ["ear", "nose", "throat", "hearing"] },
//     { name: "Dr. Lisa Ray", spec: "General Physician", cabin: "Ground - 001", keywords: ["cough", "cold", "fever", "flu", "stomach"] }
// ];

// let assignedPatientData = null;

// // ==========================================
// // 3. UI TAB SWITCHING
// // ==========================================
// window.switchTab = function(tabId) {
//     document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
//     document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
//     document.getElementById(tabId).classList.add('active');
//     event.target.classList.add('active');

//     if(tabId === 'old-patients') {
//         loadOldPatients();
//     }
// }

// // ==========================================
// // 4. ASSIGN DOCTOR & GENERATE USERNAME
// // ==========================================
// window.generateAssignment = function() {
//     const name = document.getElementById('p-name').value.trim();
//     const age = document.getElementById('p-age').value.trim();
//     const symptoms = document.getElementById('p-symptoms').value.toLowerCase();

//     if(!name || !age || !symptoms) {
//         alert("Please fill Name, Age, and Symptoms first.");
//         return;
//     }

//     // A. Generate Username
//     const username = name.replace(/\s+/g, '').toLowerCase() + age;

//     // B. Match Doctor based on keywords
//     let matchedDoc = doctors[7]; // Default to General Physician
//     for(let doc of doctors) {
//         if(doc.keywords.some(kw => symptoms.includes(kw))) {
//             matchedDoc = doc;
//             break;
//         }
//     }

//     // C. Store data temporarily
//     assignedPatientData = {
//         username: username,
//         name: name,
//         age: age,
//         phone: document.getElementById('p-phone').value,
//         altPhone: document.getElementById('p-alt-phone').value,
//         guardian: document.getElementById('p-guardian').value,
//         address: document.getElementById('p-address').value,
//         symptoms: symptoms,
//         doctorName: matchedDoc.name,
//         doctorSpec: matchedDoc.spec,
//         cabin: matchedDoc.cabin,
//         date: new Date().toLocaleDateString()
//     };

//     // D. Update Dashboard UI
//     document.getElementById('display-username').innerText = username;
//     document.getElementById('display-doc').innerText = matchedDoc.name;
//     document.getElementById('display-spec').innerText = matchedDoc.spec;
//     document.getElementById('display-cabin').innerText = matchedDoc.cabin;
    
//     // Show both Save and Print buttons immediately!
//     document.getElementById('assignment-box').classList.remove('hidden');
//     document.getElementById('btn-save').classList.remove('hidden');
//     document.getElementById('btn-print').classList.remove('hidden');

//     // E. Populate the hidden Print Template immediately
//     populatePrintTemplate(assignedPatientData);
// }

// // ==========================================
// // 5. SAVE TO FIREBASE
// // ==========================================
// window.savePatientData = async function() {
//     if(!assignedPatientData) {
//         alert("No patient data to save!");
//         return;
//     }

//     try {
//         // Attempt to save to Firebase
//         const docRef = await addDoc(collection(db, "patients"), assignedPatientData);
//         alert("✅ SUCCESS! Patient successfully saved to Firebase database!");
        
//         // Hide save button to prevent clicking it twice
//         document.getElementById('btn-save').classList.add('hidden'); 

//     } catch (e) {
//         console.error("Firebase Error: ", e);
//         // If Firebase fails, show a clear error but let them know printing still works
//         alert("❌ FIREBASE ERROR: Could not save to database. \n\nMake sure you pasted your Firebase Config keys at the top of dashboard.js. \n\n(Note: You can still test the Print Parcha button!)");
//     }
// }

// // ==========================================
// // 6. POPULATE PRINT TEMPLATE (THE PARCHA)
// // ==========================================
// function populatePrintTemplate(data) {
//     document.getElementById('print-username').innerText = data.username;
//     document.getElementById('print-doc-name').innerText = data.doctorName;
//     document.getElementById('print-doc-spec').innerText = data.doctorSpec;
//     document.getElementById('print-doc-cabin').innerText = data.cabin;
    
//     document.getElementById('print-p-name').innerText = data.name;
//     document.getElementById('print-p-address').innerText = data.address;
//     document.getElementById('print-p-age').innerText = data.age;
//     document.getElementById('print-p-date').innerText = data.date;
//     document.getElementById('print-p-symptoms').innerText = data.symptoms;
// }

// // ==========================================
// // 7. LOAD OLD PATIENTS FROM FIREBASE
// // ==========================================
// async function loadOldPatients() {
//     const listEl = document.getElementById('patients-list');
//     listEl.innerHTML = "<tr><td colspan='4'>Loading data...</td></tr>";

//     try {
//         const querySnapshot = await getDocs(collection(db, "patients"));
//         listEl.innerHTML = ""; // clear loading text
        
//         if(querySnapshot.empty) {
//             listEl.innerHTML = "<tr><td colspan='4'>No patients found.</td></tr>";
//             return;
//         }

//         querySnapshot.forEach((doc) => {
//             const data = doc.data();
//             listEl.innerHTML += `
//                 <tr>
//                     <td><b>${data.username}</b></td>
//                     <td>${data.name}</td>
//                     <td>${data.doctorName}</td>
//                     <td>${data.date}</td>
//                 </tr>
//             `;
//         });
//     } catch (error) {
//         console.error("Error fetching data: ", error);
//         listEl.innerHTML = "<tr><td colspan='4' style='color: red;'>Failed to load data. Firebase is not connected properly.</td></tr>";
//     }
// }

// ////////------------------------------------------------------------///////
// ////////------------------------------------------------------------///////
// ////////------------------------------------------------------------///////


// // <---------------------------------------------------------------------->>
// // <---------------------------------------------------------------------->>


////////------------------------------------------------------------///////
////////------------------------------------------------------------///////
////////------------------------------------------------------------///////
// ==========================================
// 4. ASSIGN DOCTOR & GENERATE USERNAME
// ==========================================
// window.generateAssignment = function() {
//     const name = document.getElementById('p-name').value.trim();
//     const age = document.getElementById('p-age').value.trim();
//     const symptoms = document.getElementById('p-symptoms').value.toLowerCase();

//     if(!name || !age || !symptoms) {
//         alert("Please fill Name, Age, and Symptoms first.");
//         return;
//     }

//     // A. Generate Username (e.g., "Rahul Sharma" + 45 -> "rahulsharma45")
//     const username = name.replace(/\s+/g, '').toLowerCase() + age;

//     // B. Match Doctor based on keywords
//     let matchedDoc = doctors[7]; // Default to General Physician
    
//     for(let doc of doctors) {
//         if(doc.keywords.some(kw => symptoms.includes(kw))) {
//             matchedDoc = doc;
//             break;
//         }
//     }

    // C. Store data temporarily
//     assignedPatientData = {
//         username: username,
//         name: name,
//         age: age,
//         phone: document.getElementById('p-phone').value,
//         altPhone: document.getElementById('p-alt-phone').value,
//         guardian: document.getElementById('p-guardian').value,
//         address: document.getElementById('p-address').value,
//         symptoms: symptoms,
//         doctorName: matchedDoc.name,
//         doctorSpec: matchedDoc.spec,
//         cabin: matchedDoc.cabin,
//         date: new Date().toLocaleDateString()
//     };

//     // D. Update UI
//     document.getElementById('display-username').innerText = username;
//     document.getElementById('display-doc').innerText = matchedDoc.name;
//     document.getElementById('display-spec').innerText = matchedDoc.spec;
//     document.getElementById('display-cabin').innerText = matchedDoc.cabin;
    
//     document.getElementById('assignment-box').classList.remove('hidden');
//     document.getElementById('btn-save').classList.remove('hidden');
// }

// // ==========================================
// // 5. SAVE TO FIREBASE & PREPARE PRINT
// // ==========================================
// document.getElementById('regForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     if(!assignedPatientData) return;

//     try {
//         // Add a new document with a generated id to collection "patients"
//         const docRef = await addDoc(collection(db, "patients"), assignedPatientData);
//         alert("Patient successfully saved to database!");
        
//         // Show Print Button
//         document.getElementById('btn-print').classList.remove('hidden');
//         document.getElementById('btn-save').classList.add('hidden'); // Hide save button to prevent double saving
        
//         // Populate the Hidden Print Parcha Template
//         populatePrintTemplate(assignedPatientData);

//     } catch (e) {
//         console.error("Error adding document: ", e);
//         alert("Error saving to database. Check your Firebase config rules.");
//     }
// });

// function populatePrintTemplate(data) {
//     document.getElementById('print-username').innerText = data.username;
//     document.getElementById('print-doc-name').innerText = data.doctorName;
//     document.getElementById('print-doc-spec').innerText = data.doctorSpec;
//     document.getElementById('print-doc-cabin').innerText = data.cabin;
    
//     document.getElementById('print-p-name').innerText = data.name;
//     document.getElementById('print-p-address').innerText = data.address;
//     document.getElementById('print-p-age').innerText = data.age;
//     document.getElementById('print-p-date').innerText = data.date;
//     document.getElementById('print-p-symptoms').innerText = data.symptoms;
// }

// ==========================================
// 6. LOAD OLD PATIENTS FROM FIREBASE
// ==========================================
// async function loadOldPatients() {
//     const listEl = document.getElementById('patients-list');
//     listEl.innerHTML = "<tr><td colspan='4'>Loading data...</td></tr>";

//     try {
//         const querySnapshot = await getDocs(collection(db, "patients"));
//         listEl.innerHTML = ""; // clear loading text
        
//         if(querySnapshot.empty) {
//             listEl.innerHTML = "<tr><td colspan='4'>No patients found.</td></tr>";
//             return;
//         }

//         querySnapshot.forEach((doc) => {
//             const data = doc.data();
//             listEl.innerHTML += `
//                 <tr>
//                     <td><b>${data.username}</b></td>
//                     <td>${data.name}</td>
//                     <td>${data.doctorName}</td>
//                     <td>${data.date}</td>
//                 </tr>
//             `;
//         });
//     } catch (error) {
//         console.error("Error fetching data: ", error);
//         listEl.innerHTML = "<tr><td colspan='4'>Failed to load data. Did you set up Firebase?</td></tr>";
//     }
// }

////////------------------------------------------------------------///////
////////------------------------------------------------------------///////
////////------------------------------------------------------------///////

// // <---------------------------------------------------------------------->>
// // <---------------------------------------------------------------------->>
