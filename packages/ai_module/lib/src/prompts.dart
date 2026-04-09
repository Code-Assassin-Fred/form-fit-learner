class PhysicalBarrierPrompts {
  static const String analysisPrompt = '''
Identify physical inabilities and constrictions from the provided media (image/video frames).
Focus on:
1. Physical Inabilities: Missing limbs, paralysis, specific anatomical absence.
2. Physical Constrictions: Limited reach, rigid joints, rigid posture, tremors.
3. Fine Motor/Grip: How physical constraints affect tool usage.
4. Functional Interaction: How the individual adapts their physical state to learn.

Output a structured JSON report with:
- "issue": Short name of the physical constraint.
- "details": Description of observed physical state and challenges.
- "impact": How it affects learning and engagement.
- "category": 'grip', 'adaptation', 'stability', or 'accessibility'.
''';

  static String generateReportPrompt(Map<String, dynamic> analysis) {
    return '''
Convert this physical analysis into a human-readable, encouraging report for a caregiver/teacher.
Analysis: $analysis

Describe what was observed and suggest simple environmental interventions.
''';
  }
}
