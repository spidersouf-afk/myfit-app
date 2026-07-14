// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker activé pour le mode hors-ligne."));
}

// Configuration globale Chart.js pour le thème sombre
Chart.defaults.color = '#888';
Chart.defaults.font.family = "'Segoe UI', sans-serif";

// Diagramme Camembert (Macros)
const ctxMacros = document.getElementById('macrosChart').getContext('2d');
new Chart(ctxMacros, {
    type: 'doughnut',
    data: {
        labels: ['Protéines', 'Glucides', 'Lipides'],
        datasets: [{
            data: [120, 180, 50],
            backgroundColor: ['#00d2ff', '#3a7bd5', '#9b59b6'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: { 
        cutout: '75%', 
        plugins: { 
            legend: { display: false } 
        },
        maintainAspectRatio: false
    }
});

// Diagramme Courbe (Évolution Séances & Force)
const ctxKpi = document.getElementById('kpiChart').getContext('2d');
new Chart(ctxKpi, {
    type: 'line',
    data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
            label: 'Volume Quotidien',
            data: [25.1, 27.2, 71.2, 39.8, 45.0, 90.9, 0],
            borderColor: '#00d2ff',
            backgroundColor: 'rgba(0, 210, 255, 0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#00d2ff',
            pointRadius: 4,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
            x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
    }
});

// Suivi de l'eau
let waterLevel = 60; // Démarrage à 60%
function addWater() {
    if (waterLevel < 100) {
        waterLevel += 8; // Ajoute environ 250ml sur 3L
        if(waterLevel > 100) waterLevel = 100;
        document.getElementById('bottle-fill').style.height = waterLevel + '%';
        let remaining = (3 - (waterLevel * 3 / 100)).toFixed(1);
        document.getElementById('water-text').innerText = Math.max(remaining, 0) + 'L';
    }
}

// Logique Coach IA
function sendMessage() {
    const input = document.getElementById('ai-input');
    const msg = input.value.trim();
    if (!msg) return;

    const chat = document.getElementById('chat-container');
    
    // Message Utilisateur
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = msg;
    chat.appendChild(userDiv);
    
    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // Simulation Réponse IA adaptée
    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'message ai-message';
        
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('dos')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Alerte prise en compte. Remplace le squat par du leg press aujourd'hui. Repose la zone lombaire et fais des étirements spécifiques.<br><br>Quand le doute ou la douleur veut entrer, rappelle-toi de ceux qui sont à tes côtés. Garde le cap du navire, on adapte la séance !";
        } else if (lowerMsg.includes('bras')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Douleur au bras notée. Baisse la charge de 20% sur les mouvements de tirage. Ta santé à long terme prime sur le volume du jour.";
        } else {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Reçu. Reste concentré sur tes KPIs du jour : 3L d'eau, 180g de protéines. L'arène t'attend.";
        }
        
        chat.appendChild(aiDiv);
        chat.scrollTop = chat.scrollHeight;
    }, 900);
}

// Init animation sur le bouton entrée du clavier
document.getElementById("ai-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
