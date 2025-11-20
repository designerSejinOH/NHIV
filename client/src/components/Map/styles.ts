// Google Maps JavaScript API 스타일 JSON 예시
// 타입: google.maps.MapTypeStyle[]

export const mapStyle: google.maps.MapTypeStyle[] = [
  //
  // 0. 전역 기본값 (전체 라벨 끄기 같은 거)
  //
  {
    featureType: 'all', // 어떤 피처든 (도로, 물, POI 전부)
    elementType: 'labels', // 라벨 전체 (텍스트 + 아이콘)
    stylers: [{ visibility: 'on' }], // 'off'로 바꾸면 라벨 전체 숨김
  },

  //
  // 1. 물 (강, 호수, 바다)
  //
  {
    featureType: 'water',
    elementType: 'labels', // 물 위에 뜨는 글자
    stylers: [
      { visibility: 'on' }, // 숨기기
    ],
  },

  //
  // 2. 도로
  //
  {
    featureType: 'road',
    elementType: 'geometry', // 모든 도로 기본 라인
    stylers: [{ visibility: 'on' }, { color: '#ffffff' }],
  },
  {
    featureType: 'road.highway', // 고속도로
    elementType: 'geometry',
    stylers: [{ color: '#ffe0b2' }],
  },
  {
    featureType: 'road.local', // 동네길
    elementType: 'geometry',
    stylers: [{ color: '#f3f3f3' }],
  },
  {
    featureType: 'road',
    elementType: 'labels', // 도로 이름 라벨
    stylers: [
      { visibility: 'off' }, // 로드 네임 전부 숨기기
    ],
  },

  //
  // 3. 지형 / 땅 (landscape)
  //

  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape.natural', // 산/숲 등의 자연 지형
    elementType: 'geometry',
    stylers: [{ visiblity: 'on' }],
  },

  //
  // 4. POI (마커/장소들)
  //
  {
    featureType: 'poi', // 모든 POI (카페, 공원, 기관 등)
    elementType: 'all',
    stylers: [
      { visibility: 'off' }, // 지도에서 POI 싹 다 숨기기
    ],
  },
  {
    featureType: 'poi.park', // 공원만 따로 켜고 싶으면 이렇게
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#e3f2e1' }],
  },

  //
  // 5. 행정 경계 (시/도 경계선 등)
  //
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' }, // 행정 경계선 숨기기
    ],
  },

  //
  // 6. 대중교통 (Transit)
  //
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [
      { visibility: 'off' }, // 지하철/버스 라인/역 숨기기
    ],
  },

  //
  // 7. 텍스트 스타일 통합 조정
  //
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#555555' }, // 모든 텍스트 색
    ],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' }, // 텍스트 외곽선 색
      { weight: 2.5 },
    ],
  },

  //
  // 8. 전체를 흑백/모노톤으로 만들고 싶을 때 (hue/saturation 예시)
  //
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [
      // { hue: '#000000' },         // 전체 색조 밀어버리기 (잘 안 쓰긴 함)
      // { gamma: 1.0 },            // 대비/감마 조정 (0.01~10)
    ],
  },
]
