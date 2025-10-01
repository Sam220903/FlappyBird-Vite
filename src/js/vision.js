// vision.js

import { GestureRecognizer, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { resetGame, jump } from './game.js';

let gestureRecognizer = null;
let lastVideoTime = -1;
let results = null;
let webcamRunning = true;

const videoRef = document.getElementById("webcam");
const canvasRef = document.getElementById("outputCanvas");
const loadingContainer = document.querySelector('.loading-bar-container');

let canvasCtx = null;

const videoWidth = 320;
const videoHeight = 240;

let frameSkip = 0;
const FRAME_SKIP_RATE = 3;

let lastGestures = [];
let previousGesture = '';

// Función para actualizar la barra de progreso
const updateLoadingBar = (progress) => {
  const blocks = document.querySelectorAll('.block-meter');
  const totalBlocks = blocks.length;
  const blocksToFill = Math.floor((progress / 100) * totalBlocks);
  
  // Llenar bloques hasta el progreso actual
  for (let i = 0; i < blocksToFill; i++) {
    if (blocks[i]) {
      blocks[i].style.opacity = '1';
      blocks[i].style.animation = 'none';
    }
  }
};

// Función para ocultar la barra de carga
const hideLoadingBar = () => {
  if (loadingContainer) {
    loadingContainer.style.display = 'none';
  }
};

const constraints = { video: true };

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  updateLoadingBar(20); // 20% - cámara obtenida
  videoRef.srcObject = stream;
  videoRef.addEventListener('loadeddata', () => {
    updateLoadingBar(40); // 40% - video cargado
    canvasCtx = canvasRef.getContext('2d');
    createGestureRecognizer().then(() => {
      updateLoadingBar(100); // 100% - reconocedor creado y listo
      predictWebcam();
      canvasRef.style.display = 'block';
      // Pequeño delay antes de ocultar la barra para mejor UX
      setTimeout(() => {
        hideLoadingBar();
      }, 1000);
    });
  });
});

const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    './wasm/'
  );
  updateLoadingBar(60); // 60% - FilesetResolver listo
  
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        './models/gesture_recognizer.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO'
  });
  updateLoadingBar(80); // 80% - GestureRecognizer creado
};

const predictWebcam = async () => {
  if (!gestureRecognizer) return;

  const nowInMs = Date.now();

  if (videoRef.currentTime !== lastVideoTime) {
    frameSkip++;
    if (frameSkip % FRAME_SKIP_RATE === 0) {

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.width, canvasRef.height);

      lastVideoTime = videoRef.currentTime;
      results = gestureRecognizer.recognizeForVideo(videoRef, nowInMs);

      canvasCtx.restore();
    }
  }

  if (results) {
    let currentGesture = 'None';
    
    // Usar el reconocedor nativo si detecta algo
    if (results.gestures && results.gestures.length > 0) {
      currentGesture = results.gestures[0][0].categoryName;
    }
    
    // Si no detecta Open_Palm nativo, usar detección personalizada
    if (currentGesture !== 'Open_Palm' && results.landmarks && detectCustomOpenPalm(results.landmarks)) {
      currentGesture = 'Open_Palm';
    }

    if (currentGesture !== 'None' && detectGestureChange(currentGesture)) {
      lastGestures.push(currentGesture);
      if (lastGestures.length > 3) lastGestures.shift();

      if (lastGestures.length === 3 && detectPulse()) {
        // lastGestures = ["Open_Palm"]; // reset
        jump();
      }

    }

    if (currentGesture === 'Thumb_Up') resetGame();
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasRef.width, canvasRef.height);
  const drawingUtils = new DrawingUtils(canvasCtx);

  canvasRef.style.height = videoHeight + "px";
  videoRef.style.height = videoHeight + "px";
  canvasRef.style.width = videoWidth + "px";
  videoRef.style.width = videoWidth + "px";

  if (results && results.landmarks) {
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        { color: "#00FF00", lineWidth: 3 }
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
    }
  }

  canvasCtx.restore();

  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  }
};

// Función para detectar mano abierta personalizada
const detectCustomOpenPalm = (landmarks) => {
  if (!landmarks || landmarks.length === 0) return false;
  
  const hand = landmarks[0]; // Primera mano detectada
  
  // Índices de landmarks para las puntas y articulaciones de los dedos
  const fingerTips = [8, 12, 16, 20]; // Índice, medio, anular, meñique
  const fingerMCPs = [5, 9, 13, 17]; // Articulaciones base de los dedos
  
  // Verificar que todos los dedos (excepto pulgar) estén extendidos
  let extendedFingers = 0;
  
  for (let i = 0; i < fingerTips.length; i++) {
    const tipY = hand[fingerTips[i]].y;
    const mcpY = hand[fingerMCPs[i]].y;
    
    // El dedo está extendido si la punta está por encima de la articulación base
    if (tipY < mcpY) {
      extendedFingers++;
    }
  }
  
  // Para el pulgar (opcional, más flexible)
  const thumbTipY = hand[4].y;
  const thumbMCPY = hand[2].y;
  const thumbExtended = thumbTipY < thumbMCPY;
  
  // Considerar mano abierta si:
  // - Al menos 3 dedos están extendidos, O
  // - Todos los dedos (incluido pulgar) están extendidos
  return extendedFingers >= 3 || (extendedFingers >= 2 && thumbExtended);
};

const detectPulse = () => {
  return (
    lastGestures[0] === 'Open_Palm' &&
    lastGestures[1] === 'Closed_Fist' &&
    lastGestures[2] === 'Open_Palm'
  );
};

const detectGestureChange = (currentGesture) => {
  if (previousGesture !== currentGesture) {
    previousGesture = currentGesture;
    return true;
  }
  return false;
};

export { detectPulse };
