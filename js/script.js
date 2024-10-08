const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const startButton = document.getElementById('startButton');
const menu = document.getElementById('menu');
const gameOverDiv = document.getElementById('gameOver');

const playerImg = new Image();
playerImg.src = '../assets/player1.png'; 

const player = {
    x: 0,
    y: canvas.height / 2 - 50,
    width: 100,
    height: 100,
    speed: 10,
    projectiles: []
};

const balls = [];
const explosions = [];
let score = 0;
let gameOver = false;

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && player.y > 0) {
        player.y -= player.speed;
    } else if (e.key === 'ArrowDown' && player.y < canvas.height-100) {
        player.y += player.speed;
    } else if (e.key === ' ') {
        player.projectiles.push({ x: player.x + player.width, y: player.y + player.height / 2, radius: 5 });
    }
});

function createBall() {
    balls.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 50) +25,
        radius: 25,
        speed: Math.random() * 3 + 2
    });
}



setInterval(createBall, 2000);

function drawExplosion(x, y) {
    const explosionSize = 50;
    for (let i = 0; i < 10; i++) {
        const alpha = 1 - (i / 10);
        ctx.beginPath();
        ctx.arc(x, y, explosionSize * (i / 10), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
        ctx.fill();
    }
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    ctx.fillStyle = 'yellow';
    player.projectiles.forEach((proj, index) => {
        proj.x += 8;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        if (proj.x > canvas.width) {
            player.projectiles.splice(index, 1);
        }
    });

    balls.forEach((ball, index) => {
        ball.x -= ball.speed;
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        if (ball.x - ball.radius < player.x + player.width &&
            ball.y + ball.radius > player.y &&
            ball.y - ball.radius < player.y + player.height) {
            gameOver = true;
        }

        player.projectiles.forEach((proj, projIndex) => {
            const dist = Math.hypot(proj.x - ball.x, proj.y - ball.y);
            if (dist - ball.radius - proj.radius < 1) {
                explosions.push({ x: ball.x, y: ball.y, timer: 15 });
                balls.splice(index, 1);
                player.projectiles.splice(projIndex, 1);
                score++;
                scoreDiv.innerText = "Score: " + score;
            }
        });

        if (ball.x - ball.radius < 0) {
            gameOver = true;
        }
    });

    explosions.forEach((exp, index) => {
        drawExplosion(exp.x, exp.y);
        exp.timer--;
        if (exp.timer <= 0) {
            explosions.splice(index, 1);
        }
    });


    requestAnimationFrame(gameLoop);
}

function startGame() {
    menu.style.display = "none";
    scoreDiv.style.display = "block";
    gameLoop();
}

startButton.addEventListener('click', startGame);
