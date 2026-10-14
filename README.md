# MonCoti 홈페이지

https://moncoti.github.io

GitHub Pages로 배포되는 정적 사이트예요. `main` 브랜치의 파일이 그대로 사이트가 되고, 따로 빌드할 필요는 없어요.

## 구조

```
index.html          페이지 본문
css/styles.css      상단(히어로부터 Memory까지)
css/intro.css       로고, 마스코트 구간
css/bottom.css      하단(Google Workspace 아코디언, Today, Control, Privacy, Capabilities, CTA). 모든 선택자가 .v3b 아래에 있어요
js/main.js          히어로 시연, 동료 탭, 글자 풀림 효과, 다운로드 버튼
js/intro.js         마스코트 영상, 게이지·동료·기억 칩 등장
js/bottom.js        아코디언, Today 카드, 확인/멈춤 카드, Capabilities 카드 4개의 화면 시연과 모바일 넘기기, 배경 테마(?bg=)
assets/fonts/       Newsreader, Outfit, Pretendard. sub/에는 이 페이지에 쓰인 글자만 담은 가벼운 폰트
assets/img/         아이콘, 파비콘, 마스코트 정지 컷, 동료 아바타(team), Google 제품 로고(gws)
assets/video/       마스코트 루프 영상(7.3초, 무음)
```

## 수정과 배포

- 파일을 고쳐서 `main`에 올리면 1~2분 뒤 사이트에 반영돼요.
- `index.html`의 css, js 링크에는 `?v=` 버전 값이 붙어 있어요. css나 js를 고치면 이 값도 바꿔 주세요. 안 바꾸면 다시 찾은 방문자에게 최대 10분 동안 예전 파일이 보일 수 있어요.
- 폰트는 `assets/fonts/sub/`의 가벼운 파일(이 페이지에 쓰인 글자만)을 먼저 쓰고, 그 밖의 글자가 생기면 기존 전체 폰트가 자동으로 이어받아요. 문구를 바꿔도 깨지지는 않지만, 문구가 많이 바뀌면 서브셋을 다시 만들어야 가장 가벼워요. Newsreader 서브셋은 굵기 400으로 고정돼 있어요.
- `css/intro.css`, `css/bottom.css`는 첫 화면을 막지 않도록 나중에 불러와요. 그동안 `index.html`의 `.mx,.v3b{visibility:hidden}`이 해당 구간을 숨기고, 두 파일 끝의 `visibility:visible`이 다시 보여줘요. 첫 화면(로고, 히어로)에 필요한 스타일은 `css/styles.css`에 두세요.
- 모바일 메뉴는 `js/main.js`가 데스크톱 메뉴(`.nav-center`)를 복제해서 만들어요. 메뉴 항목은 데스크톱 메뉴만 고치면 둘 다 바뀌어요.
- 마스코트 영상은 흰 배경을 `mix-blend-mode: multiply`로 지워서 합성해요. `.mx-figure`나 그 상위 요소에 transform, filter, opacity, z-index를 주면 흰 사각형이 보이니 주의하세요.
- 아직 공개 전이라 `index.html`에 `<meta name="robots" content="noindex, nofollow">`가 들어 있어요. 정식 공개할 때 지우면 검색에 노출돼요.
- 하단 배경은 기본이 `soft`예요. 주소 뒤에 `?bg=neutral`, `?bg=apple`, `?bg=google`, `?bg=aurora`를 붙이면 다른 시안을 볼 수 있어요.

## 라이선스와 상표

- 글꼴: Newsreader, Outfit, Pretendard 모두 SIL Open Font License 1.1
- Google, Gmail, Google Chat, Google Calendar, Google Drive, Google Docs, Google Sheets는 Google LLC의 상표예요.
