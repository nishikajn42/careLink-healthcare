import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make function global so the HTML form can trigger it
window.loginPatient = async function(event) {
    event.preventDefault(); // Form ko refresh hone se roko
    
    const patientId = document.getElementById('patientId').value.trim();
    const otp = document.getElementById('otp').value.trim();
    const errorText = document.getElementById('patient-login-error');
    const loginBtn = document.getElementById('patient-login-btn');

    // Reset error text
    errorText.style.display = 'none';
    errorText.innerText = '';

    // Step 1: Check Hardcoded OTP
    if (otp !== "123456") {
        showError("Invalid OTP! Please try again.");
        return;
    }

    loginBtn.innerText = "Checking Details...";
    loginBtn.style.backgroundColor = "#666";
    loginBtn.disabled = true;


    try {
        // Step 2: Check in Firebase if Patient ID exists
        console.log("Searching for Patient ID:", patientId); // Debug line
        const q = query(collection(db, "patients"), where("username", "==", patientId));
        const querySnapshot = await getDocs(q);

        console.log("Snapshot empty?", querySnapshot.empty); // Agar ye TRUE aaya matlab ID galat hai

        if (!querySnapshot.empty) {
            // Success! Patient ID exists
            localStorage.setItem("activeUser", patientId);
            localStorage.setItem("activeRole", "Patient"); 
            
            // Redirect to Patient Dashboard
            window.location.href = "patient_dashboard.html";
        } else {
            // Patient ID not found
            showError("Patient ID not found. Please check your ID.");
            resetButton(loginBtn);
        }
    } catch (error) {
        console.error("Error during login:", error);
        showError("Server error. Please check your internet connection.");
        resetButton(loginBtn);
    }
}

function showError(message) {
    const errorText = document.getElementById('patient-login-error');
    errorText.innerText = message;
    errorText.style.display = 'block';
}

function resetButton(btn) {
    btn.innerText = "Login to Dashboard";
    btn.style.backgroundColor = "#008b74";
    btn.disabled = false;
}