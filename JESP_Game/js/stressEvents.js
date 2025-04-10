 * StressEvents module - Handles random stress events that appear on screen
 */
class StressEvents {
    constructor() {
        this.container = document.getElementById('stress-events-container');
        this.eventTypes = [
            {
                name: 'work-email',
                className: 'email-notification',
                text: 'New urgent work email: "Re: The thing we discussed (URGENT)"',
                probability: 0.3
            },
            {
                name: 'child-scream',
                className: 'child-scream',
                text: 'DAAAAAAD! I NEED SOMETHING! NOW!',
                probability: 0.2
            },
            {
                name: 'bank-alert',
                className: 'bank-alert',
                text: 'Bank Alert: Your account balance is below $50',
                probability: 0.15
            },
            {
                name: 'coffee-spill',
                className: 'coffee-spill',
                text: 'Your coffee spilled on your last clean shirt',
                probability: 0.2,
                hasAnimation: true
            },
            {
                name: 'phone-ring',
                className: 'phone-ring',
                text: 'Your phone is ringing. It\'s that call you\'ve been avoiding.',
                probability: 0.15
            }
        ];
        
        // Start stress event loop
        this.setupRandomEvents();
    }
    
    /**
     * Sets up the timer for random stress events to appear
     */
    setupRandomEvents() {
        // Create stress events randomly every 8-15 seconds
        setInterval(() => {
            // Determine if an event should happen based on random chance
            if (Math.random() < 0.7) {
                this.triggerRandomEvent();
            }
        }, 8000);
    }
    
    /**
     * Triggers a random stress event
     */
    triggerRandomEvent() {
        // Select an event based on probability
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const eventType of this.eventTypes) {
            cumulativeProbability += eventType.probability;
            
            if (random <= cumulativeProbability) {
                this.createEvent(eventType);
                break;
            }
        }
    }
    
    /**
     * Creates and displays a stress event
     * @param {Object} eventType - The event configuration
     */
    createEvent(eventType) {
        // Create the event element
        const eventElement = document.createElement('div');
        eventElement.className = `stress-event ${eventType.className}`;
        eventElement.textContent = eventType.text;
        
        // Position randomly on screen (with some margin)
        const marginX = 150; // Keep away from edges
        const marginY = 100;
        const posX = marginX + Math.random() * (window.innerWidth - 2 * marginX);
        const posY = marginY + Math.random() * (window.innerHeight - 2 * marginY);
        
        eventElement.style.left = `${posX}px`;
        eventElement.style.top = `${posY}px`;
        
        // Add to container
        this.container.appendChild(eventElement);
        
        // Handle coffee spill special animation
        if (eventType.hasAnimation && eventType.name === 'coffee-spill') {
            this.createCoffeeSpill(posX, posY);
        }
        
        // Remove after animation completes
        setTimeout(() => {
            if (eventElement.parentNode) {
                eventElement.parentNode.removeChild(eventElement);
            }
        }, 5000);
    }
    
    /**
     * Creates a coffee spill animation
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createCoffeeSpill(x, y) {
        const spillElement = document.createElement('div');
        spillElement.className = 'coffee-splash';
        
        // Position slightly below the notification
        spillElement.style.left = `${x - 20}px`;
        spillElement.style.top = `${y + 40}px`;
        
        // Add to container
        this.container.appendChild(spillElement);
        
        // Remove after animation completes
        setTimeout(() => {
            if (spillElement.parentNode) {
                spillElement.parentNode.removeChild(spillElement);
            }
        }, 3000);
    }
}
