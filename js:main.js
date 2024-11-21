// Module State Management
const ModuleState = {
    currentSection: 'intro',
    progress: 0,
    completedSections: new Set(),
    practiceStats: {
        attempted: 0,
        correct: 0,
        currentTopic: 'propositions',
        difficulty: 'beginner'
    },
    assessment: {
        isStarted: false,
        isComplete: false,
        timeRemaining: 1800, // 30 minutes in seconds
        answers: new Map(),
        score: 0
    }
};

// Content Database
const ContentDatabase = {
    propositions: [
        {
            id: 'prop1',
            statement: "The sum of 2 and 2 is 4",
            isProposition: true,
            explanation: "This is a proposition as it has a definite truth value (true)."
        },
        {
            id: 'prop2',
            statement: "What time is it?",
            isProposition: false,
            explanation: "This is not a proposition as it is a question."
        },
        {
            id: 'prop3',
            statement: "Close the door",
            isProposition: false,
            explanation: "This is not a proposition as it is a command."
        },
        {
            id: 'prop4',
            statement: "Paris is the capital of France",
            isProposition: true,
            explanation: "This is a proposition as it has a definite truth value (true)."
        }
    ],
    truthTables: [
        {
            id: 'tt1',
            expression: 'P ∧ Q',
            difficulty: 'beginner',
            solution: [
                { P: true, Q: true, result: true },
                { P: true, Q: false, result: false },
                { P: false, Q: true, result: false },
                { P: false, Q: false, result: false }
            ],
            explanation: "Conjunction (AND) is true only when both inputs are true."
        },
        {
            id: 'tt2',
            expression: 'P ∨ Q',
            difficulty: 'beginner',
            solution: [
                { P: true, Q: true, result: true },
                { P: true, Q: false, result: true },
                { P: false, Q: true, result: true },
                { P: false, Q: false, result: false }
            ],
            explanation: "Disjunction (OR) is true when at least one input is true."
        }
    ],
    predicates: [
        {
            id: 'pred1',
            text: "All numbers greater than 5 are positive",
            solution: "∀x(x > 5 → x > 0)",
            difficulty: 'intermediate',
            explanation: "We use universal quantifier (∀) because this applies to all numbers."
        }
    ]
};

// Module Initialization
document.addEventListener('DOMContentLoaded', initializeModule);

function initializeModule() {
    setupNavigation();
    setupInteractiveComponents();
    loadProgress();
    initializeFirstSection();
}

// Navigation Setup
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.section;
            switchSection(sectionId);
        });
    });
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        ModuleState.currentSection = sectionId;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        // Update progress
        if (!ModuleState.completedSections.has(sectionId)) {
            ModuleState.completedSections.add(sectionId);
            updateProgress(10);
        }
    }
}

// Progress Management
function updateProgress(amount) {
    ModuleState.progress = Math.min(100, ModuleState.progress + amount);
    updateProgressUI();
    saveProgress();
}

function updateProgressUI() {
    const progressBar = document.getElementById('progress-bar');
    const progressValue = document.getElementById('progress-value');
    
    if (progressBar && progressValue) {
        progressBar.style.width = `${ModuleState.progress}%`;
        progressValue.textContent = `${Math.round(ModuleState.progress)}%`;
    }
}

