import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Unlock, ShieldAlert, FileText, Trash2, 
  Plus, ChevronLeft, X, AlertTriangle, Eye, EyeOff,
  Cpu, Terminal, Save, RefreshCw
} from 'lucide-react';

// --- VISUAL ASSETS & UTILS ---

// A simple encryption simulation (XOR Cipher) for the demo. 
// In production, use window.crypto.subtle or crypto-js.
const encrypt = (text, key) => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
};

const decrypt = (encoded, key) => {
  try {
    let text = atob(encoded);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return "CORRUPTED DATA";
  }
};

export default function App() {
  // --- STATE ---
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState([]);
  const [view, setView] = useState("login"); // login, list, editor
  const [activeNote, setActiveNote] = useState(null);
  const [shake, setShake] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [bootSequence, setBootSequence] = useState(false);

  // --- HARDCODED PIN FOR DEMO (You can change this) ---
  const USER_PIN = "1984";

  // --- INITIAL LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem("blackbox_vault");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    if (!isLocked) {
      localStorage.setItem("blackbox_vault", JSON.stringify(notes));
    }
  }, [notes, isLocked]);

  // --- HANDLERS ---

  const handlePinInput = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const activeUnlock = () => {
    if (pin === USER_PIN) {
      setBootSequence(true);
      setTimeout(() => {
        setIsLocked(false);
        setView("list");
        setBootSequence(false);
        setPin("");
      }, 1500); // Fake loading time for "Decrypting" effect
    } else {
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: `LOG_ENTRY_${Math.floor(Math.random() * 9000) + 1000}`,
      content: "",
      date: new Date().toLocaleDateString(),
      classification: "TOP SECRET"
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setView("editor");
  };

  const handleSaveNote = (title, content) => {
    setNotes(prev => prev.map(n => 
      n.id === activeNote.id ? { ...n, title, content } : n
    ));
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNote?.id === id) {
      setView("list");
      setActiveNote(null);
    }
  };

  const handlePurge = () => {
    if (window.confirm("WARNING: INITITIATING DATA PURGE protocol. This cannot be undone.")) {
      setGlitch(true);
      setTimeout(() => {
        setNotes([]);
        localStorage.removeItem("blackbox_vault");
        setGlitch(false);
        setView("login");
        setIsLocked(true);
      }, 2000);
    }
  };

  // --- RENDER HELPERS ---
  
  // Scramble text effect for "Redacted" look
  const Scrambler = ({ text }) => {
    return <span className="font-mono tracking-widest">{text}</span>;
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-[#e0e0e0] font-mono overflow-hidden relative selection:bg-amber-500/30 ${glitch ? 'animate-pulse' : ''}`}>
      
      {/* --- AMBIENT CRT OVERLAY --- */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      <div className="fixed inset-0 pointer-events-none z-40 opacity-10 animate-[pulse_4s_infinite]" style={{background: 'radial-gradient(circle, transparent 60%, black 100%)'}}></div>

      {/* --- BOOT SEQUENCE OVERLAY --- */}
      {bootSequence && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center space-y-4">
          <Cpu className="text-amber-500 animate-spin" size={48} />
          <div className="w-64 space-y-1">
            <div className="h-1 bg-gray-800 w-full"><div className="h-full bg-amber-500 w-[40%] animate-[width_2s_ease-out]"></div></div>
            <p className="text-xs text-amber-500">DECRYPTING LOCAL STORAGE...</p>
            <p className="text-xs text-amber-500">BYPASSING FIREWALL...</p>
          </div>
        </div>
      )}

      {/* --- GLITCH OVERLAY --- */}
      {glitch && (
        <div className="fixed inset-0 z-[70] bg-red-900/50 flex items-center justify-center">
           <h1 className="text-6xl font-black text-black bg-red-500 px-4 animate-bounce">SYSTEM FAILURE</h1>
        </div>
      )}

      {/* --- LOGIN VIEW --- */}
      {isLocked && (
        <div className="h-[100dvh] flex flex-col items-center justify-center p-6 relative">
          
          <div className="absolute top-10 left-0 w-full flex justify-center opacity-50">
             <div className="border border-amber-900/30 bg-amber-900/10 px-4 py-1 rounded text-[10px] tracking-[0.3em] text-amber-600">
                RESTRICTED ACCESS
             </div>
          </div>

          <div className={`w-full max-w-sm bg-[#0a0a0a] border border-gray-800 p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 border-2 border-amber-600/50 rounded-full flex items-center justify-center mb-4 relative">
                <Lock size={24} className="text-amber-600" />
                <div className="absolute inset-0 border border-amber-600/20 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-2xl font-bold tracking-widest text-gray-200">BLACK<span className="text-amber-600">BOX</span></h1>
              <p className="text-[10px] text-gray-600 mt-2">ENTER CLEARANCE CODE</p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center gap-4 mb-10">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-4 border border-gray-700 rotate-45 transition-all duration-200 ${pin.length > i ? 'bg-amber-600 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-transparent'}`}></div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="h-16 bg-[#111] border border-gray-800 text-xl font-bold text-gray-400 hover:bg-amber-900/20 hover:text-amber-500 hover:border-amber-900/50 active:bg-amber-600 active:text-black transition-all rounded-sm relative group"
                >
                  {num}
                  <span className="absolute top-1 left-1 text-[8px] opacity-30 group-hover:opacity-100 text-amber-500">0x0{num}</span>
                </button>
              ))}
              <div className="flex items-center justify-center">
                 <ShieldAlert size={20} className="text-red-900 opacity-50" />
              </div>
              <button 
                  onClick={() => handlePinInput("0")}
                  className="h-16 bg-[#111] border border-gray-800 text-xl font-bold text-gray-400 hover:bg-amber-900/20 hover:text-amber-500 hover:border-amber-900/50 active:bg-amber-600 active:text-black transition-all rounded-sm relative group"
                >
                  0
              </button>
               <button 
                  onClick={() => setPin(pin.slice(0, -1))}
                  className="h-16 flex items-center justify-center bg-[#111] border border-gray-800 text-gray-500 hover:text-red-500 hover:border-red-900/50 active:bg-red-900/20 transition-all rounded-sm"
                >
                  <ChevronLeft size={24} />
              </button>
            </div>

            <button 
              onClick={activeUnlock}
              disabled={pin.length !== 4}
              className="w-full py-4 bg-amber-700 text-black font-bold tracking-widest text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              AUTHENTICATE
            </button>

            <div className="mt-6 text-center">
               <p className="text-[10px] text-gray-700 font-mono">DEFAULT CODE: 1984</p>
            </div>
          </div>
        </div>
      )}


      {/* --- MAIN VAULT INTERFACE --- */}
      {!isLocked && (
        <div className="h-[100dvh] flex flex-col">
          
          {/* Header */}
          <div className="h-16 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
              <span className="text-xs tracking-widest text-gray-400">VAULT://<span className="text-white">SHIVANSH</span></span>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => setIsLocked(true)} className="p-2 hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded transition-colors">
                  <Lock size={18} />
               </button>
            </div>
          </div>

          {/* VIEW: LIST OF FILES */}
          {view === "list" && (
            <div className="flex-1 overflow-y-auto p-4 relative">
              {/* Decorative Background Grid */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                   style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
              </div>

              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50">
                   <Terminal size={48} className="mb-4" />
                   <p className="tracking-widest text-sm">NO CLASSIFIED DATA</p>
                </div>
              ) : (
                <div className="space-y-3 pb-24">
                  {notes.map((note) => (
                    <div 
                      key={note.id}
                      onClick={() => { setActiveNote(note); setView("editor"); }}
                      className="group relative bg-[#0f0f0f] border-l-2 border-l-gray-700 hover:border-l-amber-500 p-4 cursor-pointer transition-all hover:bg-[#151515]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-amber-700 mb-1 tracking-widest">{note.classification}</p>
                          <h3 className="text-gray-200 font-bold font-mono group-hover:text-amber-500 transition-colors">{note.title}</h3>
                          <p className="text-xs text-gray-600 mt-1 truncate max-w-[200px]">{note.content || "Empty File..."}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] text-gray-700 font-mono">{note.date}</span>
                           <button 
                             onClick={(e) => handleDelete(note.id, e)}
                             className="text-gray-800 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                      
                      {/* Decorative corner brackets */}
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-800 group-hover:border-amber-900"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-800 group-hover:border-amber-900"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Floating Action Button */}
              <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4">
                 <button 
                  onClick={handlePurge}
                  className="w-10 h-10 rounded-full bg-black border border-red-900/50 text-red-900 flex items-center justify-center hover:bg-red-900 hover:text-white transition-all shadow-lg"
                  title="Purge Data"
                >
                  <AlertTriangle size={18} />
                </button>
                
                <button 
                  onClick={handleCreateNote}
                  className="w-16 h-16 bg-amber-700 text-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all clip-path-polygon"
                  style={{clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)'}}
                >
                  <Plus size={32} />
                </button>
              </div>
            </div>
          )}

          {/* VIEW: EDITOR */}
          {view === "editor" && activeNote && (
            <div className="flex-1 flex flex-col bg-[#050505] relative">
              <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0a0a0a]">
                 <button onClick={() => setView("list")} className="flex items-center gap-1 text-gray-500 hover:text-white text-xs tracking-widest uppercase">
                    <ChevronLeft size={16} /> Return
                 </button>
                 <span className="text-amber-600 text-xs animate-pulse">● EDITING MODE</span>
                 <button 
                    onClick={() => {
                       handleSaveNote(activeNote.title, activeNote.content);
                       setView("list");
                    }} 
                    className="text-green-600 hover:text-green-400"
                 >
                    <Save size={18} />
                 </button>
              </div>

              <div className="p-6 flex-1 flex flex-col max-w-2xl mx-auto w-full">
                 <input 
                    value={activeNote.title}
                    onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                    className="bg-transparent text-2xl font-bold text-white mb-6 focus:outline-none font-mono placeholder-gray-800"
                    placeholder="ENTER TITLE..."
                 />
                 
                 <div className="flex-1 relative">
                    <textarea 
                       value={activeNote.content}
                       onChange={(e) => setActiveNote({...activeNote, content: e.target.value})}
                       className="w-full h-full bg-transparent text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-800"
                       placeholder="Begin secure entry..."
                    />
                    {/* Blinking Cursor Simulation if empty (optional styling) */}
                 </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}


  
