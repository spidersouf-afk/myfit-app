// SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker activé."));
}

// INTERCEPTOR DE PAGES
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

// BASE DE DONNÉES DE NUTRITION À CHOIX MULTIPLES
const nutritionDatabase = {
    breakfast: {
        muscle: { name: "Bol Flocons d'Avoine & Œufs", desc: "60g d'avoine, 1 banane, 4 blancs d'œufs + 2 jaunes entiers. Riche en sucres lents et acides aminés essentiels.", kcal: 560, p: 38, g: 65, l: 14 },
        shred: { name: "Omelette Protéinée Légère", desc: "5 blancs d'œufs, 1 œuf entier, épinards, 1 tranche de pain complet de seigle. Pauvre en lipides.", kcal: 320, p: 35, g: 22, l: 8 },
        express: { name: "Shaker Anabolique Express", desc: "40g Whey Isolat, 1 banane mûre mixée, 250ml lait d'amande sans sucre. Assimilation éclair.", kcal: 310, p: 34, g: 35, l: 3 }
    },
    lunch: {
        muscle: { name: "Riz Basmati, Poulet & Brocolis", desc: "150g (pesé cuit) filet de poulet grillé, 100g de riz basmati, brocolis vapeur, 1 cuillère d'huile d'olive.", kcal: 640, p: 48, g: 75, l: 12 },
        shred: { name: "Cabillaud & Épingle de Patate Douce", desc: "200g filet de cabillaud, 150g de patate douce au four, asperges vertes à la plancha.", kcal: 410, p: 42, g: 45, l: 5 },
        express: { name: "Wrap Thon & Avocat Rapide", desc: "1 wrap complet, 1 boîte de thon au naturel (140g), 1/2 avocat écrasé, tomates cerises.", kcal: 480, p: 36, g: 42, l: 16 }
    },
    snack: {
        muscle: { name: "Power Shake & Beurre d'Amande", desc: "35g Whey protéine, 1 banane, 20g de beurre d'amande biologique, eau.", kcal: 420, p: 32, g: 40, l: 14 },
        shred: { name: "Fromage Blanc 0% & Baies Rouges", desc: "250g de fromage blanc 0%, 50g de myrtilles fraîches, stévia, quelques éclats de noix.", kcal: 210, p: 24, g: 18, l: 4 },
        express: { name: "Barre Protéinée Premium & Café", desc: "1 barre protéinée low-carb (min. 20g de protéines), un double expresso sans sucre.", kcal: 230, p: 20, g: 24, l: 7 }
    },
    dinner: {
        muscle: { name: "Pavé de Saumon Sauvage & Quinoa", desc: "140g pavé de saumon cuit unilatéral, 80g de quinoa, haricots verts, filet de citron.", kcal: 620, p: 42, g: 50, l: 22 },
        shred: { name: "Dinde & Émincé de Légumes", desc: "180g de filet de dinde, poêlée de champignons et courgettes, filet d'huile de lin.", kcal: 350, p: 44, g: 15, l: 10 },
        express: { name: "Salade Protéinée Rapide", desc: "150g de thon, 2 œufs durs, salade mélangée, concombres, feta (30g), vinaigre balsamique.", kcal: 460, p: 40, g: 12, l: 26 }
    }
};

let currentSelectedDay = "Lundi";
let userDailyMeals = {
    Lundi: { breakfast: "muscle", lunch: "muscle", snack: "muscle", dinner: "muscle" },
    Mardi: { breakfast: "shred", lunch: "shred", snack: "shred", dinner: "shred" },
    Mercredi: { breakfast: "express", lunch: "express", snack: "express", dinner: "express" },
    Jeudi: { breakfast: "muscle", lunch: "shred", snack: "express", dinner: "muscle" }
};

let caloriesChart = null;

