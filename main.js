// ========= GLOBAL SETUP =========
const scales = {
    major: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
    minor: ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4", "C5"],
    pentatonic: ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"],
};

let currentScale = "major";
let tempo = 120;
let synthType = "synth";
let synth = new Tone.Synth().toDestination();
let isNeonMode = false;
let particles = [];
Tone.Transport.bpm.value = tempo;

// ========= DOM ELEMENTS =========
const gridContainer = document.getElementById("grid");
const tempoValue = document.getElementById("tempoValue");
const currentChallenge = document.getElementById("currentChallenge");
const attackValue = document.getElementById("attackValue");
const decayValue = document.getElementById("decayValue");

// ========= BUILD GRID =========
const numRows = 8;
const numCols = 8;
let grid = [];

function initializeGrid() {
    gridContainer.innerHTML = "";
    grid = [];

    for (let row = 0; row < numRows; row++) {
        grid[row] = [];
        for (let col = 0; col < numCols; col++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell w-full border border-gray-600 rounded hover:bg-yellow-400 transition cursor-pointer";
            cell.style.aspectRatio = "1 / 1";
            cell.dataset.active = "false";
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Add both mouse and touch events
            cell.addEventListener("click", () => toggleCell(cell));
            cell.addEventListener("touchstart", (e) => {
                e.preventDefault();
                toggleCell(cell);
            });

            gridContainer.appendChild(cell);
            grid[row][col] = cell;
        }
    }
}

// ========= CORE FUNCTIONS =========
function toggleCell(cell) {
    const active = cell.dataset.active === "true";
    cell.dataset.active = !active;
    cell.classList.toggle("bg-yellow-400", !active);
    cell.classList.toggle("shadow-md", !active);
    cell.classList.toggle("shadow-yellow-400/50", !active);

    if (isNeonMode) {
        cell.classList.toggle("neon-active", !active);
    }

    checkAchievements();
}

let playing = false;
let currentCol = 0;
let loop;

function play() {
    if (playing) return;

    // Try to start audio context if not already running
    if (Tone.context.state !== "running") {
        Tone.start().then(() => {
            actuallyStartPlayback();
        }).catch(err => {
            console.error("Audio context couldn't start:", err);
            alert("Couldn't start audio. Please interact with the page first.");
        });
    } else {
        actuallyStartPlayback();
    }
}

function actuallyStartPlayback() {
    playing = true;
    currentCol = 0;

    loop = setInterval(() => {
        playColumn(currentCol);
        currentCol++;
        if (currentCol >= numCols) currentCol = 0;
    }, (60 / tempo) * 1000);
}

function stop() {
    playing = false;
    clearInterval(loop);
    grid.flat().forEach(cell => cell.classList.remove("ring-2", "ring-pink-500"));
}

function playColumn(col) {
    for (let row = 0; row < numRows; row++) {
        const cell = grid[row][col];
        const note = scales[currentScale][numRows - row - 1];
        if (cell.dataset.active === "true") {
            synth.triggerAttackRelease(note, "8n");
            if (isNeonMode) {
                cell.classList.add("pulse");
                setTimeout(() => cell.classList.remove("pulse"), 300);
            }
        }
    }
    highlightColumn(col);
    updateParticles(col);
}

function highlightColumn(col) {
    grid.flat().forEach(cell => cell.classList.remove("ring-2", "ring-pink-500"));
    for (let row = 0; row < numRows; row++) {
        grid[row][col].classList.add("ring-2", "ring-pink-500");
    }
}

function clearGrid() {
    grid.flat().forEach(cell => {
        cell.dataset.active = "false";
        cell.classList.remove("bg-yellow-400", "shadow-md", "shadow-yellow-400/50", "neon-active", "pulse");
    });
}

