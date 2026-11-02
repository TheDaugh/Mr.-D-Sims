import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, convertToExcalidrawElements, serializeAsJSON, restore } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { buildLibrary, SHELVES } from './stencils.js';

var KEY = 'mrd-chem-whiteboard-v1';
var LIB_KEY = 'mrd-chem-library-v1'; /* your own shelves and the stencils you add to them */

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
    builtin.current = buildLibrary(convertToExcalidrawElements);
    var start = shelves.indexOf(lib.current.last) >= 0 ? lib.current.last : SHELVES[0].name;
    setShelf(start);
    show(start);
  }, [show]);

  /* Items added to or deleted from the panel while a shelf is open belong to that shelf. */
  var onLibraryChange = useCallback(function (items) {
    if (!shown.current) return;
    var cur = lib.current, keep = cur.items.filter(function (it) { return it.shelf !== shelf; });
    var mine = items.filter(function (it) { return String(it.id).indexOf('chem:') !== 0; })
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

  var onChange = useCallback(function (elements, appState, files) {
    clearTimeout(timer.current);
    timer.current = setTimeout(function () {
      try { localStorage.setItem(KEY, serializeAsJSON(elements, appState, files, 'local')); } catch (e) { /* storage full or blocked: the Save button still works */ }
    }, 800);
  }, []);

  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);

  var init = saved.current
    ? { elements: saved.current.elements, appState: Object.assign({}, saved.current.appState, { openSidebar: { name: 'default', tab: 'library' } }), scrollToContent: true }
    : { elements: [], appState: { openSidebar: { name: 'default', tab: 'library' }, objectsSnapModeEnabled: true, currentItemStrokeWidth: 2, currentItemRoughness: 0, currentItemFontFamily: 6, currentItemFontSize: 20 } };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Excalidraw
        excalidrawAPI={onApi}
        initialData={init}
        onChange={onChange}
        onLibraryChange={onLibraryChange}
        name="Chem board"
        UIOptions={{ canvasActions: { loadScene: true, saveToActiveFile: false, export: { saveFileToDisk: true }, toggleTheme: true } }}
      />
      <div className="shelves" role="tablist" aria-label="Stencil shelves">
        {shelves.map(function (n) {
          return <button key={n} role="tab" aria-selected={n === shelf} className={n === shelf ? 'on' : ''} onClick={function () { pick(n); }}>{n}</button>;
        })}
        <button className="add" onClick={addShelf} title="New shelf for a unit or concept">+ Shelf</button>
        {lib.current.shelves.indexOf(shelf) >= 0 && <button className="add" onClick={dropShelf} title="Delete this shelf">Delete shelf</button>}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