function selectNutritionDay(day) {
    currentSelectedDay = day;
    document.querySelectorAll('.btn-day').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Mettre à jour les dropdowns avec les choix sauvegardés de ce jour
    const selections = userDailyMeals[day];
    document.getElementById('select-breakfast').value = selections.breakfast;
    document.getElementById('select-lunch').value = selections.lunch;
    document.getElementById('select-snack').value = selections.snack;
    document.getElementById('select-dinner').value = selections.dinner;

    // Charger les détails des textes
    updateMealDescriptions();
    calculateAndRenderCalories();
}

function updateMealDescriptions() {
    const dayChoices = userDailyMeals[currentSelectedDay];
    
    document.getElementById('desc-breakfast').innerHTML = `<strong>${nutritionDatabase.breakfast[dayChoices.breakfast].name}</strong><br>${nutritionDatabase.breakfast[dayChoices.breakfast].desc}<br><span class="text-blue">${nutritionDatabase.breakfast[dayChoices.breakfast].kcal} kcal | P: ${nutritionDatabase.breakfast[dayChoices.breakfast].p}g | G: ${nutritionDatabase.breakfast[dayChoices.breakfast].g}g | L: ${nutritionDatabase.breakfast[dayChoices.breakfast].l}g</span>`;
    document.getElementById('desc-lunch').innerHTML = `<strong>${nutritionDatabase.lunch[dayChoices.lunch].name}</strong><br>${nutritionDatabase.lunch[dayChoices.lunch].desc}<br><span class="text-blue">${nutritionDatabase.lunch[dayChoices.lunch].kcal} kcal | P: ${nutritionDatabase.lunch[dayChoices.lunch].p}g | G: ${nutritionDatabase.lunch[dayChoices.lunch].g}g | L: ${nutritionDatabase.lunch[dayChoices.lunch].l}g</span>`;
    document.getElementById('desc-snack').innerHTML = `<strong>${nutritionDatabase.snack[dayChoices.snack].name}</strong><br>${nutritionDatabase.snack[dayChoices.snack].desc}<br><span class="text-blue">${nutritionDatabase.snack[dayChoices.snack].kcal} kcal | P: ${nutritionDatabase.snack[dayChoices.snack].p}g | G: ${nutritionDatabase.snack[dayChoices.snack].g}g | L: ${nutritionDatabase.snack[dayChoices.snack].l}g</span>`;
    document.getElementById('desc-dinner').innerHTML = `<strong>${nutritionDatabase.dinner[dayChoices.dinner].name}</strong><br>${nutritionDatabase.dinner[dayChoices.dinner].desc}<br><span class="text-blue">${nutritionDatabase.dinner[dayChoices.dinner].kcal} kcal | P: ${nutritionDatabase.dinner[dayChoices.dinner].p}g | G: ${nutritionDatabase.dinner[dayChoices.dinner].g}g | L: ${nutritionDatabase.dinner[dayChoices.dinner].l}g</span>`;
}

function applyMealChange(mealType, selectionKey) {
    userDailyMeals[currentSelectedDay][mealType] = selectionKey;
    updateMealDescriptions();
    calculateAndRenderCalories();
}

function calculateAndRenderCalories() {
    const dayChoices = userDailyMeals[currentSelectedDay];
    
    let totalKcal = 
        nutritionDatabase.breakfast[dayChoices.breakfast].kcal +
        nutritionDatabase.lunch[dayChoices.lunch].kcal +
        nutritionDatabase.snack[dayChoices.snack].kcal +
        nutritionDatabase.dinner[dayChoices.dinner].kcal;

    let totalP = 
        nutritionDatabase.breakfast[dayChoices.breakfast].p +
        nutritionDatabase.lunch[dayChoices.lunch].p +
        nutritionDatabase.snack[dayChoices.snack].p +
        nutritionDatabase.dinner[dayChoices.dinner].p;

    let totalG = 
        nutritionDatabase.breakfast[dayChoices.breakfast].g +
        nutritionDatabase.lunch[dayChoices.lunch].g +
        nutritionDatabase.snack[dayChoices.snack].g +
        nutritionDatabase.dinner[dayChoices.dinner].g;

    let totalL = 
        nutritionDatabase.breakfast[dayChoices.breakfast].l +
        nutritionDatabase.lunch[dayChoices.lunch].l +
        nutritionDatabase.snack[dayChoices.snack].l +
        nutritionDatabase.dinner[dayChoices.dinner].l;

    document.getElementById('consumed-calories').innerText = totalKcal;
    document.getElementById('macro-p').innerText = totalP + "g";
    document.getElementById('macro-g').innerText = totalG + "g";
    document.getElementById('macro-l').innerText = totalL + "g";

    // Update circular chart on main page
    if (caloriesChart) {
        caloriesChart.data.datasets[0].data = [totalKcal, Math.max(0, 2500 - totalKcal)];
        caloriesChart.update();
    }
}

