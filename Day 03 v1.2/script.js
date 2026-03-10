// State Management
let ideas = JSON.parse(localStorage.getItem('g26_ideas')) || [];
let currentTheme = localStorage.getItem('g26_theme') || 'light';

// Timer State
let timerInterval = null;
let timeLeft = 1500; // 25 minutes in seconds
let isTimerRunning = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initIdeaBoard();
    initBackground();
    initStudyTimer();
    renderIdeas();
});

// --- Theme Logic ---
function initTheme() {
    document.body.setAttribute('data-theme', currentTheme);
    const themeBtn = document.getElementById('theme-btn');
    updateThemeIcon();

    themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('g26_theme', currentTheme);
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    const icon = document.querySelector('#theme-btn i');
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// --- Navigation (SPA Logic) ---
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-view');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            views.forEach(v => {
                v.classList.remove('active');
                if (v.id === targetView) v.classList.add('active');
            });
        });
    });
}

window.navigateTo = (viewId) => {
    const navLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (navLink) navLink.click();
};

// --- Background Animation ---
function initBackground() {
    const bg = document.getElementById('bg-animation');
    const bulbCount = 15;
    bg.innerHTML = '';

    for (let i = 0; i < bulbCount; i++) {
        const bulb = document.createElement('i');
        bulb.className = 'fas fa-lightbulb floating-bulb';
        const left = Math.random() * 100;
        const duration = 15 + Math.random() * 20;
        const delay = Math.random() * 20;
        const size = 1 + Math.random() * 2;
        bulb.style.left = `${left}%`;
        bulb.style.animationDuration = `${duration}s`;
        bulb.style.animationDelay = `-${delay}s`;
        bulb.style.fontSize = `${size}rem`;
        bg.appendChild(bulb);
    }
}

// --- Group Idea Board Logic ---
function initIdeaBoard() {
    const form = document.getElementById('idea-form');
    const sortSelect = document.getElementById('sort-ideas');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('user-name').value;
        const text = document.getElementById('idea-text').value;

        const newIdea = {
            id: Date.now(),
            name,
            text,
            timestamp: new Date().toLocaleString(),
            likes: 0,
            dislikes: 0,
            pinned: false,
            rawTime: Date.now()
        };

        ideas.unshift(newIdea);
        saveIdeas();
        renderIdeas();
        form.reset();
    });

    sortSelect.addEventListener('change', renderIdeas);
}

function renderIdeas() {
    const container = document.getElementById('ideas-container');
    const totalDisplay = document.getElementById('total-ideas');
    const sortBy = document.getElementById('sort-ideas').value;

    totalDisplay.textContent = ideas.length;
    container.innerHTML = '';

    let sortedIdeas = [...ideas];
    sortedIdeas.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (sortBy === 'likes') return b.likes - a.likes;
        return b.rawTime - a.rawTime;
    });

    sortedIdeas.forEach(idea => {
        const card = document.createElement('div');
        card.className = `idea-card ${idea.pinned ? 'pinned' : ''}`;
        card.innerHTML = `
            <div class="card-header">
                <span class="card-name">${idea.name}</span>
                <span class="card-time">${idea.timestamp}</span>
            </div>
            <p class="card-text">${idea.text}</p>
            <div class="card-footer">
                <div class="vote-btns">
                    <button class="btn-vote" onclick="vote(${idea.id}, 'like')"><i class="fas fa-thumbs-up"></i> ${idea.likes}</button>
                    <button class="btn-vote" onclick="vote(${idea.id}, 'dislike')"><i class="fas fa-thumbs-down"></i> ${idea.dislikes}</button>
                </div>
                <div class="action-btns">
                    <button class="btn-pin ${idea.pinned ? 'active' : ''}" onclick="togglePin(${idea.id})"><i class="fas fa-thumbtack"></i></button>
                    <button class="btn-delete" onclick="deleteIdea(${idea.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.vote = (id, type) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
        if (type === 'like') idea.likes++;
        else idea.dislikes++;
        saveIdeas();
        renderIdeas();
    }
};

window.togglePin = (id) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
        idea.pinned = !idea.pinned;
        saveIdeas();
        renderIdeas();
    }
};

window.deleteIdea = (id) => {
    if (confirm('Are you sure you want to delete this idea?')) {
        ideas = ideas.filter(i => i.id !== id);
        saveIdeas();
        renderIdeas();
    }
};

function saveIdeas() {
    localStorage.setItem('g26_ideas', JSON.stringify(ideas));
}

// --- GPA Calculator Logic ---
window.addGpaRow = () => {
    const tbody = document.getElementById('gpa-rows');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Course Name" class="course-name"></td>
        <td><input type="number" step="0.5" min="0" placeholder="Credits" class="course-credits"></td>
        <td><input type="number" step="0.01" min="0" max="4" placeholder="GP" class="course-grade"></td>
        <td><button class="btn-remove" onclick="removeGpaRow(this)"><i class="fas fa-times"></i></button></td>
    `;
    tbody.appendChild(newRow);
};

window.removeGpaRow = (btn) => {
    btn.closest('tr').remove();
};

window.calculateGPA = () => {
    const credits = document.querySelectorAll('.course-credits');
    const grades = document.querySelectorAll('.course-grade');
    const resultDiv = document.getElementById('gpa-result');
    const gpaDisplay = document.getElementById('final-gpa');

    let totalGradeCredits = 0;
    let totalCredits = 0;
    let valid = 0;

    for (let i = 0; i < credits.length; i++) {
        const c = parseFloat(credits[i].value);
        const g = parseFloat(grades[i].value);
        if (!isNaN(c) && !isNaN(g)) {
            totalGradeCredits += (g * c);
            totalCredits += c;
            valid++;
        }
    }

    if (valid === 0 || totalCredits === 0) {
        alert('Please enter valid data for at least one course.');
        return;
    }

    const finalGPA = totalGradeCredits / totalCredits;
    gpaDisplay.textContent = finalGPA.toFixed(2);
    resultDiv.classList.remove('hidden');
};

// --- Study Timer (Pomodoro) Logic ---
function initStudyTimer() {
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    const modeBtns = document.querySelectorAll('.btn-mode');

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${display.textContent} - Study Hub`;
    }

    startBtn.addEventListener('click', () => {
        if (isTimerRunning) return;
        isTimerRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
                alert('Time is up! Take a break or start a new session.');
                // Optional: Sound notification
                // new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
            }
        }, 1000);
    });

    pauseBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        const activeMode = document.querySelector('.btn-mode.active');
        timeLeft = parseInt(activeMode.dataset.time);
        updateDisplay();
    });

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            clearInterval(timerInterval);
            isTimerRunning = false;
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
            timeLeft = parseInt(btn.dataset.time);
            updateDisplay();
        });
    });

    updateDisplay();
}
