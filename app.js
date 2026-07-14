// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker activé."));
}

// LOGIQUE DE NAVIGATION ENTRE LES ONGLETS
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Retirer la classe active de tous les boutons et ajouter au bouton cliqué
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Masquer toutes les pages et afficher la bonne page
        const targetPage = this.getAttribute('data-target');
        document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');
    });
});

// CONFIGURATION DES GRAPHIQUES (CHART.JS)
Chart.defaults.color = '#888';
Chart.defaults.font.family = "'Segoe UI', sans-serif";

const ctxMacros = document.getElementById('macrosChart').getContext('2d');
new Chart(ctxMacros, {
    type: 'doughnut',
    data: {
        labels: ['Protéines', 'Glucides', 'Lipides'],
        datasets: [{
            data: [120, 180, 50],
            backgroundColor: ['#00d2ff', '#3a7bd5', '#9b59b6'],
            borderWidth: 0
        }]
    },
    options: { 
        cutout: '75%', 
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    }
});

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
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    }
});

// SUIVI DE L'EAU
let waterLevel = 60;
function addWater() {
    if (waterLevel < 100) {
        waterLevel += 8;
        if(waterLevel > 100) waterLevel = 100;
        document.getElementById('bottle-fill').style.height = waterLevel + '%';
        let remaining = (3 - (waterLevel * 3 / 100)).toFixed(1);
        document.getElementById('water-text').innerText = Math.max(remaining, 0) + 'L';
    }
}

// COACH IA
function sendMessage() {
    const input = document.getElementById('ai-input');
    const msg = input.value.trim();
    if (!msg) return;

    const chat = document.getElementById('chat-container');
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = msg;
    chat.appendChild(userDiv);
    
    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'message ai-message';
        const lowerMsg = msg.toLowerCase();
        
        if (lowerMsg.includes('dos')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Alerte prise en compte. Remplace le squat par du leg press aujourd'hui. Repose la zone lombaire.<br><br>Garde le cap du navire, on adapte !";
        } else if (lowerMsg.includes('bras')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Douleur au bras notée. Baisse la charge de 20% sur les tirages. La santé avant tout !";
        } else {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Reçu. Reste concentré sur tes KPIs : 3L d'eau, 180g de protéines.";
        }
        chat.appendChild(aiDiv);
        chat.scrollTop = chat.scrollHeight;
    }, 900);
}
