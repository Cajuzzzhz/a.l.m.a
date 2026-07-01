/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// 1. Definição do Tipo para Habilidades (Corrige o erro de TypeScript)
interface Habilidade {
  nome: string;
  desc: string;
}

// --- COMPONENTE DE POEIRA ---
const EfeitoPoeira = ({ cor, lado }: { cor: string; lado: "esquerda" | "direita" }) => {
  const particulas = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: (i * 13.7) % 100,
      delay: (i * 1.5) % 5,
      duration: 4 + ((i * 2.4) % 4),
      size: 2 + ((i * 1.2) % 4),
    }));
  }, []);

  return (
    <div className={`absolute top-0 w-1/2 h-full overflow-hidden pointer-events-none z-0 ${lado === "esquerda" ? "left-0" : "right-0"}`}>
      {particulas.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: cor,
            left: `${p.left}%`,
            boxShadow: `0 0 10px ${cor}`,
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: -1000, opacity: [0, 0.7, 0], x: Math.sin(p.id) * 40 }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
};

// --- COMPONENTE DO MODAL ---
const ModalHabilidade = ({ habilidade, onClose, cor }: { habilidade: Habilidade, onClose: () => void, cor: string }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
      className="bg-black border-4 border-white p-8 max-w-lg w-full space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-3xl uppercase tracking-tighter font-pixel" style={{ color: cor }}>{habilidade.nome}</h3>
      <div className="h-1 w-full bg-white/20" />
      <p className="text-xl leading-relaxed text-white font-pixel">{habilidade.desc}</p>
      <button 
        onClick={onClose}
        className="mt-6 w-full py-2 border-2 border-white hover:bg-white hover:text-black transition-all text-xl font-pixel"
      >
        FECHAR
      </button>
    </motion.div>
  </motion.div>
);

