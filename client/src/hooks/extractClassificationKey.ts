export const extractClassificationKey = (name: string): string => {
  if (name.includes('포유')) return '포유류'
  if (name.includes('조류')) return '조류'
  if (name.includes('곤충')) return '곤충류'
  if (name.includes('파충')) return '파충류'
  if (name.includes('양서')) return '양서류'
  if (name.includes('어류')) return '어류'
  return 'etc'
}
