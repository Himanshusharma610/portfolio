/*===================================
  1. TYPING EFFECT
===================================*/
const typedOutput = document.getElementById('typed-output');
const phrases = [
    "SIMULATING NEURAL NETWORKS...",
    "COMPILING EMBEDDED FIRMWARE...",
    "MAPPING BRAIN ARCHITECTURE...",
    "SYSTEM: ONLINE."
];
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;

function typeLoop() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        typedOutput.textContent = currentPhrase.substring(0, letterIndex - 1);
        letterIndex--;
    } else {
        typedOutput.textContent = currentPhrase.substring(0, letterIndex + 1);
        letterIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && letterIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; 
    }

    setTimeout(typeLoop, typeSpeed);
}
typeLoop(); // Start typing

/*===================================
  2. 3D CARD TILT EFFECT (Vanilla JS)
===================================*/
const tiltElements = document.querySelectorAll('.tilt-element');

tiltElements.forEach(el => {
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
});

function handleMove(e) {
    const el = this;
    const height = el.clientHeight;
    const width = el.clientWidth;
    // Calculate mouse position relative to the element
    const rect = el.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;
    
    // Calculate rotation (multiplier controls intensity)
    const yRotation = 15 * ((xVal - width / 2) / width);
    const xRotation = -15 * ((yVal - height / 2) / height);
    
    const string = 'perspective(1000px) scale(1.02) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg)';
    el.style.transform = string;
}

function handleLeave(e) {
    // Reset transform on mouse leave
    this.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
}


/*===================================
  3. THREE.JS 3D NEURAL NETWORK BACKGROUND
===================================*/
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
const cameraThree = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Alpha true for transparent bg
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Create Particles representing AI nodes
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 180; 
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles randomly in 3D space
    posArray[i] = (Math.random() - 0.5) * 15; 
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Style the particles (neon blue dots)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.035,
    color: 0x00f7ff, // Neon blue
    transparent: true,
    opacity: 0.8
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

cameraThree.position.z = 5;

// Mouse Interaction for Parallax effect
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    // Slowly rotate the entire particle cloud
    particlesMesh.rotation.y += 0.0015;
    particlesMesh.rotation.x += 0.0005;

    // Parallax effect based on mouse position
    cameraThree.position.x += (mouseX * 2 - cameraThree.position.x) * 0.05;
    cameraThree.position.y += (-mouseY * 2 - cameraThree.position.y) * 0.05;
    cameraThree.lookAt(scene.position);

    renderer.render(scene, cameraThree);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    cameraThree.aspect = window.innerWidth / window.innerHeight;
    cameraThree.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/*===================================
  4. MEDIAPIPE HAND TRACKING INTEGRATION
===================================*/
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const hudContainer = document.getElementById('neural-hud');
const toggleBtn = document.getElementById('uplink-toggle');
const closeBtn = document.getElementById('close-hud');

let cameraActive = false;
let camera = null;

function onResults(results) {
    // Set canvas size to match video feed
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the video frame (slightly darkened for "hacker" vibe)
    canvasCtx.filter = 'brightness(60%) contrast(120%) grayscale(50%)';
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.filter = 'none';

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            // Draw Connectors (Bones) -> Neon Blue
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                {color: '#00f7ff', lineWidth: 2});
            
            // Draw Landmarks (Joints) -> Neon Green
            drawLandmarks(canvasCtx, landmarks, {
                color: '#0f0', 
                lineWidth: 1, 
                radius: 3
            });
        }
    }
    canvasCtx.restore();
}

// Initialize MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1, 
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Function to start the camera
function startCamera() {
    if(!camera) {
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: 640,
            height: 480,
            facingMode: 'user' // Ensures front camera on mobile
        });
    }
    camera.start();
    hudContainer.classList.remove('hidden');
    toggleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> INITIALIZING...';
    
    setTimeout(() => {
        toggleBtn.style.display = 'none'; // Hide button while active
    }, 1000);
}

// Function to stop the camera
function stopCamera() {
    hudContainer.classList.add('hidden');
    toggleBtn.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fa-solid fa-hand-sparkles"></i> RE-ACTIVATE_LINK';
}

// Event Listeners
toggleBtn.addEventListener('click', () => {
    if (!cameraActive) {
        startCamera();
        cameraActive = true;
    }
});

closeBtn.addEventListener('click', () => {
    stopCamera();
});
