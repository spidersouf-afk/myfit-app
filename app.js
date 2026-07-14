// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker activé."));
}

// LOGIQUE DE NAVIGATION
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        const targetPage = this.getAttribute('data-target');
        document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');
    });
});

// BASE DE DONNÉES LOCALE (Lundi, Mardi, Mercredi)
const mealDatabase = {
    lundi: [
        { id: 'l1', type: 'Petit Déjeuner', desc: '3 œufs bio, 60g flocons d\'avoine, 1 banane, café', kcal: 550, eaten: false },
        { id: 'l2', type: 'Déjeuner', desc: '200g filet de poulet, 100g riz basmati, brocolis, huile d\'olive', kcal: 650, eaten: false },
        { id: 'l3', type: 'Collation après Sport', desc: 'Whey isolat, 1 pomme, 30g d\'amandes', kcal: 350, eaten: false },
        { id: 'l4', type: 'Dîner', desc: '150g pavé de saumon grillé, 150g patates douces, haricots verts', kcal: 600, eaten: false }
    ],
    mardi: [
        { id: 'm1', type: 'Petit Déjeuner', desc: '4 blancs d\'œufs, 2 tranches pain complet, beurre de cacahuète, thé', kcal: 500, eaten: false },
        { id: 'm2', type: 'Déjeuner', desc: '180g steak haché 5%, 250g purée de pommes de terre, épinards', kcal: 700, eaten: false },
        { id: 'm3', type: 'Collation après Sport', desc: 'Whey isolat, 60g flocons d\'avoine mélangés', kcal: 380, eaten: false },
        { id: 'm4', type: 'Dîner', desc: '200g filet de colin, 100g quinoa, courgettes sautées à l\'ail', kcal: 520, eaten: false }
    ],
    mercredi: [
        { id: 'me1', type: 'Petit Déjeuner', desc: 'Bowlcake avoine (60g d\'avoine, 1 œuf, lait d\'amande, cacao)', kcal: 520, eaten: false },
        { id: 'me2', type: 'Déjeuner', desc: '200g escalope de dinde, 120g pâtes complètes, sauce tomate', kcal: 680, eaten: false },
        { id: 'me3', type: 'Collation après Sport', desc: '300g Fromage blanc 0%, miel, poignée de baies sauvages', kcal: 300, eaten: false },
        { id: 'me4', type: 'Dîner', desc: 'Salade géante (Thon au naturel, 1 œuf dur, avocat, salade)', kcal: 550, eaten: false }
    ]
};

let activeDay = 'lundi';
let caloriesChart = null;

// SYSTÈME NUTRITION DYNAMIQUE
function loadNutritionDay(day) {
    activeDay = day;
    document.querySelectorAll('.btn-day').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const container = document.getElementById('meals-container');
    container.innerHTML = '';

    mealDatabase[day].forEach(meal => {
        const item = document.createElement('div');
        item.className = 'meal-item';
        item.innerHTML = `
            <div class="meal-info">
                <h4>${meal.type}</h4>
                <p>${meal.desc}</p>
                <span class="text-blue font-weight-bold">${meal.kcal} Kcal</span>
            </div>
            <div class="checkbox-container">
                <input type="checkbox" id="chk-${meal.id}" ${meal.eaten ? 'checked' : ''} onchange="toggleMeal('${meal.id}')">
            </div>
        `;
        container.appendChild(item);
    });
    updateCalories();
}

function toggleMeal(mealId) {
    const meal = mealDatabase[activeDay].find(m => m.id === mealId);
    if (meal) {
        meal.eaten = !meal.eaten;
        updateCalories();
    }
}

function updateCalories() {
    let totalEaten = 0;
    // Calcul de toutes les calories mangées sur le jour actif
    mealDatabase[activeDay].forEach(m => {
        if (m.eaten) totalEaten += m.kcal;
    });

    document.getElementById('consumed-calories').innerText = totalEaten;
    
    // Mettre à jour le diagramme circulaire de l'accueil
    if (caloriesChart) {
        caloriesChart.data.datasets[0].data = [totalEaten, Math.max(0, 2500 - totalEaten)];
        caloriesChart.update();
    }
}

// INITIALISATION DU DIAGRAMME CIRCULAIRE (ACCUEIL)
const ctxMacros = document.getElementById('macrosChart').getContext('2d');
caloriesChart = new Chart(ctxMacros, {
    type: 'doughnut',
    data: {
        labels: ['Consommé', 'Restant'],
        datasets: [{
            data: [0, 2500],
            backgroundColor: ['#00d2ff', '#1c1c1e'],
            borderWidth: 0,
            hoverOffset: 0
        }]
    },
    options: { 
        cutout: '80%', 
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
        animation: { duration: 600 }
    }
});

