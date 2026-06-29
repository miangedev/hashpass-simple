export const html = document.documentElement;
export const themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
export const themeIcon = document.getElementById('theme-icon') as HTMLElement;

export const opts: Record<string, boolean> = { upper: true, num: true, sym: true };

export const masterEl = document.getElementById('master') as HTMLInputElement;
export const siteEl = document.getElementById('site') as HTMLInputElement;
export const lengthEl = document.getElementById('length') as HTMLInputElement;
export const lenVal = document.getElementById('len-val') as HTMLElement;
export const lenDisp = document.getElementById('len-display') as HTMLElement;
export const btnGen = document.getElementById('btn-gen') as HTMLButtonElement;
export const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
export const passDisp = document.getElementById('pass-display') as HTMLElement;
export const sFill = document.getElementById('strength-fill') as HTMLElement;
export const sName = document.getElementById('strength-name') as HTMLElement;
export const copyText = document.getElementById('copy-text') as HTMLElement;
export const eyeToggle = document.getElementById('eye-toggle') as HTMLButtonElement;
export const eyeOpen = document.getElementById('eye-open') as HTMLElement;
export const eyeClosed = document.getElementById('eye-closed') as HTMLElement;

export const LEVELS = [
  { label: 'Muy débil',  color: '#FF4444', w: '14%'  },
  { label: 'Débil',      color: '#FF6B6B', w: '28%'  },
  { label: 'Regular',    color: '#FFB347', w: '46%'  },
  { label: 'Buena',      color: '#FFE147', w: '62%'  },
  { label: 'Fuerte',     color: '#7DDB60', w: '80%'  },
  { label: 'Muy fuerte', color: '#00D4AA', w: '100%' },
];

export const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
