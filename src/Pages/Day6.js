import React from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader' //for correcting sRGB encoding issue
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass' //for antialiasing
// import * as dat from 'dat.gui'

// The number of columns change by resizing the window
class Day6 extends React.Component {
    componentDidMount() {

        /**
         * Base
         */
        // dat.gui
        // const gui = new dat.GUI()

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
        const geometry = new THREE.TorusKnotGeometry(1.0, 0.16, 120, 24, 3, 21);
        // const geometry = new THREE.TorusKnotGeometry( 1.0, 0.2, 60, 24, 3, 21 );
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

            bayerPass.material.uniforms.uResolution.value = new THREE.Vector2(sizes.width, sizes.height);
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

        // bayer dithering shader
        const bayerShader = {
            uniforms: {
                tDiffuse: { value: null }, //lets EffectComposer update texture automatically
                uTint: { value: null },
                uBrightness: { value: null },
                uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) }
            },
            vertexShader: `
                varying vec2 vUv;

                void main()
                {        
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
                    vUv = uv;
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse; // texture of previous passes
                uniform float uBrightness;
                uniform vec2 uResolution;
                
                varying vec2 vUv; //receive uv from vertex shader
                
                // from https://thebookofshaders.com/10/
                float random (vec2 st) {
                    return fract(sin(dot(st.xy,
                                        vec2(12.9898,78.233)))*
                        43758.5453123);
                }
                
                // pseudomatrix from from https://github.com/hughsk/glsl-dither/blob/master/4x4.glsl
                // bayer 4x4 dithering threshold
                float dither4x4limit (vec2 position, float brightness) {
                int x = int(mod(position.x, 4.0));
                int y = int(mod(position.y, 4.0));
                int index = x + y * 4;
                float limit = 0.0;
                
                if (x < 8) {
                    if (index == 0) limit = 0.0625;
                    if (index == 1) limit = 0.5625;
                    if (index == 2) limit = 0.1875;
                    if (index == 3) limit = 0.6875;
                    if (index == 4) limit = 0.8125;
                    if (index == 5) limit = 0.3125;
                    if (index == 6) limit = 0.9375;
                    if (index == 7) limit = 0.4375;
                    if (index == 8) limit = 0.25;
                    if (index == 9) limit = 0.75;
                    if (index == 10) limit = 0.125;
                    if (index == 11) limit = 0.625;
                    if (index == 12) limit = 1.0;
                    if (index == 13) limit = 0.5;
                    if (index == 14) limit = 0.875;
                    if (index == 15) limit = 0.375;
                }
                
                return limit;
                }
                
                void main()
                {
                    float ditheredColor;
                    vec4 color = texture2D(tDiffuse, vUv); 
                    float greyColor = clamp(0.2126 * color.r + 0.7152 * color.g * 0.0722 * color.b + uBrightness, 0.0, 1.0); 
                
                    vec2 st = gl_FragCoord.xy/uResolution.xy * vec2(0.5); //I don't know why but resolution gets weird in react
                    float rnd = random( st );
                
                
                    float bayerThreshold = dither4x4limit(gl_FragCoord.xy, greyColor);
                    float rndThreshold = 0.04;
                
                    if (st.x < 0.5) { //bayer dithering
                    if (greyColor > 1.0 - bayerThreshold - 0.72) {
                        ditheredColor = 0.95;
                    } else {
                        ditheredColor = 0.05;
                    };
                    } else { //random noise dithering
                    if (greyColor + rnd - rndThreshold > rndThreshold) {
                        ditheredColor = 0.05;
                    } else {
                        ditheredColor = 0.95;
                    };
                    }
                
                    gl_FragColor = vec4(vec3(ditheredColor), 1.0);
                    // gl_FragColor = vec4(vec3(vUv, 0), 1.0);
                }
            `,
        }

        const bayerPass = new ShaderPass(bayerShader)
        bayerPass.material.uniforms.uTint.value = new THREE.Vector3(0, 0, 0);
        bayerPass.enabled = true;
        bayerPass.material.uniforms.uBrightness.value = 0.01;
        // gui.add(bayerPass,'enabled').name('bayerDithering')
        // gui.add(bayerPass.material.uniforms.uBrightness, 'value').min(0).max(1).step(0.001).name('brightness')
        effectComposer.addPass(bayerPass)

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

            mesh.rotation.y = elapsedTime * Math.PI / 2.4;
            // pulseSize = Math.sin(elapsedTime * 0.8);
            // mesh.scale.x = 1 + pulseSize * 0.2;
            // mesh.scale.y = 1 + pulseSize * 0.2;
            // mesh.scale.z = 1 + pulseSize * 0.2;

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

export default Day6;