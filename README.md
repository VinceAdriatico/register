# store register

## How to Install

### Install Dependencies

`npm install --save three`
`npm install --save-dev vite`

## Run dev server

`npx vite`

## Requirements to Build

- [ ] Add `index.html`

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>VinceAdr 3D Models</title>
		<style>
			body { margin: 0; }
		</style>
	</head>
	<body>
		<div id="container"></div>
		<script type="module" src="js/main.js"></script>
	</body>
</html>
```

- [ ] Add `main.js` - *cube start*

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );

}

```

### Install Pages

- [ ] `npm install -g gh-pages`
- [ ] Add Deploy Script in `package.json`

*deploy script*
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "deploy": "gh-pages -d dist"
}
```

### Pushing to Production

*Need to revert this when on dev**

- [ ] `?url` added to glb and texture file references path
- [ ] `.` add to frames path for relative
- [ ] `npx vite build`
- [ ] `./assets/index.hjtml` in `distr/index.html` directory for relative 

## Publish on Pages

`npm run deploy`


## TO-DO

- [ ] Refactor code into modules [import]
- [ ] Create interface that dynamically changes position of additional models
- [ ] Light Channels
- [ ] Three.JS Color Textures (for dynamic models and lights)

```js
// utils.js
export function sayHello() {
    console.log("Hello from utils.js!");
}

```
```js
// main.js
import { sayHello } from './utils.js';

sayHello(); // Outputs: Hello from utils.js!

```

- [ ] Create modules from commonly used functions (*e.g. loading modules with position*)

```js
// utils.js (Module File)
export function greet(name) {
    console.log(`Hello, ${name}!`);
}
```
```js
// main.js
import { greet } from './utils.js';

const userName = "John";
greet(userName); // Outputs: Hello, John!

```


## References

Adjusting the Camera Position

Modify the x, y, z values to place the camera at a different position. For example:

    Move the camera closer → Decrease the z value.
    Move the camera higher → Increase the y value.
    Move the camera to the side → Adjust the x value.