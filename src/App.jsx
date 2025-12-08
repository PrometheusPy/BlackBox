import React, { useState, useEffect } from 'react';
import { 
  Lock, ShieldAlert, Trash2, 
  Plus, ChevronLeft, AlertTriangle,
  Cpu, Terminal, Save
} from 'lucide-react';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState([]);
  const [view, setView] = useState("login");
  const [activeNote, setActiveNote] = useState(null);
  const [shake, setShake] = useState(false);
  const [bootSequence, setBootSequence] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  
  // --- NEW PURGE STATES ---
  const [isPurging, setIsPurging] = useState(false); // Triggers animation
  const [isWiped, setIsWiped] = useState(false);     // Shows "Memory Wiped" screen

  const USER_PIN = "1984";

  useEffect(() => {
    const saved = localStorage.getItem("blackbox_vault");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!isLocked && !isWiped) {
      localStorage.setItem("blackbox_vault", JSON.stringify(notes));
    }
  }, [notes, isLocked, isWiped]);

  const handlePinInput = (num) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const activeUnlock = () => {
    if (pin === USER_PIN) {
      setBootSequence(true);
      setTimeout(() => {
        setIsLocked(false);
        setView("list");
        setBootSequence(false);
        setPin("");
      }, 1500); 
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

  const executePurge = () => {
    setShowPurgeModal(false);
    setIsPurging(true); // Start CRT Animation

    // Wait for animation to finish (600ms), then wipe data
    setTimeout(() => {
      setNotes([]);
      localStorage.removeItem("blackbox_vault");
      setIsWiped(true); // Show "Memory Wiped" text
      setIsPurging(false);
      
      // Wait a moment, then reset to lock screen
      setTimeout(() => {
        setIsWiped(false);
        setView("login");
        setIsLocked(true);
      }, 3000);
    }, 600);
  };

  // --- THE WIPED SCREEN ---
  if (isWiped) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-amber-700">
        <Terminal size={48} className="mb-6 opacity-50" />
        <div className="text-xl tracking-widest animate-pulse">SYSTEM HALTED</div>
        <div className="mt-4 text-xs text-amber-900 typing-effect">
          &gt; MEMORY_SECTORS_FORMATTED <br/>
          &gt; LOCAL_STORAGE_NULL <br/>
          &gt; SHUTTING DOWN...
        </div>
      </div>
    );
  }

  return (
    // Apply animation class to the entire app wrapper
    <div className={`min-h-screen bg-[#050505] text-[#e0e0e0] font-mono overflow-hidden relative selection:bg-amber-500/30 ${isPurging ? 'animate-crt-off' : ''}`}>
      
      {/* CRT Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-10" style={{background: 'radial-gradient(circle, transparent 60%, black 100%)'}}></div>
      <div className="fixed inset-0 pointer-events-none z-50 bg-[length:100%_2px,3px_100%] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]"></div>

      {/* Boot Sequence */}
      {bootSequence && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center space-y-4">
          <Cpu className="text-amber-500 animate-spin" size={48} />
          <div className="w-64 space-y-1">
            <div className="h-1 bg-gray-800 w-full"><div className="h-full bg-amber-500 w-[40%] animate-[width_2s_ease-out]"></div></div>
            <p className="text-xs text-amber-500 animate-pulse">DECRYPTING...</p>
          </div>
        </div>
      )}

      {/* Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm border-2 border-red-600 bg-[#110000] p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
            <div className="flex items-center gap-3 mb-4 text-red-500 border-b border-red-900/50 pb-2">
              <AlertTriangle size={28} />
              <h2 className="text-xl font-bold tracking-widest">WARNING</h2>
            </div>
            <p className="text-red-300 text-sm mb-6 leading-relaxed">
              PROTOCOL 99: You are about to <span className="font-bold text-red-500 underline">PERMANENTLY DELETE</span> all stored data.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowPurgeModal(false)} className="flex-1 py-3 border border-gray-600 text-gray-400 hover:bg-gray-800 text-xs tracking-widest">ABORT</button>
              <button onClick={executePurge} className="flex-1 py-3 bg-red-600 text-black font-bold hover:bg-red-500 text-xs tracking-widest animate-pulse">CONFIRM WIPE</button>
            </div>
          </div>
        </div>
      )}

      {/* Login Screen */}
      {isLocked && (
        <div className="h-[100dvh] flex flex-col items-center justify-center p-6 relative">
          <div className={`w-full max-w-sm bg-[#0a0a0a] border border-gray-800 p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 border-2 border-amber-600/50 rounded-full flex items-center justify-center mb-4 relative">
                <Lock size={24} className="text-amber-600" />
                <div className="absolute inset-0 border border-amber-600/20 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-2xl font-bold tracking-widest text-gray-200">BLACK<span className="text-amber-600">BOX</span></h1>
            </div>
            <div className="flex justify-center gap-4 mb-10">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-4 border border-gray-700 rotate-45 transition-all duration-200 ${pin.length > i ? 'bg-amber-600 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-transparent'}`}></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} onClick={() => handlePinInput(num.toString())} className="h-16 bg-[#111] border border-gray-800 text-xl font-bold text-gray-400 hover:bg-amber-900/20 hover:text-amber-500 active:bg-amber-600 active:text-black transition-all rounded-sm">{num}</button>
              ))}
              <div className="flex items-center justify-center pointer-events-none"><ShieldAlert size={20} className="text-red-900 opacity-50" /></div>
              <button onClick={() => handlePinInput("0")} className="h-16 bg-[#111] border border-gray-800 text-xl font-bold text-gray-400 hover:bg-amber-900/20 hover:text-amber-500 active:bg-amber-600 active:text-black transition-all rounded-sm">0</button>
              <button onClick={() => setPin(pin.slice(0, -1))} className="h-16 flex items-center justify-center bg-[#111] border border-gray-800 text-gray-500 hover:text-red-500 active:bg-red-900/20 transition-all rounded-sm"><ChevronLeft size={24} /></button>
            </div>
            <button onClick={activeUnlock} disabled={pin.length !== 4} className="w-full py-4 bg-amber-700 text-black font-bold tracking-widest text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-30">AUTHENTICATE</button>
            <div className="mt-4 text-center"><p className="text-[10px] text-gray-600">DEFAULT: 1984</p></div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      {!isLocked && (
        <div className="h-[100dvh] flex flex-col">
          <div className="h-16 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
              <span className="text-xs tracking-widest text-gray-400">VAULT://<span className="text-white">SHIVANSH</span></span>
            </div>
            <button onClick={() => setIsLocked(true)} className="p-2 hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded transition-colors"><Lock size={18} /></button>
          </div>

          {view === "list" && (
            <div className="flex-1 overflow-y-auto p-4 relative">
              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50"><Terminal size={48} className="mb-4" /><p className="tracking-widest text-sm">NO CLASSIFIED DATA</p></div>
              ) : (
                <div className="space-y-3 pb-24">
                  {notes.map((note) => (
                    <div key={note.id} onClick={() => { setActiveNote(note); setView("editor"); }} className="group relative bg-[#0f0f0f] border-l-2 border-l-gray-700 hover:border-l-amber-500 p-4 cursor-pointer transition-all hover:bg-[#151515]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-amber-700 mb-1 tracking-widest">{note.classification}</p>
                          <h3 className="text-gray-200 font-bold font-mono group-hover:text-amber-500 transition-colors">{note.title}</h3>
                          <p className="text-xs text-gray-600 mt-1 truncate max-w-[200px]">{note.content || "Empty File..."}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] text-gray-700 font-mono">{note.date}</span>
                           <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.filter(n => n.id !== note.id)); }} className="text-gray-800 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4">
                 <button onClick={() => setShowPurgeModal(true)} className="w-12 h-12 rounded-full bg-[#110000] border border-red-900 text-red-600 flex items-center justify-center hover:bg-red-900 hover:text-white transition-all shadow-lg active:scale-95" title="Purge Data"><AlertTriangle size={20} /></button>
                 <button onClick={handleCreateNote} className="w-16 h-16 bg-amber-700 text-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all clip-path-polygon" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)'}}><Plus size={32} /></button>
              </div>
            </div>
          )}

          {view === "editor" && activeNote && (
            <div className="flex-1 flex flex-col bg-[#050505] relative">
              <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0a0a0a]">
                 <button onClick={() => setView("list")} className="flex items-center gap-1 text-gray-500 hover:text-white text-xs tracking-widest uppercase"><ChevronLeft size={16} /> Return</button>
                 <span className="text-amber-600 text-xs animate-pulse">● EDITING MODE</span>
                 <button onClick={() => { setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, title: activeNote.title, content: activeNote.content } : n)); setView("list"); }} className="text-green-600 hover:text-green-400"><Save size={18} /></button>
              </div>
              <div className="p-6 flex-1 flex flex-col max-w-2xl mx-auto w-full">
                 <input value={activeNote.title} onChange={(e) => setActiveNote({...activeNote, title: e.target.value})} className="bg-transparent text-2xl font-bold text-white mb-6 focus:outline-none font-mono placeholder-gray-800" placeholder="ENTER TITLE..." />
                 <div className="flex-1 relative">
                    <textarea value={activeNote.content} onChange={(e) => setActiveNote({...activeNote, content: e.target.value})} className="w-full h-full bg-transparent text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-800" placeholder="Begin secure entry..." />
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


