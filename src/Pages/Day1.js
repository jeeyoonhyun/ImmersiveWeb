import React from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';


// The number of columns change by resizing the window
class Day1 extends React.Component {
    componentDidMount() {
        // three.js
        /**
 * Base
 */
        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        // Scene
        const scene = new THREE.Scene()

        //light
        const lightColor = "#ffffff";
        const intensity = 1;
        const light = new THREE.DirectionalLight(lightColor, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);


        /**
         * Object
         */

        // load font
        const loader = new FontLoader();
        const font = loader.load(
            // resource URL
            './assets/day1/anthony.json',

            // onLoad callback
            function (font) {
                const color = 0x0;

                const mat = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    emissive: 0x000000,
                    transparent: true,
                    opacity: 1,
                    side: THREE.DoubleSide,
                    roughness: 0,
                    metalness: 0,
                    reflectivity: 0,
                    clearcoat: 1,
                    clearcoatRoughness: 1,
                });
                // const mat = new THREE.MeshToonMaterial({
                //     color: 0xf,
                // })

                const message = "50 days of \nimmersive web";

                // const shapes = font.generateShapes( message, 100 );
                // const geometry = new THREE.ShapeGeometry( shapes );

                const geometry = new TextGeometry(message, {
                    font: font,
                    size: 72,
                    height: 8,
                    curveSegments: 1,
                    bevelEnabled: true,
                    bevelThickness: 0.15,
                    bevelSize: 0.3,
                    bevelSegments: 5,
                });

                geometry.computeBoundingBox();

                const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

                geometry.translate(xMid, 0, 0);

                // make shape ( N.B. edge view not visible )

                const text = new THREE.Mesh(geometry, mat);
                text.position.y = 100;
                text.position.z = -80;
                text.rotation.x = -1.3;
                scene.add(text);
            },

            // onProgress callback
            function (xhr) {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            // onError callback
            function (err) {
                console.log('An error happened');
            }
        );

        // water
        scene.background = new THREE.Color(0xffffff);
        scene.fog = new THREE.FogExp2(0xffffff, 0.0009);

        const worldWidth = 128, worldDepth = 128;
        let waterGeometry = new THREE.PlaneGeometry(20000, 20000, worldWidth - 1, worldDepth - 1);
        waterGeometry.rotateX(- Math.PI / 2);
        const position = waterGeometry.attributes.position;
        for (let i = 0; i < position.count; i++) {

            const y = 35 * Math.sin(i / 2);
            position.setY(i, y);

        }

        // const texture = new THREE.TextureLoader().load('https://live.staticflickr.com/4066/4344198258_e647f9487b_b.jpg');
        const texture = new THREE.TextureLoader().load('./assets/day1/texture.jpeg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);

        let waterMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, map: texture });
        let water = new THREE.Mesh(waterGeometry, waterMaterial);
        scene.add(water);

        /**
         * Sizes
         */
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

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
        /**
         * Camera
         */
        // Base camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
        camera.position.set(0, 100, 1000);
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

        /**
         * Animate
         */
        const clock = new THREE.Clock()

        const tick = () => {
            const delta = clock.getDelta();
            const time = clock.getElapsedTime() * 10;

            const position = waterGeometry.attributes.position;

            for (let i = 0; i < position.count; i++) {

                const y = 35 * Math.sin(i / 5 + (time + i) / 7);
                position.setY(i, y);

            }
            position.needsUpdate = true;

            // controls.update( delta );

            const elapsedTime = clock.getElapsedTime()

            // Update controls
            controls.update()

            // Render
            renderer.setClearColor(0xffffff, 1);
            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }
    render() {
        return (
            <div>
                <canvas className="webgl"></canvas>
            </div>
        )
    }
}

export default Day1;