const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

try {
  admin.initializeApp();
} catch (e) {
  console.log("Admin already initialized or failed.");
}

const db = admin.firestore();
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Download the image buffer using Node 18 fetch
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch media from URL: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const mimeType = mediaType === "video" ? "video/mp4" : "image/jpeg";

    // AGENT 1: Observation Agent
    const observerPrompt = `
      You are an Observation Agent. Your task is to describe exactly what you see in this ${mediaType} regarding the learner's physical setup and movements.
      Do not diagnose or suggest solutions. Focus on:
      - Head and neck angle.
      - Spine curvature and seating position.
      - Arm and wrist support.
      - Grip on tools (if visible).
      - Table and chair alignment.
      Be precise and objective.
    `;

    const observerResult = await model.generateContent([
      observerPrompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);
    const observations = await observerResult.response.text();

    // AGENT 2: Analysis Agent
    const analystPrompt = `
      You are an Ergonomic Analysis Agent. Based on these observations:
      "${observations}"
      
      Analyze the ergonomic risks and learning barriers. 
      Identify specific mechanical disadvantages or physical strains.
      Provide the analysis in a way that highlights the "Impact" on the learner's endurance and focus.
    `;
    const analystResult = await model.generateContent(analystPrompt);
    const analysis = await analystResult.response.text();

    // AGENT 3: Solutions Agent (Verifier)
    const solutionsPrompt = `
      You are a Solutions & Verification Agent. 
      Observations: "${observations}"
      Analysis: "${analysis}"
      
      Your task:
      1. Recommend exactly ONE specific 3D printable assistive tool to solve the primary issue.
      2. Generate a comprehensive ergonomic report in LaTeX format.
      3. Verify that the recommendation matches the observations to prevent hallucinations.

      The LaTeX report should use sections like \\section{Assessment}, \\section{Identify Risks}, etc.
      Use LaTeX for any measurements or geometric notations (e.g., angles $\\theta$, force vectors $\\vec{F}$).

      Output a JSON object with exactly these keys:
      - "issue": Short name of the primary issue.
      - "details": The LaTeX formatted report content.
      - "recommendedToolId": A machine-friendly ID for the tool (e.g., "pencil_grip_v1").
      - "toolDescription": Simple name for the tool.
      - "category": One of: 'grip', 'posture', 'stability', 'seating'.
    `;
    const solutionsResult = await model.generateContent(solutionsPrompt);
    const solutionsText = await solutionsResult.response.text();
    
    const cleanJsonTxt = solutionsText.replace(/```json/g, "").replace(/```/g, "").trim();
    let finalResults;
    try {
      finalResults = JSON.parse(cleanJsonTxt);
    } catch (e) {
      console.log("Failed to parse JSON, cleaning up...", solutionsText);
      finalResults = {
        issue: "Ergonomic Assessment",
        details: solutionsText,
        recommendedToolId: "custom_support",
        toolDescription: "Custom Support",
        category: "posture"
      };
    }

    const assessmentId = db.collection("assessments").doc().id;
    const assessment = {
      id: assessmentId,
      learnerId: learnerId || "unknown",
      userId,
      mediaUrl,
      mediaType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      analysisResults: finalResults,
      reportSummary: finalResults.details,
      recommendedToolId: finalResults.recommendedToolId,
      toolDescription: finalResults.toolDescription,
      status: "completed"
    };

    await db.collection("assessments").doc(assessmentId).set(assessment);

    return { assessmentId, status: "success", assessment };
  } catch (error) {
    console.error("Multi-Agent AI Analysis Error:", error);
    throw new functions.https.HttpsError("internal", "Failed to analyze media.", error.message);
  }
});

exports.addLearner = functions.https.onCall(async (data, context) => {
  // Check auth
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { name, age } = data;
  if (!name || age === undefined) {
    throw new functions.https.HttpsError("invalid-argument", "Name and age are required.");
  }

  try {
    console.log(`[addLearner] START: ${name}, age: ${age}`);
    
    if (!db) {
      throw new Error("Firestore DB NOT INITIALIZED in Cloud Function");
    }

    const learnerRef = db.collection("learners").doc();
    const learnerId = learnerRef.id;

    await learnerRef.set({
      id: learnerId,
      userId: context.auth.uid,
      name: String(name),
      age: parseInt(age),
      status: 'Excellent',
      score: '100%',
      class: 'Main Campus',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[addLearner] SUCCESS: ${learnerId}`);
    return { status: "success", learnerId };
  } catch (error) {
    console.error("CRITICAL ERROR in addLearner:", error);
    // Use 'failed-precondition' instead of 'internal' to see if it bypasses SDK swallowing
    throw new functions.https.HttpsError("failed-precondition", `Learner creation failed: ${error.message}`);
  }
});
