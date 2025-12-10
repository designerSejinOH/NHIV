import type { SpecimenWithRelations } from '@/types/database'

// 필터 옵션 타입
export interface FilterOptions {
  protectionTypes: string[]
  classifications: string[]
  collections: string[]
  makers: string[]
  madeYearRange: [number, number]
  deathYearRange: [number, number]
}

// DB 데이터에서 필터 옵션 추출
export function extractFilterOptions(specimens: SpecimenWithRelations[]): FilterOptions {
  const protectionTypesSet = new Set<string>()
  const classificationsSet = new Set<string>()
  const collectionsSet = new Set<string>()
  const makersSet = new Set<string>()
  const madeYears: number[] = []
  const deathYears: number[] = []

  let hasMakerUnknown = false // 제작자 미상인 표본이 있는지 체크

  specimens.forEach((specimen) => {
    // 보호종 타입
    if (specimen.protection_types && specimen.protection_types.length > 0) {
      specimen.protection_types.forEach((type) => protectionTypesSet.add(type))
    }

    // 분류 (name에 이미 한글과 영문이 포함되어 있음)
    if (specimen.species?.classifications?.name) {
      classificationsSet.add(specimen.species.classifications.name)
    }

    // 소장처
    if (specimen.collections?.institution_name) {
      collectionsSet.add(specimen.collections.institution_name)
    }

    // 제작자
    if (specimen.made_by) {
      makersSet.add(specimen.made_by)
    } else {
      hasMakerUnknown = true // 제작자 정보 없는 표본 발견
    }

    // 제작 연도
    if (specimen.made_date) {
      const year = new Date(specimen.made_date).getFullYear()
      if (!isNaN(year)) {
        madeYears.push(year)
      }
    }

    // 폐사 연도
    if (specimen.death_date) {
      const year = new Date(specimen.death_date).getFullYear()
      if (!isNaN(year)) {
        deathYears.push(year)
      }
    }
  })

  // 연도 범위 계산
  const getMadeYearRange = (): [number, number] => {
    if (madeYears.length === 0) return [1950, new Date().getFullYear()]
    return [Math.min(...madeYears), Math.max(...madeYears)]
  }

  const getDeathYearRange = (): [number, number] => {
    if (deathYears.length === 0) return [1950, new Date().getFullYear()]
    return [Math.min(...deathYears), Math.max(...deathYears)]
  }

  return {
    protectionTypes: Array.from(protectionTypesSet).sort(),
    classifications: Array.from(classificationsSet).sort(),
    collections: Array.from(collectionsSet).sort(),
    makers: [
      ...Array.from(makersSet).sort(),
      ...(hasMakerUnknown ? ['미상'] : []), // 제작자 정보 없는 표본이 있으면 "미상" 추가
    ],
    madeYearRange: getMadeYearRange(),
    deathYearRange: getDeathYearRange(),
  }
}

// 필터를 카테고리별로 그룹화
interface GroupedFilters {
  protectionTypes: Set<string>
  classifications: Set<string>
  collections: Set<string>
  makers: Set<string>
  madeYearRange: { from: number; to: number } | null
  deathYearRange: { from: number; to: number } | null
}

function groupFiltersByCategory(currentFilter: string[], allOptions: FilterOptions): GroupedFilters {
  const grouped: GroupedFilters = {
    protectionTypes: new Set(),
    classifications: new Set(),
    collections: new Set(),
    makers: new Set(),
    madeYearRange: null,
    deathYearRange: null,
  }

  currentFilter.forEach((filterTag) => {
    // 제작 기간 필터
    if (filterTag.startsWith('표본 제작 기간:')) {
      const match = filterTag.match(/: (\d+)[^\d]+(\d+)/)
      if (match) {
        grouped.madeYearRange = {
          from: parseInt(match[1]),
          to: parseInt(match[2]),
        }
      }
    }
    // 폐사 기간 필터
    else if (filterTag.startsWith('표본 수집 기간:')) {
      const match = filterTag.match(/: (\d+)[^\d]+(\d+)/)
      if (match) {
        grouped.deathYearRange = {
          from: parseInt(match[1]),
          to: parseInt(match[2]),
        }
      }
    }
    // 나머지는 각 카테고리에 속하는지 확인
    else {
      if (allOptions.protectionTypes.includes(filterTag)) {
        grouped.protectionTypes.add(filterTag)
      }
      if (allOptions.classifications.includes(filterTag)) {
        grouped.classifications.add(filterTag)
      }
      if (allOptions.collections.includes(filterTag)) {
        grouped.collections.add(filterTag)
      }
      if (allOptions.makers.includes(filterTag)) {
        grouped.makers.add(filterTag)
      }
    }
  })

  return grouped
}

// 필터 적용 함수 (카테고리 내 OR, 카테고리 간 AND)
export function applyFilters(
  specimens: SpecimenWithRelations[],
  currentFilter: string[] | null,
  allOptions: FilterOptions,
): SpecimenWithRelations[] {
  if (!currentFilter || currentFilter.length === 0) {
    return specimens
  }

  const grouped = groupFiltersByCategory(currentFilter, allOptions)

  return specimens.filter((specimen) => {
    // 각 카테고리별로 체크 (카테고리 내에서는 OR)
    const checks: boolean[] = []

    // 1. 보호종 필터 (선택된 것 중 하나라도 일치하면 OK)
    if (grouped.protectionTypes.size > 0) {
      const hasMatch = specimen.protection_types?.some((type) => grouped.protectionTypes.has(type)) || false
      checks.push(hasMatch)
    }

    // 2. 분류 필터 (선택된 것 중 하나라도 일치하면 OK)
    if (grouped.classifications.size > 0) {
      const classificationLabel = specimen.species?.classifications?.name || ''
      checks.push(grouped.classifications.has(classificationLabel))
    }

    // 3. 소장처 필터 (선택된 것 중 하나라도 일치하면 OK)
    if (grouped.collections.size > 0) {
      const hasMatch = specimen.collections?.institution_name
        ? grouped.collections.has(specimen.collections.institution_name)
        : false
      checks.push(hasMatch)
    }

    // 4. 제작자 필터 (선택된 것 중 하나라도 일치하면 OK)
    if (grouped.makers.size > 0) {
      let hasMatch = false

      // "미상" 선택 시 made_by가 없는 표본 매칭
      if (grouped.makers.has('미상') && !specimen.made_by) {
        hasMatch = true
      }

      // 일반 제작자 매칭
      if (specimen.made_by && grouped.makers.has(specimen.made_by)) {
        hasMatch = true
      }

      checks.push(hasMatch)
    }

    // 5. 제작 기간 필터
    if (grouped.madeYearRange) {
      if (specimen.made_date) {
        const year = new Date(specimen.made_date).getFullYear()
        const inRange = !isNaN(year) && year >= grouped.madeYearRange.from && year <= grouped.madeYearRange.to
        checks.push(inRange)
      } else {
        checks.push(false)
      }
    }

    // 6. 폐사 기간 필터
    if (grouped.deathYearRange) {
      if (specimen.death_date) {
        const year = new Date(specimen.death_date).getFullYear()
        const inRange = !isNaN(year) && year >= grouped.deathYearRange.from && year <= grouped.deathYearRange.to
        checks.push(inRange)
      } else {
        checks.push(false)
      }
    }

    // 모든 카테고리 체크를 통과해야 함 (AND)
    // 각 카테고리 내에서는 OR로 동작
    return checks.every((check) => check === true)
  })
}
