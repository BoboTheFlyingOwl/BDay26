

const canvas = document.getElementById("spaceGame");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOver");
const finalText = document.getElementById("finalText");

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let asteroids = [];
let bonuses = [];
let gameRunning = false;
let gameStarted = false; // Stato iniziale
let time = 0;
let score = 0;
let bonusScore = 0;

// Movimento del mouse
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// Click per iniziare sul canvas
canvas.addEventListener("click", () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        gameOverScreen.style.display = "none";
    }
});

// Click per ricominciare sul gameOverScreen
gameOverScreen.addEventListener("click", () => {
    if (!gameRunning) {
        restartGame();
    }
});

function createAsteroid() {
    const size = Math.random() * 30 + 15;
    const side = Math.floor(Math.random() * 4);
    let x, y, dx, dy;
    const speed = Math.random() * 2 + 1.5;

    if (side === 0) { x = Math.random() * canvas.width; y = -size; dx = (Math.random() - 0.5) * 2; dy = speed; }
    if (side === 1) { x = canvas.width + size; y = Math.random() * canvas.height; dx = -speed; dy = (Math.random() - 0.5) * 2; }
    if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + size; dx = (Math.random() - 0.5) * 2; dy = -speed; }
    if (side === 3) { x = -size; y = Math.random() * canvas.height; dx = speed; dy = (Math.random() - 0.5) * 2; }

    asteroids.push({ x, y, radius: size, dx, dy });
}

function createBonus(type) {
    let config = {
        normal: { radius: 20, life: 300, value: 3, color: "#00ff88" },
        rare: { radius: 14, life: 150, value: 5, color: "#bb00ff" },
        ultra: { radius: 10, life: 75, value: 10, color: "#ffcc00" }
    };
    let b = config[type];
    bonuses.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        radius: b.radius,
        life: b.life,
        value: b.value,
        color: b.color
    });
}

function drawShip() {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#00e0ff";
    ctx.shadowColor = "#00e0ff";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawAsteroids() {
    ctx.fillStyle = "#888";
    asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawBonuses() {
    bonuses.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
}

function updateAsteroids() {
    asteroids.forEach(a => {
        a.x += a.dx;
        a.y += a.dy;
        const dist = Math.hypot(mouse.x - a.x, mouse.y - a.y);
        if (dist < a.radius + 15) endGame();
    });
    asteroids = asteroids.filter(a =>
        a.x > -100 && a.x < canvas.width + 100 &&
        a.y > -100 && a.y < canvas.height + 100
    );
}

function updateBonuses() {
    bonuses.forEach((b, index) => {
        b.life--;
        const dist = Math.hypot(mouse.x - b.x, mouse.y - b.y);
        if (dist < b.radius + 15) {
            bonusScore += b.value;
            bonuses.splice(index, 1);
        }
    });
    bonuses = bonuses.filter(b => b.life > 0);
}

function drawScore() {
    ctx.fillStyle = "#00e0ff";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Tempo: " + score, 10, 25);
    ctx.fillText("Bonus: " + bonusScore, 10, 50);
}

function drawStartScreen() {
    ctx.fillStyle = "#00e0ff";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CLICK PER INIZIARE", canvas.width / 2, canvas.height / 2);
}

function endGame() {
    gameRunning = false;
    const total = score + bonusScore;
    finalText.innerHTML = `
    <div style="font-size:32px;">MISSIONE FALLITA</div>
    <div style="margin-top:20px;">Tempo sopravvissuto: ${score}</div>
    <div>Bonus raccolti: ${bonusScore}</div>
    <div style="margin-top:15px;font-size:26px;">PUNTEGGIO TOTALE: ${total}</div>
    `;
    gameOverScreen.style.display = "flex";
}

function restartGame() {
    asteroids = [];
    bonuses = [];
    time = 0;
    score = 0;
    bonusScore = 0;
    gameRunning = true;
    gameStarted = true;
    gameOverScreen.style.display = "none";
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartScreen();
    } else if (gameRunning) {
        time++;
        score = Math.floor(time / 60);

        if (Math.random() < 0.02) createAsteroid();
        if (Math.random() < 0.005) createBonus("normal");
        if (Math.random() < 0.002) createBonus("rare");
        if (Math.random() < 0.001) createBonus("ultra");

        updateAsteroids();
        updateBonuses();

        drawAsteroids();
        drawBonuses();
        drawShip();
        drawScore();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
