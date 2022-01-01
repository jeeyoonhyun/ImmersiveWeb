import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

const parameters = {
    backgroundColor: 0x232323,
    opacity: 0.8,
    // backgroundColor: 0xbababa,
}

// loading manager
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () => {
    console.log('onStart')
}

loadingManager.onLoad = () => {
    console.log('onLoad')
}

loadingManager.onProgress = () => {
    console.log('onProgress')
}

loadingManager.onError = () => {
    console.log('onError')
}

const textureLoader = new THREE.TextureLoader(loadingManager);
// load multiple textures
const textureCount = 10;
let particlesTextureArray = []
for (let i=0; i<textureCount; i++) {
    particlesTextureArray.push(textureLoader.load(`./static/textures/particles/${i}.png`));
}


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( parameters.backgroundColor );

// Particles

// Geometry
let particlesGeometryArray = []
const count = 1000 // number of particles
for (let i=0; i<textureCount; i++) {
    particlesGeometryArray.push(new THREE.BufferGeometry());

    //making a custom geometry using BufferGeometry
    //positions
    const positions = new Float32Array(count * 3) // 3 positions: x, y, z
    for (let j=0; j<count * 3 ; j++) {
        positions[j] = (Math.random() - 0.5) * 80; //-.5 to -.5 for placing in center
    }
    particlesGeometryArray[i].setAttribute(
        'position', 
        new THREE.BufferAttribute(positions, 3) //1 vertex contains 3 values
    );

    //colors
    const colors = new Float32Array(count * 3) // r, g, b
    for (let i=0; i<count * 3 ; i++) {
        colors[i] = 0.2 //note: color is not 0~255, its 0~1
    }
    particlesGeometryArray[i].setAttribute(
        'color', 
        new THREE.BufferAttribute(colors, 3)
    )   
}

//Material
let particlesMaterialArray = []
for (let i=0; i<textureCount; i++) {
    particlesMaterialArray.push(new THREE.PointsMaterial());
    particlesMaterialArray[i].size = 0.5;
    particlesMaterialArray[i].sizeAttenuation = true;
    particlesMaterialArray[i].color = new THREE.Color('lightsteelblue'); //you can still add a 'base' color even when you use vertexColors

    //make the black parts transparent
    particlesMaterialArray[i].transparent = true
    particlesMaterialArray[i].opacity = parameters.opacity;

    //load texture
    particlesMaterialArray[i].map = particlesTextureArray[i]
    particlesMaterialArray[i].alphaMap = particlesTextureArray[i]

    // Fixing WebGL bug: detecting which particle is front - pick one
    particlesMaterialArray[i].depthWrite = false; //might have bugs but best solution for now. Always test between these 3 methods
    particlesMaterialArray[i].blending = THREE.AdditiveBlending //colors add(blend) when they overlay, but can impact performance
    particlesMaterialArray[i].vertexColors = true //different colors for each particle

}

//Particles
for (let i=0; i<textureCount; i++) {
    let particles = new THREE.Points(particlesGeometryArray[i], particlesMaterialArray[i])
    scene.add(particles)
}

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update particles
    // particles.rotation.y = elapsedTime * 0.2 //animate whole thing
    for (let j=0; j<textureCount; j++) {
        for (let i=0; i < count; i++) {
            const i3 = i * 3
            const x = particlesGeometryArray[j].attributes.position.array[i3 + 2] //x position of particle
            particlesGeometryArray[j].attributes.position.array[i3 + 1] = 9*(Math.sin(elapsedTime))*Math.sin(elapsedTime + x/3) // y position of each particle
        } //this method is inefficient performance-wise. You should use a custom shader for complex animation
        // Particles need update
        particlesGeometryArray[j].attributes.position.needsUpdate = true
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()