// ALGORITHME DE PLANIFICATION ET SÉANCES
function calculateNextWorkout(selectedWorkout) {
    const banner = document.getElementById('workout-suggestion');
    if (!selectedWorkout) {
        banner.innerHTML = `<i class="fas fa-info-circle text-blue"></i> Sélectionne une séance pour mettre à jour ton plan opérationnel.`;
        return;
    }

    let recommendation = "";
    let reason = "";
    let newProgress = 62;

    if (selectedWorkout === "push") {
        recommendation = "PULL (Dos / Biceps)";
        reason = "Aujourd'hui, tes triceps et pectoraux ont subi des micro-déchirures. Laisse-les au repos complet pendant 48h. Ta chaîne postérieure est quant à elle totalement fraîche.";
        newProgress = 68;
    } else if (selectedWorkout === "pull") {
        recommendation = "LEGS & ABS (Jambes / Sangle abdominale)";
        reason = "Tes muscles tracteurs (dos, biceps) entrent en phase de surcompensation. C'est le moment d'attaquer le bas du corps avec un focus athlétique.";
        newProgress = 75;
    } else if (selectedWorkout === "legs") {
        recommendation = "PUSH (Pectoraux / Épaules / Triceps)";
        reason = "Le bas du corps est neutralisé pour permettre la régénération nerveuse. Tes muscles de poussée sont pleinement rechargés pour un nouveau round.";
        newProgress = 85;
    }

    banner.innerHTML = `
        <strong><i class="fas fa-check-circle text-success"></i> Plan opérationnel mis à jour !</strong><br>
        <p class="mt-1">${reason}</p>
        <div class="mt-2 text-blue font-weight-bold">🎯 Prochaine séance cible : ${recommendation}</div>
    `;

    document.getElementById('global-progress-bar').style.width = newProgress + '%';
    document.getElementById('global-progress-text').innerText = newProgress + '%';
}

// PROGRAMME ATHLÉTIQUE ET SUIVI LIVE (TRAINING LOGGER)
const liveExercisesDatabase = {
    push: [
        { name: "1. Développé Couché Incliné Haltères", sets: 4, reps: 8, targetWeight: "30kg", desc: "Angle de 30°. Focus sur le haut de poitrine (claviculaire). Descente lente de 3s pour un étirement optimal." },
        { name: "2. Dips Lestés ou Machine", sets: 3, reps: 10, targetWeight: "15kg", desc: "Triceps et bas de poitrine ciblés. Reste bien droit pour limiter l'étirement excessif des épaules." },
        { name: "3. Élévations Latérales aux Câbles", sets: 4, reps: 12, targetWeight: "12kg", desc: "Tension continue pour isoler le faisceau latéral du deltoïde." },
        { name: "4. Extensions Triceps à la Poulie Haute", sets: 3, reps: 12, targetWeight: "30kg", desc: "Verrouille tes coudes contre tes flancs pour isoler parfaitement le triceps." }
    ],
    pull: [
        { name: "1. Tirage Vertical Prise Large (Lat Pulldown)", sets: 4, reps: 10, targetWeight: "65kg", desc: "Engage les omoplates vers le bas avant d'amorcer le mouvement. Focus étirement." },
        { name: "2. Rowing Barre Buste Penché", sets: 3, reps: 8, targetWeight: "70kg", desc: "Buste incliné à 45°. Amène la barre vers ton nombril pour travailler l'épaisseur du dos." },
        { name: "3. Face Pull à la Poulie", sets: 4, reps: 15, targetWeight: "20kg", desc: "Focus sur l'arrière de l'épaule et la coiffe des rotateurs." },
        { name: "4. Curl Biceps Incliné aux Haltères", sets: 3, reps: 10, targetWeight: "14kg", desc: "Banc incliné à 45° pour étirer au maximum le chef long du biceps." }
    ],
    legs: [
        { name: "1. Squat Gobelet ou Hack Squat", sets: 4, reps: 8, targetWeight: "40kg", desc: "Amplitudes complètes pour cibler les quadriceps. Garde le dos parfaitement gainé." },
        { name: "2. Soulevé de Terre Jambes Tendues (RDL)", sets: 4, reps: 10, targetWeight: "80kg", desc: "Focus fessiers et ischios-jambiers. Amène les hanches vers l'arrière." },
        { name: "3. Leg Curl Isolé", sets: 3, reps: 12, targetWeight: "45kg", desc: "Contraction volontaire de 1s au sommet." },
        { name: "4. Crunchs à la Poulie Haute (Abdos)", sets: 4, reps: 15, targetWeight: "40kg", desc: "Enroule la colonne, ne tire pas avec les bras." }
    ]
};

