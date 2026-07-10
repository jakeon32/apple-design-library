import { animateSpring } from '../spring.js';

export const demo = {
  id: 'reduced-motion',
  title: 'Reduced-motion 토글',
  principle:
    'Reduced-motion은 "피드백을 없애는" 것이 아니라 "전정 감각을 자극하지 않는 대안"으로 바꾸는 것입니다. 같은 모달을 일반 모드(스프링으로 확대)와 reduced-motion 모드(짧은 opacity 크로스페이드만)로 각각 열어서 비교해보세요.',
  mount(container) {
    container.innerHTML = `
      <label><input type="checkbox" id="rm-toggle"> Reduced-motion 모드</label>
      <button id="rm-open-btn">모달 열기</button>
      <div class="rm-backdrop" id="rm-backdrop" hidden>
        <div class="rm-modal" id="rm-modal">
          <p>모달 콘텐츠</p>
          <button id="rm-close-btn">닫기</button>
        </div>
      </div>
    `;

    const toggle = container.querySelector('#rm-toggle');
    const openBtn = container.querySelector('#rm-open-btn');
    const backdrop = container.querySelector('#rm-backdrop');
    const modal = container.querySelector('#rm-modal');
    const closeBtn = container.querySelector('#rm-close-btn');
    let anim = null;

    function openModal() {
      backdrop.hidden = false;
      backdrop.style.opacity = '1';
      if (toggle.checked) {
        if (anim) anim.cancel();
        modal.style.transition = 'opacity 150ms ease';
        modal.style.transform = 'none';
        modal.style.opacity = '0';
        requestAnimationFrame(() => { modal.style.opacity = '1'; });
      } else {
        modal.style.transition = 'none';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(0.8)';
        if (anim) anim.cancel();
        anim = animateSpring({
          from: 0.8,
          to: 1,
          damping: 0.85,
          response: 0.35,
          onUpdate(scale) { modal.style.transform = `scale(${scale})`; },
        });
      }
    }

    function closeModal() {
      if (anim) anim.cancel();
      backdrop.hidden = true;
    }

    function onBackdropClick(e) {
      if (e.target === backdrop) closeModal();
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', onBackdropClick);

    return function cleanup() {
      if (anim) anim.cancel();
      openBtn.removeEventListener('click', openModal);
      closeBtn.removeEventListener('click', closeModal);
      backdrop.removeEventListener('click', onBackdropClick);
    };
  },
  code: `<div class="rm-backdrop" id="rm-backdrop" hidden>
  <div class="rm-modal" id="rm-modal">모달 콘텐츠</div>
</div>

<script type="module">
  import { animateSpring } from './spring.js';

  // Detect the user's OS-level preference directly, in addition to any manual toggle.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openModal() {
    document.querySelector('#rm-backdrop').hidden = false;
    const modal = document.querySelector('#rm-modal');
    if (prefersReduced) {
      // Reduced motion: short opacity cross-fade only, no scale/spring.
      modal.style.transition = 'opacity 150ms ease';
      modal.style.transform = 'none';
      modal.style.opacity = '0';
      requestAnimationFrame(() => { modal.style.opacity = '1'; });
    } else {
      // Full motion: spring scale-in.
      modal.style.transform = 'scale(0.8)';
      modal.style.opacity = '1';
      animateSpring({ from: 0.8, to: 1, damping: 0.85, response: 0.35,
        onUpdate(scale) { modal.style.transform = \`scale(\${scale})\`; } });
    }
  }
</script>`,
};