// SYSTÈME DE SÉANCES ET PLANIFICATION
function selectWorkout(workoutId) {
    const banner = document.getElementById('workout-suggestion');
    if (!workoutId) {
        banner.innerHTML = `<i class="fas fa-bullseye text-blue"></i> Sélectionne une séance pour voir ta prochaine recommandation.`;
        return;
    }

    let current = "";
    let next = "";
    let progress = 62;

    if (workoutId === "1") {
        current = "Jour 1 (Poitrine/Triceps/Abdos)";
        next = "Jour 2 : Dos / Biceps";
        progress = 68;
    } else if (workoutId === "2") {
        current = "Jour 2 (Dos/Biceps)";
        next = "Jour 3 : Jambes / Épaules";
        progress = 75;
    } else if (workoutId === "3") {
        current = "Jour 3 (Jambes/Épaules)";
        next = "Jour 1 : Poitrine / Triceps / Abdos";
        progress = 85;
    }

    banner.innerHTML = `
        <strong><i class="fas fa-check-circle text-success"></i> Séance validée !</strong><br>
        Aujourd'hui tu as fait le <strong>${current}</strong>.<br>
        🎯 <strong>Prochaine séance recommandée pour ton prochain round : <span class="text-blue">${next}</span></strong>.
    `;

    // Mettre à jour l'indicateur de l'écran d'accueil
    document.getElementById('global-progress-bar').style.width = progress + '%';
    document.getElementById('global-progress-text').innerText = progress + '%';
}

// SUIVI TEMPS RÉEL DE L'ENTRAÎNEMENT (COACH LIVE)
const workoutsData = {
    1: [
        { name: "Développé Couché", sets: 4, reps: 10, targetWeight: "80kg", desc: "Sers tes omoplates, pousse de façon explosive." },
        { name: "Triceps Poulie Haute", sets: 3, reps: 12, targetWeight: "35kg", desc: "Garde tes coudes bien fixes le long de ton buste." },
        { name: "Crunchs Abdos", sets: 3, reps: 15, targetWeight: "Poids de corps", desc: "Contracte volontairement en soufflant l'air." }
    ]
};

let currentLiveExerciseIndex = 0;
let currentLiveSet = 1;
let timerInterval = null;

function startLiveWorkout() {
    document.getElementById('coach-start-screen').style.display = 'none';
    document.getElementById('coach-live-screen').style.display = 'block';
    
    currentLiveExerciseIndex = 0;
    currentLiveSet = 1;
    loadLiveExercise();
}

function loadLiveExercise() {
    const exercise = workoutsData[1][currentLiveExerciseIndex];
    document.getElementById('live-exercise-name').innerText = exercise.name;
    document.getElementById('live-exercise-desc').innerText = exercise.desc;
    
    // Générer la structure des séries
    const container = document.getElementById('live-sets-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= exercise.sets; i++) {
        const row = document.createElement('div');
        row.className = `set-row ${i < currentLiveSet ? 'done' : ''}`;
        row.id = `set-row-${i}`;
        row.innerHTML = `
            <span>Série ${i}</span>
            <span class="text-blue">${exercise.reps} Reps à ${exercise.targetWeight}</span>
            <span>${i < currentLiveSet ? '✓ Prêt' : (i === currentLiveSet ? '⚡ En cours' : '💤 En attente')}</span>
        `;
        container.appendChild(row);
    }

    document.getElementById('btn-validate-set').style.display = 'inline-block';
    document.getElementById('btn-next-exercise').style.display = 'none';
    document.getElementById('timer-box').style.display = 'none';
}

function validateSet() {
    const exercise = workoutsData[1][currentLiveExerciseIndex];
    const currentRow = document.getElementById(`set-row-${currentLiveSet}`);
    if (currentRow) {
        currentRow.classList.add('done');
        currentRow.children[2].innerText = "✓ Validé";
    }

    if (currentLiveSet < exercise.sets) {
        currentLiveSet++;
        startRestTimer(60); // 60 secondes de repos entre les séries
    } else {
        // Fin de l'exercice
        document.getElementById('btn-validate-set').style.display = 'none';
        document.getElementById('btn-next-exercise').style.display = 'inline-block';
    }
}

function startRestTimer(seconds) {
    const timerBox = document.getElementById('timer-box');
    const timerDisplay = document.getElementById('timer-display');
    timerBox.style.display = 'block';
    
    let timeLeft = seconds;
    timerDisplay.innerText = timeLeft + "s";
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft + "s";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerBox.style.display = 'none';
            loadLiveExercise();
        }
    }, 1000);
}

function nextExercise() {
    clearInterval(timerInterval);
    if (currentLiveExerciseIndex < workoutsData[1].length - 1) {
        currentLiveExerciseIndex++;
        currentLiveSet = 1;
        loadLiveExercise();
    } else {
        // Entraînement fini !
        alert("Félicitations Soufiane ! Entraînement terminé. KPIs validés pour aujourd'hui ! 🔥");
        document.getElementById('coach-start-screen').style.display = 'block';
        document.getElementById('coach-live-screen').style.display = 'none';
    }
}

// SUIVI DE L'EAU (ACCUEIL)
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

// CHAT DU COACH IA
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
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Alerte prise en compte. Évite le soulevé de terre lourd ou le squat aujourd'hui. Remplace-les par de la presse ou des tirages horizontaux légers.";
        } else if (lowerMsg.includes('bras')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Douleur au bras détectée. Réduis la charge sur les curl biceps de 30% et concentre-toi sur une exécution lente.";
        } else {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Reçu. Prépare ton eau et ta créatine. Le round du jour va commencer !";
        }
        chat.appendChild(aiDiv);
        chat.scrollTop = chat.scrollHeight;
    }, 900);
}

// Initialisations automatiques
loadNutritionDay('lundi');
