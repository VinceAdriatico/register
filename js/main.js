import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

let camera, scene, renderer;

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

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 100, 0);

    const environment = new RoomEnvironment(renderer);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();

    // const grid = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
    // grid.material.opacity = 0.5;
    // grid.material.depthWrite = false;
    // grid.material.transparent = true;
    // scene.add(grid);

    const ktx2Loader = new KTX2Loader()
        .setTranscoderPath('jsm/libs/basis/')
        .detectSupport(renderer);

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('aquarium-scene.png'); // Replace with your texture file

    // Load GLTF Model
    const loader = new GLTFLoader();
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('aquarium-scene.glb', function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(5,5,5);
    
        // Apply texture to all materials
        model.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                if (!geometry.attributes.uv) {
                    console.warn('No UV coordinates found for', child);
                    return;
                }
    
                // // Ensure UV coordinates exist
                // console.log('UV Mapping:', geometry.attributes.uv.array);
    
                // Assign texture to material
                child.material.map = texture;
                child.material.needsUpdate = true;
    
                // Adjust texture settings
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrappingZ;
                texture.repeat.set(1, 1); // Change these values if needed to scale texture
            }
        });
    
        scene.add(model);
        render();
    });
    
    

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 400;
    controls.maxDistance = 1000;
    controls.target.set(10, 90, -16);
    controls.update();

    window.addEventListener('resize', onWindowResize);
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
