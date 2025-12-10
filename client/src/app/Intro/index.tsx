'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import KnnhLogo from '@/img/knnh_logo.svg'
import HiLabLogo from '@/img/hilab_logo.svg'
import classNames from 'classnames'
interface ProjectInfoProps {
  isPageInfo: boolean
  setIsPageInfo: (value: boolean) => void
}

export const Intro = ({ isPageInfo, setIsPageInfo }: ProjectInfoProps) => {
  const [isClickedScroll, setIsClickedScroll] = useState(false)

  const scrollViewRef = useRef(null)
  const isScrollViewInView = useInView(scrollViewRef, {
    amount: 0.5, // 50% 이상 보이면 true
  })

  // 버튼 재활성화
  useEffect(() => {
    if (!isScrollViewInView) {
      setIsClickedScroll(false)
    }
  }, [isScrollViewInView])

  const scrollToView = () => {
    setIsClickedScroll(true)
    const scrollView = document.getElementById('scroll-view')
    if (scrollView) {
      scrollView.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
        <div className='w-full h-[90vh] flex-shrink-0 relative flex flex-col items-center justify-center gap-5'>
          <div className='absolute top-[50vh] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-fit flex flex-col items-center justify-center gap-10 mb-36'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='w-fit h-fit pb-6 flex flex-col gap-4 items-center justify-center'
            >
              <span className='text-base leading-none w-fit h-fit font-normal text-gray-800'>
                한국전통대학교 디지털헤리티지학과 HiLAB
              </span>
              <span className='text-3xl font-bold text-center leading-snug w-fit h-fit'>
                네이처 에셋 기반
                <br />
                자연유산 디지털 아카이브
              </span>
              <span className='text-xl font-medium leading-tight w-fit h-fit text-gray-600'>
                디지털 박물관 서비스를 위한 AI 기반 네이처 복원 기술 개발
              </span>
            </motion.div>
            <button
              onClick={() => setIsPageInfo(false)}
              className='bg-[#3EBA72] shadow-xl text-white leading-none rounded-2xl w-fit h-fit px-6 py-4 justify-center items-center flex flex-row text-lg font-semibold hover:opacity-80 active:shadow-none active:translate-y-0.5 transition-all cursor-pointer'
            >
              지도기반 시각화 바로가기 <FiArrowUpRight className='text-xl' />
            </button>
            <div className='inline-flex mt-20 h-16 gap-12 justify-center items-center'>
              <KnnhLogo className='h-[70%] w-auto' />
              <HiLabLogo className='h-full w-auto' />
            </div>
          </div>
        </div>
        {!isClickedScroll && !isScrollViewInView && (
          <button
            onClick={scrollToView}
            className='fixed bottom-8 animate-bounce p-2 h-fit w-auto aspect-square rounded-full text-xl bg-white backdrop-blur-md shadow-lg text-black/70 hover:bg-white/50 cursor-pointer transition-all'
          >
            <FiArrowUpRight className='rotate-135' />
          </button>
        )}
        <div
          id='scroll-view'
          ref={scrollViewRef}
          className={classNames(
            'w-full h-fit break-keep flex flex-col gap-32 justify-start items-center pb-16',
            'bg-gradient-to-t from-white via-white/90 via-white/50 to-white/0 pt-72 -mt-60',
          )}
        >
          <InViweFrame className='max-w-6xl inline-flex justify-between items-start gap-12'>
            <div className='w-[30%] flex-shrink-0 h-fit aspect-[3/4] bg-white rounded-xl shadow' />
            <div className='w-full h-fit flex flex-col gap-12 justify-start items-start'>
              <span className='w-full h-fit font-semibold text-xl'>
                3D 기반 생태 데이터의 표준화와 재사용성 확보(가제)
              </span>
              <p className='leading-relaxed text-base pr-4'>
                {`  `}
                자연 생태 자원은 여전히 체계적인 아카이빙이 부족해 정보 공유가 개인적 네트워크에 의존하고 있습니다. 기존
                DB 플랫폼 역시 제한적이며, 대부분 저해상도 2D 이미지 중심으로 구성되어 있어 연구·교육·콘텐츠 제작에
                충분한 활용이 어렵습니다.
                <br />
                <br />
                {`  `}한편, 전시·교육·체험 분야에서는 실제에 가까운 고해상도 3D 네이처 애셋의 수요가 빠르게 증가하고
                있지만, 현재 데이터는 단발성 외주 제작에 그쳐 재사용성이 매우 낮은 실정입니다.
              </p>
              <p className='leading-relaxed text-base pr-4'>
                {`  `}본 프로젝트는 이러한 구조적 한계를 해결하기 위해 3D 생태 데이터 구축 기술, 표준화된 디지털
                아카이브, 지속적으로 재활용 가능한 네이처 애셋 생태계를 마련하고자 합니다.
              </p>
            </div>
          </InViweFrame>

          <InViweFrame className='max-w-5xl flex flex-col justify-start items-center gap-12'>
            <span className='w-full h-fit font-semibold text-xl text-center'>프로젝트 목표</span>
            <div className='inline-flex justify-between items-start gap-12'>
              {[
                {
                  img: 'img/objects.png',
                  title: '고정밀 3D 디지털화 & \n지도 기반 시각화 구축',
                  desc: '동물표본을 하이퍼리얼리티 3D로 기록하고, 공간정보 기반 생태 맵으로 확장합니다.',
                },
                {
                  img: 'img/3d-modeling.png',
                  title: '표준 분류체계 및 \n통합 디지털 아카이브 구축',
                  desc: '네이처 애셋을 위한 표준 분류체계를 정립하고, 누구나 활용 가능한 통합 아카이브를 만듭니다.',
                },
                {
                  img: 'img/sustainable.png',
                  title: '지속 가능한 데이터 \n생태계 조성',
                  desc: '연구·교육·콘텐츠 분야에서 재사용 가능한 확장형 자연 데이터 생태계를 구축합니다.',
                },
              ].map((_, index) => (
                <div
                  key={index}
                  className='w-[30%] flex-shrink-0 h-fit aspect-[3/4] bg-white rounded-xl shadow text-center flex flex-col justify-center items-center px-4 py-6 gap-4 hover:shadow-xl transition-all duration-500 ease-in-out cursor-pointer'
                >
                  <div className='w-fit h-56 mb-4'>
                    <img
                      src={_.img}
                      alt={_.title}
                      className={classNames(
                        'h-full object-contain',
                        index === 0 ? 'scale-75' : index === 1 ? 'scale-100' : 'scale-75',
                      )}
                    />
                  </div>
                  <span className='w-full h-fit font-semibold text-lg leading-snug'>{_.title}</span>
                  <p className='leading-relaxed text-sm text-gray-800'>{_.desc}</p>
                </div>
              ))}
            </div>

            <p className='leading-relaxed text-base text-center break-keep'>
              본 플랫폼은 문화체육관광부의 재원으로 한국콘텐츠진흥원 지원 <br />
              {'<'}디지털 박물관 서비스를 위한 AI 기반 네이처 복원 기술 개발{'>'} 연구 산출물을 활용하여 구축되었습니다.
            </p>
            <p className='text-xxs text-gray-200 leading-none -mt-1.5'>
              This project includes icons created by Vitaly Gorbachev, smashingstocks, Iconjam, and nangicon, sourced
              from
              <a href='https://www.flaticon.com' target='_blank' rel='noopener noreferrer'>
                Flaticon
              </a>
              .
            </p>
          </InViweFrame>
        </div>
      </motion.div>
    </>
  )
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
}

const InViweFrame = ({ children, className, ...rest }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2, once: false })
  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial='hidden'
      animate={inView ? 'visible' : 'hidden'}
      transition={{
        duration: 0.8, // 800ms
        ease: [0.4, 0, 0.2, 1], // cubic-bezier(.4,0,.2,1)
      }}
      className={`w-full relative ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
