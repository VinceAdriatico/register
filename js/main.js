import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

let camera, scene, renderer, controls;  // ✅ Declaring controls globally

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
        0.4, // Fix near clipping
        5000000  // Fix far clipping
    );
    camera.position.set(0, 100, 0);

    const environment = new RoomEnvironment(renderer);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        'aquarium-scene.png?url',
        function (texture) {
            console.log('✅ Texture loaded successfully:', texture);

            // Fix potential flipping issues
            texture.flipY = false;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1); // Adjust for proper scaling

            // Load GLTF Model after texture is loaded
            loadGLTFModel(texture);
        },
        undefined,
        function (error) {
            console.error('❌ Error loading texture:', error);
        }
    );

    // ✅ Initialize controls globally
    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 600000;
    controls.target.set(10, 90, -16);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}

// Load GLTF Model and Apply Texture
function loadGLTFModel(texture) {
    const loader = new GLTFLoader();
    loader.load('aquarium-scene.glb?url', function (gltf) {
        console.log('✅ GLTF model loaded successfully');
        const model = gltf.scene;
        scene.add(model);

        // Apply texture to all meshes
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.material.map) {
                    console.log(`🎨 Replacing existing texture on: ${child.name}`);
                }
                child.material.map = texture;
                child.material.needsUpdate = true;
                child.material.depthTest = true;
                child.material.depthWrite = true;

            }
        });

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // ✅ Adjust camera and controls using globally defined `controls`
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();

        render();
    },
        undefined,
        function (error) {
            console.error('❌ Error loading GLTF model:', error);
        });
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
