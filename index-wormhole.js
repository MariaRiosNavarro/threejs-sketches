import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js";
import spline from "./src/spline.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";


// Second Version


// Basic Setup
const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.3);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// Post-processing setup
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Create tube geometry from spline with more segments and smaller radius
// Increased tubular segments to 444 (from 222) for denser lines
// Reduced radius to 0.45 (from 0.65) to make it more closed
const tubeGeo = new THREE.TubeGeometry(spline, 888, 0.45, 32, true);

// Create edges for the tube with more segments
const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
// Softer red color (mixing red with some white and reducing intensity)
const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0xfff4e0).multiplyScalar(0.7)
});
const tubeLines = new THREE.LineSegments(edges, lineMat);
scene.add(tubeLines);

// Store all spheres for raycasting
const spheres = [];

// Add spheres to the scene
const numSpheres = 55;
const radius = 0.075 * 0.50;

// Create sphere geometry (reuse for all spheres)
const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);

for (let i = 0; i < numSpheres; i += 1) {
    // Generate random color for each sphere
    const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
    
    // Create sphere material with random color
    const sphereMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true
    });
    
    // Create sphere mesh
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    
    // Position sphere along the tube with some randomness
    const p = (i / numSpheres + Math.random() * 0.1) % 1;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    // Reduced random position spread to match smaller tube radius
    pos.x += (Math.random() - 0.5) * 0.4;
    pos.z += (Math.random() - 0.5) * 0.4;
    sphere.position.copy(pos);
    
    // Random rotation
    sphere.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    
    // Add to scene and store in array
    scene.add(sphere);
    spheres.push(sphere);
}

// Setup raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle mouse clicks
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(spheres);
    
    if (intersects.length > 0) {
        // Get the first intersected sphere
        const sphere = intersects[0].object;
        
        // Create explosion effect
        explodeSphere(sphere);
    }
}


// Create heart shape function
function createHeartShape() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;

    // Beginne am unteren Punkt des Herzens
    shape.moveTo(x, y);

    // Linke Kurve
    shape.bezierCurveTo(
        x - 2.5, y - 2.5,  // Steuerpunkt 1
        x - 5, y + 2.5,    // Steuerpunkt 2
        x, y + 5           // Endpunkt
    );

    // Rechte Kurve
    shape.bezierCurveTo(
        x + 5, y + 2.5,    // Steuerpunkt 1
        x + 2.5, y - 2.5,  // Steuerpunkt 2
        x, y               // Endpunkt
    );

    return shape;
}


// Create explosion effect with tiny hearts
function explodeSphere(sphere) {
    // Remove sphere from the scene and array
    scene.remove(sphere);
    spheres.splice(spheres.indexOf(sphere), 1);
    
    // Create a group to hold the hearts
    const particleCount = 20;
    const particles = new THREE.Group();
    
    // Create heart geometry (reuse for all particles)
    const heartShape = createHeartShape();
    const heartGeometry = new THREE.ShapeGeometry(heartShape);
    // Scale down the hearts for smaller size
    const scaleFactor = 0.05; // Smaller scale factor for smaller hearts
    heartGeometry.scale(scaleFactor, scaleFactor, scaleFactor);
    
    for (let i = 0; i < particleCount; i++) {
        const heartMaterial = new THREE.MeshBasicMaterial({
            color: sphere.material.color, // Use sphere's color
            side: THREE.DoubleSide,       // Ensure both sides are visible
        });

        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        
        // Set initial position to the sphere's position
        heart.position.copy(sphere.position);
        
        // Assign random velocity for the explosion
        heart.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2, // Horizontal spread
            (Math.random() - 0.5) * 0.2, // Vertical spread
            (Math.random() - 0.5) * 0.2  // Depth spread
        );

        // Rotate the heart 180 degrees around the Y-axis (so it's right-side up)
        heart.rotation.y = Math.PI; 
        
        // Add random rotation to each heart
        heart.rotation.x = Math.random() * Math.PI * 2; // Random rotation on X
        heart.rotation.z = Math.random() * Math.PI * 2; // Random rotation on Z
        
        particles.add(heart);
    }
    
    // Add the particles group to the scene
    scene.add(particles);
    
    // Animate the explosion
    const animateParticles = () => {
        particles.children.forEach(heart => {
            // Update position based on velocity
            heart.position.add(heart.userData.velocity);
            
            // Apply slight velocity decay for a smooth explosion effect
            heart.userData.velocity.multiplyScalar(0.95); // Decay velocity over time
        });
        
        // Remove particles when their velocity becomes negligible
        if (particles.children.every(heart => heart.userData.velocity.length() < 0.01)) {
            scene.remove(particles);
        } else {
            requestAnimationFrame(animateParticles);
        }
    };
    
    animateParticles();
}





// Add click event listener
window.addEventListener('click', onMouseClick, false);

// Camera update function
function updateCamera(t) {
    const time = t * 0.05;
    const looptime = 10 * 1000;
    const p = (time % looptime) / looptime;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

// Animation loop
function animate(t=0) {
    requestAnimationFrame(animate);
    updateCamera(t);
    composer.render(scene, camera);
    controls.update();
}

animate();

// Handle window resizing
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize, false);



// First Version

// // Basic Setup
// const width = window.innerWidth;
// const height = window.innerHeight;
// const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0x000000, 0.3);
// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// camera.position.z = 5;
// const renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.setSize(width, height);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputColorSpace = THREE.SRGBColorSpace;

// document.body.appendChild(renderer.domElement);
// // Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;