let activeLiveWorkoutKey = "push";
let activeExIndex = 0;
let activeSetIndex = 1;
let recoveryTimer = null;

function startLiveWorkout() {
    activeLiveWorkoutKey = document.getElementById('live-workout-select').value;
    activeExIndex = 0;
    activeSetIndex = 1;

    document.getElementById('coach-start-screen').style.display = 'none';
    document.getElementById('coach-live-screen').style.display = 'block';

    loadLiveWorkoutExercise();
}

function loadLiveWorkoutExercise() {
    const exercises = liveExercisesDatabase[activeLiveWorkoutKey];
    const currentEx = exercises[activeExIndex];

    document.getElementById('live-ex-counter').innerText = `Exercice ${activeExIndex + 1}/${exercises.length}`;
    document.getElementById('live-exercise-name').innerText = currentEx.name;
    document.getElementById('live-exercise-desc').innerText = currentEx.desc;

    const setsContainer = document.getElementById('live-sets-container');
    setsContainer.innerHTML = '';

    for (let i = 1; i <= currentEx.sets; i++) {
        const isDone = i < activeSetIndex;
        const isActive = i === activeSetIndex;
        
        const setRow = document.createElement('div');
        setRow.className = `set-row ${isDone ? 'done' : ''} ${isActive ? 'active-row' : ''}`;
        setRow.id = `live-set-row-${i}`;

        setRow.innerHTML = `
            <span>Série ${i}</span>
            <div class="set-inputs">
                <input type="number" id="weight-input-${i}" value="${parseFloat(currentEx.targetWeight)}" ${isDone ? 'disabled' : ''}>
                <span>kg</span>
                <input type="number" id="reps-input-${i}" value="${currentEx.reps}" ${isDone ? 'disabled' : ''}>
                <span>reps</span>
            </div>
            <span class="status-indicator">${isDone ? '✓ Validé' : (isActive ? '⚡ En cours' : '💤 En attente')}</span>
        `;
        setsContainer.appendChild(setRow);
    }

    document.getElementById('btn-validate-set').style.display = 'inline-block';
    document.getElementById('btn-next-exercise').style.display = 'none';
    document.getElementById('timer-box').style.display = 'none';
}

function validateLiveSet() {
    const exercises = liveExercisesDatabase[activeLiveWorkoutKey];
    const currentEx = exercises[activeExIndex];
    
    // Récupérer et figer les valeurs entrées par l'utilisateur
    const weightInput = document.getElementById(`weight-input-${activeSetIndex}`);
    const repsInput = document.getElementById(`reps-input-${activeSetIndex}`);
    
    if (weightInput && repsInput) {
        weightInput.disabled = true;
        repsInput.disabled = true;
    }

    const setRow = document.getElementById(`live-set-row-${activeSetIndex}`);
    if (setRow) {
        setRow.classList.remove('active-row');
        setRow.classList.add('done');
        setRow.querySelector('.status-indicator').innerText = "✓ Validé";
    }

    if (activeSetIndex < currentEx.sets) {
        activeSetIndex++;
        launchRestTimer(60); // Chrono de repos de 60 secondes
    } else {
        // Toutes les séries de cet exercice sont faites
        document.getElementById('btn-validate-set').style.display = 'none';
        document.getElementById('btn-next-exercise').style.display = 'inline-block';
    }
}

