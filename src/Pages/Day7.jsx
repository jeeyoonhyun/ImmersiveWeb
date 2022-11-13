import * as THREE from 'three'
import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom } from '@react-three/postprocessing'

function Stone({ z, props }) {
  const { nodes, materials } = useGLTF('./assets/day7/stone-transformed.glb')
  const ref = useRef();
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const { viewport, camera } = useThree() // gets viewport variables from useThree
  // helps to get current viewport (normal viewport decreases when object is far)
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z]);


  // value inside state is stale
  const [data] = useState({
    x: THREE.MathUtils.randFloatSpread(3), // value between -1 and 1
    y: THREE.MathUtils.randFloatSpread(height) * 1.5,
    z: THREE.MathUtils.randFloatSpread(10) * 10,
    rX: Math.random() * Math.PI,
    rY: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  })

  useFrame((state) => {
    // get elapsedTime from state
    // ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 2
    // ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, hovered ? 1 : -1, 0.1)

    // ref stops working when you use state
    // ref.current.position.y += 0.01;
    // if (ref.current.position.y > viewport.height / 2) {
    //   ref.current.position.y = - viewport.height / 2;
    // }

    // we multiply viewport.width inside here because the state is fixed
    ref.current.rotation.set((data.rX += 0.001), (data.rY += 0.001), (data.rZ += 0.005));
    // ref.current.position.set(data.x * width, (data.y += 0.005), z + THREE.MathUtils.lerp(data.z, hovered ? 1 : -1, 0.1));

    if (!clicked) {
      ref.current.position.set(data.x * width, data.y, data.z -= 0.02 - THREE.MathUtils.lerp(0, hovered ? 1 : -1, 0.05));
    } else {
      ref.current.position.set(data.x * width, data.y, data.z);
    }
    if (data.z < - 100 || data.z > 30) {
      data.z = 10 + THREE.MathUtils.randFloatSpread(10)
    }
  })

  return (
    <mesh scale={80} ref={ref} onClick={() => { setClicked(!clicked) }} onPointerEnter={() => { setHovered(true) }} onPointerLeave={() => { setHovered(false) }} geometry={nodes.stone.geometry} material={materials.stoneMaterial}>
      {!(hovered || clicked) && (<meshDepthMaterial transparent={true} opacity={0.25} />)}
    </mesh>
  )
}

export default function Day7({ count = 100, depth = 100 }) {
  return (
    <div id="container">
      <div className="text-day7">
        <p>click to materialize<br />click again to let go</p>
      </div>
      <Canvas className="webgl" gl={{ alpha: false }} camera={{ near: 0.01, far: 100, fov: 50 }}>
        <OrbitControls enablePan={false} />
        <color attach="background" args={["#f1f1f1"]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={1.5} />
        {/* for stuff that needs loading */}
        <Suspense fallback={null}>
          {Array.from({ length: count }, (_, i) => (<Stone key={i} z={-(i / count) * depth} />))}
        </Suspense >
        <Environment preset='dawn' />
        <EffectComposer>
          <Bloom luminanceThreshold={0.65} luminanceSmoothing={0.5} height={300} />
          <DepthOfField target={[0, 0, depth / 4]} focalLength={0.6} bokehScale={9} height={700} />
        </EffectComposer>

      </Canvas>
    </div>
  )
}
