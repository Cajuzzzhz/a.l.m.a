"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PLAYTEST_DATA, AtributoKey, Ataque, Item } from "@/lib/playtest-data";

// Ícones
const HexIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 hover:text-gray-400 transition-colors cursor-pointer"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" /></svg>;
const SwordIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 flex-shrink-0"><path d="M14.5 9.5L9.5 14.5M14.5 9.5L19 5M14.5 9.5L16.5 11.5L12.5 15.5M9.5 14.5L5 19L2 22L5 19M9.5 14.5L7.5 12.5L11.5 8.5" /></svg>;
const PersonIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 flex-shrink-0"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 0112 0v2H6v-2z" /><path d="M8 4L6 2M16 4l2-2" /></svg>;
const FireIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 flex-shrink-0"><path d="M12 2c0 0-4 7-4 11a4 4 0 008 0c0-4-4-11-4-11z" /><path d="M12 11c-1 1-1 3 0 4s3-1 3-3-2-3-3-4z" /></svg>;
const BagIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 flex-shrink-0"><path d="M6 8v12h12V8H6zM10 8V6a2 2 0 014 0v2" /></svg>;
const BookIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 flex-shrink-0"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>;
const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;

type AbaType = "ataques" | "habilidades" | "feiticos" | "inventario" | "anotacoes";

interface Rolagem { 
  titulo: string; 
  faces: number; 
  dados: number[]; 
  total?: number; 
  sucessos?: number; 
  tipo: "sucesso" | "total";
}

