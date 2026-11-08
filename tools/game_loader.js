// Injected into each published game's index.html by publish_game.sh (placeholders filled in there).
// Keeps the engine (index.wasm) and game pack (index.pck, or its 90 MB parts) in the browser's
// Cache Storage, so only the first launch of a build downloads them; later launches read from disk.
// Parts download in parallel and are stitched back into one index.pck for Godot.
// All games share one origin (subtoferalsloth11.github.io), so cache names carry the repo name and
// only this game's older builds are deleted. Also fixes mouse lock (see below).
(() => {
  const PARTS = __PARTS__, PREFIX = 'eq-game-__REPO__-', NAME = PREFIX + '__VERSION__';
  const net = window.fetch.bind(window);
  const download = async (file) => {
    const r = await net(file);
    if (!r.ok) throw new Error('missing game file ' + file);
    return r.blob();
  };
  const get = async (file) => {
    let cache;
    try { cache = await caches.open(NAME); const hit = await cache.match(file); if (hit) return hit.blob(); } catch { cache = null; }
    const blob = await download(file);
    if (cache) cache.put(file, new Response(blob)).catch(() => {}); // full disk: just skip caching
    return blob;
  };
  caches.keys().then((ks) => ks.forEach((k) => k.startsWith(PREFIX) && k !== NAME && caches.delete(k))).catch(() => {});
  window.fetch = (u, o) => {
    const file = typeof u === 'string' ? u.split('?')[0].split('/').pop() : '';
    if (file !== 'index.pck' && file !== 'index.wasm') return net(u, o);
    const files = file === 'index.pck' && PARTS ? Array.from({ length: PARTS }, (_, i) => 'index.pck.' + String(i).padStart(3, '0')) : [file];
    const type = file === 'index.wasm' ? 'application/wasm' : 'application/octet-stream';
    return Promise.all(files.map(get)).then((b) => {
      const all = new Blob(b, { type });
      return new Response(all, { headers: { 'Content-Length': String(all.size), 'Content-Type': type } });
    });
  };
  // Mouse lock: Godot calls requestPointerLock the moment the game captures the mouse, but browsers
  // refuse it unless it happens during a click (and for ~1 s after Esc unlocks). Remember that the
  // game wants the mouse locked and lock it on the next click in the game.
  let wantLock = false;
  const lock = HTMLCanvasElement.prototype.requestPointerLock, unlock = Document.prototype.exitPointerLock;
  HTMLCanvasElement.prototype.requestPointerLock = function (...a) {
    wantLock = true;
    try { const p = lock.apply(this, a); if (p && p.catch) p.catch(() => {}); return p; } catch { return undefined; }
  };
  Document.prototype.exitPointerLock = function (...a) { wantLock = false; return unlock.apply(this, a); };
  document.addEventListener('mousedown', (e) => {
    if (!wantLock || document.pointerLockElement || !(e.target instanceof HTMLCanvasElement)) return;
    try { const p = lock.call(e.target); if (p && p.catch) p.catch(() => {}); } catch {}
  }, true);
})();
