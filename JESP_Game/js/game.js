/**
 * Main game script - Initializes and manages game state
 */
class Game {
    constructor() {
        // Wait for DOM to be fully loaded
        this.initialize();
    }
    
    /**
     * Initializes the game
     */
    initialize() {
        console.log('Initializing JESP - A Life Simulator');
        
        // Create character
        this.jesp = new Character();
        
        // Set up controls
        this.controls = new Controls(this.jesp);
        
        // Create stress events manager
        this.stressEvents = new StressEvents();
        
        // Start the game loop
        this.startGameLoop();
        
        // Set up background mood changes
        this.setupBackgroundChanges();
        
        console.log('Game initialized. Press WASD to move JESP or use on-screen controls on mobile.');
    }
    
    /**
     * Starts the main game loop
     */
    startGameLoop() {
        // Main game loop - runs at 60fps
        this.gameLoopInterval = setInterval(() => {
            // Game logic updates here
            // Currently handled by event-based movement and periodic events
        }, 1000 / 60);
    }
    
    /**
     * Sets up random background color changes to reflect mood
     */
    setupBackgroundChanges() {
        // Every 20-40 seconds, slightly change the background color
        // to represent JESP's shifting mood (all equally bleak)
        setInterval(() => {
            const world = document.getElementById('world');
            
            // Remove previous transition class if any
            world.classList.remove('dark-transition');
            
            // Generate a slightly different background color
            // Keeping it in gray/beige tones to maintain the mood
            const hue = Math.floor(Math.random() * 30) + 180; // Mostly bluish/grayish
            const saturation = Math.floor(Math.random() * 10) + 5; // Low saturation
            const lightness = Math.floor(Math.random() * 15) + 75; // Mostly light
            
            // Apply new color
            world.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            // Maybe add transition class
            if (Math.random() < 0.3) {
                world.classList.add('dark-transition');
            }
        }, 30000);
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});