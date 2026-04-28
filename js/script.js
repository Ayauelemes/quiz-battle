let playerCount = 0; 
let counterInterval;
let correctAnswers = 0; 

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    const authLinks = document.getElementById('authLinks');
    const userSection = document.getElementById('userSection');
    const userNameDisplay = document.getElementById('userName');

    if (isLoggedIn === 'true' && storedUser) {
        if (authLinks) authLinks.style.display = 'none';
        if (userSection) userSection.style.display = 'inline';
        if (userNameDisplay) userNameDisplay.innerText = storedUser.name;
    }
}

function changeColor() {
    const title = document.getElementById('title');
    if (title) {
        title.style.color = title.style.color === 'yellow' ? 'white' : 'yellow';
    }
}

function sendMessage() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const result = document.getElementById('result');

    if (nameInput && emailInput && nameInput.value && emailInput.value) {
        result.innerHTML = `
            <div class="card animate-pop" style="margin-top:20px; border-top: 3px solid #ff7a18;">
                <h4>Хабарлама жіберілді!</h4>
                <p>Жіберуші: <strong>${nameInput.value}</strong></p>
                <p>Біз сізге жақын арада жауап береміз.</p>
            </div>`;
        
        nameInput.value = '';
        emailInput.value = '';
        const msg = document.getElementById('msg');
        if (msg) msg.value = '';
    }
}

function startGame() {
    const gameArea = document.getElementById('gameArea');
    const counterNumberDisplay = document.getElementById('counter');
    
    if (gameArea) {
        gameArea.style.display = 'flex'; 
        gameArea.scrollIntoView({ behavior: 'smooth' });
    }

    if (counterInterval) clearInterval(counterInterval);

    counterInterval = setInterval(() => {
        playerCount++;
        if (counterNumberDisplay) {
            counterNumberDisplay.innerText = playerCount; 
            counterNumberDisplay.classList.add('counter-animate'); 
            setTimeout(() => {
                counterNumberDisplay.classList.remove('counter-animate');
            }, 200);
        }
    }, 3000);

    nextQuestion(); 
}

function nextQuestion() {
    const questions = [
        { q: "2+2 нешеге тең?", a: ["3", "4", "5", "6"], correct: 1 },
        { q: "Қазақстанның астанасы қай қала?", a: ["Алматы", "Ақтөбе", "Астана", "Семей"], correct: 2 },
        { q: "JS-те айнымалы қалай жарияланады?", a: ["var", "let", "const", "Барлығы"], correct: 3 },
        { q: "HTML-де сілтеме тегі қандай?", a: ["<img>", "<a>", "<div>", "<p>"], correct: 1 }
    ];

    const data = questions[Math.floor(Math.random() * questions.length)];
    const gameArea = document.getElementById('gameArea');

    gameArea.innerHTML = `
        <div class="quiz-card animate-pop">
            <div class="category-badge">Интеллект Баттл</div>
            <div class="question-box">
                <h3 id="question" style="margin: 20px 0;">${data.q}</h3>
            </div>
            <div class="answer-options"></div>
            <div class="quiz-footer">
                <small style="color: #888;">Дұрыс жауаптар: ${correctAnswers}</small>
            </div>
        </div>
    `;

    const optionsEl = gameArea.querySelector('.answer-options');
    data.a.forEach((text, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = text;
        btn.onclick = () => checkAnswer(index === data.correct);
        optionsEl.appendChild(btn);
    });
}

function checkAnswer(isCorrect) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isCorrect) {
        correctAnswers++;
        if (correctAnswers === 2 && isLoggedIn !== 'true') {
            showPromoBlock();
            return;
        }
    } else {
        alert("Қате жауап! Қайталап көріңіз.");
        correctAnswers = 0;
    }
    nextQuestion();
}

function showPromoBlock() {
    const gameArea = document.getElementById('gameArea');
    if (gameArea) {
        gameArea.innerHTML = `
            <div class="quiz-card animate-pop">
                <div style="font-size: 3rem; margin-bottom: 15px;">🚀</div>
                <div class="category-badge">Керемет нәтиже!</div>
                <h3 style="margin: 20px 0; font-size: 1.8rem; color: #1f1f1f;">Сіздің деңгейіңіз өте жоғары!</h3>
                <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                    Сіз 2 сұраққа мүдірмей жауап бердіңіз. <br>
                    Ары қарай нағыз жарысқа қатысу үшін жүйеге тіркеліңіз!
                </p>
                <div class="quiz-footer">
                    <a href="register.html" class="btn main-game-btn" style="display: block; text-decoration: none; width: 100%; padding: 15px;">Тіркелу және жалғастыру</a>
                    <button onclick="location.reload()" style="background: none; border: none; color: #888; margin-top: 15px; cursor: pointer;">Қайта бастау</button>
                </div>
            </div>
        `;
    }
}

function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !password) {
        alert("Барлық өрісті толтырыңыз!");
        return;
    }
    if (password.length < 6) {
        alert("Құпиясөз кемінде 6 символ болуы керек!");
        return;
    }

    const userData = { name, email, password };
    localStorage.setItem('user', JSON.stringify(userData));
    alert("Тіркелу сәтті! Енді кіруіңізге болады.");
    window.location.href = 'login.html';
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
        localStorage.setItem('isLoggedIn', 'true');
        alert("Сәтті кірдіңіз!");
        window.location.href = 'index.html';
    } else {
        const message = document.getElementById('message');
        if (message) {
            message.style.color = "red";
            message.innerText = "Email немесе пароль қате!";
        }
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}