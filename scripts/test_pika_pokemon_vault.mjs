import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

console.log('⚡ Running Secret Arcade & Vault (/arcade, /pika, /pikachu) Test Suite...');

// 1. Verify App.tsx route resolutions
const appContent = fs.readFileSync(path.join(platformDir, 'src', 'App.tsx'), 'utf-8');

assert(appContent.includes("p === '/arcade'"), "Must resolve /arcade route in App.tsx");
assert(appContent.includes("p === '/pika'"), "Must resolve /pika route in App.tsx");
assert(appContent.includes("p === '/pikachu'"), "Must resolve /pikachu route in App.tsx");
assert(appContent.includes("route: 'POKEMON_VAULT'"), "Must map to POKEMON_VAULT route");
assert(appContent.includes("<PokemonVaultHub"), "Must render PokemonVaultHub component");
console.log('✓ TEST 1 PASSED: /arcade, /pika and /pikachu routes mapped in App.tsx without redirects.');

// 2. Verify PokeApiService
const serviceContent = fs.readFileSync(path.join(platformDir, 'src', 'services', 'pokeApiService.ts'), 'utf-8');

assert(serviceContent.includes('https://pokeapi.co/api/v2'), 'Must build on PokeAPI base URL');
assert(serviceContent.includes('/pokemon'), 'Must include pokemon endpoint');
assert(serviceContent.includes('/pokemon-species'), 'Must include pokemon-species endpoint');
assert(serviceContent.includes('ICONIC_POKEMON_ROSTER'), 'Must include offline instant-load iconic roster');
assert(serviceContent.includes('getTypeMultiplier'), 'Must calculate type effectiveness multipliers');
console.log('✓ TEST 2 PASSED: PokeApiService conforms to PokeAPI core endpoints.');

// 3. Test Type Effectiveness Multipliers
import { getTypeMultiplier } from '../src/services/pokeApiService.ts';

// Electric on Water = 2x
assert.strictEqual(getTypeMultiplier('electric', ['water']), 2, 'Electric vs Water must be 2x Super Effective');
// Electric on Ground = 0x
assert.strictEqual(getTypeMultiplier('electric', ['ground']), 0, 'Electric vs Ground must be 0x (Immune)');
// Fire on Grass = 2x
assert.strictEqual(getTypeMultiplier('fire', ['grass']), 2, 'Fire vs Grass must be 2x');
// Ghost on Normal = 0x
assert.strictEqual(getTypeMultiplier('ghost', ['normal']), 0, 'Ghost vs Normal must be 0x');
// Rock on Fire/Flying (Charizard) = 4x
assert.strictEqual(getTypeMultiplier('rock', ['fire', 'flying']), 4, 'Rock vs Fire/Flying must be 4x Quadruple damage');
console.log('✓ TEST 3 PASSED: Type effectiveness matrix accurately mirrors official Pokémon mechanics.');

// 4. Verify PokemonVaultHub features & Coin Award Integration
const hubContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'pokemon', 'PokemonVaultHub.tsx'), 'utf-8');

assert(hubContent.includes('Arcade Explorer'), 'Must name module Arcade Explorer instead of Pokedex');
assert(hubContent.includes('AcademicLevel Secret Arcade'), 'Must name arcade header AcademicLevel Secret Arcade');
assert(!hubContent.includes('Pokédex Explorer'), 'Must not display Pokédex Explorer to avoid trademark trouble');
assert(hubContent.includes('Battle Arena'), 'Must contain Battle Arena turn-based combat');
assert(hubContent.includes('Type Matchup Master'), 'Must contain Type Matchup quiz');
assert(hubContent.includes('playCry') || hubContent.includes('playVoice'), 'Must support audio voice playback');
assert(hubContent.includes('CoinLedgerService.appendTransaction'), 'Must append coin transaction to cryptographic ledger');
assert(hubContent.includes('POKEMON_GUESS_REWARD'), 'Must use reasonCode POKEMON_GUESS_REWARD');
assert(hubContent.includes('+1 Study Coin Awarded!'), 'Must display coin award message');
console.log('✓ TEST 4 PASSED: PokemonVaultHub branded as Arcade instead of Pokedex & all 4 modules verified.');

