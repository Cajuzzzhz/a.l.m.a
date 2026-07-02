// src/lib/playtest-data.ts

export type AtributoKey = "FOR" | "AGI" | "SAB" | "VIG" | "DET_MAG";

export interface Habilidade { nome: string; desc: string; }
export interface Ataque { nome: string; dano: string; aumento: string; acertoExtra: number; atributoAcerto: AtributoKey; }
export interface Feitico { nome: string; niveis: { normal: string, avancado: string, dominado: string, violenta: string }; alcance: string; alvo: string; duracao: string; desc: string; }
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
  estilo: string;
  atributos: Record<AtributoKey, number>;
  ataqueBase: Ataque;
  feiticos: Feitico[];
  inventario: Item[];
  habilidades: Habilidade[];
}

export const PLAYTEST_DATA: Record<string, Personagem> = {
  humano: {
    id: "humano",
    nome: "FRISK",
    titulo: "A GAIOLA DESTEMIDA",
    cor: "#d97706",
    nv: 1,
    lv: 1,
    hpMax: 30,
    tpMax: 2,
    defesaExtra: 0,
    deslocamento: "9m",
    estilo: "Combate agressivo de curta distância e alta resiliência física.",
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
    nome: "RALSEI",
    titulo: "A GEADA FLAMEJANTE",
    cor: "#ffffff",
    nv: 1,
    lv: 1,
    hpMax: 25,
    tpMax: 4,
    defesaExtra: 0,
    deslocamento: "9m",
    estilo: "Combate à distância com magia de gelo e de fogo.",
    atributos: { FOR: 1, AGI: 2, SAB: 3, VIG: 1, DET_MAG: 3 },
    ataqueBase: { nome: "DESARMADO", dano: "1d4", aumento: "ADIÇÃO", acertoExtra: 0, atributoAcerto: "FOR" },
    feiticos: [
      { 
        nome: "ICE SHOCK", niveis: { normal: "1d6", avancado: "2d6", dominado: "3d6", violenta: "5d6" },
        alcance: "CURTO", alvo: "1 SER", duracao: "INSTANTÂNEA", desc: "Você consegue criar gelo sem custo, gaste 1 TP para paralisar um inimigo por uma rodada." 
      },
      { 
        nome: "FIRE SHOCK", niveis: { normal: "1d6", avancado: "2d6", dominado: "3d6", violenta: "5d6" },
        alcance: "MÉDIO", alvo: "1 a 2 SERES", duracao: "INSTANTÂNEA", desc: "Você consegue criar chamas sem custo, gaste 1 TP para atingir dois inimigos de uma vez." 
      }
    ],
    inventario: [
      { nome: "DOCE MONSTRO", desc: "Restaura 10 de HP. Tem gosto de marshmallow não muito doce.", tipo: "CONSUMÍVEL" }
    ],
    habilidades: [
      { nome: "AURA IMPONENTE", desc: "Ganha +2 dados em AGIR para acalmar ou intimidar inimigos." }
    ]
  }
};