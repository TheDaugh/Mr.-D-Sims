import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, MainMenu, convertToExcalidrawElements, serializeAsJSON, restore } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import * as chem from './chem.js';
import * as stats from './stats.js';

/* One app, one bundle, several boards. The page says which one (window.MRD_BOARD). The chem keys keep their old
   names so the boards and shelves already saved in a browser still load. */
var BOARDS = {
  chem: { title: 'Chem board', key: 'mrd-chem-whiteboard-v1', libKey: 'mrd-chem-library-v1', prefix: 'chem:', lib: chem },
  stats: { title: 'Stats board', key: 'mrd-stats-whiteboard-v1', libKey: 'mrd-stats-library-v1', prefix: 'stats:', lib: stats }
};
var BOARD = BOARDS[window.MRD_BOARD] || BOARDS.chem;
var buildLibrary = BOARD.lib.buildLibrary, SHELVES = BOARD.lib.SHELVES;
var ALL = location.hash === '#all'; /* every stencil laid out in a grid, never saved; for checking and for printing a stencil sheet */

var KEY = BOARD.key;
var LIB_KEY = BOARD.libKey; /* your own shelves and the stencils you add to them */

/* The Library panel is one flat list, so the board keeps shelves itself and shows one shelf at a time.
   Built-in stencils come from stencils.js every time. Anything you add to the library lands on the shelf
   that is open, and is saved here in this browser. */
function loadLib() {
  try {
    var d = JSON.parse(localStorage.getItem(LIB_KEY) || 'null');
    if (d && d.shelves && d.items) return d;
  } catch (e) { /* fall through to a fresh shelf list */ }
  return { shelves: [], items: [], last: SHELVES[0].name };
}
function saveLib(lib) { try { localStorage.setItem(LIB_KEY, JSON.stringify(lib)); } catch (e) { /* storage full or blocked */ } }
function shelfOf(item) {
  var p = (item.name || '').split(' · ')[0], i;
  for (i = 0; i < SHELVES.length; i++) if (SHELVES[i].prefixes.indexOf(p) >= 0) return SHELVES[i].name;
  return null;
}

function loadSaved() {
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return null;
    var data = JSON.parse(raw);
    return restore(data, null, null);
  } catch (e) { return null; }
}

