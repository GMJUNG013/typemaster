const phraseContainer = document.getElementById('phrase-container');
const userInput = document.getElementById('user-input');
const wpmDisplay = document.getElementById('wpm-display');
const startBtn = document.getElementById('start-btn');
const timerDisplay = document.getElementById('timer-display');

const keypressSounds = [
    document.getElementById('keypress-sound-1'),
];

let startTime;
let timer;
let countdownInterval;
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timeLeft = 60; // 60 seconds countdown

const apiURL = 'https://random-word-api.herokuapp.com/word?number=5'; // Fetches 5 random words

const fetchWords = async () => {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        words = data;
        currentWordIndex = 0;
        currentCharIndex = 0;
        displayWord();
    } catch (error) {
        console.error('Error fetching words:', error);
    }
};

const displayWord = () => {
    phraseContainer.innerHTML = ''; // Clear the container

    const currentWord = words[currentWordIndex];
    
    currentWord.split('').forEach((char, index) => {
        const charElement = document.createElement('span');
        charElement.textContent = char;
        charElement.classList.add('char');
        
        // Change the color of the current character
        if (index === currentCharIndex) {
            charElement.classList.add('cursor'); // Highlight the current character by changing its color
        }
        
        phraseContainer.appendChild(charElement);
    });
};

const startGame = async () => {
    userInput.value = '';
    await fetchWords();
    userInput.focus();
    startTime = new Date();
    timeLeft = 60; // Reset countdown to 60 seconds
    timerDisplay.textContent = `Time: ${timeLeft}`;
    
    clearInterval(timer);
    timer = setInterval(updateWPM, 1000);
    
    // Start countdown timer
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            clearInterval(timer); // Stop WPM timer
            alert('Time is up!'); // Alert when time is up
        }
    }, 1000);
};

const updateWPM = () => {
    if (startTime) {
        const elapsedTime = (new Date() - startTime) / 60000; // Time in minutes
        const wordsTyped = currentWordIndex; // Number of correctly typed words
        const wpm = Math.round(wordsTyped / elapsedTime);
        wpmDisplay.textContent = `WPM: ${wpm}`;
    }
};

const playKeyPressSound = () => {
    // Randomly select one of the audio elements
    const randomIndex = Math.floor(Math.random() * keypressSounds.length);
    const sound = keypressSounds[randomIndex];
    sound.currentTime = 0; // Rewind to start
    sound.play();
};



const checkInput = () => {
    const currentWord = words[currentWordIndex];
    const typedValue = userInput.value.trim();

    // Play keypress sound
    playKeyPressSound();

    // Check if the typed value matches the current word up to the current character index
    if (typedValue === currentWord.slice(0, typedValue.length)) {
        // If correct so far, move the cursor to the next character
        currentCharIndex = typedValue.length;
        displayWord();

        // If the whole word is typed correctly
        if (typedValue === currentWord) {
            currentWordIndex++;
            currentCharIndex = 0;
            userInput.value = ''; // Clear the input field

            // Immediately display the next word without delay
            if (currentWordIndex < words.length) {
                displayWord(); // Display the next word
            } else {
                fetchWords(); // Fetch new words when all are typed
            }
        }
    } else {
        // Incorrect input, reset the input and force the user to retype the word
        userInput.value = '';
        currentCharIndex = 0;
        displayWord();

        // Optionally, you can add a visual indication of the mistake
        phraseContainer.classList.add('error');
        setTimeout(() => {
            phraseContainer.classList.remove('error');
        }, 300);
    }
};

startBtn.addEventListener('click', startGame);
userInput.addEventListener('input', checkInput);
