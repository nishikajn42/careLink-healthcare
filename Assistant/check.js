require('dotenv').config();

async function checkModels() {
    console.log("Google se aapke available models ki list nikal rahe hain...\n");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await res.json();
        
        if(data.error) {
            console.log("❌ API Key mein kuch problem hai:", data.error.message);
            return;
        }

        console.log("✅ Aapki API Key IN models ko support karti hai (Generate Content ke liye):\n");
        
        data.models.forEach(m => {
            // Sirf wahi models dikhayenge jo hamare kaam ke hain
            if(m.supportedGenerationMethods.includes("generateContent")) {
                console.log("👉 " + m.name.replace('models/', '')); 
            }
        });
        
        console.log("\n💡 INSTRUCTION: Upar di gayi list mein se koi ek naam copy karein aur apne server.js mein model ki jagah daal dein!");

    } catch (err) {
        console.log("Network error:", err.message);
    }
}
checkModels();