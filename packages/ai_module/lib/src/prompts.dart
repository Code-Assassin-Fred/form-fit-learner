class PhysicalBarrierPrompts {
  static const String analysisPrompt = '''
Identify physical learning barriers from the provided media (image/video frames).
Focus on:
1. Posture: Slumping, head position, seating alignment.
2. Ergonomics: Table height, chair support, reach range.
3. Fine Motor/Grip: How they hold writing/learning tools.
4. Stability: Tremors, wrist position, arm support.

Output a structured JSON report with:
- "issue": Short name of the issue.
- "details": Description of observed behavior.
- "impact": How it affects learning.
- "category": 'grip', 'posture', 'stability', or 'seating'.
''';

  static String generateReportPrompt(Map<String, dynamic> analysis) {
    return '''
Convert this physical analysis into a human-readable, encouraging report for a caregiver/teacher.
Analysis: $analysis

Describe what was observed and suggest simple environmental interventions.
''';
  }
}