// ========= SOUND IMPROVEMENTS =========
const moodPatterns = {
    "romantic": {
        scale: "major",
        tempo: 100,
        pattern: [1, 0, 1, 1, 0, 0, 1, 0],
        instrument: "piano",
        settings: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
            oscillator: {
                type: "fatsine",
                partials: [1, 2, 1, 2, 0.5],
                spread: 60
            }
        }
    },
    "energetic": {
        scale: "pentatonic",
        tempo: 150,
        pattern: [1, 1, 0, 1, 0, 1, 1, 0],
        instrument: "synth",
        settings: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.5,
            release: 0.3,
            oscillator: {
                type: "fatsawtooth",
                count: 3,
                spread: 30
            }
        }
    },
    "dreamy": {
        scale: "minor",
        tempo: 90,
        pattern: [0, 1, 0, 0, 1, 0, 0, 1],
        instrument: "pluck",
        settings: {
            attack: 0.005,
            decay: 0.5,
            sustain: 0.1,
            release: 1.5,
            oscillator: {
                type: "sine",
                partials: [0.5, 1, 1.5]
            }
        }
    },
    "dramatic": {
        scale: "minor",
        tempo: 120,
        pattern: [1, 1, 0, 0, 1, 1, 0, 0],
        instrument: "synth",
        settings: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0.2,
            release: 1,
            oscillator: {
                type: "square",
                width: 0.6
            }
        }
    },
    "happy": {
        scale: "major",
        tempo: 140,
        pattern: [1, 0, 1, 0, 1, 0, 1, 0],
        instrument: "piano",
        settings: {
            attack: 0.003,
            decay: 0.1,
            sustain: 0.4,
            release: 0.7,
            oscillator: {
                type: "fmtriangle",
                modulationType: "sine",
                modulationIndex: 0.5
            }
        }
    },
    "sad": {
        scale: "minor",
        tempo: 80,
        pattern: [0, 1, 0, 1, 0, 1, 0, 1],
        instrument: "piano",
        settings: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.2,
            release: 1.2,
            oscillator: {
                type: "sine",
                partials: [1, 0.3, 0.1]
            }
        }
    },
    "calm": {
        scale: "pentatonic",
        tempo: 100,
        pattern: [1, 0, 0, 1, 0, 0, 1, 0],
        instrument: "pluck",
        settings: {
            attack: 0.002,
            decay: 0.8,
            sustain: 0.1,
            release: 1,
            oscillator: {
                type: "sine",
                partials: [1, 0.5]
            }
        }
    },
    "excited": {
        scale: "major",
        tempo: 160,
        pattern: [1, 1, 0, 1, 1, 0, 1, 1],
        instrument: "synth",
        settings: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.6,
            release: 0.2,
            oscillator: {
                type: "pulse",
                width: 0.3
            }
        }
    }
};

function generateMoodMusic(prompt) {
    // Simple keyword matching
    const words = prompt.toLowerCase().split(" ");
    for (const [mood, config] of Object.entries(moodPatterns)) {
        if (words.some(word => mood.includes(word))) {
            return config;
        }
    }
    return moodPatterns["happy"]; // Default
}

function switchInstrument(type, settings = {}) {
    synthType = type;
    if (synth) synth.dispose();

    const defaultSettings = {
        attack: parseFloat(document.getElementById("attack").value),
        decay: parseFloat(document.getElementById("decay").value),
        sustain: 0.5,
        release: 1
    };

    const finalSettings = { ...defaultSettings, ...settings };

    switch (type) {
        case "synth":
            synth = new Tone.Synth({
                oscillator: settings.oscillator || {
                    type: "fatsawtooth",
                    count: 3,
                    spread: 30
                },
                envelope: finalSettings
            }).toDestination();
            break;
        case "piano":
            synth = new Tone.Synth({
                oscillator: settings.oscillator || {
                    type: "fatsine",
                    partials: [1, 2, 1, 2, 0.5],
                    spread: 60
                },
                envelope: finalSettings
            }).toDestination();
            break;
        case "pluck":
            synth = new Tone.PluckSynth({
                envelope: {
                    attack: finalSettings.attack,
                    decay: finalSettings.decay,
                    sustain: finalSettings.sustain,
                    release: finalSettings.release
                }
            }).toDestination();
            break;
    }
}

