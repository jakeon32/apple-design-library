# Apple Design 인터랙션 라이브러리

## 실행 방법

이 사이트는 ES 모듈(`<script type="module">`, `import`/`export`)을 사용합니다. 브라우저는 보안상 `file://`로 연 페이지에서 ES 모듈 로드를 차단하므로, `index.html`을 더블클릭해서 열면 자바스크립트가 조용히 동작하지 않습니다. 반드시 로컬 HTTP 서버로 서빙해서 열어야 합니다.

`apple-design-library/` 폴더 안에서 다음 중 하나를 실행하세요.

```sh
python -m http.server
# 또는
npx serve
```

그 다음 브라우저에서 `http://localhost:<포트>/` (예: `http://localhost:8000/`)로 접속합니다.

## 코드 스니펫 재사용 시 참고

`spring-button`, `drag-sheet`, `rubber-band`, `reduced-motion` 네 데모의 코드 스니펫은 `./spring.js`를 import합니다. 스니펫을 다른 프로젝트로 복사해서 쓸 경우, 이 저장소의 `spring.js`도 같은 폴더에 함께 복사해야 동작합니다.
