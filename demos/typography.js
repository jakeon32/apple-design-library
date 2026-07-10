function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Anchored at a 16px body-text baseline: tracking and leading move opposite to size.
// See ~/.claude/skills/apple-design/SKILL.md §15.
export function computeOpticalSizing(size) {
  if (size >= 16) {
    const t = Math.min(1, (size - 16) / (80 - 16));
    return { tracking: lerp(0, -0.04, t), leading: lerp(1.5, 1.05, t) };
  }
  const t = Math.min(1, (16 - size) / (16 - 12));
  return { tracking: lerp(0, 0.01, t), leading: lerp(1.5, 1.6, t) };
}

export const demo = {
  id: 'typography',
  title: '타이포그래피 옵티컬 사이징',
  principle:
    '같은 글자라도 크기가 커지면 자간(tracking)을 좁히고 줄간격(leading)을 타이트하게, 작아지면 반대로 풀어줘야 읽기 좋습니다. 슬라이더로 크기를 바꾸면서 "옵티컬 사이징 적용/해제"를 비교해보세요.',
  mount(container) {
    container.innerHTML = `
      <p class="typography-sample" id="type-sample">인터페이스는 우리가 생각하고 움직이는 방식과 일치할 때 비로소 자연스러워집니다.</p>
      <div class="typography-controls">
        <label>크기: <span id="size-value">32</span>px
          <input type="range" id="size-slider" min="12" max="80" step="1" value="32">
        </label>
        <label><input type="checkbox" id="optical-toggle" checked> 옵티컬 사이징 적용</label>
      </div>
    `;

    const sample = container.querySelector('#type-sample');
    const slider = container.querySelector('#size-slider');
    const sizeValue = container.querySelector('#size-value');
    const opticalToggle = container.querySelector('#optical-toggle');

    function update() {
      const size = Number(slider.value);
      sizeValue.textContent = String(size);
      sample.style.fontSize = `${size}px`;
      if (opticalToggle.checked) {
        const { tracking, leading } = computeOpticalSizing(size);
        sample.style.letterSpacing = `${tracking}em`;
        sample.style.lineHeight = String(leading);
      } else {
        sample.style.letterSpacing = '0em';
        sample.style.lineHeight = '1.5';
      }
    }

    slider.addEventListener('input', update);
    opticalToggle.addEventListener('change', update);
    update();

    return function cleanup() {};
  },
  code: `<p class="typography-sample" id="type-sample">인터페이스는 우리가 생각하고 움직이는 방식과 일치할 때 비로소 자연스러워집니다.</p>

<script>
  // Optical sizing: tracking and leading move opposite to font size, anchored at a 16px baseline.
  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyOpticalSizing(el, size) {
    let tracking, leading;
    if (size >= 16) {
      const t = Math.min(1, (size - 16) / (80 - 16));
      tracking = lerp(0, -0.04, t); leading = lerp(1.5, 1.05, t);
    } else {
      const t = Math.min(1, (16 - size) / (16 - 12));
      tracking = lerp(0, 0.01, t); leading = lerp(1.5, 1.6, t);
    }
    el.style.fontSize = \`\${size}px\`;
    el.style.letterSpacing = \`\${tracking}em\`;
    el.style.lineHeight = String(leading);
  }

  applyOpticalSizing(document.querySelector('#type-sample'), 48);
</script>`,
};