function applyEmotionTemplate(emotion) {
    const config = moodPatterns[emotion.toLowerCase()] || moodPatterns["happy"];

    // Update UI
    document.getElementById("scale").value = config.scale;
    document.getElementById("tempo").value = config.tempo;
    document.getElementById("instrument").value = config.instrument;
    tempoValue.textContent = config.tempo;
    currentScale = config.scale;
    tempo = config.tempo;
    Tone.Transport.bpm.value = tempo;

    // Update synth with mood-specific settings
    switchInstrument(config.instrument, config.settings);

    // Update grid
    clearGrid();
    config.pattern.forEach((active, col) => {
        if (active) {
            for (let row = 0; row < numRows; row++) {
                if (row === Math.floor(numRows / 2)) {
                    const cell = grid[row][col];
                    cell.dataset.active = "true";
                    cell.classList.add("bg-yellow-400", "shadow-md", "shadow-yellow-400/50");
                    if (isNeonMode) cell.classList.add("neon-active");
                }
            }
        }
    });

    currentChallenge.textContent = `Applied "${emotion}" template!`;
    unlockBadge("emotion");
}

// ========= TUTORIAL SYSTEM =========
function startTutorial() {
    let tutorialActive = false;
    let currentStep = 0;

    const steps = [
        {
            element: "#grid",
            text: "Click on any cell to place a note. Click again to remove it.",
            position: "top"
        },
        {
            element: "#play",
            text: "Press Play to hear your composition. Stop when you're done.",
            position: "left"
        },
        {
            element: "#mood",
            text: "Try mood templates to quickly generate emotion-based melodies!",
            position: "right"
        }
    ];

    const tutorialSpotlight = document.createElement("div");
    tutorialSpotlight.className = "spotlight hidden";
    document.body.appendChild(tutorialSpotlight);

    const tutorialText = document.createElement("div");
    tutorialText.className = "fixed z-50 bg-black text-white p-4 rounded-lg max-w-xs hidden shadow-lg";
    document.body.appendChild(tutorialText);

    function showStep() {
        if (currentStep >= steps.length) {
            endTutorial();
            return;
        }

        const step = steps[currentStep];
        const element = document.querySelector(step.element);

        if (element) {
            const rect = element.getBoundingClientRect();
            tutorialSpotlight.style.background = `radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 100px, rgba(0,0,0,0.8) 150px)`;
            tutorialSpotlight.classList.remove("hidden");

            tutorialText.textContent = step.text;
            tutorialText.classList.remove("hidden");

            // Position the tooltip
            const tooltipWidth = 250;
            const tooltipHeight = 100;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let left, top;

            switch (step.position) {
                case "top":
                    top = Math.max(10, rect.top - tooltipHeight - 10);
                    left = Math.max(10, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 10));
                    break;
                case "left":
                    top = rect.top + rect.height / 2 - tooltipHeight / 2;
                    left = Math.max(10, rect.left - tooltipWidth - 10);
                    break;
                case "right":
                    top = rect.top + rect.height / 2 - tooltipHeight / 2;
                    left = Math.min(viewportWidth - tooltipWidth - 10, rect.right + 10);
                    break;
            }

            tutorialText.style.top = `${top}px`;
            tutorialText.style.left = `${left}px`;
        }
    }

    function endTutorial() {
        tutorialSpotlight.classList.add("hidden");
        tutorialText.classList.add("hidden");
        tutorialActive = false;
        document.getElementById("tutorial").textContent = "Tutorial";
    }

    document.getElementById("tutorial").addEventListener("click", () => {
        if (!tutorialActive) {
            tutorialActive = true;
            currentStep = 0;
            document.getElementById("tutorial").textContent = "Next";
            showStep();
        } else {
            currentStep++;
            showStep();
        }
    });
}

// ========= PARTICLE SYSTEM =========
function setupParticles() {
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = Array(100).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.2 + 0.05,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        requestAnimationFrame(animate);
    };
    animate();
}

