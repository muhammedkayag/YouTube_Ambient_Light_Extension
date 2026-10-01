const DEFAULTS = { enabled: true, glow: true, intensity: 1, size: 0.8, blur: 18, smooth: 0.3 };
chrome.storage.sync.get(DEFAULTS, (s) => {
  for (const k in DEFAULTS) {
    const el = document.getElementById(k);
    if (el.type === 'checkbox') el.checked = s[k]; else el.value = s[k];
    el.addEventListener('input', () =>
      chrome.storage.sync.set({ [k]: el.type === 'checkbox' ? el.checked : parseFloat(el.value) }));
  }
});
