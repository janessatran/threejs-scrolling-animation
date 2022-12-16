import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "gltfLoader";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

/**
 * Models
 */
const allAssetUrls = [
  "./assets/models/christmas/treeDecorated.glb",
  "./assets/models/christmas/candyCane.glb",
  "./assets/models/christmas/presentGreenRound.glb",
];

const allAssets = [];

let assetCount = 0;
let assetTotal = allAssetUrls.length;
const objectDistance = 6;
const loader = new GLTFLoader();

const loadAssets = async () => {
  for (let i = 0; i < assetTotal; i++) {
    allAssets[i] = loader.load(
      allAssetUrls[i],
      (asset) => {
        let obj = asset.scene;
        console.log(obj);
        if (obj.id === 17) {
          obj.scale.set(3, 1.5, 2);
          obj.position.y = -objectDistance * 1 - 0.6;
          obj.position.x = 2 / sizes.width - 1;
          obj.rotation.set(0.2, 0.4, 0);
          addScrollAnimation(obj);
        } else if (obj.id === 26) {
          obj.scale.set(6, 10, 6);
          obj.position.y = -objectDistance * 0 - 0.9;
          obj.position.x = 3 / sizes.width + 0.3;
          obj.rotation.set(0.1, -3.5, 0.5);
          addScrollAnimation(obj);
        } else {
          obj.scale.set(4, 4, 4);
          obj.position.y = -objectDistance * 2 - 0.5;
          obj.position.x = 2.4 / sizes.width + 1.2;
          obj.rotation.set(0.2, 0.4, 0);
          addScrollAnimation(obj);
        }
        const light = new THREE.PointLight("white", 1, 10);
        light.position.set(obj.position.x, obj.position.y, 20);
        scene.add(light);
        scene.add(obj);
      },
      undefined,
      (error) => console.error(error)
    );
  }
  return allAssets;
};

loadAssets();

const addScrollAnimation = (obj) => {
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    // const newSection = Math.round(scrollY / sizes.height);
    // console.log("current", currentSection);
    // console.log("new", newSection);
    // if (newSection != currentSection) {
    //   currentSection = newSection;
    gsap.to(obj.rotation, {
      duration: 1,
      ease: "power2.inOut",
      x: "+=0.1",
      y: "+=3",
      z: "+=2.5",
    });
    // }
  });
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

const textureLoader = new THREE.TextureLoader();
const snowTexture = textureLoader.load(
  "./assets/textures/snowflake/snowflake3.png"
);

/**
 * Particles
 */
// Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectDistance * 0.5 - Math.random() * objectDistance * allAssets.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
// Material
const particlesMaterial = new THREE.PointsMaterial({
  map: snowTexture,
  blending: THREE.AdditiveBlending,
  depthTest: true,
  sizeAttenuation: true,
  transparent: true,
  size: 1,
  opacity: 0.2,
});
particlesMaterial.needsUpdate = true;

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 12;
cameraGroup.add(camera);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

let light = new THREE.PointLight(0xffffff, 2);
camera.add(light);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); // the default
scene.background = new THREE.Color("#c0d8c0");
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  // You need to divide scrollY by the height of the viewport so that it only moves based on the section instead of every pixel
  // Parallax
  camera.position.y = (-scrollY / sizes.height) * objectDistance;
  const parallaxX = cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;

  // easing
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