function updateParticles(col) {
    if (!isNeonMode) return;
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");

    // Add new particles for active notes
    for (let row = 0; row < numRows; row++) {
        if (grid[row][col].dataset.active === "true") {
            const hue = col * 36;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(
                Math.random() * canvas.width,
                canvas.height - 20,
                Math.random() * 4 + 2,
                Math.random() * 4 + 2
            );
        }
    }
}

// ========= ACHIEVEMENTS SYSTEM =========
function checkAchievements() {
    const activeNotes = grid.flat().filter(c => c.dataset.active === "true").length;
    if (activeNotes > 0) unlockBadge("first-note");
}

function unlockBadge(name) {
    const badge = document.querySelector(`[data-badge="${name}"]`);
    if (badge && badge.classList.contains("opacity-50")) {
        badge.classList.remove("opacity-50");
        badge.classList.add("bg-yellow-600", "animate-pulse");
        setTimeout(() => badge.classList.remove("animate-pulse"), 2000);

        // Show floating badge
        const floatingBadge = document.createElement("div");
        floatingBadge.className = "badge";
        floatingBadge.textContent = `🏆 ${name.replace("-", " ")} Unlocked!`;
        document.body.appendChild(floatingBadge);
        setTimeout(() => floatingBadge.remove(), 3000);
    }
}

// ========= THEME SYSTEM =========
const themes = {
    ocean: {
        bg: "bg-gradient-to-br from-blue-900 to-teal-900",
        panel: "bg-blue-800",
        accent: "bg-teal-500",
        text: "text-white"
    },
    sunset: {
        bg: "bg-gradient-to-br from-orange-900 to-pink-900",
        panel: "bg-orange-800",
        accent: "bg-pink-500",
        text: "text-white"
    },
    forest: {
        bg: "bg-gradient-to-br from-green-900 to-emerald-900",
        panel: "bg-green-800",
        accent: "bg-emerald-500",
        text: "text-white"
    },
    neon: {
        bg: "bg-black",
        panel: "bg-purple-900",
        accent: "bg-pink-500",
        text: "text-white",
        extra: () => {
            isNeonMode = true;
            grid.flat().forEach(cell => {
                if (cell.dataset.active === "true") cell.classList.add("neon-active");
            });
        }
    }
};

function applyTheme(name) {
    const theme = themes[name] || themes.ocean;

    // Update body background
    document.body.className = `${theme.bg} ${theme.text} min-h-screen flex flex-col theme-transition`;

    // Update panels
    document.querySelectorAll(".bg-gray-800").forEach(el => {
        el.classList.remove("bg-gray-800");
        el.classList.add(theme.panel);
    });

    // Update buttons
    document.querySelectorAll("button").forEach(btn => {
        if (!btn.id && !btn.dataset.theme) {
            btn.classList.remove(
                "bg-purple-600", "hover:bg-purple-700",
                "bg-blue-600", "hover:bg-blue-700",
                "bg-pink-600", "hover:bg-pink-700",
                "bg-indigo-600", "hover:bg-indigo-700",
                "bg-teal-600", "hover:bg-teal-700",
                "bg-green-600", "hover:bg-green-700",
                "bg-red-600", "hover:bg-red-700",
                "bg-yellow-600", "hover:bg-yellow-700"
            );
            btn.classList.add(theme.accent, `hover:${theme.accent.replace("500", "600")}`);
        }
    });

    // Special handling for neon mode
    if (name === "neon") {
        theme.extra?.();
    } else {
        isNeonMode = false;
        grid.flat().forEach(cell => cell.classList.remove("neon-active"));
    }
}

// ========= CHALLENGE SYSTEM =========
const challenges = [
    "Create a melody with exactly 8 notes",
    "Make a pattern that alternates between columns",
    "Create a melody using only the top 4 rows",
    "Make a pattern that spells your name in Morse code",
    "Create a melody that gets progressively faster"
];

function getRandomChallenge() {
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    currentChallenge.textContent = challenge;
    unlockBadge("challenge");
}

