import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

const pikaPath = path.join(platformDir, 'public', 'audio', 'pikachu.mp3');
const eeveePath = path.join(platformDir, 'public', 'audio', 'eevee.mp3');

const pikaBase64 = fs.readFileSync(pikaPath).toString('base64');
const eeveeBase64 = fs.readFileSync(eeveePath).toString('base64');

const tsContent = `// Embedded zero-latency Base64 audio assets for authentic Pokémon anime voices
// Guarantees 100% offline, zero-network, instant playback across all browsers & Android APK WebViews

export const PIKACHU_VOICE_DATA_URI = 'data:audio/mp3;base64,${pikaBase64}';
export const EEVEE_VOICE_DATA_URI = 'data:audio/mp3;base64,${eeveeBase64}';
`;

fs.writeFileSync(path.join(platformDir, 'src', 'services', 'pokemonVoiceAssets.ts'), tsContent, 'utf-8');
console.log('Successfully generated src/services/pokemonVoiceAssets.ts!');
