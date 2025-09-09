// game.js

import { Bird } from "./components/bird.js";
import { Pipe } from './components/pipe.js';

let startBtn = document.getElementById("start-game");

// Use vh and vw for responsive design
let boardWidth = window.innerWidth * 0.6; // 50vw
let boardHeight = window.innerHeight * 0.9; // 80vh


// Bird coordinates
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

// Pipes coordinates
let pipeX = boardWidth;
let pipeY = 0;
let pipeArray = [];
let pipeWidth = 64;

// Physics
let speedX = -2; // Pipes moving left speed
let speedY = 0; // Bird jump speed
let gravity = 0.35;

// Game control
let gameOver = false;
let score = 0;
let gameStarted = false;

let fontLoaded = false;

let bird = new Bird();

let restartBtn = document.getElementById("restart");


let instructionsContainer = document.getElementById("instructions-container");
let gameContainer = document.getElementById("game-container");

startBtn.addEventListener("click", () => {
    instructionsContainer.style.display = "none";
    gameContainer.style.display = "inline-block";
});

window.onload = () => {

    restartBtn.addEventListener("click", resetGame);
    let board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    // Load font
    document.fonts.load('40px "PressStart2P"').then(() => {
        fontLoaded = true;
    });
    
    const context = board.getContext('2d');

    if(!context) return;
    bird.context = context;
    bird.x = birdX;
    bird.y = birdY;
    
    bird.draw();

    requestAnimationFrame(() => update(context));
    setInterval(() => placePipes(context), 1500)

    // document.addEventListener("keydown", moveBird); 
}  

const update = (context) => { 
    requestAnimationFrame(() => update(context));

    if (gameOver) return;

    context.clearRect(0, 0, boardWidth, boardHeight);
    // Bird
    bird.draw();


    if(gameStarted) {
        speedY += gravity;
        bird.y = Math.max(bird.y + speedY, 0);

        if (bird.y > boardHeight) gameOver = true;

        // Pipes
        for (let pipe of pipeArray){
            pipe.x += speedX;
            pipe.draw();

            if(!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5; // 0.5 because there are two pipes :0
                pipe.passed = true;
            }

            if(detectCollision(bird, pipe)){
                gameOver = true;
            }
        }
        
        // Clear pipes to avoid memory issues
        if(pipeArray.length > 0 && pipeArray[0].x < - pipeWidth) pipeArray.shift();    

        context.textAlign = "center";
        context.fillStyle = "white";

        // Score
        if (fontLoaded) {
            context.font = "40px PressStart2P";
            context.lineWidth = 5;
            context.strokeText(score.toString(), boardWidth / 2, 55);
            context.fillText(score.toString(), boardWidth / 2, 55);
        }

        if (gameOver){
            context.font = "30px PressStart2P";
            context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 50);
            restartBtn.style.display = "block";
        }
    }
} 

const placePipes = (context) => {
    if (gameOver || !gameStarted) return;

    const top_pipe = new Pipe();
    const bottom_pipe = new Pipe();
    const openingSpace = boardHeight / 1.5;

    let randomPipeY = pipeY - top_pipe.height/4 - Math.random()*(top_pipe.height/2)

    // Settings for top pipe
    top_pipe.context = context;
    top_pipe.setPosition(0);
    top_pipe.x = pipeX;
    top_pipe.y = randomPipeY - openingSpace / 2;

    pipeArray.push(top_pipe);

    // Settings for bottom pipe
    bottom_pipe.context = context;
    bottom_pipe.setPosition(1);
    bottom_pipe.x = pipeX;
    bottom_pipe.y = randomPipeY + bottom_pipe.height + openingSpace / 2;

    pipeArray.push(bottom_pipe);
}

// const moveBird = (e) => {
//     if (( e instanceof KeyboardEvent &&
//     (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) || 
//     (e instanceof MouseEvent)){
//         speedY = -6;
//         if (!gameStarted) {
//             gameStarted = true;
//             return;
//         }
//     } else return;
// }

const jump = () => {
    speedY = -6;
    if (!gameStarted) {
        gameStarted = true;
        return;
    }
}

const resetGame = () => {

    if (instructionsContainer.style.display !== "none") {
        instructionsContainer.style.display = "none";
        gameContainer.style.display = "inline-block";
        return;
    };

    restartBtn.style.display = "none";
    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        gameStarted = false;
    }
}

// const resetGame = (e) => {
//     if (( e instanceof KeyboardEvent &&
//     (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) || 
//     (e instanceof MouseEvent)){
//         restartBtn.style.display = "none";
//     } else return;
    
//     if (gameOver) {
//         bird.y = birdY;
//         pipeArray = [];
//         score = 0;
//         gameOver = false;
//         gameStarted = false;
//     }
// }

const detectCollision = (a, b) => {
    return a.x < b.x + b.width && 
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}


export { resetGame, jump }