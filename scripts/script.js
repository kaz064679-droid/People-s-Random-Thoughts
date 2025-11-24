class ThoughtsApp {
    constructor() {
        this.supabaseUrl = 'https://kwhfizwrdskjztgeqbdq.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3aGZpendyZHNranp0Z2VxYmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Mjc4NjUsImV4cCI6MjA3OTUwMzg2NX0.ocTSnB_9iW42tFDi3neRXXcQbgU2Bz-AOAfYXALwZSo';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadThoughts();
    }

    bindEvents() {
        document.getElementById('publishBtn').addEventListener('click', () => this.publishThought());
    }

    async publishThought() {
        const name = document.getElementById('nameInput').value.trim();
        const thought = document.getElementById('thoughtInput').value.trim();

        if (!thought) {
            this.showNotification('Please enter your thought!');
            return;
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/thoughts`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: name || 'Anonymous',
                    thoughts: thought
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save thought');
            }

            document.getElementById('nameInput').value = '';
            document.getElementById('thoughtInput').value = '';
            await this.loadThoughts();
            this.showNotification('Your thoughts have been published');
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error publishing thought');
        }
    }

    showNotification(message) {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        
        const notificationBox = document.createElement('div');
        notificationBox.className = 'notification-box';
        
        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        
        const button = document.createElement('button');
        button.className = 'notification-button';
        button.textContent = 'Okay';
        button.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        notificationBox.appendChild(messageElement);
        notificationBox.appendChild(button);
        overlay.appendChild(notificationBox);
        
        document.body.appendChild(overlay);
    }

    async loadThoughts() {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/thoughts?select=*&order=created_at.desc&limit=10`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load thoughts');
            }

            const thoughts = await response.json();
            this.displayThoughts(thoughts);
        } catch (error) {
            console.error('Error loading thoughts:', error);
            this.displayThoughts([]);
        }
    }

    displayThoughts(thoughts) {
        const container = document.getElementById('thoughtsContainer');
        
        if (!thoughts || thoughts.length === 0) {
            container.innerHTML = '<div class="empty-message">No thoughts yet. Be the first!</div>';
            return;
        }

        container.innerHTML = thoughts.map(thought => `
            <div class="thought-item">
                <div class="thought-meta">
                    <span class="thought-name">${this.escapeHtml(thought.name)}</span>
                    <span class="thought-time">- ${this.formatTime(thought.created_at)}</span>
                </div>
                <div class="thought-content">${this.escapeHtml(thought.thoughts)}</div>
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        if (!timestamp) return 'just now';
        
        const now = new Date();
        const thoughtTime = new Date(timestamp);
        const diffMs = now - thoughtTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return thoughtTime.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThoughtsApp();
});