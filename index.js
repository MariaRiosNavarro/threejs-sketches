import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js";



const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
// renderer.setClearColor(0x000000, 1);

document.body.appendChild(renderer.domElement);

// Camera Settings and Scene

const fov = 75;
const aspect = width / height;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

// Controls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;


// 3d-Objects in the scene


const geometry = new THREE.IcosahedronGeometry(1.0, 2);
const material = new THREE.MeshStandardMaterial({color: 0xffffff, flatShading: true});
const object = new THREE.Mesh(geometry, material);
scene.add(object);


// Add wireframe Material to the object

const wireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFee0, wireframe: true});
const wireframeMash = new THREE.Mesh(geometry, wireframeMaterial);
wireframeMash.scale.setScalar(1.001);
object.add(wireframeMash);


// Add 3d effect to the object

const hemilight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemilight);


function animate(time = 0) {
    requestAnimationFrame(animate);
    // form.scale.setScalar(Math.cos(time * 0.001)+ 1.0);
    // object.rotation.x += 0.01;
    object.rotation.y = time * 0.0001;
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
