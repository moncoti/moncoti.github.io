# MonCoti 홈페이지

https://moncoti.github.io

GitHub Pages로 배포되는 정적 사이트예요. `main` 브랜치의 파일이 그대로 사이트가 되고, 따로 빌드할 필요는 없어요.

## 구조

```
index.html          페이지 본문
css/styles.css      상단(히어로부터 Memory까지)
css/intro.css       로고, 마스코트 구간
css/bottom.css      하단(Google Workspace 아코디언, Today, Control, Privacy, CTA). 모든 선택자가 .v3b 아래에 있어요
js/main.js          히어로 시연, 동료 탭, 글자 풀림 효과, 다운로드 버튼
js/intro.js         마스코트 영상, 게이지·동료·기억 칩 등장
js/bottom.js        아코디언, Today 카드, 확인/멈춤 카드, 배경 테마(?bg=)
assets/fonts/       Newsreader, Outfit, Pretendard(페이지에 쓰인 글자만 담은 서브셋)
assets/img/         아이콘, 파비콘, 마스코트 정지 컷, 동료 아바타(team), Google 제품 로고(gws)
assets/video/       마스코트 루프 영상(7.3초, 무음)
```

## 수정과 배포

- 파일을 고쳐서 `main`에 올리면 1~2분 뒤 사이트에 반영돼요.
- 한글 문구를 새로 넣으면, Pretendard 서브셋에 없는 글자는 기본 글꼴로 보일 수 있어요. 그럴 땐 `assets/fonts/pretendard`에 해당 서브셋 파일을 추가하고 `assets/fonts/fonts.css`에 등록하세요.
- 마스코트 영상은 흰 배경을 `mix-blend-mode: multiply`로 지워서 합성해요. `.mx-figure`나 그 상위 요소에 transform, filter, opacity, z-index를 주면 흰 사각형이 보이니 주의하세요.
- 아직 공개 전이라 `index.html`에 `<meta name="robots" content="noindex, nofollow">`가 들어 있어요. 정식 공개할 때 지우면 검색에 노출돼요.
- 하단 배경은 기본이 `soft`예요. 주소 뒤에 `?bg=neutral`, `?bg=apple`, `?bg=google`, `?bg=aurora`를 붙이면 다른 시안을 볼 수 있어요.

## 라이선스와 상표

- 글꼴: Newsreader, Outfit, Pretendard 모두 SIL Open Font License 1.1
- Google, Gmail, Google Chat, Google Calendar, Google Drive, Google Docs, Google Sheets는 Google LLC의 상표예요.
