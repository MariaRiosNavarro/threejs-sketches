// Import the main Three.js library and OrbitControls for camera manipulation
import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js";

// Get the browser window dimensions for the canvas
const width = window.innerWidth;
const height = window.innerHeight;

// Create a new 3D scene - this is where all our objects will live
const scene = new THREE.Scene();

// Set up the camera
// Parameters: Field of View (75 degrees), Aspect Ratio, Near Clipping Plane, Far Clipping Plane
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// Move the camera back 5 units so we can see the scene
camera.position.z = 5;

// Create the WebGL renderer with antialiasing for smoother edges
const renderer = new THREE.WebGLRenderer({antialias: true});
// Set the renderer size to match the window
renderer.setSize(width, height);
// Configure color and tone mapping for more realistic lighting
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Add the renderer's canvas element to the HTML document
document.body.appendChild(renderer.domElement);

// Set up OrbitControls to allow camera manipulation with mouse/touch
const controls = new OrbitControls(camera, renderer.domElement);
// Enable smooth camera movement
controls.enableDamping = true;
// Set how quickly the camera movement slows down
controls.dampingFactor = 0.03;

// Create a simple cube
// First, create the cube's shape (geometry)
const geometry = new THREE.BoxGeometry();
// Then create the cube's material - yellow color with standard lighting properties
const material = new THREE.MeshStandardMaterial({color: 0xffff00});
// Combine the geometry and material to create a mesh (the actual 3D object)
const cube = new THREE.Mesh(geometry, material);
// Add the cube to our scene
scene.add(cube);

// Add hemisphere light to the scene
// Parameters: Sky color (white), Ground color (gray)
const hemilight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemilight);

// Animation loop
function animate() {
    // Schedule the next frame
    requestAnimationFrame(animate);
    
    // Rotate the cube a little bit each frame
    cube.rotation.x += 0.01;  // Rotate around X axis
    cube.rotation.y += 0.02;  // Rotate around Y axis
    
    // Render the scene with the camera
    renderer.render(scene, camera);
}

// Start the animation loop
animate()

// Function to handle window resizing
function handleWindowResize() {
    // Update the camera's aspect ratio to match the new window dimensions
    camera.aspect = window.innerWidth / window.innerHeight;
    // Tell the camera to update its internal calculations
    camera.updateProjectionMatrix();
    // Update the renderer's size to match the new window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Update the controls to match the new camera
    controls.update();
}

// Add an event listener that calls handleWindowResize whenever the window is resized
// The 'false' parameter is for event bubbling and is usually set to false for most use cases
window.addEventListener('resize', handleWindowResize, false);





// BOILERPLATE without Coments:

// import * as THREE from "three";
// import {OrbitControls} from "jsm/controls/OrbitControls.js";

// const width = window.innerWidth;
// const height = window.innerHeight;
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// camera.position.z = 5;
// const renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.setSize(width, height);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputColorSpace = THREE.SRGBColorSpace;

// document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshStandardMaterial({color: 0xffff00});
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// const hemilight = new THREE.HemisphereLight(0xffffff, 0x444444);
// scene.add(hemilight);

// function animate() {
//     requestAnimationFrame(animate);
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.02;
//     renderer.render(scene, camera);
//     controls.update();
// }

// animate()

// function handleWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }
// window.addEventListener('resize', handleWindowResize, false);