const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const values = document.querySelector('.values');
const scoreDiv = document.getElementById('score');
const levelDiv = document.getElementById('level');
const startButton = document.getElementById('startButton');
const menu = document.getElementById('menu');
const restartButton = document.getElementById('restartButton');
const replayButton = document.getElementById('replayButton');
const shootSound = new Audio("../assets/sounds/shoot.mp3");
const explosionSound = new Audio("../assets/sounds/explosion.mp3");
const gameOverSound = new Audio("../assets/sounds/gameover.mp3");
const characterSound = new Audio("../assets/sounds/character.mp3");


const playerImg = new Image();
playerImg.src = '../assets/images/player.png'; 

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
let gameStarted = false;
let intervalID;
let gameEvents = []; 
let isReplay = false;
let startTime;
let projectileSpeed = 8;
let ballSpdMax = 3;
let ballSpdMin = 1;


function logEvent(type,data){
    let delay;
    let currentTime = Date.now();
    if(!gameEvents.length){
        delay = currentTime - startTime;
    }else{
        delay = currentTime - gameEvents[gameEvents.length-1].time;
    }
    // console.log(data);
    if(type === "player"){
        gameEvents.push({type,data,time:currentTime,delay});
    }
    else{
        gameEvents.push({type,data:{...data},time:currentTime,delay});
    }
    // console.log(gameEvents);
}

window.addEventListener('keydown', (e) => {
    if ((e.key === "r" || e.key === "R") && gameOver) {
        resetGame();
        startGame();
    }
    if (!gameStarted) return;
    if (e.key === 'ArrowUp' && player.y > 0 && !gameOver) {
        player.y -= player.speed;
        logEvent('player','up');
    } else if (e.key === 'ArrowDown' && player.y < canvas.height - 100 && !gameOver) {
        player.y += player.speed;
        logEvent('player','down');
    } else if (e.key === ' ' && player.projectiles.length <= 10 && !gameOver) {
        const data = { x: player.x + player.width, y: player.y + player.height / 2, radius: 5 };
        logEvent('projectile',data);
        shootSound.play();
        player.projectiles.push(data);
        // console.log(data);
    }
});

function createBall() {
    if (!gameStarted) return;
    const ball = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 50) + 25,
        radius: 25,
        speed: Math.random() * ballSpdMax + ballSpdMin
    };
    balls.push(ball);
    logEvent("ball",ball);
}

function resetGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameOver = false;
    score = 0;
    scoreDiv.innerText = "Score: 0";
    levelDiv.innerText= "Level: 1";
    player.projectiles = [];
    balls.length = 0;
    explosions.length = 0;
}

function drawExplosion(x, y) {
    const explosionSize = 50;
    const colors = ['rgba(255, 69, 0, ', 'rgba(255, 140, 0, ', 'rgba(255, 215, 0, '];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * explosionSize;
        const particleX = x + Math.cos(angle) * distance;
        const particleY = y + Math.sin(angle) * distance;
        const size = Math.random() * 5 + 2;
        const alpha = 1 - (distance / explosionSize);
        const color = colors[Math.floor(Math.random() * colors.length)] + alpha + ')';
        // console.log(color);
        ctx.beginPath();
        ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
}
function drawBalls() {
    balls.forEach((ball, index) => {
        ball.x -= ball.speed;
        ctx.fillStyle = 'red';
        ctx.beginPath();
        // if(isReplay){
        //     console.log(ball);
        // }
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        if (ball.x - ball.radius < player.x + player.width &&
            ball.y + ball.radius > player.y &&
            ball.y - ball.radius < player.y + player.height) {
            gameOverSound.play();
            gameOver = true;
        }



        player.projectiles.forEach((proj, projIndex) => {
            const dist = Math.hypot(proj.x - ball.x, proj.y - ball.y);
            console.log(dist);
            if (dist - ball.radius - proj.radius < 1) {
                explosions.push({ x: ball.x, y: ball.y, timer: 15 });
                explosionSound.play();
                balls.splice(index, 1);
                player.projectiles.splice(projIndex, 1);
                score++;
                scoreDiv.innerText = "Score: " + score;
            }
        });

        if (ball.x - ball.radius < 0) {
            gameOverSound.play();
            gameOver = true;
        }
    });
}
function gameLoop() {
    if(score>0 && score%10 === 0){
        const level = levelDiv.innerText.split(" ")[1];
        if(!(Number(level) === score/10 + 1)){
            levelDiv.innerText = `Level: ${score/10+1}`;
            characterSound.play();
            projectileSpeed += 0.02;
            ballSpdMax += 0.02;
            ballSpdMin += 0.02;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        restartButton.style.display = "block";
        replayButton.style.display = "block"; 
        if(!isReplay){
            clearTimeout(intervalID);
        }
        gameStarted = false;
        return;
    }

    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    ctx.fillStyle = 'yellow';
    player.projectiles.forEach((proj, index) => {
        proj.x += projectileSpeed;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        if (proj.x > canvas.width) {
            player.projectiles.splice(index, 1);
        }
    });

    drawBalls();
    explosions.forEach((exp, index) => {
        drawExplosion(exp.x, exp.y);
        exp.timer--;
        if (exp.timer <= 0) {
            explosions.splice(index, 1);
        }
    });

    requestAnimationFrame(gameLoop);
}

function menuHider(){
    menu.style.display = "none";
    values.style.display = "flex";
    replayButton.style.display = "none";
    restartButton.style.display = "none";
}

function startGame() {
    menuHider();
    startTime = Date.now();
    gameStarted = true;
    gameOver = false;
    intervalID = setInterval(createBall, 2000);
    gameLoop();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', ()=>{
    gameEvents = [];
    resetGame();
    startGame()
});
replayButton.addEventListener('click',()=>{
    resetGame();
    replayGame();
    gameLoop();
});



function replayGame(){
    player.y=canvas.height/2 -50;
    resetGame();
    menuHider();
    gameStarted = true;
    gameOver = false;
    isReplay = true;
    let eventIndex = 0;
    function processNextEvent() {
        if (eventIndex >= gameEvents.length) return; 
        
        const event = gameEvents[eventIndex++];
        if(event.type === "player"){
            replayPlayerMovement(event);
        }else if(event.type === "ball"){
            balls.push({...event.data});
            console.log(event.data);
        }else if(event.type === "projectile"){
            shootSound.play();
            player.projectiles.push(event.data);
        }

        if (eventIndex < gameEvents.length) {
            const nextEvent = gameEvents[eventIndex];
            setTimeout(processNextEvent, nextEvent.delay); 
        }
    }

    if (gameEvents.length > 0) {
        processNextEvent(); 
    }
}
function replayPlayerMovement(event) {
    if (event.data === "up" && player.y>0) {
        console.log("up")
        player.y -= player.speed;
    } else if (event.data === "down" && player.y<canvas.height-100) {
        console.log("down")
        player.y += player.speed;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

