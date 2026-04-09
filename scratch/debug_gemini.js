import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no direct genAI.listModels() in the v1 SDK, 
    // it usually requires a direct fetch or using a specific client.
    // However, we can try to find the supported models by trying a few common ones.
    
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'];
    
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const response = await model.generateContent('ping');
            console.log(`Model ${modelName} works!`);
            process.exit(0);
        } catch (e) {
            console.log(`Model ${modelName} failed: ${e.message}`);
        }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
