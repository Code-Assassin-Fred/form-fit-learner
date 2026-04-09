import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const localDataDir = join(rootDir, 'local_data');
const uploadsDir = join(localDataDir, 'uploads');
const logFile = join(localDataDir, 'backend.log');

// Helper to log to file
const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
};

// Ensure local storage directories exist
if (!existsSync(localDataDir)) mkdirSync(localDataDir);
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);

dotenv.config({ path: join(rootDir, '.env') });

// ---------- Local JSON Storage Helper ----------
const getFilePath = (collection) => join(localDataDir, `${collection}.json`);

const readCollection = (collection) => {
  const filePath = getFilePath(collection);
  if (!existsSync(filePath)) {
    // Return seed data if file doesn't exist
    if (collection === 'classes') return [{id: 'class1', name: 'General Ergonomics', progress: 40}];
    if (collection === 'tasks') return [{id: 'task1', title: 'Review Learner Profiles', dueDate: 'Today', icon: '📋'}];
    if (collection === 'activities') return [{id: 'act1', type: 'assessment', message: 'Ready for new scan'}];
    return [];
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
};

const writeCollection = (collection, data) => {
  writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
};

// Initialize Firebase Admin with service account for AUTH ONLY
const serviceAccountPath = join(rootDir, 'service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 media
app.use('/uploads', express.static(uploadsDir));

// ---------- Middleware: Verify Firebase Auth Token ----------
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// ---------- POST /api/learners ----------
app.post('/api/learners', verifyAuth, async (req, res) => {
  const { name, age, disabilityInfo } = req.body;
  logToFile(`POST /api/learners - User: ${req.user.uid}, Name: ${name}`);

  if (!name || age === undefined) {
    return res.status(400).json({ error: 'Name and age are required.' });
  }

  try {
    const learnerRef = db.collection('learners').doc();
    const newLearner = {
      id: learnerRef.id,
      userId: req.user.uid,
      name: String(name),
      age: parseInt(age),
      disabilityInfo: disabilityInfo || 'Not specified',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await learnerRef.set(newLearner);
    logToFile(`Learner created in Firestore: ${newLearner.id}`);
    return res.status(201).json({ status: 'success', learnerId: newLearner.id });
  } catch (err) {
    logToFile(`Error adding learner: ${err.message}`);
    return res.status(500).json({ error: `Failed to add learner: ${err.message}` });
  }
});

// ---------- DELETE /api/learners/:id ----------
app.delete('/api/learners/:id', verifyAuth, async (req, res) => {
  logToFile(`DELETE /api/learners/${req.params.id}`);
  try {
    await db.collection('learners').doc(req.params.id).delete();
    return res.json({ status: 'success' });
  } catch (err) {
    logToFile(`Error deleting learner: ${err.message}`);
    return res.status(500).json({ error: `Failed to delete learner: ${err.message}` });
  }
});

// ---------- GET /api/learners ----------
app.get('/api/learners', verifyAuth, async (req, res) => {
  logToFile(`GET /api/learners - User: ${req.user.uid}`);
  try {
    const snapshot = await db.collection('learners').where('userId', '==', req.user.uid).get();
    const learners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logToFile(`Fetched ${learners.length} learners from Firestore`);
    return res.json(learners);
  } catch (err) {
    logToFile(`Error fetching learners: ${err.message}`);
    return res.status(500).json({ error: `Failed to fetch learners: ${err.message}` });
  }
});

// ---------- GET /api/assessments ----------
app.get('/api/assessments', verifyAuth, async (req, res) => {
  logToFile(`GET /api/assessments - User: ${req.user.uid}`);
  try {
    const snapshot = await db.collection('assessments').where('userId', '==', req.user.uid).get();
    const assessments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(assessments);
  } catch (err) {
    logToFile(`Error fetching assessments: ${err.message}`);
    return res.status(500).json({ error: `Failed to fetch assessments: ${err.message}` });
  }
});


// ---------- GET /api/classes ----------
app.get('/api/classes', verifyAuth, async (req, res) => {
  try {
    return res.json(readCollection('classes'));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------- GET /api/tasks ----------
app.get('/api/tasks', verifyAuth, async (req, res) => {
  try {
    return res.json(readCollection('tasks'));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------- GET /api/activities ----------
app.get('/api/activities', verifyAuth, async (req, res) => {
  try {
    return res.json(readCollection('activities'));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------- POST /api/analyze (SSE STREAMING) ----------
app.post('/api/analyze', verifyAuth, async (req, res) => {
  const { mediaBase64, mimeType, mediaType, learnerId } = req.body;

  let isCancelled = false;
  req.on('close', () => {
    isCancelled = true;
  });

  if (!mediaBase64 || !learnerId) {
    return res.status(400).json({ error: 'mediaBase64 and learnerId are required.' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (step, progress, message) => {
    res.write(`data: ${JSON.stringify({ type: 'progress', step, progress, message })}\n\n`);
  };

  try {
    sendProgress('init', 5, 'Saving media locally...');
    
    // Save file locally instead of Firebase Storage
    const fileName = `${Date.now()}_assessment.${mimeType.split('/')[1] || 'jpg'}`;
    const filePath = join(uploadsDir, fileName);
    const mediaBuffer = Buffer.from(mediaBase64, 'base64');
    writeFileSync(filePath, mediaBuffer);
    
    const mediaUrl = `http://localhost:3001/uploads/${fileName}`;

    sendProgress('init', 10, 'Initializing AI agents...');
    if (isCancelled) return;

    // AGENT 1: Observation Agent
    sendProgress('observing', 25, 'Agent 1: Observing student challenges...');
    const observerPrompt = `You are a Specialist Observation Agent for Assistive Technology.
Your task is to identify and describe the learner's specific physical challenges and interaction barriers in this ${mediaType}.
Focus on:
- Limb presence, range of motion, and any unique physical characteristics.
- Specific difficulties the learner faces when trying to perform educational tasks (writing, typing, gripping).
- How their current physical state interacts with standard tools.
- Any observable fatigue, strain, or dignity-related challenges.
Be precise, empathetic, and objective. Focus on the *human capability and barriers* rather than the furniture or room setup.`;

    const observerResult = await model.generateContent([
      observerPrompt,
      { inlineData: { data: mediaBase64, mimeType } },
    ]);
    const observations = await observerResult.response.text();
    if (isCancelled) return;

    // AGENT 2: Analysis Agent
    sendProgress('analyzing', 50, 'Agent 2: Analyzing ergonomic risks...');
    const analystPrompt = `You are an Adaptive Learning Analysis Agent. Based on these observations:
"${observations}"

Analyze the specific learning barriers and physical hurdles for this individual.
Identify precisely where standard educational tools fail to accommodate their unique physical profile.
Highlight the "Impact" on their learning endurance, speed, and dignity. The goal is to identify challenges that prevent them from reaching their full potential.`;
    const analystResult = await model.generateContent(analystPrompt);
    const analysis = await analystResult.response.text();
    if (isCancelled) return;

    // AGENT 3: Solutions Agent
    sendProgress('recommending', 75, 'Agent 3: Generating assistive recommendations...');
    const solutionsPrompt = `You are an Assistive Technology Solutions Specialist.
Observations: "${observations}"
Analysis: "${analysis}"

Your task:
1. Recommend exactly ONE specific 3D printable assistive tool tailored to this learner's specific disability (e.g., custom pen stabilizer for missing fingers, foot-operated input, specialized grip).
2. Generate a comprehensive Inclusive Ergonomic Report.

CRITICAL FORMATTING RULES:
- Use MARKDOWN for document structure. 
- DO NOT use LaTeX commands like \\section, \\textbf, \\documentclass, or \\begin{document}.
- Use ## **Heading Name** for all major sections (ensure they are bolded).
- Use ### **Subheading Name** for subsections.
- ONLY use LaTeX for mathematical measurements, angles, or geometric notations, and wrap them in single $ for inline or double $$ for blocks. (e.g., $45^{\circ}$, $15cm$).
- The report should focus heavily on the **Human Challenges** and how to overcome them.
- Be professional, empathetic, and highly detailed.

Output a JSON object with exactly these keys:
- "issue": Short name of the primary challenge identified.
- "details": The Markdown formatted report content.
- "recommendedToolId": A machine-friendly ID for the tool (e.g., "adaptive_grip_v1").
- "toolDescription": Simple name for the assistive tool.
- "category": One of: 'grip', 'posture', 'stability', 'accessibility'.`;

    const solutionsResult = await model.generateContent(solutionsPrompt);
    const solutionsText = await solutionsResult.response.text();

    const cleanJsonTxt = solutionsText.replace(/```json/g, '').replace(/```/g, '').trim();
    let finalResults;
    try {
      finalResults = JSON.parse(cleanJsonTxt);
    } catch (e) {
      console.log('[Local Storage] Failed to parse AI JSON, using raw text...', solutionsText);
      finalResults = {
        issue: 'Inclusive Assessment',
        details: solutionsText,
        recommendedToolId: 'custom_adaptation',
        toolDescription: 'Custom Adaptation',
        category: 'accessibility'
      };
    }
    
    if (isCancelled) return;

    logToFile('Saving report to Firestore...');
    
    // Save to Firestore
    const assessmentRef = db.collection('assessments').doc();
    const newAssessment = {
      id: assessmentRef.id,
      learnerId: learnerId,
      userId: req.user.uid,
      mediaUrl: mediaUrl,
      mediaType: mediaType || 'image',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      analysisResults: finalResults,
      reportSummary: finalResults.details,
      recommendedToolId: finalResults.recommendedToolId,
      toolDescription: finalResults.toolDescription,
      status: 'completed'
    };

    await assessmentRef.set(newAssessment);
    logToFile(`Assessment completed and saved to Firestore: ${newAssessment.id}`);

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'complete', assessmentId: newAssessment.id, assessment: newAssessment })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[Local Storage] AI Analysis error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'form-fit-local-backend' });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Local Data backend running on http://localhost:${PORT}`);
});
