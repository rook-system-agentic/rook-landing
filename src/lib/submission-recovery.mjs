const PREFIX = 'rook:submission:v1:';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BYTES = 50000;
const stringRecord = value => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length < 50 && Object.values(value).every(item => typeof item === 'string' && item.length <= 512);

/** Somente a tentativa explicitamente enviada fica na sessão desta aba. */
export function readSubmissionRecovery(key, storage) {
  try {
    const raw = storage?.getItem(PREFIX + key);
    if (!raw || raw.length > MAX_BYTES) return null;
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !UUID.test(value.payload?.submissionId || '') || value.payload.antiBot !== undefined || !value.form || typeof value.form !== 'object') return null;
    if (!stringRecord(value.form.profile) || (key.startsWith('financial-') && !stringRecord(value.form.answers))) return null;
    return value;
  } catch { return null; }
}

export function saveSubmissionRecovery(key, value, storage) {
  try {
    const raw = JSON.stringify({ version: 1, ...value });
    if (raw.length > MAX_BYTES || value.payload?.antiBot !== undefined || !UUID.test(value.payload?.submissionId || '')) return false;
    storage.setItem(PREFIX + key, raw);
    return storage.getItem(PREFIX + key) === raw;
  } catch { return false; }
}

export function clearSubmissionRecovery(key, storage) {
  try { storage?.removeItem(PREFIX + key); } catch { /* A confirmação permanece no servidor. */ }
}

export function browserSubmissionStorage() {
  try { return window.sessionStorage; } catch { return undefined; }
}