// ========= SHARING SYSTEM =========
function shareMelody() {
    const gridData = [];
    for (let row = 0; row < numRows; row++) {
        gridData[row] = [];
        for (let col = 0; col < numCols; col++) {
            gridData[row][col] = grid[row][col].dataset.active === "true" ? 1 : 0;
        }
    }

    const shareData = {
        grid: gridData,
        scale: currentScale,
        tempo: tempo,
        instrument: synthType
    };

    const base64 = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}${window.location.pathname}?melody=${base64}`;

    if (navigator.share) {
        navigator.share({
            title: "Check out my melody!",
            text: "I created this cool melody with Musical Mind",
            url: url
        }).catch(err => {
            console.log("Sharing failed:", err);
            prompt("Copy this link to share your melody:", url);
        });
    } else {
        prompt("Copy this link to share your melody:", url);
    }
}

// ========= EVENT LISTENERS =========
document.getElementById("play").addEventListener("click", play);
document.getElementById("stop").addEventListener("click", stop);
document.getElementById("clear").addEventListener("click", clearGrid);

document.getElementById("instrument").addEventListener("change", (e) => {
    switchInstrument(e.target.value);
});

document.getElementById("scale").addEventListener("change", (e) => {
    currentScale = e.target.value;
});

document.getElementById("tempo").addEventListener("input", (e) => {
    tempo = parseInt(e.target.value);
    tempoValue.textContent = tempo;
    Tone.Transport.bpm.value = tempo;
    if (playing) {
        stop();
        play();
    }
});

document.getElementById("attack").addEventListener("input", (e) => {
    attackValue.textContent = e.target.value;
    if (synth && synth.envelope) {
        synth.envelope.attack = parseFloat(e.target.value);
    }
});

document.getElementById("decay").addEventListener("input", (e) => {
    decayValue.textContent = e.target.value;
    if (synth && synth.envelope) {
        synth.envelope.decay = parseFloat(e.target.value);
    }
});

document.getElementById("emotion").addEventListener("click", () => {
    const emotion = prompt("Enter an emotion (happy, sad, calm, excited):", "happy");
    if (emotion) applyEmotionTemplate(emotion);
});

document.getElementById("mood").addEventListener("click", () => {
    const promptText = prompt("Describe your mood/scene (e.g. 'romantic evening'):");
    if (promptText) {
        const config = generateMoodMusic(promptText);
        applyEmotionTemplate(Object.keys(moodPatterns).find(key =>
            moodPatterns[key] === config
        ));
    }
});

document.getElementById("challenge").addEventListener("click", getRandomChallenge);
document.getElementById("share").addEventListener("click", shareMelody);
// document.getElementById("analytics").addEventListener("click", showAnalytics);

document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// Handle window resize
window.addEventListener("resize", () => {
    const canvas = document.getElementById("particles");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ========= INITIALIZATION =========
window.addEventListener("load", () => {
    initializeGrid();

    // Load shared melody from URL if exists
    const urlParams = new URLSearchParams(window.location.search);
    const melodyParam = urlParams.get('melody');

    if (melodyParam) {
        try {
            const shareData = JSON.parse(atob(melodyParam));
            currentScale = shareData.scale;
            tempo = shareData.tempo;
            synthType = shareData.instrument;

            document.getElementById("scale").value = currentScale;
            document.getElementById("tempo").value = tempo;
            document.getElementById("instrument").value = synthType;
            tempoValue.textContent = tempo;
            Tone.Transport.bpm.value = tempo;
            switchInstrument(synthType);

            clearGrid();
            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    if (shareData.grid[row][col] === 1) {
                        const cell = grid[row][col];
                        cell.dataset.active = "true";
                        cell.classList.add("bg-yellow-400", "shadow-md", "shadow-yellow-400/50");
                        if (isNeonMode) cell.classList.add("neon-active");
                    }
                }
            }

            currentChallenge.textContent = "Loaded shared melody!";
        } catch (e) {
            console.error("Error loading melody:", e);
        }
    }

    // Initialize systems
    setupParticles();
    startTutorial(); // Now optional - only starts when tutorial button is clicked
    applyTheme("ocean"); // Default theme
});