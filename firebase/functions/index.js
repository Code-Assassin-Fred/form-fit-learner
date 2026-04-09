const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

exports.analyzeMedia = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { mediaUrl, mediaType, learnerId } = data;
  const userId = context.auth.uid;

  if (!mediaUrl) {
    throw new functions.https.HttpsError("invalid-argument", "Missing mediaUrl");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Download the image buffer using Node 18 fetch
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch media from URL: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");

    const mimeType = mediaType === "video" ? "video/mp4" : "image/jpeg"; // Simplified for MVP

    const prompt = `Analyze this ${mediaType} for physical learning barriers (posture, grip, stability).
Focus on:
1. Posture: Slumping, head position, seating alignment.
2. Ergonomics: Table height, chair support, reach range.
3. Fine Motor/Grip: How they hold writing/learning tools.
4. Stability: Tremors, wrist position, arm support.

Output a structured JSON report with exactly these keys:
- "issue": Short name of the issue.
- "details": Description of observed behavior.
- "impact": How it affects learning.
- "category": 'grip', 'posture', 'stability', or 'seating'.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);
    const textResponse = await result.response.text();
    
    // Clean up potential markdown formatting from JSON output
    const cleanJsonTxt = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    let analysisResults;
    try {
      analysisResults = JSON.parse(cleanJsonTxt);
    } catch (e) {
      console.log("Failed to parse JSON, returning raw text as details", cleanJsonTxt);
      analysisResults = {
        issue: "Unknown Issue",
        details: cleanJsonTxt,
        impact: "Requires manual review",
        category: "posture"
      };
    }

    // Deterministic Logic based on category
    let recommendedToolId = "desk_incline"; // default
    if (analysisResults.category === 'grip') recommendedToolId = "pencil_grip";
    if (analysisResults.category === 'posture') recommendedToolId = "desk_incline";
    if (analysisResults.category === 'stability') recommendedToolId = "wrist_cuff";
    if (analysisResults.category === 'seating') recommendedToolId = "hip_stabilizer";

    const reportSummary = `The learner assessment indicates: ${analysisResults.issue}. ${analysisResults.details} \nImpact: ${analysisResults.impact}. \nRecommended Tool: ${recommendedToolId.replace('_', ' ')}.`;

    const assessmentId = admin.firestore().collection("assessments").doc().id;
    const assessment = {
      id: assessmentId,
      learnerId: learnerId || "unknown",
      userId,
      mediaUrl,
      mediaType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      analysisResults,
      reportSummary,
      recommendedToolId,
      status: "completed"
    };

    await admin.firestore().collection("assessments").doc(assessmentId).set(assessment);

    return { assessmentId, status: "success", assessment };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new functions.https.HttpsError("internal", "Failed to analyze media.", error.message);
  }
});
