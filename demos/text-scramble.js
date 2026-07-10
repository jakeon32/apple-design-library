const DEFAULT_TEXT = '정교함은 반복에서 나온다';
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789가나다라마바사아자차카타파하';

// Reveals text left-to-right: unsettled characters cycle through random
// glyphs each frame, settled characters lock in and stop changing.
function scramble(el, finalText, durationMs, onDone) {
  const chars = [...finalText];
  const startTime = performance.now();
  let rafId = null;

  function frame(now) {
    const progress = Math.min(1, (now - startTime) / durationMs);
    const settledCount = Math.floor(progress * chars.length);

    el.textContent = chars
      .map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < settledCount) return ch;
        return CHARSET[Math.floor(Math.random() * CHARSET.length)];
      })
      .join('');

    if (progress < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      el.textContent = finalText;
      if (onDone) onDone();
    }
  }

  rafId = requestAnimationFrame(frame);
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

export const demo = {
  id: 'text-scramble',
  title: '텍스트 스크램블',
  principle:
    '무작위가 시간에 따라 질서로 수렴하는 것도 하나의 모션입니다. 왼쪽부터 순서대로 글자가 무작위 기호에서 정답으로 "정착"됩니다. 옵티컬 사이징·웨이트 웨이브가 폰트 축을 다뤘다면, 이건 문자 자체를 시간축의 재료로 씁니다.',
  mount(container) {
    container.innerHTML = `
      <p class="scramble-sample" id="scramble-sample">${DEFAULT_TEXT}</p>
      <div class="scramble-controls">
        <label>문장
          <input type="text" id="scramble-text" value="${DEFAULT_TEXT}" maxlength="28">
        </label>
        <label>정착 시간: <span id="scramble-duration-value">1200</span>ms
          <input type="range" id="scramble-duration" min="400" max="3000" step="100" value="1200">
        </label>
        <button id="scramble-play-btn">재생</button>
      </div>
    `;

    const sample = container.querySelector('#scramble-sample');
    const textInput = container.querySelector('#scramble-text');
    const durationSlider = container.querySelector('#scramble-duration');
    const durationValue = container.querySelector('#scramble-duration-value');
    const playBtn = container.querySelector('#scramble-play-btn');

    let cancelScramble = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function play() {
      if (cancelScramble) cancelScramble();
      const text = textInput.value || DEFAULT_TEXT;
      if (reduced) {
        sample.textContent = text;
        return;
      }
      const duration = Number(durationSlider.value);
      cancelScramble = scramble(sample, text, duration);
    }

    durationSlider.addEventListener('input', () => {
      durationValue.textContent = durationSlider.value;
    });
    playBtn.addEventListener('click', play);
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') play();
    });

    sample.textContent = DEFAULT_TEXT;

    return function cleanup() {
      if (cancelScramble) cancelScramble();
    };
  },
  code: `<!-- spring.js 불필요 — 순수 requestAnimationFrame -->
<p class="scramble-sample" id="scramble-sample"></p>
<button id="scramble-play-btn">재생</button>

<script>
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789가나다라마바사아자차카타파하';

  function scramble(el, finalText, durationMs) {
    const chars = [...finalText];
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const settledCount = Math.floor(progress * chars.length);

      el.textContent = chars.map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < settledCount) return ch;
        return CHARSET[Math.floor(Math.random() * CHARSET.length)];
      }).join('');

      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  const sample = document.querySelector('#scramble-sample');
  document.querySelector('#scramble-play-btn').addEventListener('click', () => {
    scramble(sample, '정교함은 반복에서 나온다', 1200);
  });
</script>`,
};
