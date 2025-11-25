export const Copyright = () => {
  return (
    <div className='h-7 w-full text-black px-2.5 pb-2 flex flex-row items-center justify-between gap-2'>
      <span className='w-fit h-fit text-sm font-medium'>© {new Date().getFullYear()} NHIV. All rights reserved.</span>
      <span className='w-fit h-fit text-sm font-medium'>한국전통대학교 디지털헤리티지학과 HiLAB</span>
    </div>
  )
}
