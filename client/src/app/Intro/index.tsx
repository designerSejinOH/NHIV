'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import KnnhLogo from '@/img/knnh_logo.svg'
import HiLabLogo from '@/img/hilab_logo.svg'
interface ProjectInfoProps {
  isPageInfo: boolean
  setIsPageInfo: (value: boolean) => void
}

export const Intro = ({ isPageInfo, setIsPageInfo }: ProjectInfoProps) => {
  return (
    <>
      <motion.div
        className='fixed inset-0 w-full h-dvh bg-white/50 backdrop-blur-lg p-5 flex flex-col items-center justify-center gap-5 z-50'
        initial={{
          opacity: 1,
        }}
        animate={{ opacity: isPageInfo ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className='w-fit h-fit flex flex-col items-center justify-center gap-5 mb-36'>
          <div className='w-fit h-fit pb-6 flex flex-col gap-4 items-center justify-center'>
            <span className='text-base leading-none w-fit h-fit font-normal'>
              한국전통대학교 디지털헤리티지학과 HiLAB
            </span>
            <span className='text-3xl font-bold text-center leading-snug w-fit h-fit'>
              네이처 에셋 기반
              <br />
              자연유산 디지털 아카이브
            </span>
            <span className='text-xl font-medium leading-tight w-fit h-fit'>
              디지털 박물관 서비스를 위한 AI 기반 네이처 복원 기술 개발
            </span>
            <div className='inline-flex mt-4 h-16 gap-12 justify-center items-center'>
              <KnnhLogo className='h-[70%] w-auto' />
              <HiLabLogo className='h-full w-auto' />
            </div>
          </div>
          <button
            onClick={() => setIsPageInfo(false)}
            className='bg-[#3EBA72] shadow-xl text-white leading-none rounded-2xl w-fit h-fit px-6 py-4 justify-center items-center flex flex-row text-xl font-semibold hover:opacity-80 active:shadow-none active:translate-y-0.5 transition-all cursor-pointer'
          >
            지도기반 시각화 바로가기 <FiArrowUpRight className='text-2xl' />
          </button>
        </div>

        {/* <h3 className='text-xl font-semibold mt-16'>지도기반 시각화 배경</h3>
            <h4 className='text-lg font-bold mt-8'>기존 환경</h4>
            <p className='text-lg mt-2'>
              기관마다 별개인 표본 소장 현황으로 인해 기관별 소장 표본에 대한 정보 확인의 어려움
            </p>
            <h4 className='text-lg font-bold mt-8'>e-뮤지엄</h4>
            <p className='text-lg mt-2'>
              분류 현황 : 기타자료 ‒ 표본, 재질의 경우 기타 ‒ 기타로 표기
              <br />
              액침표본, 건조표본, 박제 표본 등 다양한 표본의 종류 파악 불가, 정보 파악 난해
            </p>
            <h4 className='text-lg font-bold mt-8'>국립생물자원관 생물표본대여시스템</h4>
            <p className='text-lg mt-2'>
              표본대여를 위한 정보 중심 타 기관 통합의 문제 검색의 어려움 표본에 대한 직관적 파악 어려움
              <br />→ 시각화 자료 필요
            </p>
            <div className='w-full h-auto bg-white text-[#3EBA72] flex justify-center items-center aspect-landscape mt-5'>
              이미지 삽입 예정
            </div>
            <h3 className='text-xl font-semibold mt-16'>데이터 표현의 개선 필요</h3>
            <p className='text-lg mt-2'>
              표본의 상태를 직관적으로 파악할 수 있는 시스템 필요 3D 모델을 활용시 같은 종의 다른 모습인 표본을
              효과적으로 표현할 수 있음 <br />- 암수, 번식깃 유무, 유조와 성조, 성장 단계ê등 관리, 연구 뿐만 아니라
              콘텐츠 제작, 생물학 학습을 위한 자료로 사용 가능
            </p>
            <div className='w-full h-auto bg-white text-[#3EBA72] flex justify-center items-center aspect-landscape mt-5'>
              이미지 삽입 예정
            </div> */}
      </motion.div>
    </>
  )
}
