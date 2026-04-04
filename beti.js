// beti.js - Real AI "Digital Beti" (Powered by Gemini)

// 🛑 HACKATHON KE LIYE APNI API KEY YAHAN DAALEIN 🛑
const GEMINI_API_KEY = "AIzaSyDCgGjWxYOAb1gki2WJFaXAOr5ZQzhMrVU"; 

// 1. Aawaz nikalne ka function (Beti bolegi)
function speakBeti(text) {
    const bubble = document.getElementById('beti-bubble');
    bubble.style.display = 'block';
    bubble.innerText = text; // Screen par text dikhega

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi/Hinglish aawaz
    utterance.rate = 0.9;     // Thoda aaram se bolegi
    synth.speak(utterance);
}

// 2. Element ko chamkane (Highlight) karne ka function
function highlightAndScroll(elementId) {
    // Purane highlight hatao
    document.querySelectorAll('.beti-highlight').forEach(el => el.classList.remove('beti-highlight'));
    
    if (elementId && elementId !== "null" && elementId !== "") {
        const el = document.getElementById(elementId);
        if(el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('beti-highlight');
        }
    }
}

// 3. Asli AI Dimaag (Gemini API Call)
async function fetchAIResponse(userSaid) {
    const bubble = document.getElementById('beti-bubble');
    bubble.style.display = 'block';
    bubble.innerText = "Soch rahi hu dadaji..."; // Jab tak AI soch raha hai

    // Website ka current state AI ko batana
    const currentPage = window.location.pathname;
    let uiContext = "User hospital ki CareLink website par hai.";
    
    // Page ke hisaab se context badlo (Isme apne IDs daal lena)
    if (currentPage.includes('index.html') || currentPage === '/') {
        uiContext += " Abhi Home Page par hain. Login karne ke liye 'login-btn' ID hai.";
    } else if (currentPage.includes('patient.html')) {
        uiContext += " Abhi Patient Dashboard par hain. Dawai ke liye 'dawa-section' ID hai, Doctor ke liye 'doctor-section' ID hai.";
    }

    const systemPrompt = `
        Aap ek pyari aur madadgaar 'Digital Beti' hain jo bujurg (elderly) patients ko CareLink website chalana sikhati hai.
        Aapko bahut izzat se, jaise ek poti apne dadaji/dadiji se baat karti hai, waise Hinglish mein baat karni hai.
        Current Page Context: ${uiContext}
        
        Niyam (Rules):
        1. Agar user kuch aam baat kare (jaise "Kaise ho?"), toh natural jawab do.
        2. Agar user site ke baare mein puche (jaise "Login kahan hai?" ya "Dawai kahan hai?"), toh unhe batao aur us ID ka naam json mein do taaki wo highlight ho sake.
        
        Jawab STRICTLY ek JSON format mein hona chahiye jisme 2 keys hon:
        {
            "reply": "Aapki boli hui line Hinglish mein",
            "highlight_id": "HTML tag ki ID (jaise 'login-btn') ya fir null agar kuch highlight nahi karna"
        }
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\nDadaji ne kaha: " + userSaid }] }]
            })
        });

        const data = await response.json();
        
        // Gemini ke text se JSON nikalna
        let aiTextResponse = data.candidates[0].content.parts[0].text;
        aiTextResponse = aiTextResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const aiJson = JSON.parse(aiTextResponse);

        // Highlight karna aur bolna
        highlightAndScroll(aiJson.highlight_id);
        speakBeti(aiJson.reply);

    } catch (e) {
        console.error("Error:", e);
        speakBeti("Maaf karna dadaji, mera internet connection thoda dhama chal raha hai.");
    }
}

// 4. MAIN LOGIC: Button dabane par sunna shuru karna
function activateBeti() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi sunne ke liye

    const bubble = document.getElementById('beti-bubble');
    bubble.style.display = 'block';
    bubble.innerText = "🎤 Boliye, main sun rahi hu...";
    
    // Main button ko thoda daba hua dikhane ke liye
    document.getElementById("beti-btn").style.transform = "scale(0.9)";

    recognition.onresult = (event) => {
        document.getElementById("beti-btn").style.transform = "scale(1)";
        const transcript = event.results[0][0].transcript;
        console.log("Patient asked:", transcript);
        
        // Aawaz text mein badal gayi, ab isko AI (Gemini) ko bhejo
        fetchAIResponse(transcript);
    };

    recognition.onerror = () => {
        document.getElementById("beti-btn").style.transform = "scale(1)";
        speakBeti("Main theek se sun nahi payi, kripya dobara button dabakar boliye.");
    };

    recognition.start();
}