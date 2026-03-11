document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const ideaBoard = document.getElementById('idea-board');
    const userNameInput = document.getElementById('user-name');
    const ideaTextInput = document.getElementById('idea-text');
    const submitBtn = document.getElementById('submit-idea');
    const totalIdeasCounter = document.getElementById('total-ideas-counter');
    const sortByDropdown = document.getElementById('sort-by');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const animatedBg = document.getElementById('animated-bg');
    const navLinks = document.querySelectorAll('.nav-link');

    // State
    let ideas = JSON.parse(localStorage.getItem('g26_ideas')) || [];
    let currentTheme = localStorage.getItem('g26_theme') || 'light-theme';
    let currentView = 'home';

    // Initialize
    document.body.className = currentTheme;
    updateThemeButtonText();
    renderIdeas();
    createFloatingElements();
    initializeNavigation();

    // Event Listeners
    submitBtn.addEventListener('click', addIdea);
    sortByDropdown.addEventListener('change', renderIdeas);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Navigation Initialization
    function initializeNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.getAttribute('data-view');
                switchView(viewName);
            });
        });
    }

    // GPA Calculator DOM Elements
    const addCourseBtn = document.getElementById('add-course-btn');
    const courseNameInput = document.getElementById('course-name');
    const courseCreditsInput = document.getElementById('course-credits');
    const courseGradeSelect = document.getElementById('course-grade');
    const courseList = document.getElementById('course-list');
    const gpaValue = document.getElementById('gpa-value');
    const totalCreditsValue = document.getElementById('total-credits');
    const totalQualityPointsValue = document.getElementById('total-quality-points');

    const resetGpaBtn = document.getElementById('reset-gpa-btn');

    // GPA State
    let courses = JSON.parse(localStorage.getItem('g26_courses')) || [];

    // GPA Initializer
    function initializeGPA() {
        renderCourses();
        calculateGPA();
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', addCourse);
        }
        if (resetGpaBtn) {
            resetGpaBtn.addEventListener('click', resetGPA);
        }
    }

    // GPA Functions
    function addCourse() {
        const name = courseNameInput.value.trim();
        const credits = parseFloat(courseCreditsInput.value);
        const gradeValue = parseFloat(courseGradeSelect.value);
        const gradeText = courseGradeSelect.options[courseGradeSelect.selectedIndex].text;

        if (!name || isNaN(credits) || credits <= 0 || isNaN(gradeValue)) {
            alert('Please fill in all fields correctly.');
            return;
        }

        const newCourse = {
            id: Date.now(),
            name: name,
            credits: credits,
            gradeValue: gradeValue,
            gradeText: gradeText
        };

        courses.push(newCourse);
        saveAndRenderCourses();
        
        courseNameInput.value = '';
        courseCreditsInput.value = '';
        courseGradeSelect.value = '4.0';
    }

    function deleteCourse(id) {
        courses = courses.filter(c => c.id !== id);
        saveAndRenderCourses();
    }

    function resetGPA() {
        if (confirm('Are you sure you want to reset your GPA data? This action cannot be undone.')) {
            courses = [];
            saveAndRenderCourses();
        }
    }

    function saveAndRenderCourses() {
        localStorage.setItem('g26_courses', JSON.stringify(courses));
        renderCourses();
        calculateGPA();
    }

    function calculateGPA() {
        let totalCredits = 0;
        let totalQualityPoints = 0;

        courses.forEach(course => {
            totalCredits += course.credits;
            totalQualityPoints += course.gradeValue * course.credits;
        });

        const gpa = totalCredits === 0 ? 0 : totalQualityPoints / totalCredits;

        gpaValue.textContent = gpa.toFixed(2);
        totalCreditsValue.textContent = totalCredits;
        totalQualityPointsValue.textContent = totalQualityPoints.toFixed(2);
    }

    function renderCourses() {
        if (!courseList) return;
        courseList.innerHTML = '';
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHTML(course.name)}</td>
                <td>${course.credits}</td>
                <td>${course.gradeText}</td>
                <td><button class="delete-course-btn" data-id="${course.id}">Delete</button></td>
            `;
            courseList.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-course-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                deleteCourse(id);
            });
        });
    }

    // Switch view logic modification
    function switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show the selected view
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
            currentView = viewName;

            // Re-render ideas when switching to board view
            if (viewName === 'board') {
                renderIdeas();
            } else if (viewName === 'gpa') {
                initializeGPA();
            } else if (viewName === 'timer') {
                initializeTimer();
            }
        }
    }

    // Timer DOM Elements
    const timerTime = document.getElementById('timer-time');
    const timerModeButtons = document.querySelectorAll('.timer-mode-btn');
    const startStopBtn = document.getElementById('timer-start-stop-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // Timer State
    let timerInterval;
    let timerState = {
        mode: 'pomodoro',
        time: 25 * 60,
        isRunning: false,
        tasks: JSON.parse(localStorage.getItem('g26_tasks')) || []
    };

    const timeModes = {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    };

    // Timer Initializer
    function initializeTimer() {
        renderTasks();
        updateTimerDisplay();
        timerModeButtons.forEach(button => {
            button.addEventListener('click', () => switchMode(button.dataset.mode));
        });
        if (startStopBtn) {
            startStopBtn.addEventListener('click', toggleTimer);
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimer);
        }
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', addTask);
        }
    }

    // Timer Functions
    function switchMode(newMode) {
        timerState.mode = newMode;
        timerState.isRunning = false;
        clearInterval(timerInterval);
        timerState.time = timeModes[newMode];
        updateTimerDisplay();
        startStopBtn.textContent = 'Start';
        
        timerModeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.mode === newMode);
        });
    }

    function toggleTimer() {
        timerState.isRunning = !timerState.isRunning;
        if (timerState.isRunning) {
            startStopBtn.textContent = 'Stop';
            timerInterval = setInterval(() => {
                timerState.time--;
                updateTimerDisplay();
                if (timerState.time <= 0) {
                    clearInterval(timerInterval);
                    // Optional: Auto-switch to the next mode
                }
            }, 1000);
        } else {
            startStopBtn.textContent = 'Start';
            clearInterval(timerInterval);
        }
    }

    function resetTimer() {
        timerState.isRunning = false;
        clearInterval(timerInterval);
        timerState.time = timeModes[timerState.mode];
        updateTimerDisplay();
        startStopBtn.textContent = 'Start';
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timerState.time / 60);
        const seconds = timerState.time % 60;
        if (timerTime) {
            timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Task Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            timerState.tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            saveAndRenderTasks();
        }
    }

    function toggleTask(index) {
        timerState.tasks[index].completed = !timerState.tasks[index].completed;
        saveAndRenderTasks();
    }

    function deleteTask(index) {
        timerState.tasks.splice(index, 1);
        saveAndRenderTasks();
    }

    function saveAndRenderTasks() {
        localStorage.setItem('g26_tasks', JSON.stringify(timerState.tasks));
        renderTasks();
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        timerState.tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <span>${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="task-complete-btn" data-index="${index}">✓</button>
                    <button class="task-delete-btn" data-index="${index}">✗</button>
                </div>
            `;
            taskList.appendChild(li);
        });

        document.querySelectorAll('.task-complete-btn').forEach(button => {
            button.addEventListener('click', (e) => toggleTask(e.target.dataset.index));
        });
        document.querySelectorAll('.task-delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteTask(e.target.dataset.index));
        });
    }

    function addIdea() {
        const name = userNameInput.value.trim();
        // Trim whitespace and replace excessive internal spaces with a single space
        const text = ideaTextInput.value.trim().replace(/\s+/g, ' ');

        if (!name || !text) {
            alert('Please fill in both your name and your idea!');
            return;
        }

        // // Profanity filter (Basic check for demonstration)
        // const curseWords = ['badword1', 'badword2', 'badword3']; // Replace with actual words as needed
        // const containsCurse = curseWords.some(word => 
        //     new RegExp(`\\b${word}\\b`, 'i').test(text)
        // );

        // if (containsCurse) {
        //     alert('Your idea contains inappropriate language. Please keep it professional!');
        //     return;
        // }

        // if (text.length > 256) {
        //     alert('Your idea is too long! Please keep it under 256 characters.');
        //     return;
        // }

        // Duplicate check (case-insensitive and whitespace-agnostic)
        const isDuplicate = ideas.some(idea => 
            idea.text.trim().replace(/\s+/g, ' ').toLowerCase() === text.toLowerCase()
        );

        if (isDuplicate) {
            alert('This idea has already been posted! Please share something new.');
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
            userVote: null // 'like', 'dislike', or null
        };

        ideas.push(newIdea);
        saveAndRender();
        
        // Clear inputs
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
            // Undo vote
            idea[type === 'like' ? 'likes' : 'dislikes']--;
            idea.userVote = null;
        } else {
            // Change or add vote
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
        
        // Split into pinned and unpinned
        const pinnedIdeas = ideas.filter(i => i.pinned);
        const unpinnedIdeas = ideas.filter(i => !i.pinned);

        // Sort unpinned ideas
        unpinnedIdeas.sort((a, b) => {
            if (sortMethod === 'time') {
                return b.id - a.id; // Newest first
            } else if (sortMethod === 'total-likes') {
                return b.likes - a.likes;
            }
            return 0;
        });

        // Always put pinned at top
        const sortedIdeas = [...pinnedIdeas, ...unpinnedIdeas];

        // Update Counter
        totalIdeasCounter.textContent = `Total Ideas: ${ideas.length}`;

        // Clear and Render
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

    // Theme Logic
    function toggleTheme() {
        currentTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
        document.body.className = currentTheme;
        localStorage.setItem('g26_theme', currentTheme);
        updateThemeButtonText();
    }

    function updateThemeButtonText() {
        themeToggleBtn.textContent = currentTheme === 'light-theme' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    // Background Animation (Floating Lightbulbs/Sparks)
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

    // Global Action Handlers (for onclick attributes)
    window.handleVoteAction = (id, type) => handleVote(id, type);
    window.handlePinAction = (id) => togglePin(id);
    window.handleDeleteAction = (id) => deleteIdea(id);

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }
});
