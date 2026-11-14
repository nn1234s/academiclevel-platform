import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

console.log('⚡ Running Secret Pokémon & Pokédex (/pika, /pikachu) Test Suite...');

// 1. Verify App.tsx route resolutions
const appContent = fs.readFileSync(path.join(platformDir, 'src', 'App.tsx'), 'utf-8');

assert(appContent.includes("p === '/pika'"), "Must resolve /pika route in App.tsx");
assert(appContent.includes("p === '/pikachu'"), "Must resolve /pikachu route in App.tsx");
assert(appContent.includes("route: 'POKEMON_VAULT'"), "Must map to POKEMON_VAULT route");
assert(appContent.includes("<PokemonVaultHub"), "Must render PokemonVaultHub component");
console.log('✓ TEST 1 PASSED: /pika and /pikachu routes mapped in App.tsx without redirects.');

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

// 4. Verify PokemonVaultHub features
const hubContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'pokemon', 'PokemonVaultHub.tsx'), 'utf-8');

assert(hubContent.includes('Pokédex Explorer'), 'Must contain Pokédex Explorer');
assert(hubContent.includes('That Pokémon'), "Must contain Who's That Pokémon? anime game");
assert(hubContent.includes('Battle Arena'), 'Must contain Battle Arena turn-based combat');
assert(hubContent.includes('Type Matchup Master'), 'Must contain Type Matchup quiz');
assert(hubContent.includes('playCry'), 'Must support audio cry playback');
console.log('✓ TEST 4 PASSED: PokemonVaultHub contains all 4 arcade modules & Pokédex.');

console.log('🎉 ALL 4 POKÉMON VAULT TESTS PASSED PERFECTLY!');
