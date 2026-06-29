import './style.css';
import {
  html, themeBtn, themeIcon,
  opts,
  masterEl, siteEl, lengthEl, lenVal, lenDisp,
  btnGen, btnCopy, passDisp, sFill, sName, copyText,
  eyeToggle, eyeOpen, eyeClosed,
  LEVELS, SCRAMBLE_CHARS,
} from './variables';

let currentPassword = '';

function initTheme(): void {
  const stored = localStorage.getItem('hp_theme');
  if (stored) {
    applyTheme(stored);
  } else {
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    applyTheme(preferred);
  }
}

function applyTheme(t: string): void {
  html.setAttribute('data-theme', t);
  themeIcon.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('hp_theme', t);
}

themeBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();

eyeToggle.addEventListener('click', () => {
  const showing = masterEl.type === 'text';
  masterEl.type = showing ? 'password' : 'text';
  eyeOpen.style.display = showing ? '' : 'none';
  eyeClosed.style.display = showing ? 'none' : '';
});

lengthEl.addEventListener('input', () => {
  lenVal.textContent = lenDisp.textContent = lengthEl.value;
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const el = chip as HTMLElement;
    const k = el.dataset.key!;
    const activeCount = Object.values(opts).filter(Boolean).length;
    if (opts[k] && activeCount === 1) return;
    opts[k] = !opts[k];
    el.classList.toggle('active', opts[k]);
  });
});

[masterEl, siteEl].forEach(el => {
  el.addEventListener('input', () => {
    btnGen.disabled = !(masterEl.value.trim() && siteEl.value.trim());
  });
});

siteEl.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !btnGen.disabled) btnGen.click();
});

function buildCharset(): string {
  let c = 'abcdefghijklmnopqrstuvwxyz';
  if (opts.upper) c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.num)   c += '0123456789';
  if (opts.sym)   c += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  return c;
}

async function derivePassword(master: string, site: string, length: number): Promise<string> {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(master), 'PBKDF2', false, ['deriveBits']
  );
  const salt = enc.encode(site.toLowerCase().trim());
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-512', salt, iterations: 100_000 },
    keyMat,
    length * 8
  );
  const bytes = new Uint8Array(bits);
  const charset = buildCharset();
  let arr = Array.from(bytes).map(b => charset[b % charset.length]);

  const guarantees: string[] = [];
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

function scorePassword(pwd: string): number {
  let s = 0;
  if (pwd.length >= 12) s++;
  if (pwd.length >= 20) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  if (pwd.length >= 32) s++;
  return Math.min(s, LEVELS.length - 1);
}

function updateStrength(pwd: string): void {
  const lv = LEVELS[scorePassword(pwd)];
  sFill.style.width = lv.w;
  sFill.style.background = lv.color;
  sName.textContent = lv.label;
  sName.style.color = lv.color;
}

function scrambleReveal(target: string, duration = 700): void {
  const len = target.length;
  const start = performance.now();
  let frame: number;

  passDisp.classList.remove('empty', 'revealed');

  function tick(now: number): void {
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

  cancelAnimationFrame(frame!);
  frame = requestAnimationFrame(tick);
}

btnGen.addEventListener('click', async () => {
  const master = masterEl.value.trim();
  const site = siteEl.value.trim();
  const length = parseInt(lengthEl.value, 10);
  if (!master || !site) return;

  btnGen.disabled = true;
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
    btnGen.disabled = false;
    btnGen.textContent = 'Generar contraseña';
  }
});

btnCopy.addEventListener('click', async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), {
      value: currentPassword,
      style: 'position:fixed;opacity:0',
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
  (el as HTMLElement).style.transitionDelay = `${i * 0.06}s`;
  revealObserver.observe(el);
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector((a as HTMLAnchorElement).getAttribute('href')!);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
