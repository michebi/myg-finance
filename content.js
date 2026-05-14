console.log("Finance Tweaks: content script loaded.");

const STORAGE_KEY = "financeTweaks.collapsed";
const DEFAULTS = { left: false, right: false };

const LEFT_WIDTH = 320;
const RIGHT_WIDTH = 528;
const COLLAPSED_WIDTH = 40;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULTS };
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

let state = loadState();
let observer = null;

function applyState() {
  const left = document.querySelector('[data-fh-pn="1"]');
  const right = document.querySelector('[data-fh-pn="2"]');

  if (left) {
    const w = state.left ? COLLAPSED_WIDTH : LEFT_WIDTH;
    left.style.setProperty("width", w + "px", "important");
    left.classList.toggle("ft-collapsed", state.left);
  }

  if (right) {
    const w = state.right ? COLLAPSED_WIDTH : RIGHT_WIDTH;
    right.style.setProperty("width", w + "px", "important");
    right.classList.toggle("ft-collapsed", state.right);
  }
  // Note: we deliberately do NOT touch the middle content.
  // Collapsing a panel just leaves a gap — simple and robust.
}

function makeButton(side) {
  const btn = document.createElement("button");
  btn.className = "ft-collapse-btn ft-collapse-btn-" + side;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    state[side] = !state[side];
    saveState(state);
    run();
  });
  return btn;
}

function updateButtonLook(btn, side) {
  const collapsed = state[side];
  const label = side === "left" ? "Lists" : "Research";
  if (side === "left") {
    btn.textContent = collapsed ? "›" : "‹";
  } else {
    btn.textContent = collapsed ? "‹" : "›";
  }
  btn.title = (collapsed ? "Expand " : "Collapse ") + label;
}

function injectButtons() {
  const left = document.querySelector('[data-fh-pn="1"]');
  const right = document.querySelector('[data-fh-pn="2"]');

  if (left) {
    let btn = left.querySelector(".ft-collapse-btn");
    if (!btn) {
      btn = makeButton("left");
      left.appendChild(btn);
    }
    updateButtonLook(btn, "left");
  }

  if (right) {
    let btn = right.querySelector(".ft-collapse-btn");
    if (!btn) {
      btn = makeButton("right");
      right.appendChild(btn);
    }
    updateButtonLook(btn, "right");
  }
}

function run() {
  if (observer) observer.disconnect();
  applyState();
  injectButtons();
  if (observer) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

observer = new MutationObserver(() => run());
run();