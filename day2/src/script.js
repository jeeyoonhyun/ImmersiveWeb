import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */

let mesh;
let geometry;
// const geometry = new THREE.TorusKnotGeometry( 1, 0.02, 8, 16 );
const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

for (let i=0; i< 10; i++) {
    geometry = new THREE.CylinderGeometry(Math.random(5), , 8, 16, Math.floor(Math.random() * 20), Math.floor(Math.random() * 20));
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( Math.floor(Math.random() * 3), Math.floor(Math.random() * 3), Math.floor(Math.random() * 3));
    scene.add( mesh );
}
let params = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0.1,
    bloomRadius: 0
};

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(10, sizes.width / sizes.height, 1, 50)
camera.position.set( 1, -3, 0 );
scene.add(camera);
camera.lookAt(mesh);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// lights
scene.add( new THREE.AmbientLight( 0x404040 ) );
const pointLight = new THREE.PointLight( 0xffffff, 1 );
camera.add( pointLight );

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize(sizes.width, sizes.height)

// RenderPass

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( sizes.innerWidth, sizes.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

let composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

/**
 * Animate
 */
const clock = new THREE.Clock()
const scaleKF = new THREE.VectorKeyframeTrack( '.scale', [ 0, 1, 2 ], [ 1, 1, 1, 2, 2, 2, 1, 1, 1 ] );
const clip = new THREE.AnimationClip( 'Action', 3, [scaleKF] );

// setup the THREE.AnimationMixer
let mixer = new THREE.AnimationMixer( mesh );

// create a ClipAction and set it to play
const clipAction = mixer.clipAction( clip );

//resize
// Listen to the resize event
window.addEventListener('resize', () => {
    //update size for resize
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix();

    //update renderer
    renderer.setSize(sizes.width, sizes.height) // see https://threejs.org/docs/index.html?q=updat#manual/en/introduction/How-to-update-things
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // change pixel ratio to reduce jaggies & limit it into 2(more than 2 becomes extremely slow)
})

window.addEventListener('dblclick', () => {

    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement //for safari

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen(); // doesn't work on Safari
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen(); //for Safari
        }

    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen(); //not the canvas, it is document    
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen(); //for Safari
        }

    }
});

const tick = () =>
{
    const delta = clock.getDelta();
    const time = clock.getElapsedTime() * 10;

    params.bloomStrength = 5 * Math.sin(time);
    params.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    composer.render();
    clipAction.play();
}

tick()