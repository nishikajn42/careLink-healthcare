// ==========================================
// beti.js (Frontend) - Complete Fixed Version
// ==========================================

// 1. Microphone setup to listen to the user (Yeh missing tha!)
function activateBeti() {
    // Browser ka speech recognition engine start karein
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Maaf kijiye, aapka browser voice support nahi karta. Chrome use karein.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi aur English dono samajh legi
    recognition.interimResults = false;

    const bubble = document.getElementById('beti-bubble');
    
    // Jab mic chalu ho
    recognition.onstart = function() {
        console.log("🎤 Mic on: Listening...");
        if(bubble) bubble.innerText = "Boliye, main sun rahi hoon...";
    };

    // Jab user bolna band kare aur text mil jaye
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log("🗣️ Aapne kaha:", transcript);
        if(bubble) bubble.innerText = "Soch rahi hoon...";
        
        // Jo bola gaya hai, use backend/Gemini ko bhejein
        askDigitalBeti(transcript);
    };

    // Agar koi error aaye
    recognition.onerror = function(event) {
        console.error("🔇 Mic error:", event.error);
        if(bubble) bubble.innerText = "Awaaz nahi aayi, fir se button dabayein.";
    };

    // Sunna shuru karein
    recognition.start();
}

// 2. Sending data to your backend
async function askDigitalBeti(userTranscript) {
    const bubble = document.getElementById('beti-bubble');
    try {
        const response = await fetch('http://localhost:3000/api/ask-beti', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userTranscript })
        });

        const data = await response.json();
        
        console.log("🤖 Beti replied:", data.reply);
        console.log("🎯 Highlight Element:", data.highlight_id);

        // UI Bubble update karein
        if(bubble) bubble.innerText = data.reply; 

        // 1. Speak the reply
        speak(data.reply); 

        // 2. Highlight the UI element for dadaji/dadiji
        if (data.highlight_id) {
            highlightAndScroll(data.highlight_id);
        }

    } catch (error) {
        console.error("❌ Error communicating with backend:", error);
        if(bubble) bubble.innerText = "Server se connect nahi ho pa raha hai.";
    }
}

// 3. Speaking the text
function speak(text) {
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'hi-IN'; 
    speech.volume = 1;     
    speech.rate = 1;       
    speech.pitch = 1;      

    speech.onstart = () => console.log("🔊 Beti bolna shuru kar rahi hai...");
    speech.onerror = (e) => console.error("🔇 Speech error aayi:", e.error);

    window.speechSynthesis.speak(speech);
}

// 4. Highlighting the button/section
function highlightAndScroll(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        // Us element tak scroll karein
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Purane highlights hata dein
        document.querySelectorAll('.beti-highlight').forEach(el => el.classList.remove('beti-highlight'));
        
        // Naya highlight lagayein
        element.classList.add('beti-highlight');

        // Optional: 4 second baad highlight apne aap hata dein taaki UI clean rahe
        setTimeout(() => {
            element.classList.remove('beti-highlight');
        }, 4000);
    } else {
        console.warn(`Element with ID '${elementId}' not found on the page.`);
    }
}