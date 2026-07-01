// src/lib/playtest-data.ts

export interface Habilidade {
  nome: string;
  desc: string;
}

export interface Personagem {
  id: string;
  nome: string;
  titulo: string;
  cor: string;
  hpMax: number;
  tpMax: number;
  estilo: string;
  atributos: {
    FOR: number;
    AGI: number;
    SAB: number;
    VIG: number;
    DET_MAG: number; // Determinação para humanos, Magia para monstros
  };
  equipamento: {
    arma: {
      nome: string;
      dano: string;
      aumento: "Adição" | "Passo" | "Fixo";
      extra?: string;
    };
    armadura: string;
  };
  habilidades: Habilidade[];
}

export const PLAYTEST_DATA: Record<string, Personagem> = {
  humano: {
    id: "humano",
    nome: "Gabs",
    titulo: "A GAIOLA DESTEMIDA",
    cor: "#d97706",
    hpMax: 36,
    tpMax: 2,
    estilo: "Agressivo / Resiliente",
    atributos: { FOR: 3, AGI: 2, SAB: 1, VIG: 3, DET_MAG: 1 },
    equipamento: {
      arma: { nome: "Luvas Fortes", dano: "1d6", aumento: "Adição", extra: "+1 dado de acerto" },
      armadura: "Bandana Máscula"
    },
    habilidades: [
      { nome: "Coração Destemido", desc: "Imune a medo. HP < 50% dá +1 dado em FOR." },
      { nome: "Ataque Imprudente", desc: "Defesa vai a 0 para ganhar +2 dados de acerto." },
      { nome: "Ação Direta", desc: "Usa FOR ou VIG no lugar de SAB em interações sociais." }
    ]
  },
  monstro: {
    id: "monstro",
    nome: "Ralsei (Conselheiro)",
    titulo: "O MONSTRO CONSELHEIRO",
    cor: "#ffffff",
    hpMax: 27,
    tpMax: 5,
    estilo: "Suporte / Mágico",
    atributos: { FOR: 1, AGI: 2, SAB: 3, VIG: 1, DET_MAG: 3 },
    equipamento: {
      arma: { nome: "Chamas Mágicas", dano: "1d4", aumento: "Adição", extra: "Ataque à distância" },
      armadura: "Capa de Veludo"
    },
    habilidades: [
      { nome: "Chamas Mágicas", desc: "Ataque básico sem custo. 1 TP para atingir 2 alvos." },
      { nome: "Aura Majestosa", desc: "+1 dado em AGIR para acalmar ou convencer." },
      { nome: "Incorpóreo", desc: "+1 de Defesa passiva contra ataques físicos." }
    ]
  }
};