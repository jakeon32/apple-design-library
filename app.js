import { demo as springButtonDemo } from './demos/spring-button.js';
import { demo as dragSheetDemo } from './demos/drag-sheet.js';
import { demo as rubberBandDemo } from './demos/rubber-band.js';

export function resolveDemoFromHash(hash, demos) {
  const id = (hash || '').replace(/^#/, '');
  return demos.find((d) => d.id === id) || demos[0];
}

export const DEMOS = [springButtonDemo, dragSheetDemo, rubberBandDemo];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSidebar(demos, activeId) {
  const list = document.querySelector('#sidebar-list');
  list.innerHTML = '';
  demos.forEach((demo) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${demo.id}`;
    a.textContent = demo.title;
    a.className = demo.id === activeId ? 'active' : '';
    li.appendChild(a);
    list.appendChild(li);
  });
}

let currentCleanup = null;

function renderDemo(demo) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  document.querySelector('#panel-title').textContent = demo.title;
  document.querySelector('#panel-principle').textContent = demo.principle;

  const stage = document.querySelector('#demo-stage');
  stage.innerHTML = '';
  currentCleanup = demo.mount(stage) || null;

  const codeContent = document.querySelector('#code-content');
  codeContent.innerHTML = escapeHtml(demo.code);

  const codeBlock = document.querySelector('#code-block');
  const codeToggle = document.querySelector('#code-toggle');
  codeBlock.hidden = true;
  codeToggle.textContent = '코드 보기';
  codeToggle.onclick = () => {
    codeBlock.hidden = !codeBlock.hidden;
    codeToggle.textContent = codeBlock.hidden ? '코드 보기' : '코드 숨기기';
  };

  document.querySelector('#copy-btn').onclick = async () => {
    try {
      await navigator.clipboard.writeText(demo.code);
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(codeContent);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  renderSidebar(DEMOS, demo.id);
}

function route() {
  if (DEMOS.length === 0) return;
  const demo = resolveDemoFromHash(window.location.hash, DEMOS);
  if (demo) renderDemo(demo);
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
}
