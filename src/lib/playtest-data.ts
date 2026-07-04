// src/lib/playtest-data.ts

export type AtributoKey = "FOR" | "AGI" | "SAB" | "VIG" | "DET_MAG";

export interface Habilidade { nome: string; desc: string; }
export interface Ataque { nome: string; dano: string; aumento: string; acertoExtra: number; atributoAcerto: AtributoKey; }
export interface Feitico { nome: string; tipo: string; niveis: { normal: string, avancado: string, dominado: string, violenta: string }; alcance: string; alvo: string; duracao: string; desc: string; }
export interface Item { nome: string; desc: string; tipo: string; equipado?: boolean; isArma?: boolean; armaProps?: Ataque; }

export interface Personagem {
  id: string;
  nome: string;
  titulo: string;
  cor: string;
  nv: number;
  lv: number;
  hpMax: number;
  tpMax: number;
  defesaExtra: number;
  deslocamento: string;
  atributos: Record<AtributoKey, number>;
  ataqueBase: Ataque;
  feiticos: Feitico[];
  inventario: Item[];
  habilidades: Habilidade[];
}

export const PLAYTEST_DATA: Record<string, Personagem> = {
  humano: {
    id: "humano",
    nome: "Alice",
    titulo: "A GAIOLA DESTEMIDA",
    cor: "#d97706",
    nv: 1,
    lv: 1,
    hpMax: 30,
    tpMax: 2,
    defesaExtra: 0,
    deslocamento: "9m",
    atributos: { FOR: 3, AGI: 2, SAB: 1, VIG: 3, DET_MAG: 1 },
    ataqueBase: { nome: "DESARMADO", dano: "1d4", aumento: "ADIÇÃO", acertoExtra: 0, atributoAcerto: "FOR" },
    feiticos: [],
    inventario: [
      { nome: "PEDAÇO DE NEVE", desc: "Restaura 2d4 de HP", tipo: "CONSUMÍVEL" },
      { 
        nome: "LUVA FORTE", desc: "Equipamento para as mãos. Usada para socar mais forte.", tipo: "EQUIPAMENTO",
        equipado: true, isArma: true, armaProps: { nome: "LUVA FORTE", dano: "1d6", aumento: "ADIÇÃO", acertoExtra: 1, atributoAcerto: "FOR" }
      }
    ],
    habilidades: [
      { nome: "CORAÇÃO DESTEMIDO", desc: "Você é imune a medo. Se seu HP cair abaixo de 50%, você ganha +1 dado em todas as rolagens de FORÇA." },
      { nome: "ATAQUE IMPRUDENTE", desc: "Pode reduzir sua Defesa para 0 no turno para ganhar +2 dados de acerto no seu ataque." },
      { nome: "AÇÃO DIRETA", desc: "Em situações sociais, ao usar FOR ou VIG para resolver conflitos, ganhe +1 dado na rolagem." }
    ]
  },
  monstro: {
    id: "monstro",
    nome: "Elise",
    titulo: "A GEADA FLAMEJANTE",
    cor: "#ffffff",
    nv: 1,
    lv: 1,
    hpMax: 25,
    tpMax: 4,
    defesaExtra: 0,
    deslocamento: "9m",
    atributos: { FOR: 1, AGI: 2, SAB: 3, VIG: 1, DET_MAG: 3 },
    ataqueBase: { nome: "DESARMADO", dano: "1d4", aumento: "ADIÇÃO", acertoExtra: 0, atributoAcerto: "FOR" },
    feiticos: [
      { 
        nome: "ICE SHOCK", tipo: "GELO", niveis: { normal: "1d8", avancado: "2d8", dominado: "3d8", violenta: "5d8" },
        alcance: "CURTO", alvo: "1 SER", duracao: "INSTANTÂNEA", 
        desc: "Gastando 1 TP, você congela o seu inimigo, causando 1d8 de dano e deixando ele lento por uma rodada. \nVocê pode gastar 2 TP adicionais para usar versões melhoradas, +2 de tp para cada versão. \nVersão Violentar requer LV 10" 
      },
      { 
        nome: "FIRE SHOCK", tipo: "FOGO", niveis: { normal: "1d10", avancado: "2d10", dominado: "3d10", violenta: "5d10" },
        alcance: "MÉDIO", alvo: "1 SER", duracao: "INSTANTÂNEA", desc: "Gastando 1 TP, você incendeia o seu inimigo, causando 1d10 de dano. \nVocê pode gastar 2 TP adicionais para usar versões melhoradas, +2 de tp para cada versão. \nVersão Violentar requer LV 10" 
      }
    ],
    inventario: [
      { nome: "DOCE MONSTRO", desc: "Restaura +10 HP. Tem gosto de marshmallow não muito doce.", tipo: "CONSUMÍVEL" }
    ],
    habilidades: [
      { nome: "AURA IMPONENTE", desc: "Ganha +2 dados em AGIR para acalmar ou intimidar inimigos." }
    ]
  }
};