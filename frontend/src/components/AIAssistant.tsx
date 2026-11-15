import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  Search,
  BookOpen,
  FileCheck,
  CheckCircle2,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  HelpCircle,
  Zap,
  Bot
} from 'lucide-react';
import { FLIGHT_EXPERIENCES } from '../data/flightExperiences';
import { FlightExperience } from '../types';
import { ChatMessage, getAutonomousAssistantResponse } from '../physics/chatEngine';

export const AIAssistant: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'library'>('chat');

  // ── Chat State ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      timestamp: 'Ahora',
      category: 'general',
      citation: 'FireLock Safety Suite // NASA PSI Autonomous Engine',
      content: `### 👋 ¡Hola! Soy tu Asistente Autónomo de Seguridad en Microgravedad

Estoy entrenado sobre **datos de vuelo 100% reales de la NASA (BASS-II, FLARE, SoFIE, Saffire, FLEX-2)** y los estándares **NASA-STD-6001B / NFPA 750**.

Puedo responder de forma autónoma a cualquier pregunta que redactes en lenguaje natural:
1. **Guía paso a paso:** Cómo utilizar cada módulo de la aplicación y tomar decisiones con el Predictor ML.
2. **Consejos y protocolos:** Qué hacer ante sospecha de incendio, corte de ventilación HVAC y mitigación con micro-niebla NFPA 750.
3. **Análisis de materiales:** Por qué el límite LOI disminuye en el espacio y qué polímeros son peligrosos en atmósferas de Artemis.
4. **Fenómenos críticos:** Detección de llamas frías invisibles (LTC) y prevención de reencendidos súbitos.`,
      suggestedActions: [
        'Guíame paso a paso por los módulos',
        '¿Qué procedimiento de emergencia seguir ante fuego?',
        '¿Cómo detectar una llama fría invisible?',
        'Diferencias entre atmósfera ISS y Artemis'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeSubTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await getAutonomousAssistantResponse(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'No se pudo procesar la consulta en este momento. Por favor intenta de nuevo.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
        citation: 'FireLock Safety Suite // NASA PSI Autonomous Engine',
        content: `### Conversación Reiniciada

¿En qué puedo guiarte hoy? Puedes pedirme una guía paso a paso, procedimientos de emergencia o consultas sobre materiales espaciales.`,
        suggestedActions: [
          'Guíame paso a paso por los módulos',
          'Protocolo de respuesta ante fuego en cabina',
          '¿Cómo funciona el Predictor de Riesgo ML?'
        ]
      }
    ]);
  };

  // ── Library State ──────────────────────────────────────────────────────────
  const [selectedExperience, setSelectedExperience] = useState<FlightExperience>(FLIGHT_EXPERIENCES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Llamas Frías', 'Accidentes Históricos', 'Inflamabilidad de Materiales', 'Detección y Supresión'];

  const filteredExperiences = FLIGHT_EXPERIENCES.filter((exp) => {
    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      exp.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.mission.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-10 sm:space-y-12 animate-fade-in">

      {/* ── Top Header Banner: Spacious, Aerospace Styling ── */}
      <div className="p-7 sm:p-9 bg-slate-900/90 rounded-3xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/15 text-sky-400 text-xs font-mono font-bold tracking-wide border border-sky-500/30">
              <Bot className="w-4 h-4 text-sky-400" />
              <span>ASISTENTE IA AUTÓNOMO & PERITAJES FORENSES NASA</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50">
              100% Citas Oficiales NASA PSI
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight mt-2">
            Copiloto IA de Seguridad Térmica en Cabina
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Inferencia semántica en lenguaje natural sobre 43 investigaciones forenses de vuelo (Apollo 1, Mir 1997, Saffire), 24 misiones espaciales PSI y estándares de supresión NFPA 750.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
          <details className="text-xs font-mono text-sky-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <summary className="cursor-pointer hover:text-sky-300 font-bold select-none">
              ▶ Metodología RAG Local
            </summary>
            <p className="mt-2 text-slate-400 leading-relaxed font-sans max-w-xs">
              Tokenización TF-IDF con base vectorial en memoria. Zero-latency, 100% funcional sin conexión a internet en misiones de espacio profundo.
            </p>
          </details>
        </div>
      </div>

      {/* ── Segmented Mode Switcher (Internal Navbar): Roomy & Striking ── */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/80 border-2 border-slate-800 shadow-xl flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center justify-center space-x-3 px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-bold transition-all duration-300 cursor-pointer flex-1 ${activeSubTab === 'chat'
              ? 'bg-gradient-to-r from-sky-500/25 to-sky-600/15 text-sky-200 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20 scale-[1.01]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-2 border-transparent'
            }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeSubTab === 'chat' ? 'text-sky-400' : 'text-slate-500'}`} />
          <span>Chat de Operaciones & Consejos IA (Autónomo)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('library')}
          className={`flex items-center justify-center space-x-3 px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-bold transition-all duration-300 cursor-pointer flex-1 ${activeSubTab === 'library'
              ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-200 border-2 border-amber-400/60 shadow-lg shadow-amber-500/20 scale-[1.01]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-2 border-transparent'
            }`}
        >
          <BookOpen className={`w-5 h-5 ${activeSubTab === 'library' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Biblioteca de Casos Forenses ({FLIGHT_EXPERIENCES.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: INTERACTIVE AI CHAT                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'chat' && (
        <div className="card-aerospace p-6 sm:p-9 flex flex-col h-[860px] shadow-2xl">

          {/* Chat Toolbar: Generous margins */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800 text-xs sm:text-sm">
            <div className="flex items-center gap-3 font-mono text-slate-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MOTOR AUTÓNOMO EN LÍNEA // PROCESAMIENTO DE LENGUAJE NATURAL ACTIVO</span>
            </div>
            <button
              onClick={clearChat}
              className="text-slate-400 hover:text-rose-300 flex items-center gap-2 font-mono transition-all text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 cursor-pointer"
              title="Reiniciar conversación"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Limpiar chat</span>
            </button>
          </div>

          {/* Quick Prompt Chips: Generous space & comfortable badges */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs font-mono uppercase font-bold text-slate-400 mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Consultas Rápidas Sugeridas:</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {[
                'Guíame paso a paso por los módulos',
                '¿Qué procedimiento de emergencia seguir ante fuego?',
                '¿Cómo detectar una llama fría invisible?',
                'Prescripción de micro-niebla NFPA 750',
                'Diferencias entre atmósfera ISS y Artemis'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-sky-400 hover:text-sky-300 hover:bg-slate-800 whitespace-nowrap transition-all font-mono text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Thread: Spacious Bubbles & Large Font */}
          <div className="flex-1 overflow-y-auto space-y-7 pr-3 mb-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Sender badge & timestamp */}
                <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-400 px-1 font-semibold">
                  <span>{msg.sender === 'user' ? 'Astronauta / Operador de Misión' : 'FireLock Copilot'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.isRealTimeLLM && (
                    <span className="ml-1 px-2.5 py-0.5 rounded text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700 font-bold">
                      GEMINI LIVE
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-6 sm:p-7 text-sm sm:text-base leading-relaxed ${msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none shadow-xl shadow-sky-900/40 font-medium'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-100 rounded-bl-none shadow-2xl shadow-black/60'
                    }`}
                >
                  <div className="space-y-4 font-sans">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="text-lg sm:text-xl font-bold text-sky-300 border-b border-slate-800 pb-2 mb-3 font-mono">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      return (
                        <p key={pIdx} className="text-slate-200">
                          {paragraph.split('\n').map((line, lIdx) => {
                            if (line.startsWith('- ') || line.startsWith('* ')) {
                              return (
                                <span key={lIdx} className="block pl-4 py-1.5 border-l-2 border-sky-500/50 my-2 text-slate-300">
                                  {line.substring(2)}
                                </span>
                              );
                            }
                            if (/^\d+\.\s/.test(line)) {
                              return (
                                <span key={lIdx} className="block pl-4 py-2 border-l-2 border-emerald-500/60 my-2.5 font-medium text-slate-100 bg-emerald-950/20 rounded-r-xl">
                                  {line}
                                </span>
                              );
                            }
                            return <span key={lIdx} className="block">{line}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Citation Footer */}
                  {msg.citation && (
                    <div className="mt-5 pt-3.5 border-t border-slate-800 text-xs font-mono text-sky-400 flex items-center gap-2 font-semibold">
                      <FileCheck className="w-4 h-4 flex-shrink-0" />
                      <span>{msg.citation}</span>
                    </div>
                  )}

                  {/* Suggested Actions Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-800/80">
                      <div className="text-xs font-mono text-slate-400 mb-2.5 uppercase font-bold">
                        Consultas de profundización sugeridas:
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSendMessage(action)}
                            className="text-xs font-mono px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sky-300 hover:border-sky-400 hover:bg-sky-950/40 transition-colors flex items-center gap-2 font-semibold cursor-pointer shadow-sm"
                          >
                            <span>{action}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3 text-sm font-mono text-slate-400 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <span>Analizando datos de combustión NASA PSI y generando recomendación...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box: Spacious, Generous Targets */}
          <div className="pt-5 mt-2 border-t border-slate-800/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <input
              type="text"
              placeholder="Escribe tu consulta en lenguaje natural (ej.: ¿Por qué un cable fino arde más rápido?, ¿Cómo uso el simulador?)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-6 py-4.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans shadow-inner"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="btn-primary py-4.5 px-8 rounded-2xl flex items-center justify-center text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
              title="Enviar consulta"
            >
              <Send className="w-5 h-5 mr-2" />
              <span>Consultar</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: HISTORICAL FORENSIC EXPERIENCES LIBRARY                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'library' && (
        <div className="space-y-10">

          {/* Category Pills & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-5 top-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por caso, material (teflón, PMMA), misión (Apollo, Mir, Saffire) o fenómeno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:border-sky-400 shadow-inner"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap font-bold cursor-pointer ${selectedCategory === cat
                      ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Experience Selector + Deep Reasoning Viewer (Spacious gap-10) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left Column: List of Questions / Scenarios (5 cols) */}
            <div className="lg:col-span-5 space-y-4 max-h-[800px] overflow-y-auto pr-3">
              <div className="text-xs font-mono uppercase text-slate-400 px-1 mb-2 font-bold flex items-center justify-between">
                <span>Casos de Estudio Disponibles</span>
                <span className="text-sky-400">{filteredExperiences.length} casos</span>
              </div>

              {filteredExperiences.map((exp) => {
                const isSelected = selectedExperience && selectedExperience.id === exp.id;
                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExperience(exp)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all cursor-pointer shadow-sm ${isSelected
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-xl shadow-sky-500/10 scale-[1.01]'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${exp.category === 'Accidentes Históricos'
                            ? 'bg-red-950 text-red-300 border border-red-800/60'
                            : exp.category === 'Llamas Frías'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : exp.category === 'Detección y Supresión'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                      >
                        {exp.category}
                      </span>
                      <span className="text-slate-400 font-bold">{exp.id}</span>
                    </div>
                    <div className="text-base font-bold line-clamp-2 text-slate-100">
                      {exp.question}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-3 font-mono truncate">
                      {exp.mission}
                    </div>
                  </button>
                );
              })}

              {filteredExperiences.length === 0 && (
                <div className="p-10 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                  No se encontraron casos de estudio con los términos ingresados.
                </div>
              )}
            </div>

            {/* Right Column: Detailed Scientific Reasoning & Forensics (7 cols) */}
            <div className="lg:col-span-7">
              {selectedExperience ? (
                <div className="p-7 sm:p-9 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-7 shadow-2xl">
                  {/* Header */}
                  <div className="border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2.5 font-bold">
                      <BookOpen className="w-4 h-4" />
                      <span>REGISTRO FORENSE ESPACIAL {selectedExperience.id}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
                      {selectedExperience.question}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs sm:text-sm font-mono">
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        Misión: <strong className="text-white">{selectedExperience.mission}</strong>
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        Área: <strong className="text-white">{selectedExperience.category}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Detailed Technical Answer */}
                  <div className="space-y-4">
                    <div className="text-xs font-mono uppercase text-slate-400 font-bold">Análisis y Dictamen Técnico:</div>
                    <div className="p-6 sm:p-7 rounded-2xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed space-y-4 font-sans">
                      {selectedExperience.answer.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Verified NASA Citation Box */}
                  <div className="p-6 rounded-2xl bg-sky-950/30 border border-sky-800/50 flex items-start gap-4 shadow-sm">
                    <FileCheck className="w-6 h-6 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm font-mono">
                      <div className="text-sky-400 font-bold mb-1">FUENTE OFICIAL VERIFICADA NASA:</div>
                      <div className="text-slate-300 leading-relaxed">{selectedExperience.citation}</div>
                    </div>
                  </div>

                  {/* Key Takeaways & Recommendations - Collapsible */}
                  <details className="pt-2">
                    <summary className="text-sm font-mono uppercase text-sky-400 cursor-pointer hover:text-sky-300 select-none mb-3 font-bold">
                      ▶ Ver Recomendaciones de Diseño Derivadas
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3">
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="font-mono text-slate-400 mb-2 font-bold text-xs uppercase">PROTOCOLO DE CONTROL</div>
                        <div className="text-slate-200 leading-relaxed">
                          Eliminación de atmósferas enriquecidas (&gt; 24.1% O₂) sin mitigación por baja presión global (34 kPa).
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="font-mono text-slate-400 mb-2 font-bold text-xs uppercase">MONITOREO CRÍTICO</div>
                        <div className="text-slate-200 leading-relaxed">
                          Detección continua de monóxido de carbono (CO) e hidroperóxidos para advertencia temprana de llamas frías.
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  Seleccione un caso de estudio de la lista para ver el análisis técnico detallado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
