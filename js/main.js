import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let camera, scene, renderer, controls;
let televisionScreen, textureLoader;
let frameIndex = 0;
const totalFrames = 100;
const frameRate = 30;
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

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.4,
        5000000
    );
    
    camera.position.set(80, 30, 200);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);

    textureLoader = new THREE.TextureLoader();

    textureLoader.load(
        'aquarium-scene.png?url',
        function (texture) {
            texture.flipY = false;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            loadGLTFModel(texture);
        },
        undefined,
        function (error) {
            console.error('Error loading texture:', error);
        }
    );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 600000;
    controls.target.set(20, 90, -16);
    controls.update();

    loadPodiumModel();
    window.addEventListener('resize', onWindowResize);
}

function loadGLTFModel(texture) {
    const loader = new GLTFLoader();
    loader.load(
        'aquarium-scene.glb?url',
        function (gltf) {
            const model = gltf.scene;
            scene.add(model);

            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                    child.material.depthTest = true;
                    child.material.depthWrite = true;
                }
            });

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();

            loadAdditionalModel();
            render();
        },
        undefined,
        function (error) {
            console.error('Error loading GLTF model:', error);
        }
    );
}

function loadPodiumModel() {
    const loader = new GLTFLoader();
    loader.load(
        'Podium.glb?url',
        function (gltf) {
            const model = gltf.scene;
            scene.add(model);
            model.position.set(-10, -17, 60);
            model.scale.set(3, 3, 3);
        },
        undefined,
        function (error) {
            console.error('Error loading podium model:', error);
        }
    );
}

function loadAdditionalModel() {
    const loader = new GLTFLoader();
    loader.load(
        'television-ad.glb?url',
        function (gltf) {
            const model = gltf.scene;
            scene.add(model);

            model.position.set(34, 8, -31);
            model.scale.set(4, 5, 1);

            model.traverse((child) => {
                if (child.isMesh && child.name === 'Plane001') {
                    televisionScreen = child;
                }
            });

            if (!televisionScreen) return;

            setupAnimation(televisionScreen);
        },
        undefined,
        function (error) {
            console.error('Error loading television model:', error);
        }
    );
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
        const framePath = `./animate/${currentAnimation}/${currentAnimation}_${String(frameIndex).padStart(5, '0')}.jpg?url`;

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
