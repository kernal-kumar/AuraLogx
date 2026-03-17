lucide.createIcons();

let map;
const GEMINI_API_KEY = 'AIzaSyAsiOhAE7Y4QXyM-RLeXU1kzfQxF1OltEM';
// Ensure there are no extra spaces at the beginning or end of the URL
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyAsiOhAE7Y4QXyM-RLeXU1kzfQxF1OltEM}`;

// 1. Initialize Map
async function initMap() {
    const portPos = { lat: 33.7701, lng: -118.1937 };
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: portPos,
        zoom: 15,
        tilt: 45,
        heading: 30,
        mapId: "f0e75a761e386001", 
        disableDefaultUI: true,
        gestureHandling: "greedy"
    });

    addTruck("Alpha-1", { lat: 33.775, lng: -118.190 });
    addTruck("Beta-2", { lat: 33.765, lng: -118.200 });
}

// 2. Add 3D Trucks
async function addTruck(name, position) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const markerElement = document.createElement('div');
    markerElement.className = 'truck-marker';
    markerElement.innerHTML = `<span class="marker-label">${name}</span>`;

    const marker = new AdvancedMarkerElement({
        map,
        position: position,
        content: markerElement,
        title: name,
    });

    setInterval(() => {
        const newPos = {
            lat: marker.position.lat + (Math.random() - 0.5) * 0.0005,
            lng: marker.position.lng + (Math.random() - 0.5) * 0.0005
        };
        marker.position = newPos;
    }, 3000);
}

// 3. AI Assistant Logic
async function askGemini(userPrompt) {
    const systemContext = "You are AuraLogix AI, a predictive logistics assistant. Be concise, professional, and focus on fleet efficiency.";
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemContext} User asks: ${userPrompt}` }] }]
        })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// 4. Chat Interactivity
const chatInput = document.getElementById("chat-input");
const chatHistory = document.getElementById("chat-history");

chatInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        const userText = chatInput.value;
        chatInput.value = "";

        // Show User Message
        chatHistory.innerHTML += `<div class="text-right ml-6 mb-2"><p class="bg-blue-600 p-2 rounded-lg inline-block text-white">${userText}</p></div>`;
        
        // Show Loading
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "bg-slate-800/50 p-3 rounded-xl border border-slate-700 animate-pulse";
        loadingDiv.innerHTML = "<b>AI:</b> Thinking...";
        chatHistory.appendChild(loadingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            const aiResponse = await askGemini(userText);
            loadingDiv.classList.remove("animate-pulse");
            loadingDiv.innerHTML = `<b>AI:</b> ${aiResponse}`;
            
            // Trigger Map Anomaly if AI mentions "reroute" or "bottleneck"
            if(aiResponse.toLowerCase().includes("reroute") || aiResponse.toLowerCase().includes("bottleneck")) {
                simulateAIAnomaly();
            }
        } catch (err) {
            loadingDiv.innerHTML = "<b>Error:</b> API limit or connection issue.";
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
});

function simulateAIAnomaly() {
    map.panTo({ lat: 33.775, lng: -118.190 });
    map.setZoom(17);
}
// Function for the "Simulate Bottleneck" Button
function triggerPortCongestion() {
    // 1. Zoom the map to the truck in trouble
    map.setZoom(17);
    map.panTo({ lat: 33.775, lng: -118.190 });

    // 2. Add an AI Message
    const chat = document.getElementById("chat-history");
    chat.innerHTML += `
        <div class="bg-red-500/10 p-3 rounded-xl border border-red-500/50 animate-bounce">
            <b>CRITICAL ALERT:</b> Anomaly detected at Terminal 4. Congestion factor: 85%. 
            Calculating alternate route for Alpha-1...
        </div>`;
    chat.scrollTop = chatHistory.scrollHeight;
}

// Function for the "Optimize Fuel" Button
function triggerFuelOptimization() {
    const chat = document.getElementById("chat-history");
    chat.innerHTML += `
        <div class="bg-green-500/10 p-3 rounded-xl border border-green-500/50">
            <b>AI INSIGHT:</b> Elevation-aware routing active. 
            Alpha-1 switched to 'GreenPath'. Estimated fuel saving: <b>15.4%</b>.
        </div>`;
    
    // Pulse the Stat Cards to show they are updating
    const stats = document.querySelectorAll('.glass h2');
    stats[1].classList.add('animate-pulse', 'text-green-400');
    stats[1].innerText = "24.8%"; // Increase the fuel savings live!
}