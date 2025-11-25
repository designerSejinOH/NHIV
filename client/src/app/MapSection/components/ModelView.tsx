'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Html, OrbitControls, Sky, useGLTF, Stage, Gltf, Center } from '@react-three/drei'
import * as THREE from 'three'

export const ModelView = ({ sceneKey, modelUrl }: { sceneKey: string; modelUrl: string }) => {
  return (
    <Canvas
      key={`canvas-${sceneKey}`}
      camera={{
        position: [0, 7, 12],
        fov: 40,
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setSize(gl.domElement.parentElement!.clientWidth, gl.domElement.parentElement!.clientHeight)
      }}
      className='cursor-grab active:cursor-grabbing' // ← 이거는 다음 줄로 빼는 게 좋아
    >
      <Sky />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, 10, 5]} intensity={1} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.9}
        makeDefault
        target={[0, 0, 0]}
        autoRotate
        autoRotateSpeed={0.5}
      />

      <Stage intensity={0.5} preset='portrait' adjustCamera={1} environment='park'>
        <Suspense
          fallback={
            <Html center className='w-full h-full flex items-center justify-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
            </Html>
          }
        >
          <Gltf castShadow receiveShadow src={modelUrl} />
        </Suspense>
      </Stage>
    </Canvas>
  )
}
