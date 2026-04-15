// ==========================================
// beti.js - The Unified Global Assistant
// ==========================================

window.betiLang = 'en'; // Default language

// 1. Language Toggle Logic
window.toggleLang = function() {
    window.betiLang = window.betiLang === 'en' ? 'hi' : 'en';
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.innerText = window.betiLang === 'en' ? '🌐 EN' : '🌐 HI';

    if (window.betiLang === 'en') {
        window.speak("Language switched to English.", "Language switched to English.");
    } else {
        window.speak("Bhasha Hindi mein badal di gayi hai.", "Bhasha Hindi mein badal di gayi hai.");
    }
};

// 2. Dual-Language Speaking Logic
// Pass two strings. If she's in English mode, she reads the first. Hindi, the second.
window.speak = function(enText, hiText) {
    window.speechSynthesis.cancel(); // Stop anything currently speaking
    
    // If a Hindi translation is provided and we are in Hindi mode, use it. 
    // Otherwise, use the enText (useful for Gemini responses which return a single string).
    const textToSpeak = (window.betiLang === 'hi' && hiText) ? hiText : enText;
    
    const bubble = document.getElementById('beti-bubble');
    if(bubble) {
        bubble.innerHTML = `<i class="fa-solid fa-robot"></i> ` + textToSpeak;
        bubble.style.display = "block";
        setTimeout(() => bubble.style.display = "none", 8000); // Auto hide bubble after 8s
    }

    const speech = new SpeechSynthesisUtterance(textToSpeak);
    speech.lang = window.betiLang === 'hi' ? 'hi-IN' : 'en-IN';
    speech.volume = 1;     
    speech.rate = window.betiLang === 'hi' ? 0.9 : 1; // Slightly slower for Hindi clarity      
    
    window.speechSynthesis.speak(speech);
};

// 3. Microphone Logic
window.activateBeti = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Browser does not support voice recognition. Please use Google Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    // Dynamically set mic to listen for English or Hindi based on toggle!
    recognition.lang = window.betiLang === 'hi' ? 'hi-IN' : 'en-IN'; 
    recognition.interimResults = false;

    const bubble = document.getElementById('beti-bubble');
    
    recognition.onstart = function() {
        console.log("🎤 Mic on: Listening...");
        if(bubble) {
            bubble.style.display = "block";
            bubble.innerText = window.betiLang === 'hi' ? "Boliye, main sun rahi hoon..." : "Listening...";
        }
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log("🗣️ User said:", transcript);
        if(bubble) bubble.innerText = window.betiLang === 'hi' ? "Soch rahi hoon..." : "Thinking...";
        
        askDigitalBeti(transcript);
    };

    recognition.onerror = function(event) {
        console.error("🔇 Mic error:", event.error);
        if(bubble) bubble.innerText = window.betiLang === 'hi' ? "Awaaz nahi aayi, fir dabayein." : "Didn't catch that, click again.";
    };

    recognition.start();
};

// 4. Send to Gemini Node.js Backend
async function askDigitalBeti(userTranscript) {
    const bubble = document.getElementById('beti-bubble');
    try {
        const response = await fetch('http://localhost:3000/api/ask-beti', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send the language so Gemini knows how to reply!
            body: JSON.stringify({ message: userTranscript, language: window.betiLang })
        });

        const data = await response.json();
        console.log("🤖 Beti replied:", data.reply);

        // Speak the Gemini response
        window.speak(data.reply); 

        // Optional UI highlighting
        if (data.highlight_id) {
            const element = document.getElementById(data.highlight_id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('beti-highlight');
                setTimeout(() => element.classList.remove('beti-highlight'), 4000);
            }
        }
    } catch (error) {
        console.error("❌ Backend Error:", error);
        window.speak("Server is not responding.", "Server se connect nahi ho pa raha hai.");
    }
}