function launchRestTimer(seconds) {
    const timerBox = document.getElementById('timer-box');
    const display = document.getElementById('timer-display');
    timerBox.style.display = 'block';

    let remaining = seconds;
    display.innerText = remaining + "s";

    clearInterval(recoveryTimer);
    recoveryTimer = setInterval(() => {
        remaining--;
        display.innerText = remaining + "s";
        if (remaining <= 0) {
            clearInterval(recoveryTimer);
            timerBox.style.display = 'none';
            loadLiveWorkoutExercise();
        }
    }, 1000);
}

function nextLiveExercise() {
    clearInterval(recoveryTimer);
    const exercises = liveExercisesDatabase[activeLiveWorkoutKey];

    if (activeExIndex < exercises.length - 1) {
        activeExIndex++;
        activeSetIndex = 1;
        loadLiveWorkoutExercise();
    } else {
        // FIN DE L'ENTRAÎNEMENT COMPLET
        alert("Félicitations Soufiane ! Entraînement terminé. KPIs validés et enregistrés sur ton tableau de bord. La persévérance paie ! 🔥");
        document.getElementById('coach-start-screen').style.display = 'block';
        document.getElementById('coach-live-screen').style.display = 'none';
    }
}

// SUIVI HYDRATATION (ACCUEIL)
let waterAmount = 60;
function addWater() {
    if (waterAmount < 100) {
        waterAmount += 8;
        if (waterAmount > 100) waterAmount = 100;
        document.getElementById('bottle-fill').style.height = waterAmount + '%';
        let left = (3 - (waterAmount * 3 / 100)).toFixed(1);
        document.getElementById('water-text').innerText = Math.max(left, 0) + 'L restants';
    }
}

// INITIALISATION DU GRAPH DES CALORIES (ACCUEIL)
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
        animation: { duration: 500 }
    }
});

// HISTORIQUE DE FORCE (STATS)
const ctxKpi = document.getElementById('kpiChart').getContext('2d');
new Chart(ctxKpi, {
    type: 'line',
    data: {
        labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
        datasets: [{
            label: 'Volume d\'entraînement (tonnes)',
            data: [12.4, 14.1, 15.8, 18.2],
            borderColor: '#00d2ff',
            backgroundColor: 'rgba(0, 210, 255, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    }
});

// MESSAGERIE INTELLIGENTE DU COACH IA
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
        
        if (lowerMsg.includes('épaule') || lowerMsg.includes('epaule') || lowerMsg.includes('coiffe')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Raideur articulaire identifiée. Pour la séance PUSH, supprime le développé militaire lourd. Remplace-le par des élévations latérales plus légères à la poulie pour préserver ton supra-épineux. Échauffement obligatoire : 3 séries de rotation externe au câble.";
        } else if (lowerMsg.includes('dos') || lowerMsg.includes('lombaire')) {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Tension lombaire détectée. Ce soir ou lors du prochain LEGS, bannis le squat lourd et le soulevé de terre traditionnel. Bascule sur du Hack Squat guidé et du Leg Curl allongé pour protéger ta colonne.";
        } else {
            aiDiv.innerHTML = "<strong>Coach IA :</strong> Reçu Soufiane. Reste assidu sur ton hydratation et assure-toi de valider au moins 150g de protéines sur tes repas du jour pour optimiser la reconstruction.";
        }
        chat.appendChild(aiDiv);
        chat.scrollTop = chat.scrollHeight;
    }, 850);
}

// Lancement automatique
selectNutritionDay('Lundi');
