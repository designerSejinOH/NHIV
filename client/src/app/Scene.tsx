'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Html, OrbitControls, Sky, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ⭐ 부모가 넘겨주는 GLB 로더
function Model({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={scale} position={[0, 0, 0]} />
}

export const Scene = ({ sceneKey, modelUrl }: { sceneKey: string; modelUrl: string }) => {
  return (
    <Canvas
      key={`canvas-${sceneKey}`} // 🔥 이제 진짜로 key가 바뀜      className='cursor-grab active:cursor-grabbing'
      camera={{
        position: [0, 7, 12], // 🔥 더 위에서 대각선으로 내려다보기
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
      // 🔥 카메라 초기화 덮어쓰는 부분 제거
      onCreated={({ gl }) => {
        gl.setSize(gl.domElement.parentElement!.clientWidth, gl.domElement.parentElement!.clientHeight)
      }}
    >
      <Suspense
        fallback={
          <Html center className='w-full h-full flex items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
          </Html>
        }
      >
        <Sky />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, 10, 5]} intensity={1} />

        {/* 🔥 기준선(lookAt)을 아래쪽으로 내리기 */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2} // 살짝 더 내려보기 제한
          target={[0, 2, 0]} // ⭐ 기준선 아래로
          makeDefault
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* ⭐ GLB 모델 삽입 */}
        <Model url={modelUrl} scale={0.1} />
      </Suspense>
    </Canvas>
  )
}

// 선택적으로 GLB preload
// useGLTF.preload('/models/anything.glb')