export default function ReceptaculoScreen() {
  const [selecao, setSelecao] = useState<"nenhuma" | "humano" | "monstro">("nenhuma");
  const [fase, setFase] = useState<"digitando" | "escolha">("digitando");
  const [textoDigitado, setTextoDigitado] = useState("");
  const [habilidadeAtiva, setHabilidadeAtiva] = useState<Habilidade | null>(null);
  const router = useRouter();

  const textoCompleto = "ESCOLHA UM RECEPTACULO.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTextoDigitado(textoCompleto.slice(0, i + 1));
      i++;
      if (i >= textoCompleto.length) {
        clearInterval(interval);
        setTimeout(() => setFase("escolha"), 500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const infos = {
    humano: {
      titulo: "A GAIOLA DESTEMIDA",
      hp: "30",
      tp: "2",
      estilo: "Combate agressivo de curta distância e alta resiliência física.",
      corPrimaria: "#d97706",
      gradiente: "bg-gradient-to-r from-orange-600/30 to-transparent",
      habilidades: [
        { nome: "Coração Destemido", desc: "Você é imune a medo. Se seu HP cair abaixo de 50%, você ganha +1 dado em todas as rolagens de FORÇA." },
        { nome: "Ataque Imprudente", desc: "Pode reduzir sua Defesa para 0 no turno para ganhar +2 dados de acerto no seu ataque." },
        { nome: "Ação Direta", desc: "Em situações sociais, ao usar FOR ou VIG para resolver conflitos, ganhe +1 dado na rolagem." }
      ]
    },
    monstro: {
      titulo: "A GEADA FLAMEJANTE",
      hp: "25",
      tp: "4",
      estilo: "Combate à distância com magia de gelo e de fogo.",
      corPrimaria: "#ffffff",
      gradiente: "bg-gradient-to-l from-white/10 to-transparent",
      habilidades: [
        { nome: "Choque de fogo", desc: "Você consegue criar chamas sem custo, gaste 1 TP para atingir dois inimigos de uma vez." },
        { nome: "Choque de gelo", desc: "Você consegue criar gelo sem custo, gaste 1 TP para paralisar um inimigo por uma rodada." },
        { nome: "Aura Imponente", desc: "Ganha +2 dados em AGIR para acalmar ou intimidar inimigos." }
      ]
    }
  };

  return (
    <div className="relative h-screen w-screen bg-black text-white flex flex-col font-pixel overflow-hidden">
      
      {/* MODAL */}
      <AnimatePresence>
        {habilidadeAtiva && (
          <ModalHabilidade 
            habilidade={habilidadeAtiva} 
            cor={selecao === "humano" ? infos.humano.corPrimaria : infos.monstro.corPrimaria}
            onClose={() => setHabilidadeAtiva(null)} 
          />
        )}
      </AnimatePresence>

      {/* FUNDO E POEIRA */}
      <AnimatePresence>
        {selecao !== "nenhuma" && (
          <motion.div
            key={selecao} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 z-0 ${infos[selecao].gradiente}`}
          >
            <EfeitoPoeira cor={selecao === "humano" ? "#ff7f00" : "#ffffff"} lado={selecao === "humano" ? "esquerda" : "direita"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="h-40 flex items-center justify-center z-50">
        <h1 className="text-3xl md:text-5xl tracking-widest text-borda-cinza uppercase text-center">{textoDigitado}</h1>
      </div>

      {/* CONTAINER DAS ALMAS (Z-30) */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <AnimatePresence>
          {fase === "escolha" && (
            <div className="relative w-full flex items-center justify-center pointer-events-auto">
              
              {/* ALMA HUMANA */}
              <motion.div
                key="bravery-soul"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: selecao === "monstro" ? 0 : 1,
                  x: selecao === "nenhuma" ? -200 : (selecao === "humano" ? 0 : -600),
                  scale: selecao === "humano" ? 1.3 : 1,
                  filter: selecao === "humano" ? "drop-shadow(0 0 30px #ff7f00)" : "drop-shadow(0 0 5px #ff7f00)"
                }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className={`absolute ${selecao === "nenhuma" ? "cursor-pointer" : "pointer-events-none"}`}
                onClick={() => selecao === "nenhuma" && setSelecao("humano")}
              >
                <img src="/images/bravery.png" className="w-40 h-40 object-contain pixelated" />
              </motion.div>

              {/* ALMA MONSTRO */}
              <motion.div
                key="monster-soul"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: selecao === "humano" ? 0 : 1,
                  x: selecao === "nenhuma" ? 200 : (selecao === "monstro" ? 0 : 600),
                  scale: selecao === "monstro" ? 1.3 : 1,
                  filter: selecao === "monstro" ? "drop-shadow(0 0 30px #ffffff)" : "drop-shadow(0 0 5px #ffffff)"
                }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className={`absolute ${selecao === "nenhuma" ? "cursor-pointer" : "pointer-events-none"}`}
                onClick={() => selecao === "nenhuma" && setSelecao("monstro")}
              >
                <img src="/images/monster.png" className="w-40 h-40 object-contain scale-[1.9] pixelated" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* INTERFACE DE TEXTO (Z-40) */}
      <div className="flex-1 relative w-full flex items-center justify-center z-40 pointer-events-none px-[5%]">
        <div className="w-full flex items-center justify-between">
          
          {/* PAINEL HUMANO */}
          <div className="w-[35%] pointer-events-auto">
            <AnimatePresence>
              {selecao === "humano" && (
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                  <h2 className="text-4xl text-borda-cinza font-pixel" style={{ color: infos.humano.corPrimaria }}>{infos.humano.titulo}</h2>
                  <div className="text-2xl font-pixel" style={{ color: infos.humano.corPrimaria }}>
                    <p>HP BASE: {infos.humano.hp} / TP BASE: {infos.humano.tp}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm opacity-50 uppercase font-pixel" style={{ color: infos.humano.corPrimaria }}>Estilo de Jogo</p>
                    <p className="text-lg leading-tight font-pixel" style={{ color: infos.humano.corPrimaria }}>{infos.humano.estilo}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm opacity-50 uppercase font-pixel" style={{ color: infos.humano.corPrimaria }}>Habilidades Básicas</p>
                    <div className="flex flex-wrap gap-2">
                      {infos.humano.habilidades.map((hab) => (
                        <button 
                          key={hab.nome} onClick={() => setHabilidadeAtiva(hab)}
                          className="px-3 py-1 border border-orange-800 text-sm hover:bg-orange-800 transition-colors uppercase font-pixel"
                          style={{ color: infos.humano.corPrimaria }}
                        >
                          [ {hab.nome} ]
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-8 pt-4">
                    <button 
                      onClick={() => setSelecao("nenhuma")}
                    className="text-2xl hover:opacity-50 transition-opacity uppercase font-pixel" style={{ color: infos.humano.corPrimaria }}>Voltar</button>
                    <button onClick={() => router.push("/ficha/humano")}
                    className="text-2xl border-2 px-6 py-2 hover:bg-orange-600 hover:text-black transition-all uppercase font-pixel" style={{ color: infos.humano.corPrimaria, borderColor: infos.humano.corPrimaria }}>Confirmar</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PAINEL MONSTRO */}
          <div className="w-[35%] pointer-events-auto text-right">
            <AnimatePresence>
              {selecao === "monstro" && (
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6">
                  <h2 className="text-4xl text-borda-cinza font-pixel">{infos.monstro.titulo}</h2>
                  <div className="text-2xl font-pixel">
                    <p>HP BASE: {infos.monstro.hp} / TP BASE: {infos.monstro.tp}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm opacity-50 uppercase font-pixel">Estilo de Jogo</p>
                    <p className="text-lg leading-tight font-pixel">{infos.monstro.estilo}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm opacity-50 uppercase font-pixel">Habilidades Básicas</p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {infos.monstro.habilidades.map((hab) => (
                        <button 
                          key={hab.nome} onClick={() => setHabilidadeAtiva(hab)}
                          className="px-3 py-1 border border-white text-sm hover:bg-white hover:text-black transition-colors uppercase font-pixel"
                        >
                          [ {hab.nome} ]
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-8 pt-4 justify-end">
                    <button onClick={() => setSelecao("nenhuma")} className="text-2xl hover:opacity-50 transition-opacity uppercase font-pixel">Voltar</button>
                    <button onClick={() => router.push("/ficha/monstro")}
                    className="text-2xl border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition-all uppercase font-pixel">Confirmar</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}