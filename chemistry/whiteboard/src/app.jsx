import React, { useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, convertToExcalidrawElements, serializeAsJSON, restore } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { buildLibrary } from './stencils.js';

var KEY = 'mrd-chem-whiteboard-v1';

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

  var onApi = useCallback(function (api) {
    apiRef.current = api;
    if (!api) return;
    api.updateLibrary({ libraryItems: buildLibrary(convertToExcalidrawElements), merge: false, openLibraryMenu: true });
  }, []);

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
        name="Chem board"
        UIOptions={{ canvasActions: { loadScene: true, saveToActiveFile: false, export: { saveFileToDisk: true }, toggleTheme: true } }}
      />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
