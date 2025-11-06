'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, OrbitControls } from '@react-three/drei'

export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex w-full border flex-1 flex-col items-center justify-center px-20 text-center'>
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} className='w-full h-full'>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Suspense fallback={null}>
            <Box args={[1, 1, 1]} castShadow receiveShadow>
              <meshStandardMaterial color='orange' />
            </Box>
            <OrbitControls />
          </Suspense>
        </Canvas>
      </main>
    </div>
  )
}
