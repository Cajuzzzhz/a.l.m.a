"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { PLAYTEST_DATA, AtributoKey, Ataque, Item } from "@/lib/playtest-data";

type AbaType = "ataques" | "habilidades" | "feiticos" | "inventario" | "anotacoes";

interface Rolagem { 
  titulo: string; 
  faces: number; 
  dados: number[]; 
  total?: number; 
  sucessos?: number; 
  tipo: "sucesso" | "total";
}

interface FloatingEffect {
  id: number;
  target: "hp-minus" | "hp-plus" | "tp-minus" | "tp-plus";
  value: string;
  tone: "positive" | "negative";
}

function MenuArrow({ aberto, className = "" }: { aberto: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-8 w-8 items-center justify-center border border-white/40 bg-black/20 transition-transform duration-200 ${className} ${aberto ? "rotate-180" : ""}`}
    >
      <div className="h-0 w-0 border-x-[5px] border-b-[7px] border-x-transparent border-b-white" />
    </div>
  );
}

export default function FichaPage() {
  const params = useParams();
  const router = useRouter();
  const tipo = params.tipo as string;
  const data = PLAYTEST_DATA[tipo];

  const [abaAtiva, setAbaAtiva] = useState<AbaType>("ataques");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const [hp, setHp] = useState(data?.hpMax || 0);
  const [tp, setTp] = useState(data?.tpMax || 0);
  const [inventario, setInventario] = useState<Item[]>(data?.inventario || []);
  const [anotacao, setAnotacao] = useState("");
  const [mods, setMods] = useState<Record<AtributoKey, string>>({ FOR: "", AGI: "", SAB: "", VIG: "", DET_MAG: "" });
  const [modCustom, setModCustom] = useState("1d20");
  
  const [bonusDefesa, setBonusDefesa] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [splatSaveMuted, setSplatSaveMuted] = useState(false);
  const [healHurtMuted, setHealHurtMuted] = useState(false);
  const [floatingEffects, setFloatingEffects] = useState<FloatingEffect[]>([]);
  
  const [rolagemAtual, setRolagemAtual] = useState<Rolagem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!data) return <div className="bg-black h-screen text-white flex items-center justify-center font-pixel text-2xl">Receptáculo não encontrado.</div>;

  const labelAtributo = tipo === "humano" ? "DETERMINAÇÃO" : "MAGIA";
  const defesaTotal = Math.floor(data.atributos.AGI / 2) + data.defesaExtra + (parseInt(bonusDefesa) || 0);

  const armasEquipadas: Ataque[] = inventario.filter(i => i.isArma && i.equipado && i.armaProps).map(i => i.armaProps!);
  const listaAtaques = [data.ataqueBase, ...armasEquipadas];

  const toggleEquip = (idx: number) => {
    const novoInv = [...inventario];
    novoInv[idx].equipado = !novoInv[idx].equipado;
    setInventario(novoInv);
  };

  const toggleExpandir = (nome: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(nome)) next.delete(nome);
      else next.add(nome);
      return next;
    });
  };

  const playSfx = (src: string) => {
    if (audioMuted) return;

    const isSplatSave = src.includes("splat") || src.includes("snd-save");
    const isHealHurt = src.includes("heal") || src.includes("hurt");

    if ((isSplatSave && splatSaveMuted) || (isHealHurt && healHurtMuted)) return;

    const audio = new Audio(src);
    audio.volume = 0.5;
    void audio.play().catch(() => undefined);
  };

  const triggerFloatingEffect = (target: FloatingEffect["target"], value: string, tone: FloatingEffect["tone"]) => {
    const id = Date.now() + Math.random();
    setFloatingEffects((prev) => [...prev, { id, target, value, tone }]);
    window.setTimeout(() => {
      setFloatingEffects((prev) => prev.filter((effect) => effect.id !== id));
    }, 650);
  };

  // CORREÇÃO: Lógica de áudio e efeito retirada de dentro do atualizador funcional de estado para evitar duplicações
  const alterarHp = (delta: number) => {
    const nextVal = delta > 0 ? Math.min(data.hpMax, hp + 1) : Math.max(0, hp - 1);
    if (nextVal !== hp) {
      setHp(nextVal);
      if (delta > 0) {
        playSfx("/audio/heal.mp3");
        triggerFloatingEffect("hp-plus", "+1", "positive");
      } else {
        playSfx("/audio/hurt.mp3");
        triggerFloatingEffect("hp-minus", "-1", "negative");
      }
    }
  };

  const alterarTp = (delta: number) => {
    const nextVal = delta > 0 ? Math.min(data.tpMax, tp + 1) : Math.max(0, tp - 1);
    if (nextVal !== tp) {
      setTp(nextVal);
      if (delta > 0) {
        playSfx("/audio/heal.mp3");
        triggerFloatingEffect("tp-plus", "+1", "positive");
      } else {
        playSfx("/audio/hurt.mp3");
        triggerFloatingEffect("tp-minus", "-1", "negative");
      }
    }
  };

  const trocarAba = (aba: AbaType) => {
    setAbaAtiva(aba);
    setExpandedItems(new Set());
    playSfx("/audio/select.mp3");
  };

  const rolarAtributo = (nome: string, base: number, mod: string) => {
    const qtd = Math.max(1, base + (parseInt(mod) || 0)); 
    const dados = Array.from({ length: qtd }, () => Math.floor(Math.random() * 6) + 1);
    const sucessos = dados.filter(d => d >= 5).length;
    setRolagemAtual({ titulo: `TESTE DE ${nome}`, faces: 6, dados, sucessos, tipo: "sucesso" });
    playSfx("/audio/dice.mp3");
    window.setTimeout(() => {
      playSfx(sucessos > 0 ? "/audio/snd-save.mp3" : "/audio/deltarune-splat.mp3");
    }, 350);
  };

  const rolarAcerto = (arma: Ataque) => {
    const base = data.atributos[arma.atributoAcerto];
    const total = base + arma.acertoExtra;
    rolarAtributo(`ACERTO: ${arma.nome}`, total, "0");
  };

  const rolarCustom = (expressao: string, tituloContexto?: string) => {
    const match = expressao.toLowerCase().replace(/\s/g, '').match(/^(\d+)d(\d+)$/);
    if(match) {
      const qtd = parseInt(match[1]);
      const faces = parseInt(match[2]);
      const dados = Array.from({ length: qtd }, () => Math.floor(Math.random() * faces) + 1);
      const total = dados.reduce((a, b) => a + b, 0);
      setRolagemAtual({ titulo: tituloContexto || `ROLAGEM ${qtd}D${faces}`, faces, dados, total, tipo: "total" });
      playSfx("/audio/dice.mp3");
    } else {
      alert("Formato inválido! Tente algo como: 1d20, 3d6, 4d8");
    }
  };

  const abasRender: { id: AbaType; icon: string; iconSel: string }[] = [
    { id: "ataques", icon: "/images/icons/sword.png", iconSel: "/images/icons/swordSel.png" },
    { id: "habilidades", icon: "/images/icons/magic.png", iconSel: "/images/icons/magicSel.png" },
    { id: "feiticos", icon: "/images/icons/sparkles.png", iconSel: "/images/icons/sparklesSel.png" },
    { id: "inventario", icon: "/images/icons/sack.png", iconSel: "/images/icons/sackSel.png" },
    { id: "anotacoes", icon: "/images/icons/guy.png", iconSel: "/images/icons/guySel.png" }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-pixel p-4 uppercase selection:bg-[#f4a100] selection:text-black flex items-center justify-center overflow-hidden relative">
      
      {/* INJEÇÃO DE CSS ESTÁTICO PARA OCULTAR BARRAS DE ROLAGEM */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar,
        textarea::-webkit-scrollbar {
          display: none !important;
        }
        .custom-scrollbar,
        .overflow-y-auto,
        textarea {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* BOTÃO DE MUTE PRINCIPAL (TEXTO CLÁSSICO) */}
      <button
        onClick={() => setAudioMuted((v) => !v)}
        className="absolute top-4 right-4 z-310 border-2 border-white px-4 py-2 text-sm bg-black text-white hover:bg-white hover:text-black transition-colors"
      >
        {audioMuted ? "SFX: OFF" : "SFX: ON"}
      </button>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="ficha-intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-300 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* CONTAINER PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-350 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
      >
        
        {/* ================= COLUNA 1: RETRATO E STATUS ================= */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08, duration: 0.5 }} className="flex flex-col gap-4 lg:col-span-3">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.12, duration: 0.45 }} className="border-4 border-white w-full aspect-square flex items-center justify-center bg-black relative p-6">
            <img src={tipo === "humano" ? "/images/bravery.png" : "/images/monster.png"} className="w-full h-full object-contain pixelated" />
            <button onClick={() => router.push("/")} className="absolute top-2 left-2 text-[10px] md:text-xs border border-white px-2 py-1 hover:bg-white hover:text-black bg-black">SAIR</button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.45 }} className="border-4 border-white p-4 md:p-6 space-y-5 w-full">
            <div className="border-b-2 border-white pb-2 flex justify-between items-end">
              <h2 className="text-3xl" style={{ color: data.cor }}>{data.nome}</h2>
              <div className="flex gap-4 text-base">
                <p>NV:{data.nv}</p>
                <p className="text-red-500">LV:{data.lv}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-center text-lg mb-1 opacity-80">HP</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <button type="button" onClick={() => alterarHp(-1)} className="text-3xl px-4 bg-red-900/50 hover:bg-red-500 border border-red-500">-</button>
                    <AnimatePresence>
                      {floatingEffects.filter((effect) => effect.target === "hp-minus").map((effect) => (
                        <motion.div
                          key={effect.id}
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -24, scale: 1 }}
                          exit={{ opacity: 0, y: -32, scale: 0.95 }}
                          transition={{ duration: 0.35 }}
                          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-2xl font-bold text-red-500"
                        >
                          {effect.value}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="bg-gray-800 h-12 border border-white relative w-full flex items-center justify-center overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(hp / data.hpMax) * 100}%` }} transition={{ duration: 0.35 }} className="absolute left-0 top-0 bottom-0 bg-green-500" />
                    <span className="relative z-10 text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{hp} / {data.hpMax}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <button type="button" onClick={() => alterarHp(1)} className="text-3xl px-4 bg-green-900/50 hover:bg-green-500 border border-green-500">+</button>
                    <AnimatePresence>
                      {floatingEffects.filter((effect) => effect.target === "hp-plus").map((effect) => (
                        <motion.div
                          key={effect.id}
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -24, scale: 1 }}
                          exit={{ opacity: 0, y: -32, scale: 0.95 }}
                          transition={{ duration: 0.35 }}
                          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-2xl font-bold text-green-400"
                        >
                          {effect.value}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-center text-lg mb-1 opacity-80">TP</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <button type="button" onClick={() => alterarTp(-1)} className="text-3xl px-4 bg-red-900/50 hover:bg-red-500 border border-red-500">-</button>
                    <AnimatePresence>
                      {floatingEffects.filter((effect) => effect.target === "tp-minus").map((effect) => (
                        <motion.div
                          key={effect.id}
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -24, scale: 1 }}
                          exit={{ opacity: 0, y: -32, scale: 0.95 }}
                          transition={{ duration: 0.35 }}
                          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-2xl font-bold text-red-500"
                        >
                          {effect.value}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="bg-gray-800 h-12 border border-white relative w-full flex items-center justify-center overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(tp / data.tpMax) * 100}%` }} transition={{ duration: 0.35 }} className="absolute left-0 top-0 bottom-0 bg-orange-500" />
                    <span className="relative z-10 text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{tp} / {data.tpMax}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <button type="button" onClick={() => alterarTp(1)} className="text-3xl px-4 bg-orange-900/50 hover:bg-orange-500 border border-orange-500">+</button>
                    <AnimatePresence>
                      {floatingEffects.filter((effect) => effect.target === "tp-plus").map((effect) => (
                        <motion.div
                          key={effect.id}
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -24, scale: 1 }}
                          exit={{ opacity: 0, y: -32, scale: 0.95 }}
                          transition={{ duration: 0.35 }}
                          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-2xl font-bold text-green-400"
                        >
                          {effect.value}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t-2 border-white/30">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <img src="/images/icons/shield.png" className="absolute inset-0 w-full h-full object-contain pixelated" alt="Escudo" />
                  <span className="relative z-10 text-2xl font-bold text-black mt-1">{defesaTotal}</span>
                </div>
                <div className="text-sm leading-tight">
                  <p className="text-base">DEFESA</p>
                  <div className="flex items-center gap-1 opacity-80 text-xs mt-1">
                    <span>= AGI/2 +</span>
                    <input 
                      type="text" 
                      value={bonusDefesa} 
                      onChange={(e) => setBonusDefesa(e.target.value)} 
                      placeholder="0"
                      className="w-8 h-5 bg-transparent border-b border-white text-center focus:outline-none focus:border-[#f4a100]"
                    />
                  </div>
                </div>
              </div>
              <div className="text-right leading-tight"><p className="text-2xl">{data.deslocamento}</p><p className="opacity-50 text-sm">DESLOCAMENTO</p></div>
              
              {/* BOTÃO DE MUTE HP/TP (MENOR, LADO ESQUERDO) */}
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setHealHurtMuted((v) => !v)}
                  className="border border-white/40 bg-black p-1 hover:bg-white/10 transition-all w-8 h-8 flex items-center justify-center"
                  title={healHurtMuted ? "Ativar som de vida" : "Desativar som de vida"}
                  aria-label="Alternar sons de heal e hurt"
                >
                  <img src={healHurtMuted ? "/images/icons/muted.png" : "/images/icons/sound.png"} className="w-4 h-4 object-contain pixelated" alt="Heal/Hurt" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ================= COLUNA 2: ATRIBUTOS E ROLAGEM ================= */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="flex flex-col gap-4 lg:col-span-4 h-full">
          <div className="border-4 border-white p-5 w-full bg-black">
            <h2 className="text-xl md:text-2xl mb-4 border-b-2 border-white/20 pb-2">ATRIBUTOS</h2>
            <div className="space-y-3 md:space-y-4 text-base md:text-xl">
              {(Object.keys(mods) as AtributoKey[]).map((key) => {
                const attrCor = { FOR:"#ef4444", AGI:"#60a5fa", SAB:"#818cf8", VIG:"#4ade80", DET_MAG:"#fbbf24" }[key];
                const attrNome = key === "DET_MAG" ? labelAtributo : (key === "FOR" ? "FORÇA" : key === "AGI" ? "AGILIDADE" : key === "SAB" ? "SABEDORIA" : "VIGOR");
                return (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span style={{ color: attrCor }} className="w-32 truncate">{attrNome}</span>
                    <span className="w-6 text-center text-lg md:text-xl">{data.atributos[key]}</span>
                    <span className="text-lg md:text-xl">+</span>
                    <input type="text" value={mods[key]} onChange={(e) => setMods({ ...mods, [key]: e.target.value })} className="w-14 bg-transparent border-b-2 border-white text-center text-lg md:text-xl focus:outline-none" />
                    <img onClick={() => rolarAtributo(attrNome, data.atributos[key], mods[key])} src="/images/icons/d20.png" className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform pixelated" alt="Rolar" />
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-5 border-t-2 border-white/50 flex items-center justify-between">
              <span className="text-xs md:text-sm w-3/5 leading-tight">RODAR DADO<br/>(EX: 1D20, 2D8)</span>
              <div className="flex items-center gap-2">
                <input type="text" value={modCustom} onChange={(e) => setModCustom(e.target.value)} className="w-16 text-lg bg-transparent border-b-2 border-white text-center focus:outline-none uppercase" />
                <img onClick={() => rolarCustom(modCustom)} src="/images/icons/d20.png" className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform pixelated" alt="Rolar" />
              </div>
            </div>
          </div>

          {/* CAIXA DE ROLAGEM (DICEBOX) */}
          <div className="w-full flex justify-center items-start pt-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-85 aspect-square flex items-center justify-center"
            >
              <img src="/images/dicebox.png" className="absolute inset-0 w-full h-full object-contain pixelated z-0" />
              
              <div className="relative z-10 w-[70%] h-[70%] flex flex-col items-center justify-center overflow-y-auto custom-scrollbar p-2">
                {!rolagemAtual ? (
                  <p className="text-center opacity-30 text-lg"></p>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
                    <p className="text-sm md:text-base text-[#f4a100] tracking-widest border-b border-[#f4a100]/50 pb-1">{rolagemAtual.titulo}</p>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      {rolagemAtual.dados.map((d, i) => (
                        <motion.div
                          key={`${rolagemAtual.titulo}-${i}`}
                          initial={{ opacity: 0, scale: 0.7, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.2 }}
                          className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold bg-black/80 ${
                            rolagemAtual.tipo === "sucesso" 
                              ? (d >= 5 ? 'border-green-500 text-green-400' : 'border-red-900 text-red-500') 
                              : 'border-white text-white'
                          }`}
                        >
                          {d}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="bg-black/80 w-full py-2 border-y border-white/20">
                      {rolagemAtual.tipo === "sucesso" ? (
                        <p className="text-sm">{rolagemAtual.sucessos! > 0 ? <span className="text-green-500">{rolagemAtual.sucessos} SUCESSO(S)</span> : <span className="text-red-500">FALHA</span>}</p>
                      ) : (
                        <p className="text-sm text-blue-300">TOTAL: {rolagemAtual.total}</p>
                      )}
                    </div>
                    
                    <button onClick={() => setRolagemAtual(null)} className="text-[10px] opacity-50 hover:opacity-100 uppercase underline cursor-pointer mt-1">LIMPAR</button>
                  </div>
                )}
              </div>

              {/* BOTÃO DE MUTE DICEBOX (MENOR, EM BAIXO/LADO DIREITO) */}
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setSplatSaveMuted((v) => !v)}
                  className="border border-white/40 bg-black p-1 hover:bg-white/10 transition-all w-8 h-8 flex items-center justify-center"
                  title={splatSaveMuted ? "Ativar som de resultado" : "Desativar som de resultado"}
                  aria-label="Alternar som de resultado"
                >
                  <img src={splatSaveMuted ? "/images/icons/muted.png" : "/images/icons/sound.png"} alt="Splat/Save" className="w-4 h-4 object-contain" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ================= COLUNA 3: ABAS ================= */}
        <motion.div 
          initial={{ opacity: 0, x: 24 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.16, duration: 0.5 }} 
          className="flex flex-col gap-3 lg:col-span-5 h-full lg:h-165"
        >
          <div className="flex gap-2 h-16 md:h-20 shrink-0">
            {abasRender.map((aba) => {
              const isAtiva = abaAtiva === aba.id;
              return (
                <motion.button 
                  key={aba.id} 
                  onClick={() => trocarAba(aba.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex-1 flex items-center justify-center p-2 border-4 transition-colors cursor-pointer ${
                    isAtiva 
                      ? 'border-[#f4a100] bg-black'
                      : 'border-[#443551] bg-black hover:border-[#f4a100]'
                  }`}
                >
                  <img src={isAtiva ? aba.iconSel : aba.icon} className="w-12 h-12 md:w-14 md:h-14 object-contain pixelated" alt={aba.id} />
                </motion.button>
              );
            })}
          </div>

          <div className="border-4 border-white p-6 relative flex-1 flex flex-col z-0 overflow-hidden bg-black">
            <div className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white rotate-45" />
            <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white rotate-45" />
            <div className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white rotate-45" />
            <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white rotate-45" />

            <h2 className="text-3xl mb-6 border-b-2 border-white/20 pb-3 shrink-0">{abaAtiva}</h2>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* ABA: ATAQUES */}
              {abaAtiva === "ataques" && listaAtaques.map((item, i) => (
                <div key={i} className="border-b-2 border-white/20 pb-5 flex justify-between items-center">
                  <div>
                    <p className="text-2xl text-[#f4a100] font-semibold">{item.nome}</p>
                    <p className="text-xs opacity-60">AUMENTO: {item.aumento}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-xs opacity-60 mb-2">ACERTO (+{item.acertoExtra})</span>
                      <img onClick={() => rolarAcerto(item)} src="/images/icons/d20.png" className="w-10 h-10 cursor-pointer hover:scale-110 pixelated" alt="Rolar" />
                    </div>
                    <div className="flex flex-col items-center text-red-400">
                      <span className="text-xs mb-2">DANO ({item.dano})</span>
                      <img onClick={() => rolarCustom(item.dano, `DANO: ${item.nome}`)} src="/images/icons/d20.png" className="w-10 h-10 cursor-pointer hover:scale-110 pixelated" alt="Rolar" />
                    </div>
                  </div>
                </div>
              ))}

              {/* ABA: HABILIDADES */}
              {abaAtiva === "habilidades" && (
                <>
                  {data.habilidades.map((item) => {
                    const aberto = expandedItems.has(item.nome);
                    return (
                      <motion.div
                        key={item.nome}
                        layout
                        onClick={() => toggleExpandir(item.nome)}
                        className="border-b-2 border-white/30 pb-3 cursor-pointer"
                      >
                        <div className="w-full flex justify-between items-center gap-4 py-2 text-left" style={{ color: data.cor }}>
                          <span className="text-xl font-semibold">{item.nome}</span>
                          <MenuArrow aberto={aberto} />
                        </div>
                        <AnimatePresence initial={false}>
                          {aberto && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.24, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-2 text-base text-gray-300 bg-white/5 p-4 mt-2 border-l-2" style={{ borderColor: data.cor }}>
                                <p>{item.desc}</p>
                              </div>
                            </motion.div>
                          )}
                        </ AnimatePresence>
                      </motion.div>
                    );
                  })}
                </>
              )}

              {/* ABA: FEITIÇOS */}
              {abaAtiva === "feiticos" && data.feiticos.length === 0 && <p className="text-gray-400 text-lg">Nenhum feitiço conhecido.</p>}
              {abaAtiva === "feiticos" && data.feiticos.map((item) => {
                const aberto = expandedItems.has(item.nome);
                const tipoBadgeClass = item.tipo === "GELO"
                  ? "text-sky-300 border-sky-300"
                  : item.tipo === "FOGO"
                    ? "text-amber-300 border-amber-300"
                    : "text-white border-white/30";
                return (
                  <motion.div
                    key={item.nome}
                    layout
                    onClick={() => toggleExpandir(item.nome)}
                    className="border-b-2 border-white/30 pb-5 cursor-pointer font-pixel"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <p className="text-2xl text-[#f4a100] font-semibold">{item.nome}</p>
                        <span className={`inline-flex items-center justify-center mt-2 px-3 py-1 text-xs uppercase font-bold border ${tipoBadgeClass} bg-black/10`}>
                          {item.tipo}
                        </span>
                      </div>
                      <span className="flex items-center justify-center">
                        <MenuArrow aberto={aberto} />
                      </span>
                    </div>

                    {/* ALWAYS VISIBLE: damage/level grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-sm bg-black/10 p-2 border border-white mb-2 font-pixel">
                      {[
                        { l: "NORMAL", d: item.niveis.normal, c: "text-white" },
                        { l: "AVANÇADO", d: item.niveis.avancado, c: "text-yellow-200" },
                        { l: "DOMINADO", d: item.niveis.dominado, c: "text-orange-400" },
                        { l: "VIOLENTA", d: item.niveis.violenta, c: "text-red-500" }
                      ].map(nivel => (
                        <div key={nivel.l} className="border border-white bg-black/20 p-2 flex flex-col items-center justify-center">
                          <span className="uppercase opacity-70 mb-2 text-[10px] md:text-xs">{nivel.l}</span>
                          <div className={`flex items-center justify-center gap-1 ${nivel.c}`}>
                            <span className="font-bold text-base">{nivel.d}</span>
                            <img onClick={(event) => { event.stopPropagation(); rolarCustom(nivel.d, `FEITIÇO: ${item.nome} (${nivel.l})`) }} src="/images/icons/d20.png" className="w-6 h-6 md:w-7 md:h-7 cursor-pointer hover:scale-125 pixelated" alt="Rolar" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <AnimatePresence initial={false}>
                      {aberto && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 text-xs md:text-sm font-pixel text-gray-300">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="border border-white bg-black p-3">
                                <p className="uppercase opacity-80 text-xs mb-1">alcance</p>
                                <p className="text-white font-bold">{item.alcance}</p>
                              </div>
                              <div className="border border-white bg-black p-3">
                                <p className="uppercase opacity-80 text-xs mb-1">alvo</p>
                                <p className="text-white font-bold">{item.alvo}</p>
                              </div>
                              <div className="border border-white bg-black p-3 col-span-2">
                                <p className="uppercase opacity-80 text-xs mb-1">duração</p>
                                <p className="text-white font-bold">{item.duracao}</p>
                              </div>
                            </div>
                            <div className="border border-white bg-black p-4 max-h-70 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                              <p className="text-sm leading-6 text-gray-300 whitespace-pre-line wrap-break-word">{item.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* ABA: INVENTÁRIO */}
              {abaAtiva === "inventario" && inventario.map((item, idx) => {
                const aberto = expandedItems.has(item.nome);
                return (
                  <motion.div key={item.nome} layout className="border-b-2 border-white/30 pb-3 flex flex-col">
                    <div
                      className="flex items-center justify-between py-2 cursor-pointer"
                      onClick={() => toggleExpandir(item.nome)}
                    >
                      <div className="flex items-center gap-4">
                        {item.tipo === "EQUIPAMENTO" && (
                          <input
                            type="checkbox"
                            checked={item.equipado || false}
                            onChange={(event) => {
                              event.stopPropagation();
                              toggleEquip(idx);
                            }}
                            className="w-6 h-6 accent-[#f4a100] cursor-pointer"
                            title="Equipar"
                          />
                        )}
                        <span className="text-xl hover:text-[#f4a100]">{item.nome}</span>
                      </div>
                      <button
                        type="button"
                        className="text-white hover:text-[#f4a100] cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleExpandir(item.nome);
                        }}
                        aria-label={aberto ? `Recolher ${item.nome}` : `Expandir ${item.nome}`}
                      >
                        <MenuArrow aberto={aberto} />
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {aberto && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 text-base text-gray-300 bg-white/5 p-4 mb-2 border-l-2 border-[#f4a100]">
                            <p className="opacity-60 text-sm mb-2">{item.tipo}</p>
                            <p>{item.desc}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* ABA: ANOTAÇÕES */}
              {abaAtiva === "anotacoes" && (
                <textarea 
                  value={anotacao} 
                  onChange={(e) => setAnotacao(e.target.value)} 
                  placeholder="anotações..."
                  className="w-full h-full min-h-100 bg-transparent border-2 border-white/20 p-5 focus:outline-none focus:border-[#f4a100] resize-none custom-scrollbar uppercase text-lg"
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}