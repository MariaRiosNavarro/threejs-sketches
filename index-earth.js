import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js";



const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);



// Controls

new OrbitControls(camera, renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;


// 3d-Objects in the scene


const geometry = new THREE.IcosahedronGeometry(1, 24);
const material = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    // flatShading: true
});
const earthMesh = new THREE.Mesh(geometry, material);
scene.add(earthMesh);





// Add 3d effect to the object

const hemilight = new THREE.HemisphereLight(0x000000, 0xFFFFFF);
scene.add(hemilight);


function animate() {
    requestAnimationFrame(animate);
    earthMesh.rotation.x += 0.001;
    earthMesh.rotation.y += 0.002;
    renderer.render(scene, camera);
    controls.update();
}

animate();



























// const scene = new THREE.Scene();


// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// camera.position.z = 5;


// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);


// function animate() {
//     requestAnimationFrame(animate);
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
//     renderer.render(scene, camera);
// }

// animate();