function saveProgress() {
    localStorage.setItem('logicModuleProgress', JSON.stringify({
        progress: ModuleState.progress,
        completedSections: Array.from(ModuleState.completedSections),
        practiceStats: ModuleState.practiceStats
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('logicModuleProgress');
    if (saved) {
        const data = JSON.parse(saved);
        ModuleState.progress = data.progress;
        ModuleState.completedSections = new Set(data.completedSections);
        ModuleState.practiceStats = data.practiceStats;
        updateProgressUI();
    }
}
// Truth Table Implementation
class TruthTableGenerator {
    constructor() {
        this.variables = new Set();
        this.expression = '';
    }

    generateTable(expression) {
        this.expression = expression;
        this.variables = this.extractVariables();
        const combinations = this.generateCombinations();
        return this.evaluateAndRender(combinations);
    }

    extractVariables() {
        return new Set(this.expression.match(/[A-Z]/g));
    }

    generateCombinations() {
        const variables = Array.from(this.variables);
        const numCombinations = Math.pow(2, variables.length);
        const combinations = [];

        for (let i = 0; i < numCombinations; i++) {
            const combination = {};
            variables.forEach((variable, index) => {
                combination[variable] = !!(i & (1 << (variables.length - 1 - index)));
            });
            combinations.push(combination);
        }

        return combinations;
    }

    evaluateAndRender(combinations) {
        const table = document.createElement('table');
        table.className = 'truth-table';
        
        // Create header
        const header = table.createTHead();
        const headerRow = header.insertRow();
        
        // Add variable columns
        Array.from(this.variables).forEach(variable => {
            const th = document.createElement('th');
            th.textContent = variable;
            headerRow.appendChild(th);
        });
        
        // Add result column
        const resultTh = document.createElement('th');
        resultTh.textContent = this.expression;
        headerRow.appendChild(resultTh);

        // Create body
        const tbody = table.createTBody();
        combinations.forEach(combination => {
            const row = tbody.insertRow();
            Array.from(this.variables).forEach(variable => {
                const cell = row.insertCell();
                cell.textContent = combination[variable] ? 'T' : 'F';
            });
            
            // Evaluate and add result
            const resultCell = row.insertCell();
            resultCell.textContent = this.evaluate(combination) ? 'T' : 'F';
        });

        return table;
    }

    evaluate(values) {
        try {
            return this.parseExpression(values);
        } catch (error) {
            throw new Error('Invalid expression');
        }
    }

    parseExpression(values) {
        const tokens = this.tokenize(this.expression);
        return this.parseTokens(tokens, values);
    }

    tokenize(expression) {
        const tokens = [];
        let current = '';
        
        for (let char of expression) {
            if ('∧∨→↔¬()'.includes(char)) {
                if (current) tokens.push(current);
                tokens.push(char);
                current = '';
            } else if (!char.trim()) {
                if (current) tokens.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        if (current) tokens.push(current);
        
        return tokens;
    }

    parseTokens(tokens, values) {
        // Parse using recursive descent
        let position = 0;

        const parseAtom = () => {
            const token = tokens[position];
            if (token === '(') {
                position++;
                const result = parseOr();
                position++;
                return result;
            }
            if (token === '¬') {
                position++;
                return !parseAtom();
            }
            if (token in values) {
                position++;
                return values[token];
            }
            throw new Error(`Invalid token: ${token}`);
        };

        const parseAnd = () => {
            let left = parseAtom();
            while (tokens[position] === '∧') {
                position++;
                const right = parseAtom();
                left = left && right;
            }
            return left;
        };

        const parseOr = () => {
            let left = parseAnd();
            while (tokens[position] === '∨') {
                position++;
                const right = parseAnd();
                left = left || right;
            }
            return left;
        };

        return parseOr();
    }
}

// Practice Problem System
class PracticeProblemManager {
    constructor() {
        this.currentProblem = null;
        this.problems = [];
        this.index = 0;
    }

    initialize(type = 'propositions') {
        this.problems = this.loadProblems(type);
        this.index = 0;
        this.displayCurrentProblem();
    }

    loadProblems(type) {
        const problems = ContentDatabase[type] || [];
        return this.shuffleArray([...problems]);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    displayCurrentProblem() {
        if (!this.problems.length) return;
        
        this.currentProblem = this.problems[this.index];
        const container = document.getElementById('practice-content');
        if (!container) return;

        container.innerHTML = this.generateProblemHTML();
    }

    generateProblemHTML() {
        switch (this.currentProblem.type) {
            case 'proposition':
                return this.generatePropositionHTML();
            case 'truth-table':
                return this.generateTruthTableHTML();
            case 'predicate':
                return this.generatePredicateHTML();
            default:
                return '<p>Problem type not supported</p>';
        }
    }

    // Additional problem generation methods...

    checkAnswer(answer) {
        if (!this.currentProblem) return;

        const isCorrect = this.evaluateAnswer(answer);
        this.showFeedback(isCorrect);
        this.updateStats(isCorrect);
    }

    evaluateAnswer(answer) {
        switch (this.currentProblem.type) {
            case 'proposition':
                return answer === this.currentProblem.isProposition;
            case 'truth-table':
                return this.evaluateTruthTableAnswer(answer);
            case 'predicate':
                return this.evaluatePredicateAnswer(answer);
            default:
                return false;
        }
    }

    showFeedback(isCorrect) {
        const feedback = document.getElementById('practice-feedback');
        if (!feedback) return;

        feedback.innerHTML = `
            <div class="feedback ${isCorrect ? 'success' : 'error'}">
                <p>${isCorrect ? 'Correct!' : 'Incorrect.'}</p>
                <p>${this.currentProblem.explanation}</p>
            </div>
        `;
        feedback.style.display = 'block';
    }

    updateStats(isCorrect) {
        ModuleState.practiceStats.attempted++;
        if (isCorrect) ModuleState.practiceStats.correct++;
        this.updateStatsDisplay();
        saveProgress();
    }

    nextProblem() {
        this.index = (this.index + 1) % this.problems.length;
        this.displayCurrentProblem();
    }
}
// Assessment System Implementation
class AssessmentManager {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.timer = null;
        this.timeRemaining = 1800; // 30 minutes
    }

    initialize() {
        this.questions = this.generateAssessment();
        this.setupTimer();
        this.displayCurrentQuestion();
        this.setupNavigation();
        ModuleState.assessment.isStarted = true;
    }

    generateAssessment() {
        return [
            ...this.selectQuestions('propositions', 5),
            ...this.selectQuestions('truth-tables', 5),
            ...this.selectQuestions('predicates', 5),
            ...this.selectQuestions('mixed', 5)
        ].sort(() => Math.random() - 0.5);
    }

    selectQuestions(type, count) {
        const questions = ContentDatabase[type] || [];
        return this.shuffleArray(questions).slice(0, count);
    }

    setupTimer() {
        const timerDisplay = document.getElementById('timer-display');
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            
            if (this.timeRemaining <= 0) {
                this.submitAssessment();
                return;
            }

            if (timerDisplay) {
                const minutes = Math.floor(this.timeRemaining / 60);
                const seconds = this.timeRemaining % 60;
                timerDisplay.textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    displayCurrentQuestion() {
        const question = this.questions[this.currentIndex];
        const container = document.getElementById('question-container');
        
        if (!container || !question) return;

        container.innerHTML = this.generateQuestionHTML(question);
        this.updateNavigationStatus();
    }

    generateQuestionHTML(question) {
        switch (question.type) {
            case 'multiple-choice':
                return this.generateMultipleChoiceHTML(question);
            case 'truth-table':
                return this.generateTruthTableQuestionHTML(question);
            case 'predicate':
                return this.generatePredicateQuestionHTML(question);
            default:
                return '<p>Unsupported question type</p>';
        }
    }

    submitAssessment() {
        clearInterval(this.timer);
        const score = this.calculateScore();
        this.displayResults(score);
        ModuleState.assessment.isComplete = true;
        ModuleState.assessment.score = score;
        this.saveAssessmentResults();
    }

    calculateScore() {
        let correct = 0;
        this.questions.forEach((question, index) => {
            const userAnswer = ModuleState.assessment.answers.get(index);
            if (this.isCorrectAnswer(question, userAnswer)) {
                correct++;
            }
        });
        return (correct / this.questions.length) * 100;
    }

    displayResults(score) {
        const resultsContainer = document.getElementById('assessment-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="results-summary">
                <h3>Assessment Complete</h3>
                <div class="score-display">
                    <p>Your Score: ${Math.round(score)}%</p>
                    <p>Status: ${score >= 80 ? 'PASSED' : 'NOT PASSED'}</p>
                </div>
                <div class="question-review">
                    ${this.generateQuestionReview()}
                </div>
            </div>
        `;
        resultsContainer.style.display = 'block';
    }
}

// Interactive Components
class InteractiveComponents {
    static initializeAll() {
        this.setupSymbolPalette();
        this.setupDragAndDrop();
        this.setupInputValidation();
    }

    static setupSymbolPalette() {
        document.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.dataset.symbol;
                this.insertSymbol(symbol);
            });
        });
    }

    static insertSymbol(symbol) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;
            activeElement.value = 
                activeElement.value.substring(0, start) + 
                symbol + 
                activeElement.value.substring(end);
            activeElement.selectionStart = activeElement.selectionEnd = start + 1;
        }
    }

    static setupInputValidation() {
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
            });
        });
    }
}

// Utility Functions
const Utils = {
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showFeedback(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = `
            <div class="feedback ${type}">
                <p>${message}</p>
            </div>
        `;
        element.style.display = 'block';
    }
};

// Event Handlers
function setupEventHandlers() {
    // Navigation Events
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            switchSection(section);
        });
    });

    // Practice Events
    const practiceBtn = document.querySelector('.practice-btn');
    if (practiceBtn) {
        practiceBtn.addEventListener('click', () => {
            practiceManager.nextProblem();
        });
    }

    // Assessment Events
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to submit your assessment?')) {
                assessmentManager.submitAssessment();
            }
        });
    }
}

// Initialize Components
const truthTableGenerator = new TruthTableGenerator();
const practiceManager = new PracticeProblemManager();
const assessmentManager = new AssessmentManager();

// Global Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeModule();
    InteractiveComponents.initializeAll();
    setupEventHandlers();
});

// Export necessary functions for global scope
window.switchSection = switchSection;
window.generateTruthTable = () => {
    const expression = document.getElementById('expression-input').value;
    try {
        const table = truthTableGenerator.generateTable(expression);
        document.getElementById('truth-table-output').innerHTML = '';
        document.getElementById('truth-table-output').appendChild(table);
        updateProgress(2);
    } catch (error) {
        Utils.showFeedback('truth-table-output', 'Invalid expression', 'error');
    }
};
window.checkAnswer = (answer) => practiceManager.checkAnswer(answer);
window.nextProblem = () => practiceManager.nextProblem();
