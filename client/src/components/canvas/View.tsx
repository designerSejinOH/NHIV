'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, type MutableRefObject } from 'react'
import { Html, OrbitControls, PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'
import { Loading } from '@/components'

interface CommonProps {
  color?: THREE.ColorRepresentation
}

export const Common = ({ color }: CommonProps) => (
  <Suspense
    fallback={
      <Html center className='w-full h-full flex items-center justify-center'>
        <Loading />
      </Html>
    }
  >
    {/* @ts-ignore */}
    {color && <color attach='background' args={[color]} />}
    {/* @ts-ignore */}
    <ambientLight />
    {/* @ts-ignore */}
    <pointLight position={[10, 10, 10]} />
    {/* @ts-ignore */}
    <pointLight position={[-10, -10, -10]} color='blue' decay={0.2} />
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 0]} />
  </Suspense>
)

interface ViewProps {
  children: React.ReactNode
  orbit?: boolean
  perf?: boolean
  className?: string // className 속성 추가
}

const View = forwardRef(({ children, orbit, perf, ...props }: ViewProps, ref) => {
  const localRef = useRef<HTMLDivElement | null>(null)
  useImperativeHandle(ref, () => localRef.current)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef as unknown as MutableRefObject<HTMLElement>}>
          {children}
          {orbit && <OrbitControls />}
          {perf && <Perf position='top-left' />}
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
