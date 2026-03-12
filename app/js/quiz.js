import { categories, results, SPECIAL_SCORE_HERABSTUFUNG, SPECIAL_SCORE_BETROFFENHEITSRAT } from './data.js';
import { encodeState, decodeState } from './share.js';

let state = {
  step: 0,          // current category index (0–4), or 'result'
  selections: {},   // { A: optionIndex, B: optionIndex, ... }
  specialFlags: [], // ['betroffenheitsrat', 'herabstufung']
};

function getScore() {
  let total = 0;
  for (const cat of categories) {
    const idx = state.selections[cat.id];
    if (idx === undefined) continue;
    const option = cat.options[idx];
    if (option.special === 'betroffenheitsrat') {
      total += SPECIAL_SCORE_BETROFFENHEITSRAT;
    } else if (option.special === 'herabstufung') {
      total += SPECIAL_SCORE_HERABSTUFUNG;
    } else {
      total += option.score;
    }
  }
  return total;
}

function getResult(score) {
  return results.find(r => score >= r.min && score <= r.max);
}

function render() {
  const app = document.getElementById('app');
  if (state.step === 'landing') {
    renderLanding(app);
  } else if (state.step === 'result') {
    renderResult(app);
  } else {
    renderCategory(app, state.step);
  }
  updateProgress();
}

function renderLanding(app) {
  app.innerHTML = `
    <div class="card">
      <div class="category-badge">Willkommen</div>
      <h2 class="category-title">Verdächtig integriert? Anerkennungswürdig betroffen? Oder moralisch unangreifbar?</h2>
      <p style="font-size:0.95rem;line-height:1.75;color:var(--grey-700);margin-bottom:1.5rem">
        Ermitteln Sie Ihren Betroffenheitsrang – amtlich, kategorisch, endgültig.
      </p>
      <p style="font-size:0.8rem;color:var(--grey-500);margin-bottom:2rem">
        Kategorien A – E · bfB 2025
      </p>
      <div class="nav" style="justify-content:flex-end">
        <button class="btn btn--primary" id="btn-start">Jetzt starten →</button>
      </div>
    </div>
  `;
  document.getElementById('btn-start').addEventListener('click', () => {
    state.step = 0;
    render();
  });
}

function renderCategory(app, stepIndex) {
  const cat = categories[stepIndex];
  const selected = state.selections[cat.id];

  app.innerHTML = `
    <div class="card">
      <div class="category-badge">Kategorie ${cat.id}</div>
      <h2 class="category-title">${cat.title.replace(/^Kategorie [A-E]: /, '')}</h2>
      <div class="options">
        ${cat.options.map((opt, i) => `
          <button
            class="option ${selected === i ? 'selected' : ''} ${opt.special ? 'option--special option--' + opt.special : ''}"
            data-index="${i}"
            aria-pressed="${selected === i}"
          >
            ${opt.label}
          </button>
        `).join('')}
      </div>
      <div class="nav">
        <button class="btn btn--ghost" id="btn-back" ${stepIndex === 0 ? 'disabled' : ''}>← Zurück</button>
        <button class="btn btn--primary" id="btn-next" ${selected === undefined ? 'disabled' : ''}>
          ${stepIndex === categories.length - 1 ? 'Auswerten →' : 'Weiter →'}
        </button>
      </div>
    </div>
  `;

  app.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const option = cat.options[idx];

      state.selections[cat.id] = idx;

      if (option.special === 'betroffenheitsrat') {
        showBetroffenheitsratWarning(() => render());
        return;
      }
      if (option.special === 'herabstufung') {
        showHerabstufungWarning(() => render());
        return;
      }

      render();
    });
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    if (state.step > 0) { state.step--; render(); }
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (selected === undefined) return;
    if (state.step < categories.length - 1) {
      state.step++;
    } else {
      state.step = 'result';
    }
    render();
    window.history.replaceState(null, '', '#' + encodeState(state));
  });
}

