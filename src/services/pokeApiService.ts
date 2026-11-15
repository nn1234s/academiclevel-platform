/**
 * AcademicLevel Secret PokéAPI Client & Battle Engine
 * Base URL: https://pokeapi.co/api/v2/
 */

export interface PokemonListItem {
  name: string;
  url: string;
  id: number;
}

import { PIKACHU_VOICE_DATA_URI, EEVEE_VOICE_DATA_URI } from './pokemonVoiceAssets.ts';

export interface PokemonStat {
  name: string;
  baseStat: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  flavorText?: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number; // decimeters
  weight: number; // hectograms
  types: string[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  artworkUrl: string;
  shinyArtworkUrl: string;
  spriteUrl: string;
  animatedSpriteUrl?: string;
  cryUrl: string;
  flavorText?: string;
  genus?: string;
  generation?: string;
}

export interface PokemonMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  damageClass: 'physical' | 'special' | 'status';
  description?: string;
}

export type VoiceMode = 'anime' | 'retro';

export interface AnimeVoiceConfig {
  speechText: string;
  pitch: number;
  rate: number;
  audioClipUrl?: string;
  fallbackAudioClipUrl?: string;
}

export const ANIME_VOICE_REGISTRY: Record<string, AnimeVoiceConfig> = {
  pikachu: {
    speechText: 'Pika... chuuu!',
    pitch: 1.7,
    rate: 1.15,
    audioClipUrl: PIKACHU_VOICE_DATA_URI
  },
  "ash's pikachu": {
    speechText: 'Pika... pika... chuuu!',
    pitch: 1.75,
    rate: 1.2,
    audioClipUrl: PIKACHU_VOICE_DATA_URI
  },
  'ash-pikachu': {
    speechText: 'Pika... pika... chuuu!',
    pitch: 1.75,
    rate: 1.2,
    audioClipUrl: PIKACHU_VOICE_DATA_URI
  },
  eevee: {
    speechText: 'Ee... vee!',
    pitch: 1.6,
    rate: 1.1,
    audioClipUrl: EEVEE_VOICE_DATA_URI
  },
  charizard: {
    speechText: 'Char... izaaard!',
    pitch: 0.7,
    rate: 0.95
  },
  charmander: {
    speechText: 'Char... mander!',
    pitch: 1.45,
    rate: 1.15
  },
  charmeleon: {
    speechText: 'Char... meleon!',
    pitch: 1.1,
    rate: 1.05
  },
  bulbasaur: {
    speechText: 'Bulba... saur!',
    pitch: 1.4,
    rate: 1.1
  },
  ivysaur: {
    speechText: 'Ivy... saur!',
    pitch: 1.15,
    rate: 1.05
  },
  venusaur: {
    speechText: 'Venu... saur!',
    pitch: 0.65,
    rate: 0.85
  },
  squirtle: {
    speechText: 'Squirtle... squirtle!',
    pitch: 1.5,
    rate: 1.2
  },
  wartortle: {
    speechText: 'War... tortle!',
    pitch: 1.2,
    rate: 1.05
  },
  blastoise: {
    speechText: 'Blas... toise!',
    pitch: 0.7,
    rate: 0.85
  },
  caterpie: {
    speechText: 'Cater... pie!',
    pitch: 1.65,
    rate: 1.2
  },
  butterfree: {
    speechText: 'Freeee... butterfree!',
    pitch: 1.6,
    rate: 1.1
  },
  pidgey: {
    speechText: 'Pidgey... pidgey!',
    pitch: 1.45,
    rate: 1.2
  },
  pidgeot: {
    speechText: 'Pidge... ooot!',
    pitch: 1.15,
    rate: 1.05
  },
  raichu: {
    speechText: 'Rai... chuuu!',
    pitch: 1.25,
    rate: 1.1
  },
  vulpix: {
    speechText: 'Vul... pix!',
    pitch: 1.65,
    rate: 1.15
  },
  ninetales: {
    speechText: 'Nine... tales!',
    pitch: 1.1,
    rate: 0.95
  },
  jigglypuff: {
    speechText: 'Jiggly... puff... jiggly!',
    pitch: 1.85,
    rate: 1.05
  },
  meowth: {
    speechText: 'Meowth... that is right!',
    pitch: 1.35,
    rate: 1.15
  },
  psyduck: {
    speechText: 'Psy... ya-ya-duck!',
    pitch: 1.5,
    rate: 1.1
  },
  arcanine: {
    speechText: 'Arca... nine!',
    pitch: 0.75,
    rate: 0.95
  },
  alakazam: {
    speechText: 'Ala... kazam!',
    pitch: 0.9,
    rate: 1.0
  },
  machamp: {
    speechText: 'Ma... champ!',
    pitch: 0.7,
    rate: 1.0
  },
  gengar: {
    speechText: 'Gen... gaaar!',
    pitch: 0.85,
    rate: 0.95
  },
  onix: {
    speechText: 'O... nix!',
    pitch: 0.6,
    rate: 0.8
  },
  snorlax: {
    speechText: 'Snoooor... laaax!',
    pitch: 0.55,
    rate: 0.75
  },
  gyarados: {
    speechText: 'Gyara... dooos!',
    pitch: 0.6,
    rate: 0.85
  },
  lapras: {
    speechText: 'La... praaas!',
    pitch: 1.3,
    rate: 0.95
  },
  ditto: {
    speechText: 'Dit... to!',
    pitch: 1.55,
    rate: 1.2
  },
  dragonite: {
    speechText: 'Dragon... iite!',
    pitch: 0.9,
    rate: 1.0
  },
  mewtwo: {
    speechText: 'Mew... two!',
    pitch: 0.75,
    rate: 0.95
  },
  mew: {
    speechText: 'Meeew!',
    pitch: 1.9,
    rate: 1.25
  },
  lucario: {
    speechText: 'Lu-car-i-o!',
    pitch: 0.9,
    rate: 1.05
  },
  greninja: {
    speechText: 'Gre-nin-ja!',
    pitch: 0.95,
    rate: 1.15
  },
  rayquaza: {
    speechText: 'Ray... qua... za!',
    pitch: 0.65,
    rate: 0.85
  }
};

