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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

camera.position.z = 5;

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
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
