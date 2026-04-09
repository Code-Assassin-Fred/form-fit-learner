import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

async function listModelsRaw() {
  const apiKey = process.env.GEMINI_API_KEY;
  // Try v1beta first
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log('--- Models in v1beta ---');
    if (data.models) {
        data.models.forEach(m => console.log(m.name));
    } else {
        console.log('No models found in v1beta or error:', JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error fetching v1beta:', e.message);
  }

  // Try v1
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`); // Wait, I meant v1
    const responseV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const dataV1 = await responseV1.json();
    console.log('--- Models in v1 ---');
    if (dataV1.models) {
        dataV1.models.forEach(m => console.log(m.name));
    } else {
        console.log('No models found in v1 or error:', JSON.stringify(dataV1));
    }
  } catch (e) {
    console.error('Error fetching v1:', e.message);
  }
}

listModelsRaw();
