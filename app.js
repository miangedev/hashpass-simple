const html      = document.documentElement;
const themeBtn  = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function initTheme() {
  const stored = localStorage.getItem('hp_theme');
  if (stored) {
    applyTheme(stored);
  } else {
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    applyTheme(preferred);
  }
}

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  themeIcon.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('hp_theme', t);
}

themeBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Follow system changes only if user hasn't manually set a preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  // Only auto-switch if user hasn't manually chosen
  // (We skip this since localStorage always has a value after init)
});

initTheme();

const opts = { upper: true, num: true, sym: true };
let currentPassword = '';

const masterEl  = document.getElementById('master');
const siteEl    = document.getElementById('site');
const lengthEl  = document.getElementById('length');
const lenVal    = document.getElementById('len-val');
const lenDisp   = document.getElementById('len-display');
const btnGen    = document.getElementById('btn-gen');
const btnCopy   = document.getElementById('btn-copy');
const passDisp  = document.getElementById('pass-display');
const sFill     = document.getElementById('strength-fill');
const sName     = document.getElementById('strength-name');
const copyText  = document.getElementById('copy-text');
const eyeToggle = document.getElementById('eye-toggle');
const eyeOpen   = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');

eyeToggle.addEventListener('click', () => {
  const showing = masterEl.type === 'text';
  masterEl.type = showing ? 'password' : 'text';
  eyeOpen.style.display   = showing ? '' : 'none';
  eyeClosed.style.display = showing ? 'none' : '';
});

/* Movimiento y datos del Slider */
lengthEl.addEventListener('input', () => {
  lenVal.textContent = lenDisp.textContent = lengthEl.value;
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const k = chip.dataset.key;
    const activeCount = Object.values(opts).filter(Boolean).length;
    if (opts[k] && activeCount === 1) return; // keep at least one
    opts[k] = !opts[k];
    chip.classList.toggle('active', opts[k]);
  });
});

/* Activar los botones de generación */
[masterEl, siteEl].forEach(el => {
  el.addEventListener('input', () => {
    btnGen.disabled = !(masterEl.value.trim() && siteEl.value.trim());
  });
});

siteEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !btnGen.disabled) btnGen.click();
});

function buildCharset() {
  let c = 'abcdefghijklmnopqrstuvwxyz';
  if (opts.upper) c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.num)   c += '0123456789';
  if (opts.sym)   c += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  return c;
}

async function derivePassword(master, site, length) {
  const enc    = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(master), 'PBKDF2', false, ['deriveBits']
  );
  const salt = enc.encode(site.toLowerCase().trim());
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-512', salt, iterations: 100_000 },
    keyMat,
    length * 8
  );
  const bytes   = new Uint8Array(bits);
  const charset = buildCharset();
  let arr       = Array.from(bytes).map(b => charset[b % charset.length]);

  const guarantees = [];
  if (opts.upper) guarantees.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (opts.num)   guarantees.push('0123456789');
  if (opts.sym)   guarantees.push('!@#$%^&*()-_=+[]{}|;:,.<>?');
  guarantees.forEach((pool, i) => {
    arr[i] = pool[bytes[length + i] % pool.length];
  });

  for (let i = arr.length - 1; i > 0; i--) {
    const j = bytes[i % bytes.length] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

const LEVELS = [
  { label: 'Muy débil',  color: '#FF4444', w: '14%' },
  { label: 'Débil',      color: '#FF6B6B', w: '28%' },
  { label: 'Regular',    color: '#FFB347', w: '46%' },
  { label: 'Buena',      color: '#FFE147', w: '62%' },
  { label: 'Fuerte',     color: '#7DDB60', w: '80%' },
  { label: 'Muy fuerte', color: '#00D4AA', w: '100%' },
];

function scorePassword(pwd) {
  let s = 0;
  if (pwd.length >= 12) s++;
  if (pwd.length >= 20) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  if (pwd.length >= 32) s++;
  return Math.min(s, LEVELS.length - 1);
}

function updateStrength(pwd) {
  const lv = LEVELS[scorePassword(pwd)];
  sFill.style.width      = lv.w;
  sFill.style.background = lv.color;
  sName.textContent      = lv.label;
  sName.style.color      = lv.color;
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

function scrambleReveal(target, duration = 700) {
  const len   = target.length;
  const start = performance.now();
  let   frame;

  passDisp.classList.remove('empty', 'revealed');

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const resolved = Math.floor(progress * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      out += i < resolved
        ? target[i]
        : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    passDisp.textContent = out;
    if (progress < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      passDisp.textContent = target;
      passDisp.classList.add('revealed');
    }
  }

  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(tick);
}

/* Generar la contraseña */
btnGen.addEventListener('click', async () => {
  const master = masterEl.value.trim();
  const site   = siteEl.value.trim();
  const length = parseInt(lengthEl.value, 10);

  if (!master || !site) return;

  btnGen.disabled    = true;
  btnGen.textContent = 'Calculando…';
  passDisp.classList.add('empty');
  passDisp.classList.remove('revealed');
  passDisp.textContent = 'Derivando clave…';
  btnCopy.disabled = true;
  sFill.style.width = '0%';
  sName.textContent = '—';
  sName.style.color = '';

  try {
    currentPassword = await derivePassword(master, site, length);
    scrambleReveal(currentPassword);
    updateStrength(currentPassword);
    btnCopy.disabled = false;
  } catch (err) {
    passDisp.classList.add('empty');
    passDisp.textContent = 'Error al generar. Intenta de nuevo.';
    console.error('HashPass derive error:', err);
  } finally {
    btnGen.disabled    = false;
    btnGen.textContent = 'Generar contraseña';
  }
});

/* Copiar la contraseña */
btnCopy.addEventListener('click', async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
  } catch {
    // Fallback for older browsers or HTTP
    const ta = Object.assign(document.createElement('textarea'), {
      value: currentPassword,
      style: 'position:fixed;opacity:0'
    });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  btnCopy.classList.add('copied');
  copyText.textContent = '¡Copiado!';
  setTimeout(() => {
    btnCopy.classList.remove('copied');
    copyText.textContent = 'Copiar';
  }, 2200);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.06}s`;
  revealObserver.observe(el);
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});