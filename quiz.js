// --- State Variables ---
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timerInterval;
const TIME_PER_QUESTION = 60;
let isPaused = false;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questions = document.getElementById('questions');
const resultScreen = document.getElementById('result-screen');
const timer = document.getElementById('timer');
const scoreCounter = document.getElementById('score-counter');
const questionTxt = document.getElementById('question-txt');
const nextBtn = document.getElementById('next-btn');
const optionBtns = document.querySelectorAll('.option-btn');

// Quiz Questions
const quizQuestions = [
    {
        question: "What is Git?",
        answers: [
            { text: "A programming language", correct: false },
            { text: "A version control system", correct: true },
            { text: "An operating system", correct: false },
            { text: "A text editor", correct: false }
        ]
    },
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Berlin", correct: false },
            { text: "Paris", correct: true },
            { text: "Madrid", correct: false },
            { text: "Rome", correct: false }
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Venus", correct: false }
        ]
    },
    {
        question: "What is the largest ocean on Earth?",
        answers: [
            { text: "Atlantic Ocean", correct: false },
            { text: "Indian Ocean", correct: false },
            { text: "Arctic Ocean", correct: false },
            { text: "Pacific Ocean", correct: true }
        ]
    }
];

function startQuiz() {
    startScreen.classList.add('hidden');
    questions.classList.remove('hidden');
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    scoreCounter.textContent = `Score: ${score}`;
    nextBtn.style.display = 'none';
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    questionTxt.textContent = question.question;
    
    // Get all option buttons except the next button
    const optionButtons = Array.from(optionBtns).filter(btn => btn.id !== 'next-btn');
    
    optionButtons.forEach((button, index) => {
        button.textContent = question.answers[index].text;
        button.dataset.correct = question.answers[index].correct;
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
        // Remove old listeners and add new one
        button.removeEventListener('click', selectAnswer);
        button.addEventListener('click', selectAnswer);
    });
}

function selectAnswer(e) {
    clearInterval(timerInterval);
    const selectedButton = e.target;
    const isCorrect = selectedButton.dataset.correct === 'true';

    if (isCorrect) {
        score++;
        scoreCounter.textContent = `Score: ${score}`;
    }

    // Store answer for results
    const currentQuestion = quizQuestions[currentQuestionIndex];
    userAnswers.push({
        question: currentQuestion.question,
        userAnswer: selectedButton.textContent,
        correctAnswer: currentQuestion.answers.find(ans => ans.correct).text,
        isCorrect: isCorrect
    });

    // Show correct/wrong for all options
    Array.from(optionBtns)
        .filter(btn => btn.id !== 'next-btn')
        .forEach(button => {
            button.disabled = true;
            if (button.dataset.correct === 'true') {
                button.classList.add('correct');
            } else if (button === selectedButton && !isCorrect) {
                button.classList.add('wrong');
            }
        });

    // Show next button
    nextBtn.style.display = 'block';
}

// Next button event listener
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        nextBtn.style.display = 'none';
        loadQuestion();
        startTimer();
    } else {
        endQuiz();
    }
});

function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = TIME_PER_QUESTION;
    timer.textContent = timeLeft + 's';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = timeLeft + 's';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    // Auto-select wrong answer if time is up
    userAnswers.push({
        question: quizQuestions[currentQuestionIndex].question,
        userAnswer: "Time's up!",
        correctAnswer: quizQuestions[currentQuestionIndex].answers.find(ans => ans.correct).text,
        isCorrect: false
    });
    
    Array.from(optionBtns)
        .filter(btn => btn.id !== 'next-btn')
        .forEach(button => {
            button.disabled = true;
            if (button.dataset.correct === 'true') {
                button.classList.add('correct');
            }
        });

    nextBtn.style.display = 'block';
}

function endQuiz() {
    questions.classList.add('hidden');
    resultScreen.classList.remove('screen-hidden');
    document.getElementById('final-score').textContent = score;
    displayResultsSummary();
}

function displayResultsSummary() {
    const resultsSummary = document.getElementById('results-summary');
    resultsSummary.innerHTML = '';
    userAnswers.forEach((answer, index) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        
        resultItem.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
            <p style="color: ${answer.isCorrect ? 'green' : 'red'}">
                Your Answer: ${answer.userAnswer}
            </p>
            <p style="color: green">
                Correct Answer: ${answer.correctAnswer}
            </p>
        `;
        
        resultsSummary.appendChild(resultItem);
    });
}

// --- Added Functions for Control ---
function togglePause() {
    if (isPaused) {
        startTimer();
        pauseBtn.textContent = 'Pause';
    } else {
        clearInterval(timerInterval);
        pauseBtn.textContent = 'Resume';
    }
    isPaused = !isPaused;
}

function restartQuiz() {
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    isPaused = false;
    
    // Reset displays
    scoreCounter.textContent = `Score: 0`;
    timer.textContent = '60s';
    
    // Hide results and questions, show start screen
    resultScreen.classList.add('screen-hidden'); // Changed from style.display
    questions.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // Reset all option buttons
    document.querySelectorAll('.option-btn').forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
    });
    
    // Clear timer
    clearInterval(timerInterval);
    
    // Reset next button
    nextBtn.style.display = 'none';
    
    // Clear results summary
    document.getElementById('results-summary').innerHTML = '';
    document.getElementById('final-score').textContent = '0';
    
    // Reset pause button
    document.getElementById('pause-btn').textContent = 'Pause';
}

// --- Event Listeners ---
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

startBtn.addEventListener('click', startQuiz);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartQuiz);