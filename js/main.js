import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

let camera, scene, renderer, controls;
let televisionScreen, textureLoader;
let frameIndex = 0;
const totalFrames = 100; // Adjust based on the number of frames
const frameRate = 30; // Frames per second
let animationInterval;

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
    // default
    camera.position.set(90, 10, 200);

    // center
    // camera.position.set(0, 0, 100);


    const environment = new RoomEnvironment(renderer);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();

    textureLoader = new THREE.TextureLoader();

    // Load aquarium scene
    textureLoader.load(
        'aquarium-scene.png?url',
        function (texture) {
            console.log('✅ Texture loaded successfully:', texture);
            texture.flipY = false;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            loadGLTFModel(texture);
        },
        undefined,
        function (error) {
            console.error('❌ Error loading texture:', error);
        }
    );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 600000;
    controls.target.set(10, 90, -16);
    controls.update();
    

    window.addEventListener('resize', onWindowResize);
}

// Load Aquarium Scene
function loadGLTFModel(texture) {
    const loader = new GLTFLoader();
    loader.load('aquarium-scene.glb?url', function (gltf) {
        console.log('✅ GLTF model loaded successfully');
        const model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
            if (child.isMesh) {
                // if (child.material.map) {
                //     console.log(`🎨 Replacing existing texture on: ${child.name}`);
                // }
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

        // Load television model
        loadAdditionalModel();

        render();
    },
    undefined,
    function (error) {
        console.error('❌ Error loading GLTF model:', error);
    });
}

function loadAdditionalModel() {
    const loader = new GLTFLoader();
    loader.load(
        'television-ad.glb',
        function (gltf) {
            const model = gltf.scene;
            scene.add(model);

            model.position.set(34, 8, -15);
            model.scale.set(5, 5, 5);

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            // model.position.sub(center);

            let televisionScreen = null;

            // Find the correct mesh (Plane001)
            model.traverse((child) => {
                if (child.isMesh && child.name === 'Plane001') {
                    televisionScreen = child;
                    console.log('📺 Assigned television screen to:', child.name);
                }
            });

            if (!televisionScreen) {
                console.warn('⚠️ No television screen found in the model.');
                return;
            }

            // Start animation once the model is loaded
            setupAnimation(televisionScreen);
        },
        undefined,
        function (error) {
            console.error('❌ Error loading television model:', error);
        }
    );
}

// Animate Texture Frames
function setupAnimation(televisionScreen) {
    let frameIndex = 0;
    const totalFrames = 100; // Adjust based on actual frame count
    const frameRate = 30; // Frames per second
    const textureLoader = new THREE.TextureLoader();

    function updateTexture() {
        const framePath = `/animate/television_ad/television_ad_${String(frameIndex).padStart(5, '0')}.jpg?url`;

        textureLoader.load(framePath, function (texture) {
            texture.flipY = false; // Fix upside-down animation
            texture.needsUpdate = true;

            televisionScreen.material.map = texture;
            televisionScreen.material.needsUpdate = true;

            render(); // 🚀 Force scene update
        });

        frameIndex = (frameIndex + 1) % totalFrames; // Loop animation
        setTimeout(updateTexture, 1000 / frameRate); // Schedule next frame
    }

    updateTexture(); // Start animation loop
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}