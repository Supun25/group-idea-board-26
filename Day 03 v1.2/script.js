document.addEventListener('DOMContentLoaded', () => {
    // ===================== COMMON ELEMENTS =====================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const animatedBg = document.getElementById('animated-bg');
    const navLinks = document.querySelectorAll('.nav-link');

    // ===================== STATE MANAGEMENT =====================
    let currentTheme = localStorage.getItem('g26_theme') || 'light-theme';
    let currentView = 'home';

    // ===================== INITIALIZATION =====================
    document.body.className = currentTheme;
    updateThemeButtonText();
    createFloatingElements();
    initializeNavigation();
    initializeIdeaBoard();
    initializeGPACalculator();
    initializeStudyTimer();

    // ===================== NAVIGATION & THEME =====================
    function initializeNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.getAttribute('data-view');
                switchView(viewName);
            });
        });
    }

    function switchView(viewName) {
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });

        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
            currentView = viewName;

            if (viewName === 'board') {
                renderIdeas();
            }
        }
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
        document.body.className = currentTheme;
        localStorage.setItem('g26_theme', currentTheme);
        updateThemeButtonText();
    }

    function updateThemeButtonText() {
        themeToggleBtn.textContent = currentTheme === 'light-theme' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    themeToggleBtn.addEventListener('click', toggleTheme);

    // ===================== ANIMATED BACKGROUND =====================
    function createFloatingElements() {
        const symbols = ['💡', '✨', '⚡', '🌟'];
        for (let i = 0; i < 15; i++) {
            const el = document.createElement('div');
            el.className = 'floating-bulb';
            el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (Math.random() * 5 + 5) + 's';
            el.style.animationDelay = (Math.random() * 10) + 's';
            el.style.fontSize = (Math.random() * 20 + 20) + 'px';
            animatedBg.appendChild(el);
        }
    }

    // ===================== IDEA BOARD =====================
    let ideas = JSON.parse(localStorage.getItem('g26_ideas')) || [];

    function initializeIdeaBoard() {
        const ideaBoard = document.getElementById('idea-board');
        const userNameInput = document.getElementById('user-name');
        const ideaTextInput = document.getElementById('idea-text');
        const submitBtn = document.getElementById('submit-idea');
        const sortByDropdown = document.getElementById('sort-by');

        submitBtn.addEventListener('click', addIdea);
        sortByDropdown.addEventListener('change', renderIdeas);
        renderIdeas();

        function addIdea() {
            const name = userNameInput.value.trim();
            const text = ideaTextInput.value.trim();

            if (!name || !text) {
                alert('Please fill in both your name and your idea!');
                return;
            }

            const newIdea = {
                id: Date.now(),
                author: name,
                text: text,
                timestamp: new Date().toLocaleString(),
                likes: 0,
                dislikes: 0,
                pinned: false,
                userVote: null
            };

            ideas.push(newIdea);
            saveAndRender();
            userNameInput.value = '';
            ideaTextInput.value = '';
        }

        function togglePin(id) {
            const idea = ideas.find(i => i.id === id);
            if (idea) {
                idea.pinned = !idea.pinned;
                saveAndRender();
            }
        }

        function deleteIdea(id) {
            if (confirm('Are you sure you want to delete this idea?')) {
                ideas = ideas.filter(i => i.id !== id);
                saveAndRender();
            }
        }

        function handleVote(id, type) {
            const idea = ideas.find(i => i.id === id);
            if (!idea) return;

            if (idea.userVote === type) {
                idea[type === 'like' ? 'likes' : 'dislikes']--;
                idea.userVote = null;
            } else {
                if (idea.userVote) {
                    idea[idea.userVote === 'like' ? 'likes' : 'dislikes']--;
                }
                idea[type === 'like' ? 'likes' : 'dislikes']++;
                idea.userVote = type;
            }

            saveAndRender();
        }

        function saveAndRender() {
            localStorage.setItem('g26_ideas', JSON.stringify(ideas));
            renderIdeas();
        }

        function renderIdeas() {
            const sortMethod = sortByDropdown.value;
            const pinnedIdeas = ideas.filter(i => i.pinned);
            const unpinnedIdeas = ideas.filter(i => !i.pinned);

            unpinnedIdeas.sort((a, b) => {
                if (sortMethod === 'net-likes') {
                    return (b.likes - b.dislikes) - (a.likes - a.dislikes);
                } else if (sortMethod === 'time') {
                    return b.id - a.id;
                } else if (sortMethod === 'total-likes') {
                    return b.likes - a.likes;
                }
                return 0;
            });

            const sortedIdeas = [...pinnedIdeas, ...unpinnedIdeas];
            document.getElementById('total-ideas-counter').textContent = `Total Ideas: ${ideas.length}`;

            ideaBoard.innerHTML = '';
            
            if (sortedIdeas.length === 0) {
                ideaBoard.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.6; padding: 40px;">No ideas yet. Start the brainstorming!</p>';
                return;
            }

            sortedIdeas.forEach(idea => {
                const card = document.createElement('div');
                card.className = `idea-card ${idea.pinned ? 'pinned' : ''}`;
                
                card.innerHTML = `
                    ${idea.pinned ? '<div class="pin-tag">Pinned</div>' : ''}
                    <div class="card-header">
                        <span class="author-name">${escapeHTML(idea.author)}</span>
                        <span class="timestamp">${idea.timestamp}</span>
                    </div>
                    <div class="idea-body">
                        <p>${escapeHTML(idea.text)}</p>
                    </div>
                    <div class="card-actions">
                        <div class="vote-btns">
                            <button class="vote-btn like ${idea.userVote === 'like' ? 'active' : ''}" onclick="window.handleVoteAction(${idea.id}, 'like')">
                                👍 <span>${idea.likes}</span>
                            </button>
                            <button class="vote-btn dislike ${idea.userVote === 'dislike' ? 'active' : ''}" onclick="window.handleVoteAction(${idea.id}, 'dislike')">
                                👎 <span>${idea.dislikes}</span>
                            </button>
                        </div>
                        <div class="utility-btns">
                            <button class="pin-btn ${idea.pinned ? 'active' : ''}" onclick="window.handlePinAction(${idea.id})" title="Pin Idea">
                                📌
                            </button>
                            <button class="delete-btn" onclick="window.handleDeleteAction(${idea.id})" title="Delete Idea">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
                ideaBoard.appendChild(card);
            });
        }

        function escapeHTML(str) {
            const p = document.createElement('p');
            p.textContent = str;
            return p.innerHTML;
        }

        // Global handlers
        window.handleVoteAction = (id, type) => handleVote(id, type);
        window.handlePinAction = (id) => togglePin(id);
        window.handleDeleteAction = (id) => deleteIdea(id);
    }

    // ===================== GPA CALCULATOR =====================
    function initializeGPACalculator() {
        const gpaRowsContainer = document.getElementById('gpa-rows');
        const addRowBtn = document.getElementById('add-gpa-row');
        const calculateBtn = document.getElementById('calculate-gpa');
        const resetBtn = document.getElementById('reset-gpa');
        const gpaResult = document.getElementById('gpa-result');

        addRowBtn.addEventListener('click', addGPARow);
        calculateBtn.addEventListener('click', calculateGPA);
        resetBtn.addEventListener('click', resetGPA);

        // Add initial row
        addGPARow();

        function addGPARow() {
            const row = document.createElement('tr');
            row.className = 'gpa-row';
            row.innerHTML = `
                <td><input type="text" placeholder="e.g., Math 101" class="course-name"></td>
                <td><input type="number" placeholder="0.0 - 4.0" class="course-grade" min="0" max="4" step="0.1"></td>
                <td><input type="number" placeholder="1-4" class="course-credits" min="0" step="0.5"></td>
                <td><button class="remove-row-btn" onclick="this.closest('tr').remove()">Remove</button></td>
            `;
            gpaRowsContainer.appendChild(row);
        }

        function calculateGPA() {
            const rows = document.querySelectorAll('.gpa-row');
            let totalPoints = 0;
            let totalCredits = 0;
            let validRows = 0;

            rows.forEach(row => {
                const grade = parseFloat(row.querySelector('.course-grade').value);
                const credits = parseFloat(row.querySelector('.course-credits').value);

                if (!isNaN(grade) && !isNaN(credits) && grade >= 0 && credits > 0) {
                    totalPoints += (grade * credits);
                    totalCredits += credits;
                    validRows++;
                }
            });

            if (validRows === 0) {
                alert('Please add at least one valid course!');
                gpaResult.textContent = '0.00';
                return;
            }

            const gpa = (totalPoints / totalCredits).toFixed(2);
            gpaResult.textContent = gpa;

            // Add animation
            gpaResult.style.animation = 'none';
            setTimeout(() => {
                gpaResult.style.animation = 'fadeIn 0.5s ease-in-out';
            }, 10);
        }

        function resetGPA() {
            gpaRowsContainer.innerHTML = '';
            gpaResult.textContent = '0.00';
            addGPARow();
        }
    }

    // ===================== STUDY TIMER =====================
    function initializeStudyTimer() {
        const timerDisplay = document.getElementById('timer-display');
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        const resetBtn = document.getElementById('timer-reset');
        const sessionsCount = document.getElementById('sessions-count');
        const modeRadios = document.querySelectorAll('input[name="timer-mode"]');

        let timeRemaining = 25 * 60;
        let timerInterval = null;
        let isRunning = false;
        let completedSessions = parseInt(localStorage.getItem('g26_sessions')) || 0;

        sessionsCount.textContent = completedSessions;

        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (!isRunning) {
                    const mode = e.target.value;
                    if (mode === 'work') timeRemaining = 25 * 60;
                    else if (mode === 'break') timeRemaining = 5 * 60;
                    else if (mode === 'long-break') timeRemaining = 15 * 60;
                    updateDisplay();
                }
            });
        });

        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.disabled = true;
                pauseBtn.disabled = false;

                timerInterval = setInterval(() => {
                    timeRemaining--;
                    updateDisplay();

                    if (timeRemaining <= 0) {
                        clearInterval(timerInterval);
                        isRunning = false;
                        startBtn.disabled = false;
                        pauseBtn.disabled = true;

                        // Check if work session ended
                        const currentMode = document.querySelector('input[name="timer-mode"]:checked').value;
                        if (currentMode === 'work') {
                            completedSessions++;
                            localStorage.setItem('g26_sessions', completedSessions);
                            sessionsCount.textContent = completedSessions;
                        }

                        playNotification();
                        alert('Time is up! ' + (currentMode === 'work' ? 'Take a break.' : 'Ready to work again!'));
                    }
                }, 1000);
            }
        });

        pauseBtn.addEventListener('click', () => {
            isRunning = false;
            clearInterval(timerInterval);
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        });

        resetBtn.addEventListener('click', () => {
            isRunning = false;
            clearInterval(timerInterval);
            const mode = document.querySelector('input[name="timer-mode"]:checked').value;
            if (mode === 'work') timeRemaining = 25 * 60;
            else if (mode === 'break') timeRemaining = 5 * 60;
            else if (mode === 'long-break') timeRemaining = 15 * 60;
            updateDisplay();
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        });

        function updateDisplay() {
            const mins = Math.floor(timeRemaining / 60);
            const secs = timeRemaining % 60;
            timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function playNotification() {
            // Try to play a sound using Web Audio API or fallback
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (e) {
                console.log('Audio notification not available');
            }
        }
    }
});
