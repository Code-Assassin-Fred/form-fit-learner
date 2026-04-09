const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeMedia = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { mediaUrl, mediaType, learnerId } = data;
  const userId = context.auth.uid;

  try {
    // 1. Logic for Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // For simplicity in MVP, we assume the AI can handle the URL or we pass base64
    // In production, we'd fetch from Storage and convert to parts
    const prompt = "Analyze this " + mediaType + " for physical learning barriers (posture, grip, stability). Return JSON.";
    
    // Placeholder for AI call
    // const result = await model.generateContent([prompt, mediaPart]);
    // const response = await result.response;
    // const analysis = JSON.parse(response.text());

    const mockAnalysis = {
      issue: "Slumped Posture",
      details: "The learner is leaning forward significantly.",
      impact: "Risk of back pain and reduced focus.",
      category: "posture"
    };

    const assessmentId = admin.firestore().collection("assessments").doc().id;
    const assessment = {
      id: assessmentId,
      learnerId,
      userId,
      mediaUrl,
      mediaType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      analysisResults: mockAnalysis,
      reportSummary: "The learner shows signs of slumping. An incline desk wedge is recommended.",
      recommendedToolId: "desk_incline",
      status: "completed"
    };

    await admin.firestore().collection("assessments").doc(assessmentId).set(assessment);

    return { assessmentId, status: "success" };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new functions.https.HttpsError("internal", "Failed to analyze media.");
  }
});
