//loading.tsx
export default function Loading() {
  return (
    <div className='w-full h-dvh flex flex-col justify-center items-center gap-4'>
      <div className='w-16 h-16 border-4 border-t-4 border-gray-300 border-t-gray-600 rounded-full animate-spin'></div>
      <span className='text-lg font-medium text-gray-700'>로딩 중...</span>
    </div>
  )
}
