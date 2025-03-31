// loadToggleAnimationModel.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadToggleAnimationModel({
    scene,
    camera,
    modelPath,
    meshName = 'Plane001',
    position = new THREE.Vector3(0, 0, 0),
    scale = new THREE.Vector3(1, 1, 1),
    initialAnimation = 'animation_1',
    alternateAnimation = 'animation_2',
    frameCount = 80,
    frameRate = 30,
    framePath = (name, index) => `/animate/${name}/${name}_${String(index).padStart(5, '0')}.jpg`,
    onLoaded = () => {},
}) {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    let animationTarget = null;
    let currentAnimation = initialAnimation;
    let animationTimeout = null;
    let currentTexture = null;

    function setupAnimation(animationName) {
        if (animationTimeout) clearTimeout(animationTimeout);

        let frameIndex = 0;

        function updateTexture() {
            const path = framePath(animationName, frameIndex);
            textureLoader.load(path, (texture) => {
                texture.flipY = false;
                if (currentTexture) currentTexture.dispose();
                currentTexture = texture;

                if (animationTarget?.material) {
                    animationTarget.material.map = texture;
                    animationTarget.material.needsUpdate = true;
                }
            });

            frameIndex = (frameIndex + 1) % frameCount;
            animationTimeout = setTimeout(updateTexture, 1000 / frameRate);
        }

        updateTexture();
    }

    function toggleAnimation() {
        currentAnimation = currentAnimation === initialAnimation ? alternateAnimation : initialAnimation;
        setupAnimation(currentAnimation);
    }

    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;
            model.position.copy(position);
            model.scale.copy(scale);
            scene.add(model);

            model.traverse((child) => {
                if (child.isMesh && child.name === meshName) {
                    animationTarget = child;
                }
            });

            if (animationTarget) {
                setupAnimation(currentAnimation);

                document.addEventListener('click', (event) => {
                    const raycaster = new THREE.Raycaster();
                    const mouse = new THREE.Vector2();
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObjects(scene.children, true);

                    for (let i = 0; i < intersects.length; i++) {
                        if (intersects[i].object === animationTarget) {
                            toggleAnimation();
                            break;
                        }
                    }
                });
            }

            onLoaded(model);
        },
        undefined,
        (error) => console.error('Error loading animated model:', error)
    );
}