import { db } from '../server/db.js';

const rows = db.prepare("SELECT * FROM system_settings WHERE key LIKE '%gemini%' OR key LIKE '%ai%'").all();
console.log('System Settings rows:', rows.map(r => ({ key: r.key, value: r.value ? r.value.substring(0, 8) + '...' : null })));

const keyRow = db.prepare("SELECT value FROM system_settings WHERE key = 'gemini_api_key'").get();
const apiKey = keyRow?.value || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.log('No API key found in platform_settings or process.env');
} else {
  console.log('Found API Key with prefix:', apiKey.substring(0, 8));
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log('Models endpoint status:', res.status);
    const data = await res.json();
    if (data.models) {
      console.log('Available models for this key:');
      const supported = data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => ({ name: m.name, displayName: m.displayName }));
      console.log(JSON.stringify(supported, null, 2));
    } else {
      console.log('Response body:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
