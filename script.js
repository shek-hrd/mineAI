class AIMiningSim {
    constructor() {
        this.isMining = false;
        this.hashRate = 0;
        this.progress = 0;
        this.sharesFound = 0;
        this.maxHashRate = this.getMaxHashRate();
        this.miningInterval = null;
        this.progressInterval = null;
        this.workerPool = [];
        
        this.bindEvents();
        this.updateDisplay();
        this.detectHardware();
    }

    // Detect user's hardware capabilities for appropriate mining simulation
    detectHardware() {
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        
        // Adjust max hash rate based on detected hardware
        // These are simulated values for demonstration
        if (cores >= 8 && memory >= 8) {
            this.maxHashRate = Math.random() * 2000 + 1500; // High-end: 1.5-3.5 KH/s
        } else if (cores >= 4 && memory >= 4) {
            this.maxHashRate = Math.random() * 1000 + 500; // Mid-range: 0.5-1.5 KH/s
        } else {
            this.maxHashRate = Math.random() * 500 + 200; // Low-end: 0.2-0.7 KH/s
        }
        
        console.log(`Detected ${cores} cores, ${memory}GB RAM. Max hash rate: ${this.maxHashRate.toFixed(1)} H/s`);
    }

    getMaxHashRate() {
        // Base hash rate calculation based on "hardware"
        return Math.random() * 1500 + 300; // 300-1800 H/s range
    }

    bindEvents() {
        // Allow Enter key to submit
        document.getElementById('command-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitQuery();
            }
        });
    }

    startMining() {
        if (this.isMining) return;
        
        this.isMining = true;
        document.body.classList.add('mining-active');
        document.getElementById('mining-status').textContent = 'Mining';
        document.getElementById('mining-status').className = 'value';
        
        // Start mining simulation
        this.miningInterval = setInterval(() => {
            this.simulateMining();
        }, 100);
        
        // Start progress tracking
        this.progressInterval = setInterval(() => {
            this.updateProgress();
        }, 200);
        
        console.log('Mining started');
    }

    stopMining() {
        if (!this.isMining) return;
        
        this.isMining = false;
        document.body.classList.remove('mining-active');
        
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // Gradually reduce hash rate
        const fadeOut = setInterval(() => {
            this.hashRate *= 0.8;
            if (this.hashRate < 10) {
                this.hashRate = 0;
                document.getElementById('mining-status').textContent = 'Idle';
                document.getElementById('mining-status').className = 'value inactive';
                clearInterval(fadeOut);
            }
            this.updateDisplay();
        }, 100);
        
        console.log('Mining stopped');
    }

    simulateMining() {
        // Simulate variable hash rate based on "CPU load"
        const targetHashRate = this.maxHashRate * (0.6 + Math.random() * 0.4);
        const variance = (Math.random() - 0.5) * 100;
        
        this.hashRate = Math.max(0, targetHashRate + variance);
        
        // Simulate finding shares occasionally
        if (Math.random() < 0.02) { // 2% chance per tick
            this.sharesFound++;
            this.showShareFound();
        }
        
        this.updateDisplay();
    }

    updateProgress() {
        if (!this.isMining) return;
        
        // Simulate mining progress
        const progressIncrement = (this.hashRate / this.maxHashRate) * 0.5;
        this.progress += progressIncrement;
        
        if (this.progress > 100) {
            this.progress = 0; // Reset for next round
        }
        
        this.updateProgressBar();
    }

    updateDisplay() {
        document.getElementById('hash-rate').textContent = `${Math.round(this.hashRate)} H/s`;
        document.getElementById('mining-progress').textContent = `${Math.round(this.progress)}%`;
        document.getElementById('shares-found').textContent = this.sharesFound;
    }

    updateProgressBar() {
        document.getElementById('progress-fill').style.width = `${this.progress}%`;
    }

    showShareFound() {
        // Visual feedback for found share
        const statusElement = document.getElementById('shares-found');
        statusElement.style.animation = 'none';
        statusElement.offsetHeight; // Trigger reflow
        statusElement.style.animation = 'pulse 0.5s ease';
    }

    async submitQuery() {
        const input = document.getElementById('command-input');
        const submitBtn = document.getElementById('submit-btn');
        const responseFrame = document.getElementById('response-frame');
        const thinkingIndicator = document.getElementById('thinking-indicator');
        
        const query = input.value.trim();
        if (!query) {
            this.showMessage('Please enter a question or command.', 'error');
            return;
        }
        
        // Disable input during processing
        submitBtn.disabled = true;
        input.disabled = true;
        
        // Show thinking indicator and start mining
        thinkingIndicator.style.display = 'flex';
        responseFrame.innerHTML = '<p class="placeholder">AI is processing your request...</p>';
        
        this.startMining();
        
        try {
            // Simulate AI processing time based on mining speed
            const processingTime = this.calculateProcessingTime();
            const response = await this.simulateAIResponse(query, processingTime);
            
            // Display response
            responseFrame.innerHTML = `<div class="ai-response">${response}</div>`;
            
        } catch (error) {
            responseFrame.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        } finally {
            // Stop mining and re-enable interface
            this.stopMining();
            thinkingIndicator.style.display = 'none';
            submitBtn.disabled = false;
            input.disabled = false;
            input.value = ''; // Clear input
        }
    }

    calculateProcessingTime() {
        // Processing time inversely related to hash rate
        const baseTime = 3000; // 3 seconds base
        const hashRateFactor = Math.max(0.3, this.maxHashRate / 2000); // Scale factor
        return baseTime / hashRateFactor + Math.random() * 2000; // Add some randomness
    }

    async simulateAIResponse(query, processingTime) {
        // Simulate AI processing with realistic delay
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Generate contextual responses based on query content
        const responses = this.generateContextualResponse(query);
        return responses;
    }

    generateContextualResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Mining-related queries
        if (lowerQuery.includes('mining') || lowerQuery.includes('hash') || lowerQuery.includes('cryptocurrency')) {
            return `Mining Analysis for "${query}":

The mining simulation you just experienced represents a proof-of-work computation similar to cryptocurrency mining. During processing, your device performed approximately ${Math.round(this.hashRate * (this.calculateProcessingTime() / 1000))} hash operations.

Key insights:
• Your estimated hash rate: ${Math.round(this.maxHashRate)} H/s
• Shares found during processing: ${this.sharesFound}
• Processing efficiency: ${(this.hashRate / this.maxHashRate * 100).toFixed(1)}%

This demonstrates the fair trade principle - computational resources for AI intelligence.`;
        }
        
        // Technical queries
        if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('explain')) {
            return `Technical Response for "${query}":

Based on the computational work performed during this query (${Math.round(this.hashRate)} H/s average), here's my analysis:

This interface demonstrates a novel approach to AI service provision where users contribute computational resources in exchange for AI responses. The mining simulation ran for ${(this.calculateProcessingTime() / 1000).toFixed(1)} seconds, during which your device contributed processing power.

The system balances resource usage with response quality - lower computational contribution may result in longer processing times, creating a fair exchange mechanism.`;
        }
        
        // General queries
        return `AI Response for "${query}":

Thank you for your computational contribution! During processing, the system achieved:
• Hash rate: ${Math.round(this.hashRate)} H/s
• Processing time: ${(this.calculateProcessingTime() / 1000).toFixed(1)} seconds
• Computational shares: ${this.sharesFound}

Your query has been processed using distributed computation principles. The mining simulation demonstrates how AI services can be powered by user-contributed resources, creating a fair and transparent exchange of computation for intelligence.

This proof-of-concept shows how future AI systems might operate on a contribute-to-use model, ensuring sustainable and democratized access to AI capabilities.`;
    }

    showMessage(message, type = 'info') {
        const responseFrame = document.getElementById('response-frame');
        const className = type === 'error' ? 'error' : 'info';
        responseFrame.innerHTML = `<div class="${className}">${message}</div>`;
    }
}

// Utility functions
function copyWallet() {
    const walletAddress = '0x6f602be9fccf656c8c3e9f36d2064d580264b393';
    navigator.clipboard.writeText(walletAddress).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'rgba(0, 255, 136, 0.3)';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'rgba(0, 212, 255, 0.2)';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy wallet address:', err);
        alert('Failed to copy wallet address. Please copy manually.');
    });
}

function submitQuery() {
    if (window.aiMining) {
        window.aiMining.submitQuery();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.aiMining = new AIMiningSim();
    
    // Add some startup animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('AI Mining Interface initialized');
    console.log('Hardware capabilities detected and mining parameters set');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.aiMining && window.aiMining.isMining) {
        console.log('Page hidden, reducing mining intensity');
        window.aiMining.maxHashRate *= 0.5; // Reduce performance when tab is not active
    } else if (!document.hidden && window.aiMining) {
        window.aiMining.detectHardware(); // Re-detect on focus
    }
});