export function getAnimeVoiceForPokemon(name: string, detail?: Partial<PokemonDetail>): AnimeVoiceConfig {
  const cleanName = (name || 'pikachu').toLowerCase().trim();
  if (ANIME_VOICE_REGISTRY[cleanName]) {
    return ANIME_VOICE_REGISTRY[cleanName];
  }

  // Dynamic Syllabifier for any Generation Pokémon
  let spoken = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  if (cleanName.length > 5) {
    const mid = Math.floor(cleanName.length / 2);
    const match = cleanName.slice(2, -2).search(/[aeiou]/);
    const splitIdx = match !== -1 ? match + 2 + 1 : mid;
    const part1 = cleanName.slice(0, splitIdx);
    const part2 = cleanName.slice(splitIdx);
    spoken = `${part1.charAt(0).toUpperCase() + part1.slice(1)}... ${part2}!`;
  } else {
    spoken = `${spoken}... ${spoken}!`;
  }

  const weight = detail?.weight ?? 400;
  let pitch = 1.2;
  let rate = 1.1;

  if (weight > 800) {
    pitch = 0.7;
    rate = 0.9;
  } else if (weight < 150) {
    pitch = 1.55;
    rate = 1.15;
  }

  return {
    speechText: spoken,
    pitch,
    rate
  };
}

