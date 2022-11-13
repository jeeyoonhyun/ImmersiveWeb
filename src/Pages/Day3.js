import React from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from "three";
import '../day3/style.css'

// The number of columns change by resizing the window
class Day3 extends React.Component {
    componentDidMount() {
        //    insert three.js code
        // Params
        const parameters = {
            meshColor: 0x97cdae,
            lightColor: 0xffffff,
            planeColor: 0x313866,
            deviceAlpha: 0,
            deviceBeta: 0,
            deviceGamma: 0,
        }

        /**
         * Base
         */
        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        // Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf1d3d3);

        /**
         * Object
         */
        // const geometry = new THREE.BoxGeometry(10, 10, 10)
        const geometry = new THREE.TorusKnotGeometry(5, 1.2, 64, 16, 1, 2);
        const material = new THREE.MeshToonMaterial({ color: parameters.meshColor })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh)
        mesh.position.set(0, 5, 3);

        // Light
        // const dirLight = new THREE.DirectionalLight( parameters.lightColor, 0.7 );
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.castShadow = true; // default false
        dirLight.position.set(0, 60, 5);

        // adjust dirLight size
        dirLight.shadow.camera.left = -10;
        dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10;
        dirLight.shadow.camera.bottom = -10;

        scene.add(dirLight);

        // const helper = new THREE.CameraHelper( dirLight.shadow.camera );
        // scene.add( helper );



        const ambLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambLight);


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

        // Plane for receiving shadows
        const planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
        const planeMaterial = new THREE.MeshToonMaterial({ color: parameters.planeColor });
        // weird box appears in the shadows?? don't know why
        // const planeMaterial = new THREE.MeshToonMaterial({ color: 0x313866, side: THREE.DoubleSide}); 
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        scene.add(plane);
        plane.rotateX(-2);
        plane.position.set(0, -20, 0);

        // Shadow on plane
        plane.castShadow = true;
        plane.receiveShadow = true;

        /**
         * Camera
         */
        // Base camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(0, 20, 30);
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
        // const axesHelper = new THREE.AxesHelper( 20 );
        // scene.add( axesHelper );

        // dat.gui

        // const gui = new dat.GUI({autoPlace: true});
        // gui.domElement.id = 'gui';
        // let folder = gui.addFolder(`Colors`)
        // gui
        //     .addColor(parameters, 'meshColor')
        //     .onChange(() =>
        //     {
        //         material.color.set(parameters.meshColor)
        //     })
        // gui
        //     .addColor(parameters, 'lightColor')
        //     .onChange(() =>
        //     {
        //         material.color.set(parameters.lightColor)
        //     })

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
                DeviceOrientationEvent.requestPermission();
            }
        }

        const rotate = e => {
            console.log("orientation event received!")
            var x = e.beta;
            var y = e.alpha;
            var z = e.gamma;

            // Because we don't want to have the device upside down
            // We constrain the x value to the range [-90,90]
            if (y > 90) {
                y = 90;
            }
            if (y < -90) {
                y = -90;
            }

            if (z > 90) {
                z = 90;
            }
            if (z < -90) {
                z = -90;
            }

            parameters.deviceBeta = x;
            parameters.deviceAlpha = y;
            parameters.deviceGamma = z;
        }

        // get device orientation when button is clicked
        let is_running = false;
        let button = document.getElementById("start");

        button.onclick = function (e) {
            e.preventDefault();

            if (is_running) {
                scene.background = new THREE.Color(0xf1d3d3);
                button.innerText = 'start detection';
                // iOS permission
                window.removeEventListener("click", getPermisson);
                window.removeEventListener("touchstart", getPermisson);
                // device orientation
                window.removeEventListener("deviceorientation", rotate, true);
                is_running = false;
            } else {
                scene.background = new THREE.Color(0xF2E7B3);
                button.innerText = 'stop detection';
                // iOS permission
                window.addEventListener("click", getPermisson);
                window.addEventListener("touchstart", getPermisson);
                // device orientation
                window.addEventListener("deviceorientation", rotate, true);
                is_running = true;
            }

        }
        const tick = () => {
            // window.addEventListener("deviceorientation", rotate, true);
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
    }
    render() {
        return (
            <div>
                <div id="container">
                    <p id="description">press button and turn your phone around</p>
                    <button id="start" className="btn" href="#" role="button">start detection</button>
                    <canvas className="webgl"></canvas>
                </div>
            </div>
        )
    }
}

export default Day3;