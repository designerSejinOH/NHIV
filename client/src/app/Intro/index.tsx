'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import KnnhLogo from '@/img/knnh_logo.svg'
import HiLabLogo from '@/img/hilab_logo.svg'
import classNames from 'classnames'
interface ProjectInfoProps {
  isPageInfo: boolean
  setIsPageInfo: (value: boolean) => void
}

export const Intro = ({ isPageInfo, setIsPageInfo }: ProjectInfoProps) => {
  return (
    <>
      <motion.div
        className='fixed inset-0 w-full h-dvh overflow-y-scroll bg-white/20 backdrop-blur-xl flex flex-col items-center justify-start z-50'
        initial={{
          opacity: 1,
        }}
        animate={{ opacity: isPageInfo ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className='w-full h-[80vh] flex-shrink-0 relative flex flex-col items-center justify-center gap-5'>
          <div className='absolute top-[45vh] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-fit flex flex-col items-center justify-center gap-10 mb-36'>
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
            </div>
            <button
              onClick={() => setIsPageInfo(false)}
              className='bg-[#3EBA72] shadow-xl text-white leading-none rounded-2xl w-fit h-fit px-6 py-4 justify-center items-center flex flex-row text-xl font-semibold hover:opacity-80 active:shadow-none active:translate-y-0.5 transition-all cursor-pointer'
            >
              지도기반 시각화 바로가기 <FiArrowUpRight className='text-2xl' />
            </button>
            <div className='inline-flex mt-20 h-16 gap-12 justify-center items-center'>
              <KnnhLogo className='h-[70%] w-auto' />
              <HiLabLogo className='h-full w-auto' />
            </div>
          </div>
        </div>

        <div
          className={classNames(
            'w-full h-fit break-keep flex flex-col gap-32 justify-start items-center pb-32',
            'bg-gradient-to-t from-white via-white/90 via-white/50 to-white/0 pt-72 -mt-60',
          )}
        >
          <div className='max-w-6xl inline-flex justify-between items-start gap-12'>
            <div className='w-[30%] flex-shrink-0 h-fit aspect-[3/4] bg-white' />
            <div className='w-full h-fit flex flex-col gap-12 justify-start items-start'>
              <span className='w-full h-fit font-semibold text-xl'>
                3D 기반 생태 데이터의 표준화와 재사용성 확보(가제)
              </span>
              <p className='leading-relaxed text-lg'>
                {`  `}
                자연 생태 자원은 여전히 체계적인 아카이빙이 부족해 정보 공유가 개인적 네트워크에 의존하고 있습니다. 기존
                DB 플랫폼 역시 제한적이며, 대부분 저해상도 2D 이미지 중심으로 구성되어 있어 연구·교육·콘텐츠 제작에
                충분한 활용이 어렵습니다.
                <br />
                <br />
                {`  `}한편, 전시·교육·체험 분야에서는 실제에 가까운 고해상도 3D 네이처 애셋의 수요가 빠르게 증가하고
                있지만, 현재 데이터는 단발성 외주 제작에 그쳐 재사용성이 매우 낮은 실정입니다.
              </p>
              <p className='leading-relaxed text-lg'>
                {`  `}본 프로젝트는 이러한 구조적 한계를 해결하기 위해 3D 생태 데이터 구축 기술, 표준화된 디지털
                아카이브, 지속적으로 재활용 가능한 네이처 애셋 생태계를 마련하고자 합니다.
              </p>
            </div>
          </div>

          <div className='max-w-5xl flex flex-col justify-start items-center gap-12'>
            <span className='w-full h-fit font-semibold text-xl text-center'>프로젝트 목표</span>
            <div className='inline-flex justify-between items-start gap-12'>
              {[
                {
                  img: '',
                  title: '고정밀 3D 디지털화 & \n지도 기반 시각화 구축',
                  desc: '동물표본을 하이퍼리얼리티 3D로 기록하고, 공간정보 기반 생태 맵으로 확장합니다.',
                },
                {
                  img: '',
                  title: '표준 분류체계 및 \n통합 디지털 아카이브 구축',
                  desc: '네이처 애셋을 위한 표준 분류체계를 정립하고, 누구나 활용 가능한 통합 아카이브를 만듭니다.',
                },
                {
                  img: '',
                  title: '지속 가능한 데이터 \n생태계 조성',
                  desc: '연구·교육·콘텐츠 분야에서 재사용 가능한 확장형 자연 데이터 생태계를 구축합니다.',
                },
              ].map((_, index) => (
                <div key={index} className='w-[30%] flex-shrink-0 h-fit aspect-[3/4] bg-white text-center'>
                  <span className='w-full h-fit font-semibold text-lg'>{_.title}</span>
                  <p className='leading-relaxed text-base'>{_.desc}</p>
                </div>
              ))}
            </div>
            <p className='leading-relaxed text-lg text-center break-keep'>
              본 플랫폼은 문화체육관광부의 재원으로 한국콘텐츠진흥원 지원 <br />
              {'<'}디지털 박물관 서비스를 위한 AI 기반 네이처 복원 기술 개발{'>'} 연구 산출물을 활용하여 구축되었습니다.
            </p>
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
            표본의 상태를 직관적으로 파악할 수 있는 시스템 필요 3D 모델을 활용시 같은 종의 다른 모습인 표본을 효과적으로
            표현할 수 있음 <br />- 암수, 번식깃 유무, 유조와 성조, 성장 단계ê등 관리, 연구 뿐만 아니라 콘텐츠 제작,
            생물학 학습을 위한 자료로 사용 가능
          </p>
          <div className='w-full h-auto bg-white text-[#3EBA72] flex justify-center items-center aspect-landscape mt-5'>
            이미지 삽입 예정
          </div> */}
        </div>
      </motion.div>
    </>
  )
}
