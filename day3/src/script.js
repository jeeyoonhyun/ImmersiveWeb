import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DirectionalLight } from 'three'
import * as dat from 'dat.gui';

// Params
const parameters = {
    meshColor: 0x455eff,
    lightColor: 0xffffff,
    planeColor: 0x313866,
    deviceAlpha:0,
    deviceBeta:0,
    deviceGamma: 0,
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xf1d3d3 );

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(10, 10, 10)
const material = new THREE.MeshToonMaterial({ color: parameters.meshColor })
const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh)
mesh.position.set(0,10,0);

// Light
const dirLight = new THREE.DirectionalLight( parameters.lightColor, 0.5 );
dirLight.castShadow = true; // default false
dirLight.position.set(0,10,5);
scene.add( dirLight );

const ambLight = new THREE.AmbientLight(0xffffff);
scene.add( ambLight );

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Fullscreen
 */
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

// Plane for receiving shadows
const planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
const planeMaterial = new THREE.MeshToonMaterial({ color: parameters.planeColor});
// weird box appears in the shadows?? don't know why
// const planeMaterial = new THREE.MeshToonMaterial({ color: 0x313866, side: THREE.DoubleSide}); 
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotateX(-2);
plane.position.set(0,-10,0);

// Shadow on plane
plane.castShadow = true;
plane.receiveShadow = true;

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,20,30);
camera.lookAt(plane.position);
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// axisHelper
const axesHelper = new THREE.AxesHelper( 20 );
scene.add( axesHelper );

// dat.gui

const gui = new dat.GUI({autoPlace: true});
gui.domElement.id = 'gui';
let folder = gui.addFolder(`Colors`)
gui
    .addColor(parameters, 'meshColor')
    .onChange(() =>
    {
        material.color.set(parameters.meshColor)
    })
gui
    .addColor(parameters, 'lightColor')
    .onChange(() =>
    {
        material.color.set(parameters.lightColor)
    })

/**
 * Animate
 */
const clock = new THREE.Clock()

const getPermisson = e => {
    e.preventDefault();
    // Request permission for iOS 13+ devices
    if (
        DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        console.log("click event received!!")
        scene.background = new THREE.Color( 0xffffff );
        DeviceOrientationEvent.requestPermission();
    }
}

const rotate = e => {
    console.log("orientation event received!")
    scene.background = new THREE.Color( 0xff0000 );
    var x = e.beta;
    var y = e.alpha;
    var z = e.gamma;

    // Because we don't want to have the device upside down
    // We constrain the x value to the range [-90,90]
    if (y,z > 90) { y,z = 90};
    if (y,z < -90) { y,z = -90};

    parameters.deviceBeta = x;
    parameters.deviceAlpha = y;
    parameters.deviceGamma = z;
}

// get device orientation when button is clicked
let button = document.getElementById("start");

button.onclick = function(e) {
    e.preventDefault();
    window.addEventListener("click", getPermisson);
    window.addEventListener("touchstart", getPermisson);
    // Detect device orientation
    window.addEventListener("deviceorientation", rotate, true);

}
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Rotation
    mesh.rotation.x = parameters.deviceBeta * Math.PI / 180;
    mesh.rotation.y = parameters.deviceAlpha * Math.PI / 180;
    mesh.rotation.z = - parameters.deviceGamma * Math.PI / 180;
    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()