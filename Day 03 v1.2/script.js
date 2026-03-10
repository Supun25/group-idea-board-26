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
            }
        }
    }

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
            if (sortMethod === 'net-likes') {
                return (b.likes - b.dislikes) - (a.likes - a.dislikes);
            } else if (sortMethod === 'time') {
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
