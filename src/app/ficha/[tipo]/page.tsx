"use client";

import { useParams, useRouter } from "next/navigation";
import { PLAYTEST_DATA } from "@/lib/playtest-data";
import { motion } from "framer-motion";

export default function FichaPage() {
  const params = useParams();
  const router = useRouter();
  const tipo = params.tipo as string;
  const data = PLAYTEST_DATA[tipo];

  if (!data) return <div className="bg-black h-screen text-white flex items-center justify-center">Personagem não encontrado.</div>;

  const labelAtributo = tipo === "humano" ? "DET" : "MAG";

  return (
    <div className="min-h-screen bg-black text-white font-pixel p-4 md:p-10 flex flex-col items-center">
      
      {/* HEADER DA FICHA */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl border-4 border-white p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div className="text-center md:text-left">
          <h1 className="text-4xl text-borda-cinza uppercase" style={{ color: data.cor }}>{data.nome}</h1>
          <p className="text-xl opacity-70">{data.titulo}</p>
        </div>
        <div className="flex gap-10 text-2xl">
          <p>HP: <span className="text-green-500">{data.hpMax}/{data.hpMax}</span></p>
          <p>TP: <span className="text-orange-400">{data.tpMax}/{data.tpMax}</span></p>
        </div>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUNA 1: ATRIBUTOS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="border-4 border-white p-4 space-y-4"
        >
          <h2 className="text-2xl border-b-2 border-white pb-2 text-center uppercase">Atributos</h2>
          <div className="text-xl space-y-3">
            <div className="flex justify-between"><span>FORÇA:</span> <span>{data.atributos.FOR}</span></div>
            <div className="flex justify-between"><span>AGILIDADE:</span> <span>{data.atributos.AGI}</span></div>
            <div className="flex justify-between"><span>SABEDORIA:</span> <span>{data.atributos.SAB}</span></div>
            <div className="flex justify-between"><span>VIGOR:</span> <span>{data.atributos.VIG}</span></div>
            <div className="flex justify-between" style={{ color: data.cor }}><span>{labelAtributo}:</span> <span>{data.atributos.DET_MAG}</span></div>
          </div>
          <div className="mt-6 pt-4 border-t-2 border-white/20 text-center">
             <p className="text-sm opacity-50 uppercase">Defesa Passiva</p>
             <p className="text-3xl">{Math.floor(data.atributos.AGI / 2)}</p>
          </div>
        </motion.div>

        {/* COLUNA 2: EQUIPAMENTO E ESTILO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="md:col-span-2 space-y-6"
        >
          {/* BLOCO ARMA */}
          <div className="border-4 border-white p-4">
            <h2 className="text-2xl border-b-2 border-white pb-2 mb-4 uppercase">Equipamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-50 uppercase">Arma Atual</p>
                <p className="text-2xl text-yellow-400">{data.equipamento.arma.nome}</p>
                <p className="text-lg">Dano: {data.equipamento.arma.dano} ({data.equipamento.arma.aumento})</p>
                {data.equipamento.arma.extra && <p className="text-sm italic text-gray-400">*{data.equipamento.arma.extra}</p>}
              </div>
              <div>
                <p className="text-sm opacity-50 uppercase">Armadura</p>
                <p className="text-2xl text-blue-400">{data.equipamento.armadura}</p>
                <p className="text-lg italic opacity-70">Equipada</p>
              </div>
            </div>
          </div>

          {/* BLOCO HABILIDADES */}
          <div className="border-4 border-white p-4">
            <h2 className="text-2xl border-b-2 border-white pb-2 mb-4 uppercase">Habilidades</h2>
            <div className="space-y-4">
              {data.habilidades.map((hab, i) => (
                <div key={i} className="border-l-4 border-white/30 pl-4">
                  <p className="text-xl uppercase" style={{ color: data.cor }}>{hab.nome}</p>
                  <p className="text-sm opacity-80">{hab.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTÃO VOLTAR */}
      <button 
        onClick={() => router.push("/")}
        className="mt-10 px-8 py-3 border-2 border-white hover:bg-white hover:text-black transition-all text-xl uppercase"
      >
        Sair da Ficha
      </button>

    </div>
  );
}