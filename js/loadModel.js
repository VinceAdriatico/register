// loadModel.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadModel({
    scene,
    modelPath,
    texturePath = null,
    position = new THREE.Vector3(0, 0, 0),
    scale = new THREE.Vector3(1, 1, 1),
    onLoad = () => {},
    onError = (error) => console.error('Error loading model:', error)
}) {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    const applyTextureAndAddModel = (texture = null) => {
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                model.position.copy(position);
                model.scale.copy(scale);

                if (texture) {
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.material.map = texture;
                            child.material.needsUpdate = true;
                            child.material.depthTest = true;
                            child.material.depthWrite = true;
                        }
                    });
                }

                scene.add(model);
                onLoad(model);
            },
            undefined,
            onError
        );
    };

    if (texturePath) {
        textureLoader.load(
            texturePath,
            (texture) => {
                texture.flipY = false;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                applyTextureAndAddModel(texture);
            },
            undefined,
            onError
        );
    } else {
        applyTextureAndAddModel();
    }
}