export default function FichaPage() {
  const params = useParams();
  const router = useRouter();
  const tipo = params.tipo as string;
  const data = PLAYTEST_DATA[tipo];

  const [abaAtiva, setAbaAtiva] = useState<AbaType>("ataques");
  const [expandido, setExpandido] = useState<string | null>(null);
  
  // Status Dinâmicos
  const [hp, setHp] = useState(data?.hpMax || 0);
  const [tp, setTp] = useState(1);
  const [inventario, setInventario] = useState<Item[]>(data?.inventario || []);
  const [anotacao, setAnotacao] = useState("");
  const [mods, setMods] = useState<Record<AtributoKey, string>>({ FOR: "", AGI: "", SAB: "", VIG: "", DET_MAG: "" });
  const [modCustom, setModCustom] = useState("1d20");
  
  // Rolagem Atual (Substitui o histórico infinito)
  const [rolagemAtual, setRolagemAtual] = useState<Rolagem | null>(null);

  if (!data) return <div className="bg-black h-screen text-white flex items-center justify-center font-pixel text-2xl">Receptáculo não encontrado.</div>;

  const labelAtributo = tipo === "humano" ? "DETERMINAÇÃO" : "MAGIA";
  const defesaTotal = Math.floor(data.atributos.AGI / 2) + data.defesaExtra;

  // Filtra as armas equipadas para a aba Ataques
  const armasEquipadas: Ataque[] = inventario.filter(i => i.isArma && i.equipado && i.armaProps).map(i => i.armaProps!);
  const listaAtaques = [data.ataqueBase, ...armasEquipadas];

  const toggleEquip = (idx: number) => {
    const novoInv = [...inventario];
    novoInv[idx].equipado = !novoInv[idx].equipado;
    setInventario(novoInv);
  };

  // Rolagem de Atributos (Sistema de Sucessos >= 5)
const rolarAtributo = (nome: string, base: number, mod: string) => {
    const qtd = Math.max(1, base + (parseInt(mod) || 0)); 
    const dados = Array.from({ length: qtd }, () => Math.floor(Math.random() * 6) + 1);
    const sucessos = dados.filter(d => d >= 5).length;
    setRolagemAtual({ titulo: `TESTE DE ${nome}`, faces: 6, dados, sucessos, tipo: "sucesso" });
  };


  // Rolagem de Acerto da Arma (Atributo da arma + Acerto Extra)
  const rolarAcerto = (arma: Ataque) => {
    const base = data.atributos[arma.atributoAcerto];
    const total = base + arma.acertoExtra;
    rolarAtributo(`ACERTO: ${arma.nome}`, total, "0");
  };

  // Rolagem Customizada Interpretada (ex: "1d20", "4d8")
  const rolarCustom = (expressao: string, tituloContexto?: string) => {
    const match = expressao.toLowerCase().replace(/\s/g, '').match(/^(\d+)d(\d+)$/);
    if(match) {
      const qtd = parseInt(match[1]);
      const faces = parseInt(match[2]);
      const dados = Array.from({ length: qtd }, () => Math.floor(Math.random() * faces) + 1);
      const total = dados.reduce((a, b) => a + b, 0);
      setRolagemAtual({ titulo: tituloContexto || `ROLAGEM ${qtd}D${faces}`, faces, dados, total, tipo: "total" });
    } else {
      alert("Formato inválido! Tente algo como: 1d20, 3d6, 4d8");
    }
  };

   const toggleExpandir = (nome: string) => setExpandido(expandido === nome ? null : nome);

  const abasRender: { id: AbaType; icon: React.ReactNode }[] = [
    { id: "ataques", icon: <SwordIcon /> },
    { id: "habilidades", icon: <PersonIcon /> },
    { id: "feiticos", icon: <FireIcon /> },
    { id: "inventario", icon: <BagIcon /> },
    { id: "anotacoes", icon: <BookIcon /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-pixel p-4 uppercase selection:bg-yellow-500 selection:text-black">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUNA 1: RETRATO E STATUS ================= */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="border-4 border-white w-full max-w-[350px] aspect-square mx-auto flex items-center justify-center bg-black relative p-6">
            <img src={tipo === "humano" ? "/images/bravery.png" : "/images/monster.png"} className="w-full h-full object-contain pixelated" />
            <button onClick={() => router.push("/")} className="absolute top-2 left-2 text-[10px] border border-white px-2 py-1 hover:bg-white hover:text-black bg-black">SAIR</button>
          </div>

          <div className="border-4 border-white p-4 space-y-6 max-w-[350px] w-full mx-auto">
            <div className="border-b-2 border-white pb-2 flex justify-between items-end">
              <h2 className="text-xl" style={{ color: data.cor }}>{data.nome}</h2>
              <div className="flex gap-4 text-xs">
                <p>NV:{data.nv}</p>
                <p className="text-red-500">LV:{data.lv}</p>
              </div>
            </div>

            {/* CONTROLES GIGANTES DE HP E TP */}
            <div className="space-y-4">
              <div>
                <p className="text-center text-sm mb-1 opacity-80">HP</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setHp(h => Math.max(0, h - 1))} className="text-2xl px-3 bg-red-900/50 hover:bg-red-500 border border-red-500">-</button>
                  <div className="bg-gray-800 h-10 border border-white relative w-full flex items-center justify-center">
                    <div className="absolute left-0 top-0 bottom-0 bg-green-500 transition-all" style={{ width: `${(hp / data.hpMax) * 100}%` }} />
                    <span className="relative z-10 text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{hp} / {data.hpMax}</span>
                  </div>
                  <button onClick={() => setHp(h => Math.min(data.hpMax, h + 1))} className="text-2xl px-3 bg-green-900/50 hover:bg-green-500 border border-green-500">+</button>
                </div>
              </div>
              
              <div>
                <p className="text-center text-sm mb-1 opacity-80">TP</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTp(t => Math.max(0, t - 1))} className="text-2xl px-3 bg-red-900/50 hover:bg-red-500 border border-red-500">-</button>
                  <div className="bg-gray-800 h-10 border border-white relative w-full flex items-center justify-center">
                    <div className="absolute left-0 top-0 bottom-0 bg-orange-500 transition-all" style={{ width: `${(tp / data.tpMax) * 100}%` }} />
                    <span className="relative z-10 text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{tp} / {data.tpMax}</span>
                  </div>
                  <button onClick={() => setTp(t => Math.min(data.tpMax, t + 1))} className="text-2xl px-3 bg-orange-900/50 hover:bg-orange-500 border border-orange-500">+</button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-white/30">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <ShieldIcon />
                  <span className="absolute text-lg mt-1">{defesaTotal}</span>
                </div>
                <div className="text-xs leading-tight"><p>DEFESA</p><p className="opacity-50">= AGI/2 + BÔNUS</p></div>
              </div>
              <div className="text-right text-xs leading-tight"><p className="text-xl">{data.deslocamento}</p><p className="opacity-50">DESLOCAM.</p></div>
            </div>
          </div>
        </div>

        {/* ================= COLUNA 2: ATRIBUTOS E ROLAGEM ================= */}
        <div className="flex flex-col gap-6 lg:col-span-4 h-full">
          <div className="border-4 border-white p-6">
            <h2 className="text-lg mb-6 border-b-2 border-white/20 pb-2">ATRIBUTOS</h2>
            <div className="space-y-4 text-base md:text-lg">
              {(Object.keys(mods) as AtributoKey[]).map((key) => {
                const attrCor = { FOR:"#ef4444", AGI:"#60a5fa", SAB:"#818cf8", VIG:"#4ade80", DET_MAG:"#fbbf24" }[key];
                const attrNome = key === "DET_MAG" ? labelAtributo : (key === "FOR" ? "FORÇA" : key === "AGI" ? "AGILIDADE" : key === "SAB" ? "SABEDORIA" : "VIGOR");
                return (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span style={{ color: attrCor }} className="w-28 truncate">{attrNome}</span>
                    <span className="w-4 text-center">{data.atributos[key]}</span>
                    <span>+</span>
                    <input type="text" value={mods[key]} onChange={(e) => setMods({ ...mods, [key]: e.target.value })} className="w-12 bg-transparent border-b-2 border-white text-center focus:outline-none" />
                    <div onClick={() => rolarAtributo(attrNome, data.atributos[key], mods[key])}><HexIcon /></div>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 pt-6 border-t-2 border-white/50 flex items-center justify-between">
              <span className="text-xs w-3/5 leading-tight">RODAR DADO<br/>(EX: 1D20, 2D8)</span>
              <div className="flex items-center gap-2">
                <input type="text" value={modCustom} onChange={(e) => setModCustom(e.target.value)} className="w-16 bg-transparent border-b-2 border-white text-center focus:outline-none uppercase" />
                <div onClick={() => rolarCustom(modCustom)}><HexIcon /></div>
              </div>
            </div>
          </div>

          {/* CAIXA DE ROLAGEM ÚNICA (ESTILO POP-UP/FOCADA) */}
          <div className="flex-1 bg-[#2b1818] border-4 border-[#3d2626] p-6 flex flex-col justify-center min-h-[250px] relative">
            {!rolagemAtual ? (
              <p className="text-center opacity-30 text-xl">Aguardando Rolagem...</p>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <p className="text-sm text-yellow-500 tracking-widest border-b border-yellow-500/50 pb-1">{rolagemAtual.titulo}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {rolagemAtual.dados.map((d, i) => (
                    <div key={i} className={`w-14 h-14 border-2 flex items-center justify-center text-3xl font-bold bg-black/50 ${
                      rolagemAtual.tipo === "sucesso" 
                        ? (d >= 5 ? 'border-green-500 text-green-400' : 'border-red-900 text-red-500') 
                        : 'border-white text-white'
                    }`}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="bg-black/50 w-full py-2 border-y border-white/20">
                  {rolagemAtual.tipo === "sucesso" ? (
                    <p className="text-2xl">{rolagemAtual.sucessos! > 0 ? <span className="text-green-500">{rolagemAtual.sucessos} SUCESSO(S)</span> : <span className="text-red-500">FALHA</span>}</p>
                  ) : (
                    <p className="text-2xl text-blue-300">TOTAL: {rolagemAtual.total}</p>
                  )}
                </div>
                <button onClick={() => setRolagemAtual(null)} className="absolute top-2 right-3 text-[10px] opacity-50 hover:opacity-100 uppercase underline cursor-pointer">LIMPAR</button>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUNA 3: ABAS ================= */}
        <div className="flex flex-col gap-2 lg:col-span-5 h-full">
          <div className="flex gap-2 h-14">
            {abasRender.map((aba) => (
              <button key={aba.id} onClick={() => { setAbaAtiva(aba.id); setExpandido(null); }} className={`flex-1 flex items-center justify-center border-4 transition-colors ${abaAtiva === aba.id ? 'border-yellow-500 text-yellow-500' : 'border-white/30 text-white/50 hover:border-white hover:text-white'}`}>
                {aba.icon}
              </button>
            ))}
          </div>

          <div className="border-4 border-white p-6 relative flex-1 min-h-[400px] flex flex-col">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rotate-45" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rotate-45" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rotate-45" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rotate-45" />

            <h2 className="text-2xl mb-4 border-b-2 border-white/20 pb-2">{abaAtiva}</h2>

            <div className="space-y-4 flex-1">
              
              {/* ABA: ATAQUES */}
              {abaAtiva === "ataques" && listaAtaques.map((item, i) => (
                <div key={i} className="border-b-2 border-white/20 pb-4 flex justify-between items-center">
                  <div>
                    <p className="text-xl text-yellow-400">{item.nome}</p>
                    <p className="text-xs opacity-60">AUMENTO: {item.aumento}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] opacity-60 mb-1">ACERTO (+{item.acertoExtra})</span>
                      <div onClick={() => rolarAcerto(item)}><HexIcon /></div>
                    </div>
                    <div className="flex flex-col items-center text-red-400">
                      <span className="text-[10px] mb-1">DANO ({item.dano})</span>
                      <div onClick={() => rolarCustom(item.dano, `DANO: ${item.nome}`)}><HexIcon /></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* ABA: HABILIDADES */}
              {abaAtiva === "habilidades" && (
                <>
                  <div className="mb-6 bg-white/5 p-3 border-l-2 border-white">
                    <p className="text-xs opacity-50 mb-1">ESTILO DE JOGO</p>
                    <p className="text-sm leading-relaxed text-white">{data.estilo}</p>
                  </div>
                  {data.habilidades.map((item) => (
                    <div key={item.nome} className="border-b-2 border-white/30 pb-2">
                      <button onClick={() => toggleExpandir(item.nome)} className="w-full flex justify-between items-center py-2 text-left" style={{ color: data.cor }}>
                        <span className="text-lg">{item.nome}</span>
                        <span className="text-lg text-white hover:text-yellow-400">{expandido === item.nome ? "▼" : "◀"}</span>
                      </button>
                      {expandido === item.nome && <div className="pt-2 text-sm text-gray-300 bg-white/5 p-3 mt-1 border-l-2" style={{ borderColor: data.cor }}><p>{item.desc}</p></div>}
                    </div>
                  ))}
                </>
              )}

              {/* ABA: FEITIÇOS */}
              {abaAtiva === "feiticos" && data.feiticos.length === 0 && <p className="text-gray-400">Nenhum feitiço conhecido.</p>}
              {abaAtiva === "feiticos" && data.feiticos.map((item) => (
                <div key={item.nome} className="border-b-2 border-white/30 pb-4">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xl text-yellow-400">{item.nome}</p>
                    <p className="text-[10px] opacity-60">ALVO: {item.alvo}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{item.desc}</p>
                  
                  {/* Grid de Dano Sempre Visível e Clicável */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white/5 p-2 rounded">
                    {[
                      { l: "NORMAL", d: item.niveis.normal, c: "text-white" },
                      { l: "AVANÇADO", d: item.niveis.avancado, c: "text-yellow-200" },
                      { l: "DOMINADO", d: item.niveis.dominado, c: "text-orange-400" },
                      { l: "VIOLENTA", d: item.niveis.violenta, c: "text-red-500" }
                    ].map(nivel => (
                      <div key={nivel.l} className="flex flex-col items-center justify-center">
                        <span className="text-[9px] opacity-50 mb-1">{nivel.l}</span>
                        <div className={`flex items-center gap-1 ${nivel.c}`}>
                          <span>{nivel.d}</span>
                          <div onClick={() => rolarCustom(nivel.d, `FEITIÇO: ${item.nome} (${nivel.l})`)}><HexIcon /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* ABA: INVENTÁRIO (Com Checkbox Dinâmico) */}
              {abaAtiva === "inventario" && inventario.map((item, idx) => (
                <div key={item.nome} className="border-b-2 border-white/30 pb-2 flex flex-col">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      {item.tipo === "EQUIPAMENTO" && (
                        <input type="checkbox" checked={item.equipado || false} onChange={() => toggleEquip(idx)} className="w-5 h-5 accent-yellow-500 cursor-pointer" title="Equipar" />
                      )}
                      <span className="text-lg hover:text-yellow-400 cursor-pointer" onClick={() => toggleExpandir(item.nome)}>{item.nome}</span>
                    </div>
                    <span className="text-lg text-white hover:text-yellow-400 cursor-pointer" onClick={() => toggleExpandir(item.nome)}>{expandido === item.nome ? "▼" : "◀"}</span>
                  </div>
                  {expandido === item.nome && (
                    <div className="pt-1 text-sm text-gray-300 bg-white/5 p-3 mb-2 border-l-2 border-yellow-400">
                      <p className="opacity-60 text-xs mb-1">{item.tipo}</p>
                      <p>{item.desc}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* ABA: ANOTAÇÕES */}
              {abaAtiva === "anotacoes" && (
                <textarea 
                  value={anotacao} 
                  onChange={(e) => setAnotacao(e.target.value)} 
                  placeholder="Escreva seus planos, informações de NPCs ou segredos aqui..."
                  className="w-full h-full min-h-[300px] bg-transparent border-2 border-white/20 p-4 focus:outline-none focus:border-yellow-500 resize-none custom-scrollbar uppercase"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}