// Official Type Colors
export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  normal: { bg: 'bg-stone-500', text: 'text-stone-100', border: 'border-stone-400' },
  fire: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-500' },
  water: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  electric: { bg: 'bg-yellow-400', text: 'text-yellow-950', border: 'border-yellow-300' },
  grass: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
  ice: { bg: 'bg-cyan-400', text: 'text-cyan-950', border: 'border-cyan-300' },
  fighting: { bg: 'bg-red-700', text: 'text-white', border: 'border-red-600' },
  poison: { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-600' },
  ground: { bg: 'bg-amber-700', text: 'text-white', border: 'border-amber-600' },
  flying: { bg: 'bg-indigo-400', text: 'text-white', border: 'border-indigo-300' },
  psychic: { bg: 'bg-pink-600', text: 'text-white', border: 'border-pink-500' },
  bug: { bg: 'bg-lime-600', text: 'text-white', border: 'border-lime-500' },
  rock: { bg: 'bg-stone-600', text: 'text-white', border: 'border-stone-500' },
  ghost: { bg: 'bg-violet-800', text: 'text-white', border: 'border-violet-700' },
  dragon: { bg: 'bg-indigo-700', text: 'text-white', border: 'border-indigo-600' },
  dark: { bg: 'bg-neutral-800', text: 'text-white', border: 'border-neutral-700' },
  steel: { bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-400' },
  fairy: { bg: 'bg-pink-400', text: 'text-pink-950', border: 'border-pink-300' }
};

// Simplified Type Effectiveness Table
// Multiplier: 2 = Super Effective, 0.5 = Not Very Effective, 0 = Immune
export const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

export function getTypeMultiplier(attackType: string, defenseTypes: string[]): number {
  const chart = TYPE_CHART[attackType.toLowerCase()] || {};
  let multiplier = 1;
  for (const defType of defenseTypes) {
    const factor = chart[defType.toLowerCase()];
    if (factor !== undefined) {
      multiplier *= factor;
    }
  }
  return multiplier;
}

// Ash's Iconic Partner Pikachu (Cap Form with 10,000,000 Volt Z-Power)
export const ASH_PIKACHU_DETAIL: PokemonDetail = {
  id: 10094,
  name: "Ash's Pikachu",
  height: 4,
  weight: 60,
  types: ['electric'],
  genus: "Mouse Pokémon (Ash Ketchum's Partner)",
  flavorText: "This Pikachu wears its trainer Ash Ketchum's cap. Through the unbreakable bond forged across Kanto to the World Coronation Series, it unleashes extraordinary power.",
  generation: 'World Championship',
  artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10094.png',
  shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10094.png',
  spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10094.png',
  animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/10094.gif',
  cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg',
  abilities: [
    {
      name: "Ash's Bond / 10,000,000 Volt Power",
      isHidden: false,
      flavorText: "Special Ash-Pikachu Ability: Synchronized with Ash Ketchum. Boosts Electric attacks by 50% and unlocks the legendary 10,000,000 Volt Thunderbolt Z-Move."
    },
    {
      name: 'Static',
      isHidden: false,
      flavorText: 'Contact with the Pokémon may cause paralysis in the foe.'
    },
    {
      name: 'Lightning Rod',
      isHidden: true,
      flavorText: 'Draws in all Electric-type moves to power up its Special Attack.'
    }
  ],
  stats: [
    { name: 'hp', baseStat: 65 },
    { name: 'attack', baseStat: 95 },
    { name: 'defense', baseStat: 60 },
    { name: 'special-attack', baseStat: 110 },
    { name: 'special-defense', baseStat: 75 },
    { name: 'speed', baseStat: 125 }
  ]
};

// Curated Roster of Iconic Pokémon for instant zero-latency loading and battle
export const ICONIC_POKEMON_ROSTER: PokemonDetail[] = [
  ASH_PIKACHU_DETAIL,
  {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: ['electric'],
    genus: 'Mouse Pokémon',
    flavorText: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg',
    stats: [
      { name: 'hp', baseStat: 35 },
      { name: 'attack', baseStat: 55 },
      { name: 'defense', baseStat: 40 },
      { name: 'special-attack', baseStat: 50 },
      { name: 'special-defense', baseStat: 50 },
      { name: 'speed', baseStat: 90 }
    ],
    abilities: [
      { name: 'static', isHidden: false, flavorText: 'Contact with the Pokémon may cause paralysis.' },
      { name: 'lightning-rod', isHidden: true, flavorText: 'Draws in all Electric-type moves to up Sp. Attack.' }
    ]
  },
  {
    id: 6,
    name: 'charizard',
    height: 17,
    weight: 905,
    types: ['fire', 'flying'],
    genus: 'Flame Pokémon',
    flavorText: 'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/6.ogg',
    stats: [
      { name: 'hp', baseStat: 78 },
      { name: 'attack', baseStat: 84 },
      { name: 'defense', baseStat: 78 },
      { name: 'special-attack', baseStat: 109 },
      { name: 'special-defense', baseStat: 85 },
      { name: 'speed', baseStat: 100 }
    ],
    abilities: [
      { name: 'blaze', isHidden: false, flavorText: 'Powers up Fire-type moves when HP is low.' },
      { name: 'solar-power', isHidden: true, flavorText: 'Boosts Sp. Atk in sunny weather but lowers HP.' }
    ]
  },
  {
    id: 9,
    name: 'blastoise',
    height: 16,
    weight: 855,
    types: ['water'],
    genus: 'Shellfish Pokémon',
    flavorText: 'A brutal Pokémon with pressurized water jets on its shell. They are used for high-speed tackles.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/9.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/9.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/9.ogg',
    stats: [
      { name: 'hp', baseStat: 79 },
      { name: 'attack', baseStat: 83 },
      { name: 'defense', baseStat: 100 },
      { name: 'special-attack', baseStat: 85 },
      { name: 'special-defense', baseStat: 105 },
      { name: 'speed', baseStat: 78 }
    ],
    abilities: [
      { name: 'torrent', isHidden: false, flavorText: 'Powers up Water-type moves when HP is low.' },
      { name: 'rain-dish', isHidden: true, flavorText: 'Regains HP gradually in rain.' }
    ]
  },
  {
    id: 3,
    name: 'venusaur',
    height: 20,
    weight: 1000,
    types: ['grass', 'poison'],
    genus: 'Seed Pokémon',
    flavorText: 'The plant blooms when it absorbs solar energy. It stays on the move to seek sunlight.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/3.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/3.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/3.ogg',
    stats: [
      { name: 'hp', baseStat: 80 },
      { name: 'attack', baseStat: 82 },
      { name: 'defense', baseStat: 83 },
      { name: 'special-attack', baseStat: 100 },
      { name: 'special-defense', baseStat: 100 },
      { name: 'speed', baseStat: 80 }
    ],
    abilities: [
      { name: 'overgrow', isHidden: false, flavorText: 'Powers up Grass-type moves when HP is low.' },
      { name: 'chlorophyll', isHidden: true, flavorText: 'Boosts the Pokémon’s Speed stat in sunshine.' }
    ]
  },
  {
    id: 94,
    name: 'gengar',
    height: 15,
    weight: 405,
    types: ['ghost', 'poison'],
    genus: 'Shadow Pokémon',
    flavorText: 'Under a full moon, this Pokémon likes to mimic the shadows of people and laugh at their fright.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/94.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/94.ogg',
    stats: [
      { name: 'hp', baseStat: 60 },
      { name: 'attack', baseStat: 65 },
      { name: 'defense', baseStat: 60 },
      { name: 'special-attack', baseStat: 130 },
      { name: 'special-defense', baseStat: 75 },
      { name: 'speed', baseStat: 110 }
    ],
    abilities: [
      { name: 'cursed-body', isHidden: false, flavorText: 'May disable a move used on the Pokémon.' }
    ]
  },
  {
    id: 150,
    name: 'mewtwo',
    height: 20,
    weight: 1220,
    types: ['psychic'],
    genus: 'Genetic Pokémon',
    flavorText: 'It was created by a scientist after years of horrific gene-splicing and DNA engineering experiments.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/150.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/150.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/150.ogg',
    stats: [
      { name: 'hp', baseStat: 106 },
      { name: 'attack', baseStat: 110 },
      { name: 'defense', baseStat: 90 },
      { name: 'special-attack', baseStat: 154 },
      { name: 'special-defense', baseStat: 90 },
      { name: 'speed', baseStat: 130 }
    ],
    abilities: [
      { name: 'pressure', isHidden: false, flavorText: 'The Pokémon raises opposing Pokémon’s PP usage.' },
      { name: 'unnerve', isHidden: true, flavorText: 'Unnerves opposing Pokémon and makes them unable to eat Berries.' }
    ]
  },
  {
    id: 133,
    name: 'eevee',
    height: 3,
    weight: 65,
    types: ['normal'],
    genus: 'Evolution Pokémon',
    flavorText: 'Its genetic code is irregular. It may mutate if it is exposed to radiation from element stones.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/133.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/133.ogg',
    stats: [
      { name: 'hp', baseStat: 55 },
      { name: 'attack', baseStat: 55 },
      { name: 'defense', baseStat: 50 },
      { name: 'special-attack', baseStat: 45 },
      { name: 'special-defense', baseStat: 65 },
      { name: 'speed', baseStat: 55 }
    ],
    abilities: [
      { name: 'run-away', isHidden: false, flavorText: 'Enables a sure getaway from wild Pokémon.' },
      { name: 'adaptability', isHidden: false, flavorText: 'Powers up moves of the same type.' }
    ]
  },
  {
    id: 448,
    name: 'lucario',
    height: 12,
    weight: 540,
    types: ['fighting', 'steel'],
    genus: 'Aura Pokémon',
    flavorText: 'It has the ability to sense the auras of all things. It understands human speech.',
    generation: 'Generation IV',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/448.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/448.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/448.ogg',
    stats: [
      { name: 'hp', baseStat: 70 },
      { name: 'attack', baseStat: 110 },
      { name: 'defense', baseStat: 70 },
      { name: 'special-attack', baseStat: 115 },
      { name: 'special-defense', baseStat: 70 },
      { name: 'speed', baseStat: 90 }
    ],
    abilities: [
      { name: 'steadfast', isHidden: false, flavorText: 'Boosts the Speed stat each time the Pokémon flinches.' },
      { name: 'inner-focus', isHidden: false, flavorText: 'The Pokémon’s intensely focused mind prevents flinching.' }
    ]
  },
  {
    id: 149,
    name: 'dragonite',
    height: 22,
    weight: 2100,
    types: ['dragon', 'flying'],
    genus: 'Dragon Pokémon',
    flavorText: 'An extremely rarely seen marine Pokémon. Its intelligence is said to match that of humans.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/149.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/149.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/149.ogg',
    stats: [
      { name: 'hp', baseStat: 91 },
      { name: 'attack', baseStat: 134 },
      { name: 'defense', baseStat: 95 },
      { name: 'special-attack', baseStat: 100 },
      { name: 'special-defense', baseStat: 100 },
      { name: 'speed', baseStat: 80 }
    ],
    abilities: [
      { name: 'inner-focus', isHidden: false, flavorText: 'Prevents flinching.' },
      { name: 'multiscale', isHidden: true, flavorText: 'Reduces the amount of damage taken while HP is full.' }
    ]
  },
  {
    id: 143,
    name: 'snorlax',
    height: 21,
    weight: 4600,
    types: ['normal'],
    genus: 'Sleeping Pokémon',
    flavorText: 'Very lazy. Just eats and sleeps. As its enormous bulk builds, it becomes even more inactive.',
    generation: 'Generation I',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/143.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/143.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/143.ogg',
    stats: [
      { name: 'hp', baseStat: 160 },
      { name: 'attack', baseStat: 110 },
      { name: 'defense', baseStat: 65 },
      { name: 'special-attack', baseStat: 65 },
      { name: 'special-defense', baseStat: 110 },
      { name: 'speed', baseStat: 30 }
    ],
    abilities: [
      { name: 'immunity', isHidden: false, flavorText: 'Prevents the Pokémon from getting poisoned.' },
      { name: 'thick-fat', isHidden: false, flavorText: 'Boosts resistance to Fire- and Ice-type moves.' }
    ]
  },
  {
    id: 658,
    name: 'greninja',
    height: 15,
    weight: 400,
    types: ['water', 'dark'],
    genus: 'Ninja Pokémon',
    flavorText: 'It creates throwing stars out of compressed water. When it spins them and throws them at high speed, they can split metal.',
    generation: 'Generation VI',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/658.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/658.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/658.ogg',
    stats: [
      { name: 'hp', baseStat: 72 },
      { name: 'attack', baseStat: 95 },
      { name: 'defense', baseStat: 67 },
      { name: 'special-attack', baseStat: 103 },
      { name: 'special-defense', baseStat: 71 },
      { name: 'speed', baseStat: 122 }
    ],
    abilities: [
      { name: 'torrent', isHidden: false, flavorText: 'Powers up Water-type moves when HP is low.' },
      { name: 'protean', isHidden: true, flavorText: 'Changes the Pokémon’s type to the type of the move it’s about to use.' }
    ]
  },
  {
    id: 384,
    name: 'rayquaza',
    height: 70,
    weight: 2065,
    types: ['dragon', 'flying'],
    genus: 'Sky High Pokémon',
    flavorText: 'It flies endlessly in the ozone layer. It is said it would descend to the ground if Kyogre and Groudon were to fight.',
    generation: 'Generation III',
    artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    shinyArtworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/384.png',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png',
    animatedSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/384.gif',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/384.ogg',
    stats: [
      { name: 'hp', baseStat: 105 },
      { name: 'attack', baseStat: 150 },
      { name: 'defense', baseStat: 90 },
      { name: 'special-attack', baseStat: 150 },
      { name: 'special-defense', baseStat: 90 },
      { name: 'speed', baseStat: 95 }
    ],
    abilities: [
      { name: 'air-lock', isHidden: false, flavorText: 'Eliminates all weather effects while the Pokémon is in battle.' }
    ]
  }
];

// Curated Battle Moves for Iconic Pokémon
export const POKEMON_MOVES: Record<string, PokemonMove[]> = {
  'ash-pikachu': [
    { name: '10,000,000 Volt Thunderbolt', type: 'electric', power: 195, accuracy: 100, pp: 5, damageClass: 'special', description: "Ash and Pikachu's ultimate Z-Move with Pikachu wearing Ash's cap! Strikes with 7 rainbow bolts of 10,000,000-volt electricity." },
    { name: 'Volt Tackle', type: 'electric', power: 120, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Surrounds itself with extreme high-voltage electricity and charges with immense power.' },
    { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 85, pp: 15, damageClass: 'physical', description: 'Hardens its tail into impenetrable steel and slams the target.' },
    { name: 'Electro Ball', type: 'electric', power: 95, accuracy: 100, pp: 10, damageClass: 'special', description: 'Hurls an electric orb that inflicts devastating damage based on Pikachu’s superior speed.' }
  ],
  "ash's pikachu": [
    { name: '10,000,000 Volt Thunderbolt', type: 'electric', power: 195, accuracy: 100, pp: 5, damageClass: 'special', description: "Ash and Pikachu's ultimate Z-Move with Pikachu wearing Ash's cap! Strikes with 7 rainbow bolts of 10,000,000-volt electricity." },
    { name: 'Volt Tackle', type: 'electric', power: 120, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Surrounds itself with extreme high-voltage electricity and charges with immense power.' },
    { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 85, pp: 15, damageClass: 'physical', description: 'Hardens its tail into impenetrable steel and slams the target.' },
    { name: 'Electro Ball', type: 'electric', power: 95, accuracy: 100, pp: 10, damageClass: 'special', description: 'Hurls an electric orb that inflicts devastating damage based on Pikachu’s superior speed.' }
  ],
  'pikachu-original-cap': [
    { name: '10,000,000 Volt Thunderbolt', type: 'electric', power: 195, accuracy: 100, pp: 5, damageClass: 'special', description: "Ash and Pikachu's ultimate Z-Move with Pikachu wearing Ash's cap! Strikes with 7 rainbow bolts of 10,000,000-volt electricity." },
    { name: 'Volt Tackle', type: 'electric', power: 120, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Surrounds itself with extreme high-voltage electricity and charges with immense power.' },
    { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 85, pp: 15, damageClass: 'physical', description: 'Hardens its tail into impenetrable steel and slams the target.' },
    { name: 'Electro Ball', type: 'electric', power: 95, accuracy: 100, pp: 10, damageClass: 'special', description: 'Hurls an electric orb that inflicts devastating damage based on Pikachu’s superior speed.' }
  ],
  pikachu: [
    { name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, pp: 15, damageClass: 'special', description: 'A strong electric attack that may paralyze the foe.' },
    { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 75, pp: 15, damageClass: 'physical', description: 'Slams the target with a steel-hard tail.' },
    { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, pp: 30, damageClass: 'physical', description: 'Strikes first with blazing quickness.' },
    { name: 'Electro Ball', type: 'electric', power: 80, accuracy: 100, pp: 10, damageClass: 'special', description: 'Hurls an electric orb that inflicts more damage the faster the user is.' }
  ],
  charizard: [
    { name: 'Flamethrower', type: 'fire', power: 90, accuracy: 100, pp: 15, damageClass: 'special', description: 'The target is scorched with an intense blast of fire.' },
    { name: 'Air Slash', type: 'flying', power: 75, accuracy: 95, pp: 15, damageClass: 'special', description: 'Attacks with a blade of air that slices through the sky.' },
    { name: 'Dragon Claw', type: 'dragon', power: 80, accuracy: 100, pp: 15, damageClass: 'physical', description: 'Slashes the target with huge, sharp dragon claws.' },
    { name: 'Fire Blast', type: 'fire', power: 110, accuracy: 85, pp: 5, damageClass: 'special', description: 'An all-consuming fireball that leaves devastating burn marks.' }
  ],
  blastoise: [
    { name: 'Hydro Pump', type: 'water', power: 110, accuracy: 80, pp: 5, damageClass: 'special', description: 'Blasts water at high pressure from dual shell cannons.' },
    { name: 'Surf', type: 'water', power: 90, accuracy: 100, pp: 15, damageClass: 'special', description: 'A giant wave crashes down upon the target.' },
    { name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, pp: 10, damageClass: 'special', description: 'Freezes the foe with a bone-chilling sub-zero ray.' },
    { name: 'Skull Bash', type: 'normal', power: 130, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Tucks head in to raise defense, then rams headfirst.' }
  ],
  venusaur: [
    { name: 'Solar Beam', type: 'grass', power: 120, accuracy: 100, pp: 10, damageClass: 'special', description: 'Absorbs intense sunlight and blasts pure solar energy.' },
    { name: 'Sludge Bomb', type: 'poison', power: 90, accuracy: 100, pp: 10, damageClass: 'special', description: 'Unleashes toxic sludge that may poison the target.' },
    { name: 'Giga Drain', type: 'grass', power: 75, accuracy: 100, pp: 10, damageClass: 'special', description: 'Drains half the damage dealt to restore user HP.' },
    { name: 'Earthquake', type: 'ground', power: 100, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Triggers a massive quake that shakes the entire arena.' }
  ],
  gengar: [
    { name: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100, pp: 15, damageClass: 'special', description: 'Hurls a shadowy blob that may lower the target Sp. Def.' },
    { name: 'Sludge Wave', type: 'poison', power: 95, accuracy: 100, pp: 10, damageClass: 'special', description: 'Floods the field with a poisonous tidal wave.' },
    { name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, pp: 15, damageClass: 'special', description: 'Zaps the target with sudden lightning.' },
    { name: 'Dark Pulse', type: 'dark', power: 80, accuracy: 100, pp: 15, damageClass: 'special', description: 'Releases a horrible aura imbued with dark thoughts.' }
  ],
  mewtwo: [
    { name: 'Psystrike', type: 'psychic', power: 100, accuracy: 100, pp: 10, damageClass: 'special', description: 'Materializes an immense psychic wave that inflicts physical damage.' },
    { name: 'Psychic', type: 'psychic', power: 90, accuracy: 100, pp: 10, damageClass: 'special', description: 'A powerful telekinetic force strikes the mind.' },
    { name: 'Aura Sphere', type: 'fighting', power: 80, accuracy: 100, pp: 20, damageClass: 'special', description: 'Fires an aura blast that never misses.' },
    { name: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100, pp: 15, damageClass: 'special', description: 'Launches a black sphere of ghostly matter.' }
  ],
  eevee: [
    { name: 'Swift', type: 'normal', power: 60, accuracy: 100, pp: 20, damageClass: 'special', description: 'Star-shaped rays that never miss.' },
    { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, pp: 30, damageClass: 'physical', description: 'Strikes first at hyper speed.' },
    { name: 'Bite', type: 'dark', power: 60, accuracy: 100, pp: 25, damageClass: 'physical', description: 'Bites the target with vicious fangs.' },
    { name: 'Double-Edge', type: 'normal', power: 120, accuracy: 100, pp: 15, damageClass: 'physical', description: 'A life-risking tackle with devastating impact.' }
  ],
  lucario: [
    { name: 'Aura Sphere', type: 'fighting', power: 80, accuracy: 100, pp: 20, damageClass: 'special', description: 'Fires a sphere of pure aura power.' },
    { name: 'Close Combat', type: 'fighting', power: 120, accuracy: 100, pp: 5, damageClass: 'physical', description: 'Fights up close without guarding itself.' },
    { name: 'Flash Cannon', type: 'steel', power: 80, accuracy: 100, pp: 10, damageClass: 'special', description: 'Concentrates light and blasts a beam of steel energy.' },
    { name: 'Extreme Speed', type: 'normal', power: 80, accuracy: 100, pp: 5, damageClass: 'physical', description: 'Charges the target at blinding, blinding speed.' }
  ],
  dragonite: [
    { name: 'Dragon Rush', type: 'dragon', power: 100, accuracy: 75, pp: 10, damageClass: 'physical', description: 'Tackles the target while exuding an overwhelming menace.' },
    { name: 'Outrage', type: 'dragon', power: 120, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Rampages and attacks for multiple turns.' },
    { name: 'Hurricane', type: 'flying', power: 110, accuracy: 70, pp: 10, damageClass: 'special', description: 'Wraps the target in a fierce tempest of wind.' },
    { name: 'Thunder Punch', type: 'electric', power: 75, accuracy: 100, pp: 15, damageClass: 'physical', description: 'An electrically charged punch.' }
  ],
  snorlax: [
    { name: 'Body Slam', type: 'normal', power: 85, accuracy: 100, pp: 15, damageClass: 'physical', description: 'Drops its huge body down on the target.' },
    { name: 'Heavy Slam', type: 'steel', power: 100, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Slams into the target with the power of its tremendous weight.' },
    { name: 'Crunch', type: 'dark', power: 80, accuracy: 100, pp: 15, damageClass: 'physical', description: 'Crunches with sharp fangs to lower defense.' },
    { name: 'Giga Impact', type: 'normal', power: 150, accuracy: 90, pp: 5, damageClass: 'physical', description: 'Charges the foe with every ounce of power.' }
  ],
  greninja: [
    { name: 'Water Shuriken', type: 'water', power: 80, accuracy: 100, pp: 20, damageClass: 'special', description: 'Strikes first with ninja stars made of high-pressure water.' },
    { name: 'Night Slash', type: 'dark', power: 70, accuracy: 100, pp: 15, damageClass: 'physical', description: 'Slaws the target instantaneously as if from the shadows.' },
    { name: 'Hydro Pump', type: 'water', power: 110, accuracy: 80, pp: 5, damageClass: 'special', description: 'Blasts water at high pressure.' },
    { name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, pp: 10, damageClass: 'special', description: 'Fires an icy beam.' }
  ],
  rayquaza: [
    { name: 'Dragon Ascent', type: 'flying', power: 120, accuracy: 100, pp: 5, damageClass: 'physical', description: 'Soars high into the stratosphere and crashes down like a meteor.' },
    { name: 'Outrage', type: 'dragon', power: 120, accuracy: 100, pp: 10, damageClass: 'physical', description: 'Rampages across the field.' },
    { name: 'Extreme Speed', type: 'normal', power: 80, accuracy: 100, pp: 5, damageClass: 'physical', description: 'Strikes with cosmic speed.' },
    { name: 'Hyper Beam', type: 'normal', power: 150, accuracy: 90, pp: 5, damageClass: 'special', description: 'Fires an apocalyptic beam of pure energy.' }
  ]
};

export class PokeApiService {
  private static BASE_URL = 'https://pokeapi.co/api/v2';
  private static cache = new Map<string, any>();

  /**
   * Fetches Pokémon list with pagination (Core endpoint /pokemon?limit=X&offset=Y)
   */
  public static async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListItem[]> {
    const cacheKey = `list_${limit}_${offset}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    try {
      const res = await fetch(`${this.BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: PokemonListItem[] = data.results.map((item: any) => {
        const parts = item.url.split('/').filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10) || 0;
        return {
          name: item.name,
          url: item.url,
          id
        };
      });
      this.cache.set(cacheKey, list);
      return list;
    } catch {
      // Offline fallback: Return slice from iconic roster
      return ICONIC_POKEMON_ROSTER.slice(offset, offset + limit).map(p => ({
        name: p.name,
        url: `${this.BASE_URL}/pokemon/${p.id}/`,
        id: p.id
      }));
    }
  }

  /**
   * Fetches detailed Pokémon data (Core endpoint /pokemon/{id or name})
   */
  public static async getPokemon(idOrName: string | number): Promise<PokemonDetail> {
    const key = String(idOrName).toLowerCase().trim();
    if (this.cache.has(key)) return this.cache.get(key);

    // Special instant handling for Ash's Pikachu
    if (
      key === 'ash-pikachu' ||
      key === "ash's pikachu" ||
      key === 'pikachu-cap' ||
      key === 'pikachu-original-cap' ||
      key === '10094'
    ) {
      this.cache.set(key, ASH_PIKACHU_DETAIL);
      return ASH_PIKACHU_DETAIL;
    }

    // Check pre-baked iconic roster
    const iconic = ICONIC_POKEMON_ROSTER.find(
      p => p.id === Number(key) || p.name.toLowerCase() === key
    );

    try {
      const res = await fetch(`${this.BASE_URL}/pokemon/${key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();

      const detail: PokemonDetail = {
        id: d.id,
        name: d.name,
        height: d.height,
        weight: d.weight,
        types: d.types.map((t: any) => t.type.name),
        stats: d.stats.map((s: any) => ({
          name: s.stat.name,
          baseStat: s.base_stat
        })),
        abilities: d.abilities.map((a: any) => ({
          name: a.ability.name,
          isHidden: a.is_hidden
        })),
        artworkUrl: d.sprites.other?.['official-artwork']?.front_default ||
                    d.sprites.front_default ||
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${d.id}.png`,
        shinyArtworkUrl: d.sprites.other?.['official-artwork']?.front_shiny ||
                         d.sprites.front_shiny ||
                         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${d.id}.png`,
        spriteUrl: d.sprites.front_default ||
                   `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.id}.png`,
        animatedSpriteUrl: d.sprites.other?.showdown?.front_default ||
                           `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${d.id}.gif`,
        cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${d.id}.ogg`
      };

      // Enhance with species data in background
      try {
        const speciesRes = await fetch(`${this.BASE_URL}/pokemon-species/${d.id}`);
        if (speciesRes.ok) {
          const s = await speciesRes.json();
          const enEntry = s.flavor_text_entries?.find((e: any) => e.language?.name === 'en');
          if (enEntry) {
            detail.flavorText = enEntry.flavor_text.replace(/[\n\f]/g, ' ');
          }
          detail.genus = s.genera?.find((g: any) => g.language?.name === 'en')?.genus;
          detail.generation = s.generation?.name?.replace('generation-', 'Generation ')?.toUpperCase();
        }
      } catch {}

      this.cache.set(key, detail);
      this.cache.set(String(detail.id), detail);
      return detail;
    } catch {
      if (iconic) return iconic;
      // Fallback to Pikachu
      return ICONIC_POKEMON_ROSTER[0];
    }
  }

  /**
   * Plays the Pokémon voice:
   * Defaults to 'anime' mode (real spoken anime voice like "Pika...chu!").
   * Can also play 'retro' mode (8-bit Game Boy squawk).
   */
  public static playVoice(
    id: number,
    name?: string,
    modeOverride?: VoiceMode,
    detail?: Partial<PokemonDetail>
  ): void {
    try {
      // Force real anime voice by default; only play 8-bit cry if explicitly requested
      const activeMode: VoiceMode = modeOverride === 'retro' ? 'retro' : 'anime';

      if (activeMode === 'retro') {
        const audioUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
        const audio = new Audio(audioUrl);
        audio.volume = 0.55;
        audio.play().catch(() => {});
        return;
      }

      // Real Anime Voice Mode (Iconic voices & anime pronunciation)
      const cleanName = (name || (id === 25 ? 'pikachu' : id === 133 ? 'eevee' : '')).toLowerCase().trim();
      const config = getAnimeVoiceForPokemon(cleanName || `pokemon-${id}`, detail);

      // 1. If embedded Base64 audio clip exists (Pikachu, Eevee)
      if (config.audioClipUrl) {
        try {
          const audio = new Audio(config.audioClipUrl);
          audio.volume = 1.0;
          const p = audio.play();
          if (p !== undefined) {
            p.catch(err => {
              console.warn('Audio clip play blocked, falling back to synthesizer:', err);
              this.playAnimeChime(config);
              this.speakAnimeUtterance(config);
            });
          }
          return;
        } catch {
          this.playAnimeChime(config);
          this.speakAnimeUtterance(config);
          return;
        }
      }

      // 2. Play Web Audio synth chime + Web Speech anime name
      this.playAnimeChime(config);
      this.speakAnimeUtterance(config);
    } catch (err) {
      console.warn('Voice engine anomaly:', err);
    }
  }

  /**
   * Generates a melodic anime synthesizer formant pulse via Web Audio API.
   * Guarantees an immediate audible feedback tone even if OS TTS is unconfigured.
   */
  public static playAnimeChime(config: AnimeVoiceConfig): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = Math.max(160, Math.min(800, config.pitch * 350));
      osc.type = config.pitch < 0.8 ? 'sawtooth' : 'triangle';

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.26);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  /**
   * Speaks anime phonetic phrase with Web Speech API.
   * Avoids the Chromium cancel() race bug so speech reliably fires.
   */
  public static speakAnimeUtterance(config: AnimeVoiceConfig): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utter = new SpeechSynthesisUtterance(config.speechText);
      utter.pitch = config.pitch;
      utter.rate = config.rate;
      utter.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferred) {
          utter.voice = preferred;
        }
      }

      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }

  /**
   * Backward-compatible alias for playVoice
   */
  public static playCry(id: number, name?: string): void {
    this.playVoice(id, name);
  }

  /**
   * Gets moves for a Pokémon
   */
  public static getMovesForPokemon(pokemonName: string): PokemonMove[] {
    const key = pokemonName.toLowerCase().trim();
    if (key.includes('ash') || key === '10094' || key.includes('cap')) {
      return POKEMON_MOVES['ash-pikachu'];
    }
    if (POKEMON_MOVES[key]) {
      return POKEMON_MOVES[key];
    }
    // Generic high-yield moveset for any Pokémon based on types
    return [
      { name: 'Tackle', type: 'normal', power: 40, accuracy: 100, pp: 35, damageClass: 'physical', description: 'A physical charge attack.' },
      { name: 'Swift', type: 'normal', power: 60, accuracy: 100, pp: 20, damageClass: 'special', description: 'Star-shaped rays that never miss.' },
      { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 75, pp: 15, damageClass: 'physical', description: 'Slams with hard tail.' },
      { name: 'Hyper Beam', type: 'normal', power: 150, accuracy: 90, pp: 5, damageClass: 'special', description: 'A devastating blast of pure energy.' }
    ];
  }
}
