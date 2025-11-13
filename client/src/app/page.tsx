'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, OrbitControls } from '@react-three/drei'
import { Map } from '@/components'
import { LiveLocationLayer } from '@/components/Map/LiveLocationLayer'

export default function Home() {
  return (
    <div className='flex flex-col md:flex-row h-dvh w-full items-center justify-center'>
      <main className='w-full md:w-1/2 h-1/2 md:h-full relative flex flex-col items-center justify-center cursor-pointer'>
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} className='w-full h-full'>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Suspense fallback={null}>
            <Box args={[1, 1, 1]} castShadow receiveShadow>
              <meshStandardMaterial color='red' />
            </Box>
            <OrbitControls autoRotate />
          </Suspense>
        </Canvas>
      </main>
      <main className='w-full bg-gray-100 md:w-1/2 h-1/2 md:h-full relative flex flex-col items-center justify-center'>
        <span>지도 영역</span>
        {/* <Map defaultCenter={null} defaultZoom={15}>
          <LiveLocationLayer />
        </Map> */}
      </main>
      <div className='fixed top-0 z-10 inset-x-0 w-full p-4 bg-black text-white text-center'>
        NHIV, 자연유산 지도기반 시각화
      </div>
    </div>
  )
}
