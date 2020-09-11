## Mukbank-data-collect

먹뱅크 프로젝트에서 데이터 수집을 하면서 작성했던 코드와 주요 sql 작성 파일들을 모아둔 자료입니다. 

### controller.js 

사용된 api
공간정보 플랫폼 api
네이버 api 문서 사이트
카카오 api 문서 사이트

insertController
네이버 검색 api를 사용해서 데이터를 입력

updateGeo
공간정보 플랫폼 사이트에서 주소를 위도,경도 좌표로 바꿔서 업데이트

kakaoapi
카카오 api를 이용해 주소를 위도,경고 좌표로 바꿔서 업데이트

crolling
크롤링을 이용해 기존 식당 및 카페 데이터 업데이트

transcoord
카카오 api를 이용해 카텍좌표를 위도, 경도로 바꿔서 업데이트

### index.js

express 서버를 실행시킬 js 파일

### location.txt

검색할 데이터 자료(주소) ex) 송파구 풍납동