function App() {
  var apiRef = useRef(null);
  var timer = useRef(null);
  var saved = useRef(loadSaved());
  var lib = useRef(loadLib());
  var builtin = useRef(null);
  var shown = useRef(false); /* true once the current shelf has been pushed into the panel */
  var [shelf, setShelf] = useState(lib.current.last);
  var [shelves, setShelves] = useState(SHELVES.map(function (s) { return s.name; }).concat(lib.current.shelves));

  var show = useCallback(function (name) {
    var api = apiRef.current;
    if (!api || !builtin.current) return;
    shown.current = false;
    var items = builtin.current.filter(function (it) { return shelfOf(it) === name; })
      .concat(lib.current.items.filter(function (it) { return it.shelf === name; }).map(function (it) { return it.item; }));
    api.updateLibrary({ libraryItems: items, merge: false, openLibraryMenu: true });
    lib.current.last = name; saveLib(lib.current);
    setTimeout(function () { shown.current = true; }, 400);
  }, []);

  var onApi = useCallback(function (api) {
    apiRef.current = api;
    if (!api) return;
    if (ALL) window.MRD_API = api; /* for the stencil check (tests and screenshots) */
    builtin.current = buildLibrary(convertToExcalidrawElements);
    var start = shelves.indexOf(lib.current.last) >= 0 ? lib.current.last : SHELVES[0].name;
    setShelf(start);
    show(start);
  }, [show]);

  /* Items added to or deleted from the panel while a shelf is open belong to that shelf. */
  var onLibraryChange = useCallback(function (items) {
    if (!shown.current) return;
    var cur = lib.current, keep = cur.items.filter(function (it) { return it.shelf !== shelf; });
    var mine = items.filter(function (it) { return String(it.id).indexOf(BOARD.prefix) !== 0; })
      .map(function (it) { return { shelf: shelf, item: it }; });
    cur.items = keep.concat(mine);
    saveLib(cur);
  }, [shelf]);

  var pick = function (name) { setShelf(name); show(name); };
  var addShelf = function () {
    var n = (window.prompt('Name for the new shelf (a unit or a concept):') || '').trim();
    if (!n || shelves.indexOf(n) >= 0) return;
    lib.current.shelves.push(n); saveLib(lib.current);
    setShelves(shelves.concat([n])); pick(n);
  };
  var dropShelf = function () {
    if (lib.current.shelves.indexOf(shelf) < 0) return;
    if (!window.confirm('Delete the shelf "' + shelf + '" and the stencils you saved on it?')) return;
    lib.current.shelves = lib.current.shelves.filter(function (x) { return x !== shelf; });
    lib.current.items = lib.current.items.filter(function (it) { return it.shelf !== shelf; });
    saveLib(lib.current);
    setShelves(shelves.filter(function (x) { return x !== shelf; })); pick(SHELVES[0].name);
  };

  /* Autosave. The save waits 800 ms after the last change, so a tab closed inside that window used to lose the last
     edit; the page now saves at once when it is hidden or closed. A failed save (storage full or blocked) shows a
     bar instead of failing silently. */
  var latest = useRef(null);
  var [saveErr, setSaveErr] = useState(false);
  var persist = useCallback(function () {
    var l = latest.current;
    if (!l || ALL) return;
    clearTimeout(timer.current);
    try { localStorage.setItem(KEY, serializeAsJSON(l.elements, l.appState, l.files, 'local')); setSaveErr(false); latest.current = null; }
    catch (e) { setSaveErr(true); }
  }, []);
  var onChange = useCallback(function (elements, appState, files) {
    if (ALL) return;
    latest.current = { elements: elements, appState: appState, files: files };
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, 800);
  }, [persist]);

  useEffect(function () {
    var hide = function () { persist(); };
    var vis = function () { if (document.visibilityState === 'hidden') persist(); };
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', vis);
    return function () { clearTimeout(timer.current); window.removeEventListener('pagehide', hide); document.removeEventListener('visibilitychange', vis); };
  }, [persist]);

  var allEls = null;
  if (ALL && !allEls) {
    var items = buildLibrary(convertToExcalidrawElements), x = 0, y = 0, rowH = 0, out = [];
    items.forEach(function (it) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      it.elements.forEach(function (e) {
        var pts = e.points || [[0, 0], [e.width || 0, e.height || 0]];
        pts.forEach(function (p) { minX = Math.min(minX, e.x + p[0]); maxX = Math.max(maxX, e.x + p[0]); minY = Math.min(minY, e.y + p[1]); maxY = Math.max(maxY, e.y + p[1]); });
        if (!e.points) { minX = Math.min(minX, e.x); minY = Math.min(minY, e.y); maxX = Math.max(maxX, e.x + (e.width || 0)); maxY = Math.max(maxY, e.y + (e.height || 0)); }
      });
      var w = maxX - minX, h = maxY - minY;
      if (x > 0 && x + w > 2600) { x = 0; y += rowH + 90; rowH = 0; }
      out.push.apply(out, convertToExcalidrawElements([{ type: 'text', x: x, y: y - 28, text: it.name + '          ', fontSize: 18, fontFamily: 6, strokeColor: '#868e96' }]));
      it.elements.forEach(function (e) { out.push(Object.assign({}, e, { x: e.x - minX + x, y: e.y - minY + y })); });
      x += 0;
      x += w + 70; rowH = Math.max(rowH, h);
    });
    allEls = out;
  }
  var init = ALL ? { elements: allEls, appState: { viewBackgroundColor: '#ffffff' }, scrollToContent: true } : saved.current
    ? { elements: saved.current.elements, appState: Object.assign({}, saved.current.appState, { openSidebar: { name: 'default', tab: 'library' } }), scrollToContent: true }
    : { elements: [], appState: { openSidebar: { name: 'default', tab: 'library' }, objectsSnapModeEnabled: true, currentItemStrokeWidth: 2, currentItemRoughness: 0, currentItemFontFamily: 6, currentItemFontSize: 20 } };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Excalidraw
        excalidrawAPI={onApi}
        initialData={init}
        onChange={onChange}
        onLibraryChange={onLibraryChange}
        name={BOARD.title}
        UIOptions={{ canvasActions: { loadScene: true, saveToActiveFile: false, export: { saveFileToDisk: true }, toggleTheme: true } }}
      >
        {/* The default menu also lists GitHub, Twitter and Discord links and Excalidraw+ ads; a classroom board does not need them. */}
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
      {saveErr && <div className="saveerr" role="alert">Not saved: this browser's storage is full or blocked. Use the menu, Save to, so you keep this board.</div>}
      {!ALL && <div className="shelves" role="tablist" aria-label="Stencil shelves">
        {shelves.map(function (n) {
          return <button key={n} role="tab" aria-selected={n === shelf} className={n === shelf ? 'on' : ''} onClick={function () { pick(n); }}>{n}</button>;
        })}
        <button className="add" onClick={addShelf} title="New shelf for a unit or concept">+ Shelf</button>
        {lib.current.shelves.indexOf(shelf) >= 0 && <button className="add" onClick={dropShelf} title="Delete this shelf">Delete shelf</button>}
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
