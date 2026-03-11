// Encode/decode quiz state to/from a URL-safe string

export function encodeState(state) {
  const payload = {
    s: state.step === 'result' ? 'r' : state.step,
    sel: state.selections,
  };
  return btoa(JSON.stringify(payload));
}

export function decodeState(hash) {
  try {
    const payload = JSON.parse(atob(hash));
    return {
      step: payload.s === 'r' ? 'result' : payload.s,
      selections: payload.sel ?? {},
      specialFlags: [],
    };
  } catch {
    return null;
  }
}
