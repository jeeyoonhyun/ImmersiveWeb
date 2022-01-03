import React, { Component } from 'react';
import { Link } from 'react-router';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader' //for correcting sRGB encoding issue
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass' //for antialiasing
import * as dat from 'dat.gui'
import '../day5/style.css'

// The number of columns change by resizing the window
class Day5 extends React.Component {
    componentDidMount() {
        //    insert three.js code
        /**
      * Base
      */
        // dat.gui
        const gui = new dat.GUI()

        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        // Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('white');

        // loader
        const textureLoader = new THREE.TextureLoader()

        /**
         * Update all materials
         */
        const updateAllMaterials = () => {
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMapIntensity = 2.5
                    child.material.needsUpdate = true
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        }

        /**
         * Lights
         */
        const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(0, 4, 1)
        scene.add(directionalLight)

        /**
         * Object
         */
        let pulseSize = 0;
        const geometry = new THREE.TorusKnotGeometry(0.5, 0.13, 100, 16, 1, 3);
        const material = new THREE.MeshPhongMaterial({ color: new THREE.Color('lightsteelblue') })
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        /**
         * Sizes
         */
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        window.addEventListener('resize', () => {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            // Update effectcomposer
            effectComposer.setSize(sizes.width, sizes.height)
            effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        /**
         * Fullscreen
         */
        window.addEventListener('dblclick', () => {
            const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

            if (!fullscreenElement) {
                if (canvas.requestFullscreen) {
                    canvas.requestFullscreen()
                }
                else if (canvas.webkitRequestFullscreen) {
                    canvas.webkitRequestFullscreen()
                }
            }
            else {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                }
                else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen()
                }
            }
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
            canvas: canvas,
            antialias: true
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFShadowMap
        renderer.physicallyCorrectLights = true
        renderer.outputEncoding = THREE.sRGBEncoding
        renderer.toneMapping = THREE.ReinhardToneMapping
        renderer.toneMappingExposure = 1.5
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // postprocessing

        let renderTargetClass = null;
        if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
            // use WebGLMultisampleRenderTarget
            renderTargetClass = THREE.WebGLMultisampleRenderTarget
        } else {
            // Safari(doesn't support WebGL2)
            // or retina screens (doesn't need antialiasing)
            renderTargetClass = THREE.WebGLRenderTarget
        }

        // render target for anti-aliasing support (WebGL2 - doesn't work on Safari)
        const renderTarget = new renderTargetClass(
            800,
            600,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }
        )

        // effects
        const effectComposer = new EffectComposer(renderer, renderTarget) // doesn't work on Safari
        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        effectComposer.setSize(sizes.width, sizes.height)

        const renderPass = new RenderPass(scene, camera)
        effectComposer.addPass(renderPass)

        // threshold pass (custom effect)
        const ThresholdShader = {
            uniforms: {
                tDiffuse: { value: null }, //lets EffectComposer update texture automatically
                uTint: { value: null },
                uBrightness: { value: null }
            },
            vertexShader: `
        varying vec2 vUv;

        void main()
        {
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
            fragmentShader: `
        uniform sampler2D tDiffuse; // texture of previous passes
        uniform vec3 uTint;
        uniform float uBrightness;

        varying vec2 vUv; //receive uv from vertex shader

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            float greyColor = clamp(0.2126 * color.r + 0.7152 * color.g * 0.0722 * color.b + uBrightness, 0.0, 1.0);
            if (greyColor > 0.0 && greyColor <= 0.05) greyColor = 0.02;
            if (greyColor > 0.05 && greyColor <= 0.1) greyColor = 0.08;
            if (greyColor > 0.1) greyColor = 1.0;
            

            gl_FragColor = vec4(vec3(greyColor), 1.0);
        }
    `,
        }

        const thresholdPass = new ShaderPass(ThresholdShader)
        thresholdPass.material.uniforms.uTint.value = new THREE.Vector3(0, 0, 0);
        thresholdPass.enabled = true;
        thresholdPass.material.uniforms.uBrightness.value = 0.005;
        gui.add(thresholdPass, 'enabled').name('thresholdPass')
        // gui.add(thresholdPass.material.uniforms.uBrightness, 'value').min(0).max(1).step(0.001).name('brightness')
        effectComposer.addPass(thresholdPass)


        const unrealBloomPass = new UnrealBloomPass()
        unrealBloomPass.enabled = true
        unrealBloomPass.strength = 0.54
        unrealBloomPass.radius = 0.82
        effectComposer.addPass(unrealBloomPass)
        gui.add(unrealBloomPass, 'enabled').name('unrealBloomPass')

        // add color correction at the last
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
        effectComposer.addPass(gammaCorrectionPass)

        // (last last) if pixel ratio is 1 and browser doesn't support WebGL2,
        // add SMAA pass for anti aliasing
        if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
            const smaaPass = new SMAAPass()
            effectComposer.addPass(smaaPass)
        }


        /**
         * Animate
         */
        const clock = new THREE.Clock()

        const tick = () => {
            const elapsedTime = clock.getElapsedTime()

            mesh.rotation.y = elapsedTime * Math.PI / 2;
            unrealBloomPass.radius = 0.7 + Math.sin(elapsedTime * 0.8) * 0.2;
            pulseSize = Math.sin(elapsedTime * 0.8);
            mesh.scale.x = 1 + pulseSize * 0.2;
            mesh.scale.y = 1 + pulseSize * 0.2;
            mesh.scale.z = 1 + pulseSize * 0.2;

            // Update controls
            controls.update()

            // Render
            // renderer.render(scene, camera)
            // postprocessing
            effectComposer.render()

            // update uniform time for passes
            // displacementPass.material.uniforms.uTime.value = elapsedTime;

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }
    render() {
        return (
            <div>
                <div id="container">
                    <canvas className="webgl"></canvas>
                </div>
            </div>
        )
    }
}

export default Day5;