function renderResult(app) {
  const score = getScore();
  const result = getResult(score);
  const hasBetroffenheitsrat = Object.entries(state.selections).some(([catId, idx]) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.options[idx]?.special === 'betroffenheitsrat';
  });
  const hasHerabstufung = Object.entries(state.selections).some(([catId, idx]) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.options[idx]?.special === 'herabstufung';
  });

  app.innerHTML = `
    <div class="card card--result" id="result-card">
      <div class="result-stamp">AMTLICH</div>
      <div class="category-badge">Ergebnis</div>
      <div class="score-display">
        <span class="score-number">${score > 0 ? '+' : ''}${score}</span>
        <span class="score-label">Betroffenheitspunkte</span>
      </div>
      <h2 class="result-title">${result.label}</h2>
      <p class="result-description">${result.description}</p>
      ${hasBetroffenheitsrat ? `<div class="alert alert--review">⚠ Akte wurde zur Prüfung an den Betroffenheitsrat weitergeleitet.</div>` : ''}
      ${hasHerabstufung ? `<div class="alert alert--herabstufung">⚠ Automatische Herabstufung erfolgt. CDU/konservativ/liberal ist nicht kompatibel mit legitimer Betroffenheit.</div>` : ''}
      <div class="result-actions">
        <button class="btn btn--primary" id="btn-share-url">🔗 Link teilen</button>
        <button class="btn btn--secondary" id="btn-share-img">📸 Als Bild speichern</button>
        <button class="btn btn--ghost" id="btn-restart">Neu starten</button>
      </div>
    </div>
  `;

  document.getElementById('btn-share-url').addEventListener('click', shareUrl);
  document.getElementById('btn-share-img').addEventListener('click', shareImage);
  document.getElementById('btn-restart').addEventListener('click', restart);

  window.history.replaceState(null, '', '#' + encodeState(state));
}

function showBetroffenheitsratWarning(callback) {
  showModal(
    '⚠ Sofortprüfung eingeleitet',
    'Ihre Berufung auf Eigenleistung hat eine automatische Überprüfung durch den Betroffenheitsrat ausgelöst. Bitte warten Sie auf Bescheid.',
    callback
  );
}

function showHerabstufungWarning(callback) {
  showModal(
    '⚠ Automatische Herabstufung',
    'Die Angabe CDU / konservativ / liberal führt zur sofortigen Herabstufung Ihrer Betroffenheitseinstufung. Dieser Vorgang ist nicht reversibel.',
    callback
  );
}

function showModal(title, body, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="alertdialog" aria-modal="true">
      <div class="modal-header">${title}</div>
      <div class="modal-body">${body}</div>
      <button class="btn btn--primary modal-close">Zur Kenntnis genommen</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close').addEventListener('click', () => {
    overlay.remove();
    onClose();
  });
}

function updateProgress() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  if (!bar) return;
  const total = categories.length;
  const done = state.step === 'result' ? total : (state.step === 'landing' ? 0 : state.step);
  bar.style.width = `${(done / total) * 100}%`;
  label.textContent = state.step === 'result'
    ? 'Auswertung vollständig'
    : state.step === 'landing'
    ? 'Kategorien A – E'
    : `Kategorie ${state.step + 1} von ${total}`;
}

function shareUrl() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Link kopiert!'));
  } else {
    prompt('Link kopieren:', url);
  }
}

async function shareImage() {
  const btn = document.getElementById('btn-share-img');
  btn.disabled = true;
  btn.textContent = 'Wird erstellt…';
  try {
    const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js');
    const card = document.getElementById('result-card');
    const canvas = await html2canvas(card, { backgroundColor: '#f4f1eb', scale: 2 });
    const link = document.createElement('a');
    link.download = 'migrahigrumat-ergebnis.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    showToast('Fehler beim Erstellen des Bildes.');
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.textContent = '📸 Als Bild speichern';
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('toast--visible'), 10);
  setTimeout(() => { toast.classList.remove('toast--visible'); setTimeout(() => toast.remove(), 300); }, 2500);
}

function restart() {
  state = { step: 'landing', selections: {}, specialFlags: [] };
  window.history.replaceState(null, '', window.location.pathname);
  render();
}

export function init() {
  const hash = window.location.hash.slice(1);
  if (hash) {
    const decoded = decodeState(hash);
    if (decoded) {
      state = decoded;
    }
  } else {
    state.step = 'landing';
  }
  render();
}
