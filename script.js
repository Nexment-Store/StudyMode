/* ── Config ── */
// Add your 4 image paths here
const IMAGES = [
  'Bg1.jpg',
  'Bg2.jpg',
  'Bg3.jpg',
  'Bg4.jpg'
];

const ROTATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
/* ── State ── */
let currentImgIndex   = 0;
let clockInterval     = null;
let countdownSecs     = 0;
let isCountdown       = false;
let countdownInterval = null;

/* ─────────────────────────────────────────── */
/*  Boot — wait for DOM to be fully ready      */
/* ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Elements ── */
  const bg        = document.getElementById('bg');
  const timeEl    = document.getElementById('timeDisplay');
  const dateEl    = document.getElementById('dateDisplay');
  const clockWrap = document.getElementById('clockWrap');
  const backdrop  = document.getElementById('modalBackdrop');
  const closeBtn  = document.getElementById('closeModal');
  const setBtn    = document.getElementById('setTimer');
  const hrInput   = document.getElementById('hrInput');
  const minInput  = document.getElementById('minInput');

  /* ─────────────────────────────────────────── */
  /*  Background rotation                        */
  /* ─────────────────────────────────────────── */
  function setBackground(index) {
    bg.style.backgroundImage = `url('${IMAGES[index]}')`;
  }

  function rotateBackground() {
    currentImgIndex = (currentImgIndex + 1) % IMAGES.length;
    setBackground(currentImgIndex);
  }

  setBackground(currentImgIndex);
  setInterval(rotateBackground, ROTATE_INTERVAL_MS);

  /* ─────────────────────────────────────────── */
  /*  Real clock                                 */
  /* ─────────────────────────────────────────── */
  function pad(n) { return String(n).padStart(2, '0'); }

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function updateClock() {
    const now = new Date();
    timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    dateEl.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, 2026`;
  }

  function startClock() {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  function stopClock() {
    clearInterval(clockInterval);
    clockInterval = null;
  }

  /* ─────────────────────────────────────────── */
  /*  Countdown                                  */
  /* ─────────────────────────────────────────── */
  function renderCountdown(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    timeEl.textContent = h > 0
      ? `${pad(h)}:${pad(m)}:${pad(s)}`
      : `${pad(m)}:${pad(s)}`;

    const now = new Date();
    dateEl.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  }

  function startCountdown(totalSecs) {
    stopClock();
    clearInterval(countdownInterval);

    isCountdown   = true;
    countdownSecs = totalSecs;

    timeEl.classList.add('countdown');
    renderCountdown(countdownSecs);

    countdownInterval = setInterval(() => {
      countdownSecs--;
      renderCountdown(countdownSecs);

      if (countdownSecs <= 0) {
        clearInterval(countdownInterval);
        isCountdown = false;
        timeEl.classList.remove('countdown');
        location.reload();
      }
    }, 1000);
  }

  /* ─────────────────────────────────────────── */
  /*  Modal                                      */
  /* ─────────────────────────────────────────── */
  function openModal() {
    hrInput.value  = 0;
    minInput.value = 0;
    backdrop.classList.add('open');
  }

  function closeModal() {
    backdrop.classList.remove('open');
  }

  clockWrap.addEventListener('dblclick', openModal);
  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  setBtn.addEventListener('click', () => {
    const h     = Math.max(0, parseInt(hrInput.value)  || 0);
    const m     = Math.max(0, parseInt(minInput.value) || 0);
    const total = h * 3600 + m * 60;
    if (total <= 0) return;
    closeModal();
    startCountdown(total);
  });

  /* ── Stepper buttons ── */
  document.querySelectorAll('.stepper').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const max   = parseInt(input.max);
      const min   = parseInt(input.min);
      let val     = parseInt(input.value) || 0;
      if (btn.dataset.dir === 'up')   val = Math.min(max, val + 1);
      if (btn.dataset.dir === 'down') val = Math.max(min, val - 1);
      input.value = val;
    });
  });

  /* ── Clamp inputs on change ── */
  [hrInput, minInput].forEach(inp => {
    inp.addEventListener('input', () => {
      let v = parseInt(inp.value);
      if (isNaN(v)) return;
      v = Math.max(parseInt(inp.min), Math.min(parseInt(inp.max), v));
      inp.value = v;
    });
  });

  /* ── Keyboard: Escape closes modal ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ── Start ── */
  startClock();

}); // end DOMContentLoaded

/* ─────────────────────────────────────────── */
/*  Service Worker (outside DOMContentLoaded)  */
/* ─────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.warn('SW registration failed:', err));
  });
}
