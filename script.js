class AIMiningSim {
    constructor() {
        this.isMining = false;
        this.hashRate = 0;
        this.progress = 0;
        this.hashesSaved = 0;
        this.sessionId = this.generateSessionId();
        this.maxHashRate = this.getMaxHashRate();
        this.miningInterval = null;
        this.progressInterval = null;
        this.workerPool = [];
        this.currentHashes = [];
        this.fileCounter = this.getNextFileNumber();
        
        this.bindEvents();
        this.updateDisplay();
        this.detectHardware();
        this.initializeSession();
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

    generateSessionId() {
        return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    getNextFileNumber() {
        const saved = localStorage.getItem('mineAI_fileCounter');
        const current = saved ? parseInt(saved) + 1 : 1;
        localStorage.setItem('mineAI_fileCounter', current.toString());
        return current;
    }

    initializeSession() {
        document.getElementById('session-id').textContent = this.sessionId.substr(-8);
        console.log(`Session initialized: ${this.sessionId}`);
    }

    bindEvents() {
        const input = document.getElementById('command-input');
        
        // Allow Enter key to submit (without Ctrl)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitQuery();
            }
        });

        // Prevent form submission on Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
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

    async performRealMining() {
        // Perform actual SHA-256 hash computation
        const data = `${this.sessionId}_${Date.now()}_${Math.random().toString(36)}`;
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Check if hash meets difficulty target (starts with zeros)
        const difficulty = 4; // Adjust difficulty as needed
        if (hashHex.startsWith('0'.repeat(difficulty))) {
            this.currentHashes.push({
                hash: hashHex,
                timestamp: Date.now(),
                nonce: data,
                difficulty: difficulty
            });
            this.hashesSaved++;
            this.showHashFound();
        }
        
        return hashHex;
    }

    simulateMining() {
        // Simulate variable hash rate based on "CPU load"
        const targetHashRate = this.maxHashRate * (0.6 + Math.random() * 0.4);
        const variance = (Math.random() - 0.5) * 100;
        
        this.hashRate = Math.max(0, targetHashRate + variance);
        
        // Perform actual mining computation
        this.performRealMining();
        
        this.updateDisplay();
    }

    updateProgress() {
        if (!this.isMining) return;
        
        // Simulate mining progress
        const progressIncrement = (this.hashRate / this.maxHashRate) * 0.5;
        this.progress += progressIncrement;
        
        // Save hashes when reaching 100%
        if (this.progress >= 100) {
            this.saveHashesToFile();
            this.progress = 0; // Reset for next round
        }
        
        this.updateProgressBar();
    }

    async saveHashesToFile() {
        if (this.currentHashes.length === 0) return;
        
        const hashData = {
            sessionId: this.sessionId,
            fileNumber: this.fileCounter,
            timestamp: new Date().toISOString(),
            totalHashes: this.currentHashes.length,
            hashes: this.currentHashes
        };
        
        const filename = `mining_hashes_${this.fileCounter.toString().padStart(6, '0')}.json`;
        const jsonString = JSON.stringify(hashData, null, 2);
        
        try {
            // Create and download file
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Saved ${this.currentHashes.length} hashes to ${filename}`);
            
            // Reset for next batch
            this.currentHashes = [];
            this.fileCounter = this.getNextFileNumber();
            
        } catch (error) {
            console.error('Error saving hash file:', error);
        }
    }

    updateDisplay() {
        document.getElementById('hash-rate').textContent = `${Math.round(this.hashRate)} H/s`;
        document.getElementById('mining-progress').textContent = `${Math.round(this.progress)}%`;
        document.getElementById('hashes-saved').textContent = this.hashesSaved;
    }

    updateProgressBar() {
        document.getElementById('progress-fill').style.width = `${this.progress}%`;
    }

    showHashFound() {
        // Visual feedback for found hash
        const statusElement = document.getElementById('hashes-saved');
        statusElement.style.animation = 'none';
        statusElement.offsetHeight; // Trigger reflow
        statusElement.style.animation = 'pulse 0.5s ease';
        
        // Also flash the progress bar
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.boxShadow = '0 0 10px #00ff88';
        setTimeout(() => {
            progressFill.style.boxShadow = 'none';
        }, 500);
    }

    async submitQuery() {
        const input = document.getElementById('command-input');
        const responseFrame = document.getElementById('response-frame');
        const thinkingIndicator = document.getElementById('thinking-indicator');
        
        const query = input.value.trim();
        if (!query) {
            this.showMessage('Please enter a question or command.', 'error');
            return;
        }
        
        // Disable input during processing
        input.disabled = true;
        input.style.opacity = '0.6';
        
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
            input.disabled = false;
            input.style.opacity = '1';
            input.value = ''; // Clear input
        }
    }

    calculateProcessingTime() {
        // Processing time inversely related to hash rate
        const baseTime = 3000; // 3 seconds base
        const hashRateFactor = Math.max(0.3, this.maxHashRate / 2000); // Scale factor
        return baseTime / hashRateFactor + Math.random() * 2000; // Add some randomness
    }

    async callRealAI(query) {
        // Try multiple AI services in order of preference
        const aiServices = [
            { name: 'OpenAI', func: this.callOpenAI },
            { name: 'Anthropic', func: this.callAnthropic },
            { name: 'Local', func: this.callLocalAI }
        ];
        
        for (const service of aiServices) {
            try {
                const response = await service.func.call(this, query);
                if (response) {
                    return `[${service.name} AI Response]\n\n${response}`;
                }
            } catch (error) {
                console.log(`${service.name} AI failed:`, error.message);
                continue;
            }
        }
        
        // Fallback to local processing
        return this.generateContextualResponse(query);
    }

    async callOpenAI(query) {
        // Note: This requires an API key - implement if available
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) throw new Error('OpenAI API key not found');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: query }],
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async callAnthropic(query) {
        // Note: This requires an API key - implement if available
        const apiKey = localStorage.getItem('anthropic_api_key');
        if (!apiKey) throw new Error('Anthropic API key not found');
        
        // Anthropic API implementation would go here
        throw new Error('Anthropic API not implemented in demo');
    }
    
    async callLocalAI(query) {
        // Attempt to call a local AI service (like Ollama)
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama2',
                    prompt: query,
                    stream: false
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch (error) {
            throw new Error('Local AI service not available');
        }
    }

    async simulateAIResponse(query, processingTime) {
        // Continue mining during AI processing
        const startTime = Date.now();
        let aiResponse;
        
        try {
            // Try real AI first
            aiResponse = await this.callRealAI(query);
        } catch (error) {
            // Fallback to simulated response
            await new Promise(resolve => setTimeout(resolve, processingTime));
            aiResponse = this.generateContextualResponse(query);
        }
        
        const actualProcessingTime = Date.now() - startTime;
        console.log(`AI processing took ${actualProcessingTime}ms`);
        
        return aiResponse;
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
        const addressElement = document.querySelector('.address');
        const originalBg = addressElement.style.background;
        const originalText = addressElement.textContent;
        
        addressElement.textContent = 'Copied to clipboard!';
        addressElement.style.background = 'rgba(0, 255, 136, 0.4)';
        
        setTimeout(() => {
            addressElement.textContent = originalText;
            addressElement.style.background = originalBg;
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
