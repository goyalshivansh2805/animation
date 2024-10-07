const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ballsLocations = [];

const circlesAmount = 10;
const gridStartingX = (canvas.width*0.45);
const gridStartingY = canvas.height/2;
const wallHeight = 250;
let defaultBlue = 1;
let defaultRed = 1;
const wallPlayer1X=gridStartingX-200;
const wallLocationY=(canvas.height/2);
const turn = "red";

const wallPlayer2X=gridStartingX+ 280;
const redAngleMap = {
    "1":.85,
    "2":.9,
    "3":.95
};

const blueAngleMap = {
    "1":-.85,
    "2":-.90,
    "3":-.95
}

const createGrid = ()=>{
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(gridStartingX, gridStartingY);
    ctx.lineTo(gridStartingX , gridStartingY + 240);
    ctx.moveTo(gridStartingX+80, gridStartingY);
    ctx.lineTo(gridStartingX+80 , gridStartingY + 240);
    ctx.moveTo(gridStartingX-80, gridStartingY+80);
    ctx.lineTo(gridStartingX-80+240, gridStartingY+80);
    ctx.moveTo(gridStartingX-80, gridStartingY+160);
    ctx.lineTo(gridStartingX-80+240, gridStartingY+160);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(wallPlayer1X, wallLocationY);
    ctx.lineTo(wallPlayer1X, wallLocationY+wallHeight);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(wallPlayer2X, wallLocationY);
    ctx.lineTo(wallPlayer2X, wallLocationY+wallHeight);
    ctx.stroke();
    ctx.closePath();
}

function Ball(x, y, radius,color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = (Math.random() - 0.5) * 8;
    this.dy = (Math.random() - 0.5) * 8;
    this.color = color;

    this.update = function(){
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    };

    this.draw = function(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    
}

// const angleToTranslate = (angle)=>{
//     if(angle === -0.85){
//         ctx.translate(-430, 180);
//     }else if(angle === -0.9){
//         ctx.translate(-410,190)
//     }else if(angle === -0.95){
//         ctx.translate(-430,210)
//     }else if(angle === 0.85){
//         ctx.translate(700,-880);
//     }else if(angle === 0.9){
//         ctx.translate(740,-920);
//     }else if(angle === 0.95){
//         ctx.translate(820,-940);
//     }
// }

const angleToTranslate = (angle) => {
    let translateX = 0;
    let translateY = 0;

    
    if (angle <= -0.85 && angle >= -0.95) {
        const factor = (angle + 0.85) / (-0.1); 
        translateX = -410 - factor * 20; 
        translateY = 190 + factor * 20;  
    }


    if (angle >= 0.85 && angle <= 0.95) {
        const factor = (angle - 0.85) / 0.1;
        translateX = 700 + factor * 120; 
        translateY = -880 - factor * 60;
    }
    ctx.translate(translateX, translateY);
};


function drawLauncher(angle,x,y) {
    ctx.save(); 
    angleToTranslate(angle);
    ctx.rotate(angle);
    ctx.fillStyle = 'gray';
    ctx.fillRect(x,y, 200, 70);  
    ctx.restore();  
}

window.addEventListener('keydown', (event)=>{
    const key = event.key;
    if(key === "ArrowRight" && turn === "red" && defaultRed <3){
        defaultRed += 1;
    }else if(key === "ArrowLeft" && turn==="red" &&defaultRed >1){
        defaultRed -= 1;
    }else if((key === "a" || key === "A")&& turn === "blue" && defaultBlue<3){
        defaultBlue += 1;
    }else if((key === "d" || key === "D")&& turn === "blue" && defaultBlue>1){
        defaultBlue -= 1;
    }
})
const animate = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLauncher(blueAngleMap[defaultBlue],0,canvas.height); //LEFT LAUNCHER
    drawLauncher(redAngleMap[defaultRed],canvas.width,canvas.height); //RIGHT LAUNCHER
    createGrid();//GRID
    requestAnimationFrame(animate);
}

animate();