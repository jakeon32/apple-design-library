import { animateSpring, rubberband } from '../spring.js';

export const demo = {
  id: 'rubber-band',
  title: '러버밴드 스크롤',
  principle:
    '카드 목록을 좌우로 드래그해보세요. 끝에 도달한 뒤에도 계속 당기면 딱 멈추지 않고 점점 저항이 세지며 따라오다가, 놓으면 스프링으로 경계까지 되돌아갑니다. "멈춤"이 아니라 "반응"으로 느껴지게 만드는 원칙입니다.',
  mount(container) {
    container.innerHTML = `
      <div class="rubber-band-viewport" id="rb-viewport">
        <div class="rubber-band-track" id="rb-track">
          ${['A', 'B', 'C', 'D', 'E'].map((label) => `<div class="rubber-band-card">${label}</div>`).join('')}
        </div>
      </div>
    `;

    const viewport = container.querySelector('#rb-viewport');
    const track = container.querySelector('#rb-track');

    let offset = 0;
    let anim = null;
    let dragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;

    function maxOffset() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function setOffset(raw) {
      const max = maxOffset();
      let visual = raw;
      if (raw < 0) visual = -rubberband(-raw, viewport.clientWidth, 0.55);
      else if (raw > max) visual = max + rubberband(raw - max, viewport.clientWidth, 0.55);
      offset = visual;
      track.style.transform = `translateX(${-visual}px)`;
    }

    function onPointerDown(e) {
      if (anim) anim.cancel();
      dragging = true;
      viewport.setPointerCapture(e.pointerId);
      dragStartX = e.clientX;
      dragStartOffset = offset;
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setOffset(dragStartOffset - (e.clientX - dragStartX));
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      const max = maxOffset();
      const target = offset < 0 ? 0 : offset > max ? max : offset;
      if (target !== offset) {
        anim = animateSpring({
          from: offset,
          to: target,
          damping: 1.0,
          response: 0.35,
          onUpdate(p) {
            offset = p;
            track.style.transform = `translateX(${-p}px)`;
          },
        });
      }
    }

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);

    return function cleanup() {
      if (anim) anim.cancel();
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerUp);
      viewport.removeEventListener('pointercancel', onPointerUp);
    };
  },
  code: `<!-- spring.js도 같은 폴더에 함께 복사하세요 (사이트 저장소의 spring.js 참고) -->
<div class="rubber-band-viewport" id="rb-viewport">
  <div class="rubber-band-track" id="rb-track">
    <div class="rubber-band-card">A</div>
    <div class="rubber-band-card">B</div>
    <div class="rubber-band-card">C</div>
  </div>
</div>

<script type="module">
  import { animateSpring, rubberband } from './spring.js';

  const viewport = document.querySelector('#rb-viewport');
  const track = document.querySelector('#rb-track');
  let offset = 0, dragging = false, dragStartX = 0, dragStartOffset = 0;

  function maxOffset() { return Math.max(0, track.scrollWidth - viewport.clientWidth); }

  function setOffset(raw) {
    const max = maxOffset();
    let visual = raw;
    if (raw < 0) visual = -rubberband(-raw, viewport.clientWidth, 0.55);
    else if (raw > max) visual = max + rubberband(raw - max, viewport.clientWidth, 0.55);
    offset = visual;
    track.style.transform = \`translateX(\${-visual}px)\`;
  }

  viewport.addEventListener('pointerdown', (e) => {
    dragging = true;
    viewport.setPointerCapture(e.pointerId);
    dragStartX = e.clientX;
    dragStartOffset = offset;
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setOffset(dragStartOffset - (e.clientX - dragStartX));
  });

  viewport.addEventListener('pointerup', () => {
    dragging = false;
    const max = maxOffset();
    const target = offset < 0 ? 0 : offset > max ? max : offset;
    // Spring back to the boundary if we overshot it
    animateSpring({ from: offset, to: target, damping: 1.0, response: 0.35,
      onUpdate(p) { offset = p; track.style.transform = \`translateX(\${-p}px)\`; } });
  });
</script>`,
};
