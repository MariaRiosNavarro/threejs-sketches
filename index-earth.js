import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js";

import getStartfield from "./src/getStarfield.js";
import {getFresnelMat} from "./src/getFresnelMat.js";

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);


const earthGroup = new THREE.Group();
earthGroup.rotation.z = 23.4 * Math.PI / 180;
scene.add(earthGroup);


// Controls

const controls = new OrbitControls(camera, renderer.domElement);



// 3d-Objects in the scene

const detail = 12;

const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshStandardMaterial({
    map: loader.load('/textures/00_earthmap1k.jpg')
});

// Earth
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// Earth Light

const lightMat = new THREE.MeshBasicMaterial({
    map:loader.load("/textures/03_earthlights1k.jpg"),
    blending: THREE.AdditiveBlending,
});
const lightMesh = new THREE.Mesh(geometry, lightMat);

earthGroup.add(lightMesh);


//Glow

const glowMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, glowMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);


// Earth Clouds

const cloudsMat = new THREE.MeshBasicMaterial({
    map:loader.load("/textures/04_earthcloudmap.jpg"),
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
});

const cloudMesh = new THREE.Mesh(geometry, cloudsMat);
cloudMesh.scale.setScalar(1.02);
earthGroup.add(cloudMesh);


//Stars

const stars = getStartfield(2000);
scene.add(stars);


// SUNLIGHT

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(-2, -0.5, 1.5);
scene.add(sunLight);

function animate() {
    requestAnimationFrame(animate);
    earthMesh.rotation.y += 0.002;
    lightMesh.rotation.y += 0.002;
    cloudMesh.rotation.y += 0.0023;
    glowMesh.rotation.y += 0.002;
    renderer.render(scene, camera);
    controls.update();
}

animate();















