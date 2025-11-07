'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, OrbitControls } from '@react-three/drei'

export default function Home() {
  return (
    <div className='flex flex-col md:flex-row h-dvh w-full items-center justify-center'>
      <main className='w-full md:w-1/2 h-1/2 md:h-full relative flex flex-col items-center justify-center'>
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} className='w-full h-full'>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Suspense fallback={null}>
            <Box args={[1, 1, 1]} castShadow receiveShadow>
              <meshStandardMaterial color='red' />
            </Box>
            <OrbitControls />
          </Suspense>
        </Canvas>
      </main>
      <main className='w-full md:w-1/2 h-1/2 md:h-full relative flex flex-col items-center justify-center'>
        <h1 className='text-4xl font-bold mb-4'>Welcome Page</h1>
        <p className='text-lg text-center'>This is a sample Next.js application with a 3D canvas.</p>
      </main>
    </div>
  )
}
