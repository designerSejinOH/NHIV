'use client'

import { useState } from 'react'
import { Map } from '@/components'
import { OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api'
import { LiveLocationLayer } from '@/components/Map/LiveLocationLayer'
import { HeritageModal } from './components/HeritageModal'
import classNames from 'classnames'
import { Specimen } from '@/types'

interface MapSectionProps {
  specimens?: Specimen[]
  className?: string
  setSelectedHeritage: React.Dispatch<React.SetStateAction<{ isSelected: boolean; data: any } | null>>
  selectedHeritage: { isSelected: boolean; data: any } | null
}

export const MapSection = ({ specimens, setSelectedHeritage, selectedHeritage, className }: MapSectionProps) => {
  return (
    <section className={classNames('flex relative', className)}>
      <Map defaultCenter={null} defaultZoom={15}>
        {/* 데이터 좌표로 맵핑 */}
        {specimens?.map((item) => (
          <OverlayViewF
            key={item.no}
            position={{ lat: item.latlng[0], lng: item.latlng[1] }}
            mapPaneName={OVERLAY_MOUSE_TARGET}
          >
            <div
              onClick={() => {
                setSelectedHeritage({ isSelected: true, data: item })
              }}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'auto',
              }}
              className=' w-fit h-fit flex flex-row gap-2 bg-white p-2 shadow-lg items-center justify-center cursor-pointer hover:bg-[#F5FDF8] active:scale-95 transition-all'
            >
              <div className='w-6 h-6 bg-[#3EBA72]' />
              <span className='w-fit h-fit text-sm font-medium text-black'>{item.name_kr}</span>
            </div>
          </OverlayViewF>
        ))}
        <LiveLocationLayer />
      </Map>
      <HeritageModal
        specimens={specimens || []}
        selectedSpeciemen={selectedHeritage}
        setSelectedSpeciemen={setSelectedHeritage}
      />
    </section>
  )
}
