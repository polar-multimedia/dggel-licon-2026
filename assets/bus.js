// Capa de datos: Firebase Realtime Database o modo demo (BroadcastChannel + localStorage).
// Estructura en Firebase:
//   /registros/{id}  { nombre, grupo, ts }
//   /control         { pausa: bool, reposo: seg, reproducir: {id,nombre,grupo,ts} }
//   /estado          { enCola: n, mostrando: {nombre,grupo}, ts }   (lo escribe la pantalla)
window.BUS = (function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const DEMO = !cfg.apiKey;
  const arranque = Date.now();

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  if (DEMO) {
    const ch = new BroadcastChannel('dggel-licon');
    const KEY = 'dggel.registros';
    const KCTRL = 'dggel.control';
    const lee = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
    const guarda = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    const subs = { registro: [], control: [], estado: [] };
    ch.onmessage = (ev) => {
      const { tipo, data } = ev.data || {};
      (subs[tipo] || []).forEach(fn => fn(data));
    };
    return {
      DEMO,
      enviarRegistro({ nombre, grupo }) {
        const r = { id: uid(), nombre, grupo, ts: Date.now() };
        const lista = lee(KEY, []); lista.push(r); guarda(KEY, lista.slice(-500));
        ch.postMessage({ tipo: 'registro', data: r });
        subs.registro.forEach(fn => fn(r));
        return Promise.resolve(r.id);
      },
      onRegistro(fn) { subs.registro.push(fn); },
      onControl(fn) { subs.control.push(fn); fn(lee(KCTRL, {})); },
      setControl(parcial) {
        const c = Object.assign(lee(KCTRL, {}), parcial); guarda(KCTRL, c);
        ch.postMessage({ tipo: 'control', data: c }); subs.control.forEach(fn => fn(c));
        return Promise.resolve();
      },
      onEstado(fn) { subs.estado.push(fn); },
      setEstado(e) { ch.postMessage({ tipo: 'estado', data: e }); return Promise.resolve(); },
      recientes(fn, n = 30) { fn(lee(KEY, []).slice(-n).reverse()); },
      borrarTodo() { guarda(KEY, []); ch.postMessage({ tipo: 'control', data: Object.assign(lee(KCTRL, {}), { borrado: Date.now() }) }); return Promise.resolve(); },
    };
  }

  // ---- Firebase ----
  firebase.initializeApp(cfg);
  const db = firebase.database();
  return {
    DEMO,
    enviarRegistro({ nombre, grupo }) {
      const ref = db.ref('registros').push();
      return ref.set({ nombre, grupo, ts: firebase.database.ServerValue.TIMESTAMP }).then(() => ref.key);
    },
    onRegistro(fn) {
      // Solo registros nuevos a partir de que la pantalla se conecta
      db.ref('registros').orderByChild('ts').startAt(arranque).on('child_added', s => fn(Object.assign({ id: s.key }, s.val())));
    },
    onControl(fn) { db.ref('control').on('value', s => fn(s.val() || {})); },
    setControl(parcial) { return db.ref('control').update(parcial); },
    onEstado(fn) { db.ref('estado').on('value', s => fn(s.val() || {})); },
    setEstado(e) { return db.ref('estado').set(Object.assign({ ts: firebase.database.ServerValue.TIMESTAMP }, e)); },
    recientes(fn, n = 30) {
      db.ref('registros').orderByChild('ts').limitToLast(n).on('value', s => {
        const arr = []; s.forEach(c => { arr.push(Object.assign({ id: c.key }, c.val())); }); fn(arr.reverse());
      });
    },
    borrarTodo() { return db.ref('registros').remove().then(() => db.ref('control').update({ borrado: Date.now() })); },
  };
})();
