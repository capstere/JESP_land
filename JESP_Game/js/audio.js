/**
 * Audio System - Handles all game audio using Web Audio API
 * No external sound files needed - all sounds generated programmatically
 */
class AudioSystem {
    constructor() {
        // Initialize audio context
        this.context = null;
        this.isMuted = false;
        this.currentMusic = null;
        
        // Try to initialize audio context
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            console.log('Audio context initialized');
        } catch (e) {
            console.warn('Web Audio API not supported in this browser');
            this.isMuted = true;
        }
        
        // Setup mute toggle
        document.getElementById('mute-btn').addEventListener('click', () => {
            this.toggleMute();
        });
    }
    
    // Helper method to ensure context is running (needed for Chrome's autoplay policy)
    ensureContext() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
    
    /**
     * Play menu music - a sad, boring melody
     */
    playMenuMusic() {
        if (this.isMuted || !this.context) return;
        
        this.stopAllMusic();
        this.ensureContext();
        
        // Create oscillators for a simple, sad melody
        const melody = [
            { note: 'A3', duration: 1.0 },
            { note: 'C4', duration: 1.0 },
            { note: 'B3', duration: 1.5 },
            { note: 'G3', duration: 1.5 },
            { note: 'F3', duration: 1.0 },
        ];
        
        // Convert notes to frequencies
        const notes = {
            'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 
            'B3': 246.94, 'C4': 261.63
        };
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.2; // Quiet volume
        gainNode.connect(this.context.destination);
        
        // How long to wait before playing the next note
        let startTime = this.context.currentTime;
        
        // Create a loop that repeats the melody
        const playNextNote = () => {
            if (this.isMuted) return;
            
            for (let i = 0; i < melody.length; i++) {
                const note = melody[i];
                const osc = this.context.createOscillator();
                osc.type = 'sine'; // Smooth, sad sound
                osc.frequency.value = notes[note.note];
                
                // Create a gain node for this note's envelope
                const noteGain = this.context.createGain();
                noteGain.gain.setValueAtTime(0, startTime + (i * 1.5));
                noteGain.gain.linearRampToValueAtTime(0.2, startTime + (i * 1.5) + 0.1);
                noteGain.gain.linearRampToValueAtTime(0.1, startTime + (i * 1.5) + note.duration - 0.2);
                noteGain.gain.linearRampToValueAtTime(0, startTime + (i * 1.5) + note.duration);
                
                osc.connect(noteGain);
                noteGain.connect(gainNode);
                
                osc.start(startTime + (i * 1.5));
                osc.stop(startTime + (i * 1.5) + note.duration);
            }
            
            // Schedule the next loop
            startTime += melody.length * 1.5;
            setTimeout(playNextNote, (melody.length * 1.5 * 1000) - 100);
        };
        
        // Start the melody
        playNextNote();
        
        this.currentMusic = 'menu';
    }
    
    /**
     * Play game music - ambient, melancholic tones
     */
    playGameMusic() {
        if (this.isMuted || !this.context) return;
        
        this.stopAllMusic();
        this.ensureContext();
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.15; // Very quiet
        gainNode.connect(this.context.destination);
        
        // Create a low drone sound
        const drone = this.context.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 65.41; // C2 - very low
        drone.connect(gainNode);
        drone.start();
        
        // Create a sad pad sound with subtle modulation
        const pad = this.context.createOscillator();
        pad.type = 'sine';
        pad.frequency.value = 196.00; // G3
        
        // Add slight pitch modulation for ethereal effect
        const modulator = this.context.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.value = 0.2; // Very slow modulation
        
        const modulationDepth = this.context.createGain();
        modulationDepth.gain.value = 2; // Small pitch variations
        
        modulator.connect(modulationDepth);
        modulationDepth.connect(pad.frequency);
        
        // Add slight tremolo
        const tremolo = this.context.createGain();
        const tremoloOsc = this.context.createOscillator();
        tremoloOsc.type = 'sine';
        tremoloOsc.frequency.value = 0.8; // Slow tremolo
        
        const tremoloDepth = this.context.createGain();
        tremoloDepth.gain.value = 0.1; // Subtle volume changes
        
        tremoloOsc.connect(tremoloDepth);
        tremoloDepth.connect(tremolo.gain);
        
        pad.connect(tremolo);
        tremolo.connect(gainNode);
        
        pad.start();
        modulator.start();
        tremoloOsc.start();
        
        // Store references for stopping
        this.gameMusic = {
            nodes: [drone, pad, modulator, tremoloOsc],
            gainNode: gainNode
        };
        
        this.currentMusic = 'game';
    }
    
    /**
     * Stop all music
     */
    stopAllMusic() {
        if (this.gameMusic) {
            this.gameMusic.nodes.forEach(node => {
                try {
                    node.stop();
                    node.disconnect();
                } catch (e) { /* Ignore if already stopped */ }
            });
            this.gameMusic.gainNode.disconnect();
            this.gameMusic = null;
        }
        
        this.currentMusic = null;
    }
    
    /**
     * Play a footstep sound
     */
    playFootstep() {
        if (this.isMuted || !this.context) return;
        this.ensureContext();
        
        // Create a short, dull thud sound
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.15;
        gainNode.connect(this.context.destination);
        
        // Create noise for the footstep
        const bufferSize = this.context.sampleRate * 0.15; // 150ms
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        
        // Add a filter to shape the sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150 + Math.random() * 100;
        filter.Q.value = 1.0;
        
        // Shape the envelope
        const envelopeGain = this.context.createGain();
        const now = this.context.currentTime;
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.2, now + 0.02);
        envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        noise.connect(filter);
        filter.connect(envelopeGain);
        envelopeGain.connect(gainNode);
        
        noise.start();
        noise.stop(now + 0.15);
    }
    
    /**
     * Play a random groan sound
     */
    playRandomGroan() {
        if (this.isMuted || !this.context) return;
        this.ensureContext();
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.2;
        gainNode.connect(this.context.destination);
        
        // Create an oscillator for the groan
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        
        // Random base frequency for different groans
        const baseFreq = 110 + Math.random() * 20;
        osc.frequency.value = baseFreq;
        
        // Add filter for vocal-like quality
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = baseFreq * 3;
        filter.Q.value = 0.5;
        
        // Shape the envelope and pitch
        const envelopeGain = this.context.createGain();
        const now = this.context.currentTime;
        
        // Volume envelope
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        envelopeGain.gain.linearRampToValueAtTime(0.1, now + 0.3);
        envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        // Pitch envelope (dropping pitch for sigh effect)
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.8);
        
        osc.connect(filter);
        filter.connect(envelopeGain);
        envelopeGain.connect(gainNode);
        
        osc.start();
        osc.stop(now + 0.8);
    }
    
    /**
     * Play can kicking sound
     */
    playCanKick() {
        if (this.isMuted || !this.context) return;
        this.ensureContext();
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.25;
        gainNode.connect(this.context.destination);
        
        // Create a metallic ping sound
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 700 + Math.random() * 200;
        
        // Add high-pass filter for metallic sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 500;
        
        // Create a short, sharp envelope
        const envelopeGain = this.context.createGain();
        const now = this.context.currentTime;
        
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        // Add slight pitch drop
        osc.frequency.setValueAtTime(700 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);
        
        osc.connect(filter);
        filter.connect(envelopeGain);
        envelopeGain.connect(gainNode);
        
        osc.start();
        osc.stop(now + 0.3);
    }
    
    /**
     * Play a random laugh sound
     */
    playRandomLaugh() {
        if (this.isMuted || !this.context) return;
        this.ensureContext();
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.2;
        gainNode.connect(this.context.destination);
        
        // Create multiple short bursts for "ha ha" effect
        const laughCount = 2 + Math.floor(Math.random() * 3); // 2-4 "ha"s
        const now = this.context.currentTime;
        
        for (let i = 0; i < laughCount; i++) {
            const startTime = now + (i * 0.2); // Timing for each "ha"
            
            // Create oscillator for laugh sound
            const osc = this.context.createOscillator();
            osc.type = 'square';
            
            // Random frequency for different laughs
            const baseFreq = 200 + Math.random() * 50;
            osc.frequency.value = baseFreq;
            
            // Filter to shape the sound
            const filter = this.context.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = baseFreq * 2;
            filter.Q.value = 1.0;
            
            // Envelope for each "ha"
            const envelopeGain = this.context.createGain();
            envelopeGain.gain.setValueAtTime(0, startTime);
            envelopeGain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            envelopeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
            
            // Pitch envelope (each "ha" drops in pitch)
            osc.frequency.setValueAtTime(baseFreq, startTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, startTime + 0.15);
            
            osc.connect(filter);
            filter.connect(envelopeGain);
            envelopeGain.connect(gainNode);
            
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        }
    }
    
    /**
     * Play a random clapping sound
     */
    playRandomClap() {
        if (this.isMuted || !this.context) return;
        this.ensureContext();
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.25;
        gainNode.connect(this.context.destination);
        
        // Create a noise burst for the clap
        const bufferSize = this.context.sampleRate * 0.1; // 100ms
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        
        // Add filter for clap sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1.0;
        
        // Shape the envelope
        const envelopeGain = this.context.createGain();
        const now = this.context.currentTime;
        
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        noise.connect(filter);
        filter.connect(envelopeGain);
        envelopeGain.connect(gainNode);
        
        noise.start();
        noise.stop(now + 0.1);
    }
    
    /**
     * Play specific event sounds
     */
    playEventSound(eventName) {
        if (this.isMuted || !this.context) return;
        this.ensureContext();
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.25;
        gainNode.connect(this.context.destination);
        
        const now = this.context.currentTime;
        
        switch (eventName) {
            case 'bankAlert':
                // Short alert beep
                this.playBeepSound(440, 0.1, 0.2, gainNode);
                setTimeout(() => {
                    this.playBeepSound(330, 0.1, 0.2, gainNode);
                }, 200);
                break;
                
            case 'phoneRing':
                // Phone ringing effect
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.playBeepSound(880, 0.2, 0.2, gainNode);
                    }, i * 800);
                }
                break;
                
            case 'anxietyAttack':
                // Rapid heartbeat sound
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.playHeartbeatSound(gainNode);
                    }, i * 300);
                }
                break;
                
            case 'burnedToast':
                // Alarm beep sound
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.playBeepSound(660, 0.15, 0.2, gainNode);
                    }, i * 400);
                }
                break;
                
            default:
                // Generic notification sound
                this.playBeepSound(523.25, 0.2, 0.25, gainNode);
                break;
        }
    }
    
    /**
     * Helper to play a simple beep sound
     */
    playBeepSound(frequency, duration, volume, gainNode) {
        if (this.isMuted || !this.context) return;
        
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        const noteGain = this.context.createGain();
        const now = this.context.currentTime;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(volume, now + 0.01);
        noteGain.gain.linearRampToValueAtTime(volume, now + duration - 0.05);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.connect(noteGain);
        noteGain.connect(gainNode || this.context.destination);
        
        osc.start();
        osc.stop(now + duration);
    }
    
    /**
     * Helper to play a heartbeat sound
     */
    playHeartbeatSound(gainNode) {
        if (this.isMuted || !this.context) return;
        
        const bufferSize = this.context.sampleRate * 0.2; // 200ms
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a dull thud sound
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        
        // Filter for heartbeat sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        
        // Shape the envelope for a "thud-thud" effect
        const envelopeGain = this.context.createGain();
        const now = this.context.currentTime;
        
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
        envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        noise.connect(filter);
        filter.connect(envelopeGain);
        envelopeGain.connect(gainNode || this.context.destination);
        
        noise.start();
        noise.stop(now + 0.2);
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopAllMusic();
            document.getElementById('mute-btn').textContent = '🔇';
        } else {
            this.ensureContext();
            if (this.currentMusic === 'game') {
                this.playGameMusic();
            } else {
                this.playMenuMusic();
            }
            document.getElementById('mute-btn').textContent = '🔊';
        }
    }
}
