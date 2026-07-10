const DEFAULT_TEXT = '만지고 느끼는 디자인';

export const demo = {
  id: 'weight-wave',
  title: '가변폰트 웨이트 웨이브',
  principle:
    '가변폰트(variable font)의 weight 축은 그 자체로 애니메이션 가능한 값입니다. 글자 하나하나에 순차적인 딜레이를 주면 텍스트 전체가 카드섹션처럼 웨이브를 그리며 흐릅니다. 옵티컬 사이징이 "크기에 반응하는 굵기"였다면, 이건 같은 weight 축을 시간축으로 확장한 것입니다.',
  mount(container) {
    container.innerHTML = `
      <p class="weight-wave-sample" id="wave-sample"></p>
      <div class="weight-wave-controls">
        <label>문장
          <input type="text" id="wave-text" value="${DEFAULT_TEXT}" maxlength="24">
        </label>
        <label>글자당 딜레이: <span id="wave-delay-value">60</span>ms
          <input type="range" id="wave-delay" min="30" max="200" step="10" value="60">
        </label>
      </div>
    `;

    const sample = container.querySelector('#wave-sample');
    const textInput = container.querySelector('#wave-text');
    const delaySlider = container.querySelector('#wave-delay');
    const delayValue = container.querySelector('#wave-delay-value');

    function render() {
      const text = textInput.value || DEFAULT_TEXT;
      const delay = Number(delaySlider.value);
      sample.innerHTML = '';
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.animationDelay = `${i * delay}ms`;
        sample.appendChild(span);
      });
    }

    textInput.addEventListener('input', render);
    delaySlider.addEventListener('input', () => {
      delayValue.textContent = delaySlider.value;
      render();
    });
    render();

    return function cleanup() {};
  },
  code: `<!-- spring.js는 필요 없음 — 순수 CSS 가변폰트 애니메이션 -->
<p class="weight-wave-sample" id="wave-sample"></p>

<style>
.weight-wave-sample span {
  display: inline-block;
  animation: weight-wave 3.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes weight-wave {
  0%, 100% { font-variation-settings: 'wght' 300; }
  25% { font-variation-settings: 'wght' 550; }
  50% { font-variation-settings: 'wght' 900; }
  75% { font-variation-settings: 'wght' 550; }
}
</style>

<script>
  const text = "만지고 느끼는 디자인";
  const perCharDelayMs = 60;
  const sample = document.querySelector('#wave-sample');
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? '\\u00a0' : ch;
    span.style.animationDelay = \`\${i * perCharDelayMs}ms\`;
    sample.appendChild(span);
  });
</script>`,
};
