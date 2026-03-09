document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const ideaInput = document.getElementById('idea-input');
    const addIdeaBtn = document.getElementById('add-idea-btn');
    const resetBoardBtn = document.getElementById('reset-board-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const ideaListContainer = document.getElementById('idea-list');

    // Initialize data
    let ideas = JSON.parse(localStorage.getItem('ideas')) || [
        { id: 1, text: 'Build a study planner', author: 'Alice', likes: 0, dislikes: 0, pinned: false, userVote: null, timestamp: new Date().toLocaleString() },
        { id: 2, text: 'Start a podcast', author: 'Bob', likes: 0, dislikes: 0, pinned: false, userVote: null, timestamp: new Date().toLocaleString() },
        { id: 3, text: 'Organize a coding workshop', author: 'Charlie', likes: 0, dislikes: 0, pinned: false, userVote: null, timestamp: new Date().toLocaleString() }
    ];
    let idCounter = ideas.length > 0 ? Math.max(...ideas.map(i => i.id)) + 1 : 1;

    // Theme toggle
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
        }
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });

    // Add idea
    addIdeaBtn.addEventListener('click', addIdea);
    ideaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addIdea();
    });

    function addIdea() {
        const name = nameInput.value.trim();
        const text = ideaInput.value.trim();

        if (!name) {
            alert('Please enter your name.');
            nameInput.focus();
            return;
        }

        if (!text) {
            alert('Please enter an idea.');
            ideaInput.focus();
            return;
        }

        const newIdea = {
            id: idCounter++,
            text: text,
            author: name,
            likes: 0,
            dislikes: 0,
            pinned: false,
            userVote: null,
            timestamp: new Date().toLocaleString()
        };

        ideas.unshift(newIdea);
        saveData();
        renderIdeas();

        nameInput.value = '';
        ideaInput.value = '';
        ideaInput.focus();
    }

    // Reset board
    resetBoardBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all ideas? This cannot be undone.')) {
            ideas = [];
            saveData();
            renderIdeas();
        }
    });

    // Delete idea
    function deleteIdea(id) {
        ideas = ideas.filter(idea => idea.id !== id);
        saveData();
        renderIdeas();
    }

    // Pin/Unpin idea
    function togglePin(id) {
        const idea = ideas.find(i => i.id === id);
        if (idea) {
            idea.pinned = !idea.pinned;
            saveData();
            renderIdeas();
        }
    }

    // Vote on idea (like/dislike)
    function vote(id, voteType) {
        const idea = ideas.find(i => i.id === id);
        if (!idea) return;

        // Remove previous vote
        if (idea.userVote === 'like') {
            idea.likes--;
        } else if (idea.userVote === 'dislike') {
            idea.dislikes--;
        }

        // Apply new vote
        if (idea.userVote === voteType) {
            // Clicking same vote again unvotes
            idea.userVote = null;
        } else {
            if (voteType === 'like') {
                idea.likes++;
            } else if (voteType === 'dislike') {
                idea.dislikes++;
            }
            idea.userVote = voteType;
        }

        saveData();
        renderIdeas();
    }

    // Sort ideas: pinned first, then by likes desc
    function sortIdeas() {
        const pinned = ideas.filter(i => i.pinned);
        const unpinned = ideas.filter(i => !i.pinned);
        
        unpinned.sort((a, b) => b.likes - a.likes);
        
        return [...pinned, ...unpinned];
    }

    // Render ideas
    function renderIdeas() {
        ideaListContainer.innerHTML = '';

        // Update idea count
        const countDisplay = document.getElementById('count-display');
        if (countDisplay) {
            countDisplay.textContent = `${ideas.length} ${ideas.length === 1 ? 'idea' : 'ideas'}`;
        }

        if (ideas.length === 0) {
            ideaListContainer.innerHTML = '<div class="empty-state"><p>✨ No ideas yet. Be the first to add one!</p></div>';
            return;
        }

        const sorted = sortIdeas();

        sorted.forEach(idea => {
            const card = document.createElement('div');
            card.className = `idea-card ${idea.pinned ? 'pinned' : ''}`;

            const isLiked = idea.userVote === 'like';
            const isDisliked = idea.userVote === 'dislike';

            card.innerHTML = `
                <div class="idea-content">
                    <div class="idea-text">${escapeHtml(idea.text)}</div>
                    <div class="idea-meta">
                        <span>By <span class="idea-author">${escapeHtml(idea.author)}</span></span>
                        <span class="idea-timestamp">📅 ${idea.timestamp}</span>
                    </div>
                </div>
                <div class="idea-buttons">
                    <button class="btn-card btn-like ${isLiked ? 'active' : ''}" data-id="${idea.id}" data-vote="like">
                        👍 <span class="vote-counter">${idea.likes}</span>
                    </button>
                    <button class="btn-card btn-dislike ${isDisliked ? 'active' : ''}" data-id="${idea.id}" data-vote="dislike">
                        👎 <span class="vote-counter">${idea.dislikes}</span>
                    </button>
                    <button class="btn-card btn-pin ${idea.pinned ? 'pinned' : ''}" data-id="${idea.id}">
                        ${idea.pinned ? '📍 Unpin' : '📌 Pin'}
                    </button>
                    <button class="btn-card btn-delete" data-id="${idea.id}">🗑️ Delete</button>
                </div>
            `;

            // Add event listeners
            card.querySelector('.btn-like').addEventListener('click', () => vote(idea.id, 'like'));
            card.querySelector('.btn-dislike').addEventListener('click', () => vote(idea.id, 'dislike'));
            card.querySelector('.btn-pin').addEventListener('click', () => togglePin(idea.id));
            card.querySelector('.btn-delete').addEventListener('click', () => deleteIdea(idea.id));

            ideaListContainer.appendChild(card);
        });
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, char => map[char]);
    }

    // Initialize
    initTheme();
    renderIdeas();
});
