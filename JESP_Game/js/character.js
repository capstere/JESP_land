/**
 * Character module - Handles JESP character state and behaviors
 */
class Character {
    constructor() {
        this.element = document.getElementById('jesp');
        this.sighBubble = document.querySelector('.sigh-bubble');
        this.character = document.querySelector('.character');
        this.rainCloud = document.querySelector('.rain-cloud');
        
        // Position state
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        
        // Movement state
        this.speed = 3; // Slow movement to feel burdened
        this.isMoving = false;
        this.movingDirection = { x: 0, y: 0 };
        
        // Character state
        this.isSighing = false;
        
        // Initialize position
        this.updatePosition();
        
        // Create raindrops
        this.createRaindrops();
        
        // Set up periodic sighing
        this.setupPeriodicSighing();
    }
    
    /**
     * Updates character's position on screen
     */
    updatePosition() {
        // Ensure JESP stays within screen boundaries
        this.x = Math.max(20, Math.min(window.innerWidth - 20, this.x));
        this.y = Math.max(40, Math.min(window.innerHeight - 40, this.y));
        
        // Apply position
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    /**
     * Moves character in the specified direction
     * @param {number} dirX - X direction (-1, 0, 1)
     * @param {number} dirY - Y direction (-1, 0, 1)
     */
    move(dirX, dirY) {
        // Update moving state
        this.isMoving = dirX !== 0 || dirY !== 0;
        this.movingDirection = { x: dirX, y: dirY };
        
        // Apply movement animation class if moving
        if (this.isMoving) {
            this.character.classList.add('moving');
        } else {
            this.character.classList.remove('moving');
        }
        
        // Move at appropriate speed
        this.x += dirX * this.speed;
        this.y += dirY * this.speed;
        
        // Update position
        this.updatePosition();
    }
    
    /**
     * Creates raindrops animation under the rain cloud
     */
    createRaindrops() {
        // Add a few raindrops under the cloud
        for (let i = 0; i < 3; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop';
            raindrop.style.left = `${10 + i * 8}px`;
            raindrop.style.animationDelay = `${i * 0.5}s`;
            this.rainCloud.appendChild(raindrop);
        }
    }
    
    /**
     * Sets up periodic sighing behavior
     */
    setupPeriodicSighing() {
        // JESP sighs randomly every 10-20 seconds
        setInterval(() => {
            if (!this.isSighing && Math.random() < 0.7) {
                this.sigh();
            }
        }, 10000);
    }
    
    /**
     * Triggers a sighing animation
     */
    sigh() {
        if (this.isSighing) return;
        
        this.isSighing = true;
        this.sighBubble.classList.remove('hidden');
        this.sighBubble.classList.add('visible');
        
        // Slightly slouch during sighing
        const arms = this.character.querySelector('.arms');
        arms.style.transform = 'rotate(8deg)';
        
        // Remove sigh bubble after a few seconds
        setTimeout(() => {
            this.sighBubble.classList.remove('visible');
            setTimeout(() => {
                this.sighBubble.classList.add('hidden');
                arms.style.transform = 'rotate(0deg)';
                this.isSighing = false;
            }, 500);
        }, 2000);
    }
    
    /**
     * Handles window resizing
     */
    handleResize() {
        // Keep JESP in bounds when window resizes
        this.x = Math.min(this.x, window.innerWidth - 20);
        this.y = Math.min(this.y, window.innerHeight - 40);
        this.updatePosition();
    }
}
