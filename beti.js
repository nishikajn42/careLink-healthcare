// beti.js - The "Digital Beti" Logic

// Aawaz nikalne ka function (Text to Speech)
function speakBeti(text, callback) {
    const bubble = document.getElementById('beti-bubble');
    bubble.style.display = 'block';
    bubble.innerText = text;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi/Hinglish
    utterance.rate = 0.9;     // Dadaji ke liye thoda aaram se

    utterance.onend = function() {
        if(callback) callback(); // Bolne ke baad agar kuch sunna hai
    };
    synth.speak(utterance);
}

// Sunne ka function (Speech to Text)
function listenDadaji(onResultCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';

    document.getElementById('beti-bubble').innerText = "🎤 Sun rahi hu dadaji, boliye...";
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Dadaji ne bola:", transcript);
        onResultCallback(transcript);
    };

    recognition.onerror = () => speakBeti("Maaf karna, main sun nahi payi. Button dobara dabayein.");
    recognition.start();
}

// Element ko chamkane (Highlight) karne ka function
function highlightAndScroll(elementId) {
    // Purane highlight hatao
    document.querySelectorAll('.beti-highlight').forEach(el => el.classList.remove('beti-highlight'));
    
    const el = document.getElementById(elementId);
    if(el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('beti-highlight');
    }
}

// MAIN LOGIC: Button dabane par kya hoga
function activateBeti() {
    const currentPage = window.location.pathname;

    // --- LOGIC FOR HOME PAGE (index.html) ---
    if (currentPage.includes('index.html') || currentPage === '/') {
        speakBeti("Namaste! Aapko site ghoomni hai, ya phir login karna hai?", () => {
            listenDadaji((kaha) => {
                if (kaha.includes("login") || kaha.includes("patient")) {
                    speakBeti("Theek hai, main upar login button ko chamka rahi hu. Uspar click kijiye.");
                    highlightAndScroll("login-btn"); // Aapke HTML mein login button ki id="login-btn" honi chahiye
                } else {
                    speakBeti("Theek hai, aap aaram se site dekhiye.");
                }
            });
        });
    }

    // --- LOGIC FOR LOGIN FORM (index.html par hi agar login form hai) ---
    // Note: Agar unhone login click kar diya, toh form dikhega. Usme input ki id="patient-id-input" honi chahiye.
    else if (currentPage.includes('login.html') /* Ya jo bhi aapka login modal ho */) {
         speakBeti("Apne parche par right side mein dekhiye, aapka ID likha hai. Mujhe bol kar bataiye ya yahan likh dijiye.", () => {
            highlightAndScroll("patient-id-input");
            listenDadaji((id) => {
                document.getElementById("patient-id-input").value = id.replace(/\s/g, ''); // Space hata kar ID likh degi
                speakBeti("Maine aapka ID likh diya hai, ab submit daba dijiye!");
            });
         });
    }

    // --- LOGIC FOR PATIENT DASHBOARD (patient.html) ---
    else if (currentPage.includes('patient.html') || currentPage.includes('paitent.html')) {
        speakBeti("Dadaji, aapka dashboard khul gaya hai. Batayein aapko kya dekhna hai? Apni dawai, ya doctor ka number?", () => {
            listenDadaji((kaha) => {
                if (kaha.includes("dawa") || kaha.includes("dawai") || kaha.includes("medicine")) {
                    speakBeti("Yeh lijiye, main aapke dawai wale parche ko chamka rahi hu.");
                    highlightAndScroll("dawa-section"); // HTML mein dawa section ki id="dawa-section" honi chahiye
                } 
                else if (kaha.includes("doctor") || kaha.includes("number")) {
                    speakBeti("Yeh raha doctor sahab ka number.");
                    highlightAndScroll("doctor-section"); // id="doctor-section"
                }
            });
        });
    }
}