import { animateSpring } from '../spring.js';

export const demo = {
  id: 'spring-button',
  title: '스프링 버튼',
  principle:
    '버튼을 누르면 damping·response 값에 따라 카드가 움직입니다. duration이 아니라 이 두 값으로 "감쇠 정도"와 "도달 속도"를 조절하는 방식을 체감해보세요. damping 1.0은 오버슈트 없는 정착, 1.0 미만은 통통 튀는 느낌입니다.',
  mount(container) {
    container.innerHTML = `
      <div class="spring-stage">
        <div class="spring-box" id="spring-box"></div>
      </div>
      <div class="spring-controls">
        <label>Damping: <span id="damping-value">1.00</span>
          <input type="range" id="damping-slider" min="0.3" max="1.2" step="0.05" value="1.0">
        </label>
        <label>Response: <span id="response-value">0.40</span>s
          <input type="range" id="response-slider" min="0.15" max="1.0" step="0.05" value="0.4">
        </label>
        <button id="trigger-btn">움직이기</button>
      </div>
    `;

    const box = container.querySelector('#spring-box');
    const dampingSlider = container.querySelector('#damping-slider');
    const responseSlider = container.querySelector('#response-slider');
    const dampingValue = container.querySelector('#damping-value');
    const responseValue = container.querySelector('#response-value');
    const triggerBtn = container.querySelector('#trigger-btn');

    let currentAnim = null;
    let toggled = false;

    function updateLabels() {
      dampingValue.textContent = Number(dampingSlider.value).toFixed(2);
      responseValue.textContent = Number(responseSlider.value).toFixed(2);
    }
    dampingSlider.addEventListener('input', updateLabels);
    responseSlider.addEventListener('input', updateLabels);

    function trigger() {
      if (currentAnim) currentAnim.cancel();
      const from = toggled ? 220 : 0;
      const to = toggled ? 0 : 220;
      toggled = !toggled;
      currentAnim = animateSpring({
        from,
        to,
        damping: Number(dampingSlider.value),
        response: Number(responseSlider.value),
        onUpdate(position) {
          box.style.transform = `translateX(${position}px)`;
        },
      });
    }
    triggerBtn.addEventListener('click', trigger);

    return function cleanup() {
      if (currentAnim) currentAnim.cancel();
    };
  },
  code: `<div class="spring-stage">
  <div class="spring-box" id="spring-box"></div>
</div>
<button id="trigger-btn">움직이기</button>

<script type="module">
  import { animateSpring } from './spring.js';

  const box = document.querySelector('#spring-box');
  let toggled = false;
  let currentAnim = null;

  document.querySelector('#trigger-btn').addEventListener('click', () => {
    if (currentAnim) currentAnim.cancel();
    const from = toggled ? 220 : 0;
    const to = toggled ? 0 : 220;
    toggled = !toggled;
    currentAnim = animateSpring({
      from, to,
      damping: 1.0,   // 1.0 = no overshoot, < 1.0 = bouncy
      response: 0.4,  // seconds to reach target, not a fixed duration
      onUpdate(position) {
        box.style.transform = \`translateX(\${position}px)\`;
      },
    });
  });
</script>`,
};
