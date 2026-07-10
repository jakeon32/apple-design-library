import { animateSpring, project } from '../spring.js';

export const demo = {
  id: 'drag-sheet',
  title: '드래그 가능한 바텀시트',
  principle:
    '시트를 손가락에 딱 붙여서(1:1 추적) 드래그하고, 놓으면 놓을 때의 속도로 "어디까지 갈지"를 미리 계산(모멘텀 프로젝션)해서 열림/닫힘을 스냅합니다. 애니메이션 도중에 다시 잡으면 즉시 반응합니다(중단 가능성) — CSS transition으로는 만들기 어려운 동작입니다.',
  mount(container) {
    container.innerHTML = `
      <div class="drag-sheet-stage">
        <div class="drag-sheet-backdrop" id="sheet-backdrop"></div>
        <div class="drag-sheet" id="sheet">
          <div class="drag-sheet-handle" id="sheet-handle"></div>
          <p>손잡이를 위아래로 드래그해보세요.</p>
        </div>
      </div>
      <button id="open-btn">시트 열기</button>
    `;

    const sheet = container.querySelector('#sheet');
    const handle = container.querySelector('#sheet-handle');
    const openBtn = container.querySelector('#open-btn');
    const backdrop = container.querySelector('#sheet-backdrop');

    const CLOSED_Y = 200;
    const OPEN_Y = 0;

    let position = CLOSED_Y;
    let anim = null;
    let dragging = false;
    let dragStartY = 0;
    let dragStartPosition = 0;
    let history = [];

    function setPosition(y) {
      position = Math.max(OPEN_Y, Math.min(CLOSED_Y, y));
      sheet.style.transform = `translateY(${position}px)`;
      backdrop.style.opacity = String((1 - position / CLOSED_Y) * 0.4);
    }

    function settleTo(target, velocity) {
      if (anim) anim.cancel();
      anim = animateSpring({
        from: position,
        to: target,
        velocity,
        damping: 0.9,
        response: 0.35,
        onUpdate(p) { setPosition(p); },
      });
    }

    function onPointerDown(e) {
      if (anim) anim.cancel();
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      dragStartY = e.clientY;
      dragStartPosition = position;
      history = [{ y: e.clientY, t: performance.now() }];
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setPosition(dragStartPosition + (e.clientY - dragStartY));
      history.push({ y: e.clientY, t: performance.now() });
      if (history.length > 5) history.shift();
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;

      let velocity = 0;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0) velocity = (last.y - first.y) / dt;
      }

      const projectedPosition = position + project(velocity);
      const target = projectedPosition > CLOSED_Y / 2 ? CLOSED_Y : OPEN_Y;
      settleTo(target, velocity);
    }

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
    openBtn.addEventListener('click', () => settleTo(OPEN_Y, 0));
    backdrop.addEventListener('click', () => settleTo(CLOSED_Y, 0));

    setPosition(CLOSED_Y);

    return function cleanup() {
      if (anim) anim.cancel();
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
    };
  },
  code: `<div class="drag-sheet-stage">
  <div class="drag-sheet-backdrop" id="sheet-backdrop"></div>
  <div class="drag-sheet" id="sheet">
    <div class="drag-sheet-handle" id="sheet-handle"></div>
  </div>
</div>

<script type="module">
  import { animateSpring, project } from './spring.js';

  const sheet = document.querySelector('#sheet');
  const handle = document.querySelector('#sheet-handle');
  const CLOSED_Y = 200, OPEN_Y = 0;
  let position = CLOSED_Y, anim = null, dragging = false;
  let dragStartY = 0, dragStartPosition = 0, history = [];

  function setPosition(y) {
    position = Math.max(OPEN_Y, Math.min(CLOSED_Y, y));
    sheet.style.transform = \`translateY(\${position}px)\`;
  }

  function settleTo(target, velocity) {
    if (anim) anim.cancel();
    anim = animateSpring({ from: position, to: target, velocity, damping: 0.9, response: 0.35, onUpdate: setPosition });
  }

  handle.addEventListener('pointerdown', (e) => {
    if (anim) anim.cancel();
    dragging = true;
    handle.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    dragStartPosition = position;
    history = [{ y: e.clientY, t: performance.now() }];
  });

  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setPosition(dragStartPosition + (e.clientY - dragStartY));
    history.push({ y: e.clientY, t: performance.now() });
    if (history.length > 5) history.shift();
  });

  handle.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    let velocity = 0;
    if (history.length >= 2) {
      const first = history[0], last = history[history.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt > 0) velocity = (last.y - first.y) / dt;
    }
    // Momentum projection: where would this velocity carry the sheet?
    const projected = position + project(velocity);
    settleTo(projected > CLOSED_Y / 2 ? CLOSED_Y : OPEN_Y, velocity);
  });
</script>`,
};