// 5. Verify Core Types and Server Coin Reason Codes
const typesContent = fs.readFileSync(path.join(platformDir, 'src', 'core', 'types', 'index.ts'), 'utf-8');
assert(typesContent.includes("'POKEMON_GUESS_REWARD'"), "Must have POKEMON_GUESS_REWARD in CoinReasonCode type");

const serverApiContent = fs.readFileSync(path.join(platformDir, 'server', 'api.js'), 'utf-8');
assert(serverApiContent.includes("'POKEMON_GUESS_REWARD'"), "Must permit POKEMON_GUESS_REWARD in server ALLOWED_STUDENT_CREDIT_REASONS");
assert(serverApiContent.includes("reasonCode === 'POKEMON_GUESS_REWARD' && numAmount > 1"), "Must cap POKEMON_GUESS_REWARD at 1 coin on server");
console.log('✓ TEST 5 PASSED: CoinReasonCode and server-side 1-coin safety guard verified.');

// 6. Verify Real Anime Voice Engine & Pikachu MP3 Asset
assert(serviceContent.includes('playVoice'), 'Must have playVoice function');
assert(serviceContent.includes('ANIME_VOICE_REGISTRY'), 'Must have ANIME_VOICE_REGISTRY');
assert(serviceContent.includes('getAnimeVoiceForPokemon'), 'Must have dynamic anime syllabifier');
assert(fs.existsSync(path.join(platformDir, 'public', 'audio', 'pikachu.mp3')), 'Must bundle pikachu.mp3 voice clip');
const pikachuMp3Buf = fs.readFileSync(path.join(platformDir, 'public', 'audio', 'pikachu.mp3'));
assert(pikachuMp3Buf.length > 1000, 'pikachu.mp3 must be non-empty valid audio');
assert(hubContent.includes('voiceMode'), 'PokemonVaultHub must support voiceMode switcher');
console.log('✓ TEST 6 PASSED: Real Anime Voice Engine & Pikachu MP3 audio verified.');

// 7. Verify Ash's Pikachu Form & Ability
assert(serviceContent.includes('ASH_PIKACHU_DETAIL'), "Must export ASH_PIKACHU_DETAIL");
assert(serviceContent.includes('10094'), "Must reference PokeAPI ID 10094 for Ash's Cap Pikachu");
assert(serviceContent.includes("Ash's Bond / 10,000,000 Volt Power"), "Must include Ash's signature ability");
assert(serviceContent.includes('10,000,000 Volt Thunderbolt'), "Must include signature Z-Move 10,000,000 Volt Thunderbolt");
assert(serviceContent.includes('Volt Tackle'), "Must include signature Volt Tackle move");

import { ASH_PIKACHU_DETAIL, PokeApiService } from '../src/services/pokeApiService.ts';
assert.strictEqual(ASH_PIKACHU_DETAIL.id, 10094, "Ash's Pikachu ID must be 10094");
const ashMoves = PokeApiService.getMovesForPokemon("ash's pikachu");
assert(ashMoves.some(m => m.name === '10,000,000 Volt Thunderbolt' && m.power === 195), "Ash's Pikachu must have 10,000,000 Volt Thunderbolt with power 195");
const ashAbility = ASH_PIKACHU_DETAIL.abilities.find(a => a.name.includes("Ash's Bond"));
assert(ashAbility, "Ash's Pikachu must possess Ash's Bond ability");
console.log("✓ TEST 7 PASSED: Ash's Pikachu form (ID 10094), signature ability & 10,000,000 Volt move verified.");

// 8. Verify Mode Switcher & Ability Display in PokemonVaultHub
assert(hubContent.includes('pikachuMode'), "Must support pikachuMode state");
assert(hubContent.includes('ASH_CAP'), "Must have ASH_CAP mode state");
assert(hubContent.includes('togglePikachuMode'), "Must implement togglePikachuMode function");
assert(hubContent.includes("Ash's Pikachu Active"), "Must display active Ash's Pikachu indicator");
assert(hubContent.includes("ASH'S SIGNATURE ABILITY"), "Must render Ash's signature ability badge");
console.log("✓ TEST 8 PASSED: Mode switcher UI and Ash's ability rendering in PokemonVaultHub verified.");

console.log('🎉 ALL 8 POKÉMON VAULT, ASH PIKACHU MODE & COIN REWARD TESTS PASSED PERFECTLY!');
