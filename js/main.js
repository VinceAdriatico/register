import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadModel } from './loadModel.js';
import { loadToggleAnimationModel } from './loadToggleAnimationModel.js';

let camera, scene, renderer, controls;
let televisionScreen, textureLoader;
let animationTimeout = null;
let currentAnimation = 'television_ad';
let alternateAnimation = 'television_ad_2';

init();
render();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.4, 5000000);
    camera.position.set(139, 11, 155);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', () => {
    //     console.log(`Camera Position: ${camera.position.x.toFixed(0)}, ${camera.position.y.toFixed(0)}, ${camera.position.z.toFixed(0)}`);
    // });
    controls.minDistance = 10;
    controls.maxDistance = 600000;
    controls.target.set(20, 90, -16);
    controls.update();

    loadModel({
        scene,
        modelPath: 'aquarium-scene.glb',
        texturePath: 'aquarium-scene.png',
        position: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        onLoad: (model) => {
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();
            render();
        }
    });

    loadModel({
        scene,
        modelPath: 'television-ad.glb',
        position: new THREE.Vector3(34, 8, -31),
        scale: new THREE.Vector3(4, 5, 1),
        onLoad: (model) => {
            model.traverse((child) => {
                if (child.isMesh && child.name === 'Plane001') {
                    televisionScreen = child;
                }
            });
    
            if (televisionScreen) {
                setupAnimation(televisionScreen, currentAnimation); // ← THIS was missing!
            }
        }
    });


    window.addEventListener('resize', onWindowResize);
    document.addEventListener('click', onDocumentClick);
}

function setupAnimation(televisionScreen) {
    if (!televisionScreen) return;
    if (animationTimeout) {
        clearTimeout(animationTimeout);
    }

    let frameIndex = 0;
    const totalFrames = 80;
    const frameRate = 30;
    const textureLoader = new THREE.TextureLoader();
    let currentTexture = null;

    function updateTexture() {
        const framePath = `/animate/${currentAnimation}/${currentAnimation}_${String(frameIndex).padStart(5, '0')}.jpg`;

        textureLoader.load(framePath, function (texture) {
            texture.flipY = false;
            texture.needsUpdate = true;

            // Dispose of the previous texture
            if (currentTexture) {
                currentTexture.dispose();
            }
            currentTexture = texture;

            televisionScreen.material.map = texture;
            televisionScreen.material.needsUpdate = true;

            render();
        });

        frameIndex = (frameIndex + 1) % totalFrames;
        animationTimeout = setTimeout(updateTexture, 1000 / frameRate);
    }

    updateTexture();
}

// Click event handler to toggle animations on the television
function onTelevisionClick() {
    currentAnimation = currentAnimation === 'television_ad' ? 'television_ad_2' : 'television_ad';
    setupAnimation(televisionScreen);
}

function onDocumentClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        if (televisionScreen && intersects[i].object === televisionScreen) {
            onTelevisionClick();
            break;
        }
    }
}

document.addEventListener('click', function (event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    for (let i = 0; i < intersects.length; i++) {
        if (televisionScreen && intersects[i].object === televisionScreen) {
            onTelevisionClick();
            break;
        }
    }
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}
