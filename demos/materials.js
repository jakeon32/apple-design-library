export const demo = {
  id: 'materials',
  title: '반투명 재질',
  principle:
    '반투명 레이어(backdrop-filter)는 아래 콘텐츠가 스크롤되는 동안에도 구조를 유지하면서 시선을 빼앗지 않습니다. 배경을 바꿔가며 툴바가 어떻게 "그 위의 빛을 받는 유리"처럼 보이는지 확인해보세요.',
  mount(container) {
    container.innerHTML = `
      <div class="materials-stage materials-bg-light" id="materials-stage">
        <div class="materials-toolbar">
          <span>반투명 툴바</span>
          <button id="bg-toggle">배경 전환</button>
        </div>
        <div class="materials-content">
          ${Array.from({ length: 14 })
            .map((_, i) => `<p>스크롤되는 콘텐츠 줄 ${i + 1} — 툴바 아래로 흘러갑니다.</p>`)
            .join('')}
        </div>
      </div>
    `;

    const stage = container.querySelector('#materials-stage');
    const toggleBtn = container.querySelector('#bg-toggle');
    let dark = false;

    function toggle() {
      dark = !dark;
      stage.classList.toggle('materials-bg-dark', dark);
      stage.classList.toggle('materials-bg-light', !dark);
    }
    toggleBtn.addEventListener('click', toggle);

    return function cleanup() {
      toggleBtn.removeEventListener('click', toggle);
    };
  },
  code: `<div class="materials-stage">
  <div class="materials-toolbar">반투명 툴바</div>
  <div class="materials-content">
    <p>스크롤되는 콘텐츠…</p>
  </div>
</div>

<style>
.materials-stage { position: relative; overflow-y: auto; height: 320px; }
.materials-toolbar {
  position: sticky; top: 0; z-index: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 16px;
}
.materials-content { padding: 16px; }
</style>`,
};