// // Post-processing
// const renderScene = new RenderPass(scene, camera);
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 100);
// bloomPass.threshold = 0.002;
// bloomPass.strength = 3.5;
// bloomPass.radius = 0;
// const composer = new EffectComposer(renderer);
// composer.addPass(renderScene);
// composer.addPass(bloomPass);

// //Create a line geometry from the spline
// const points = spline.getPoints(100);
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const material = new THREE.LineBasicMaterial({color: 0xff0000});
// const line = new THREE.Line(geometry, material);
// // scene.add(line);


// // Create a tube geometry from the spline
// const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);


// //create edges geometry from the spline
// const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
// const lineMat = new THREE.LineBasicMaterial({color: 0xff0000});
// const tubeLines = new THREE.LineSegments(edges, lineMat);
// scene.add(tubeLines);

// // Add boxes to the scene
// const numBoxes = 55;
// const size = 0.075;
// const boxGeo = new THREE.BoxGeometry(size, size, size);
// for (let i = 0; i < numBoxes; i += 1) {
//     const boxMat = new THREE.MeshBasicMaterial({
//         color: 0xffffff,
//         wireframe: true
//     });
//     const box = new THREE.Mesh(boxGeo, boxMat);
//     const p = (i / numBoxes + Math.random() * 0.1) % 1;
//     const pos = tubeGeo.parameters.path.getPointAt(p);
//     pos.x += Math.random() - 0.4;
//     pos.z += Math.random() - 0.4;
//     box.position.copy(pos);
//     const rote = new THREE.Vector3(
//         Math.random() * Math.PI,
//         Math.random() * Math.PI,
//         Math.random() * Math.PI
//     );
//     box.rotation.set(rote.x, rote.y, rote.z);

//     const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
//     const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
//     const lineMat = new THREE.LineBasicMaterial({color});
//     const boxLines = new THREE.LineSegments(edges, lineMat);
//     boxLines.position.copy(pos);
//     boxLines.rotation.set(rote.x, rote.y, rote.z);
//     scene.add(boxLines);

// }


// function updateCamera(t) {
//     const time = t * 0.1;
//     const looptime = 4 * 1000;
//     const p = (time % looptime) / looptime;
//     const pos = tubeGeo.parameters.path.getPointAt(p);
//     const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
//     camera.position.copy(pos);
//     camera.lookAt(lookAt);
// }

// function animate(t=0) {
//     requestAnimationFrame(animate);
//     updateCamera(t);
//     composer.render(scene, camera);
//     controls.update();
// }

// animate()

// function handleWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }
// window.addEventListener('resize', handleWindowResize, false);

































// Bobby Roe CODE in https://github.com/bobbyroe/flythru-wireframe-wormhole/blob/main/index.js

// import * as THREE from "three";
// import { OrbitControls } from 'jsm/controls/OrbitControls.js';
// import spline from "./src/spline.js";
// import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "jsm/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

// const w = window.innerWidth;
// const h = window.innerHeight;
// const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0x000000, 0.3);
// const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
// camera.position.z = 5;
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(w, h);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputColorSpace = THREE.SRGBColorSpace;
// document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;

// // post-processing
// const renderScene = new RenderPass(scene, camera);
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
// bloomPass.threshold = 0.002;
// bloomPass.strength = 3.5;
// bloomPass.radius = 0;
// const composer = new EffectComposer(renderer);
// composer.addPass(renderScene);
// composer.addPass(bloomPass);

// // create a line geometry from the spline
// const points = spline.getPoints(100);
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const line = new THREE.Line(geometry, material);
// // scene.add(line);

// // create a tube geometry from the spline
// const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);

// // create edges geometry from the spline
// const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
// const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const tubeLines = new THREE.LineSegments(edges, lineMat);
// scene.add(tubeLines);

// const numBoxes = 55;
// const size = 0.075;
// const boxGeo = new THREE.BoxGeometry(size, size, size);
// for (let i = 0; i < numBoxes; i += 1) {
//   const boxMat = new THREE.MeshBasicMaterial({
//     color: 0xffffff,
//     wireframe: true
//   });
//   const box = new THREE.Mesh(boxGeo, boxMat);
//   const p = (i / numBoxes + Math.random() * 0.1) % 1;
//   const pos = tubeGeo.parameters.path.getPointAt(p);
//   pos.x += Math.random() - 0.4;
//   pos.z += Math.random() - 0.4;
//   box.position.copy(pos);
//   const rote = new THREE.Vector3(
//     Math.random() * Math.PI,
//     Math.random() * Math.PI,
//     Math.random() * Math.PI
//   );
//   box.rotation.set(rote.x, rote.y, rote.z);
//   const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
//   const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
//   const lineMat = new THREE.LineBasicMaterial({ color });
//   const boxLines = new THREE.LineSegments(edges, lineMat);
//   boxLines.position.copy(pos);
//   boxLines.rotation.set(rote.x, rote.y, rote.z);
//   // scene.add(box);
//   scene.add(boxLines);
// }

// function updateCamera(t) {
//   const time = t * 0.1;
//   const looptime = 10 * 1000;
//   const p = (time % looptime) / looptime;
//   const pos = tubeGeo.parameters.path.getPointAt(p);
//   const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
//   camera.position.copy(pos);
//   camera.lookAt(lookAt);
// }

// function animate(t = 0) {
//   requestAnimationFrame(animate);
//   updateCamera(t);
//   composer.render(scene, camera);
//   controls.update();
// }
// animate();

// function handleWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// }
// window.addEventListener('resize', handleWindowResize, false);