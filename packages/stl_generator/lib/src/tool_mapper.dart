import 'package:core/core.dart';

class ToolMapper {
  static const Map<String, AssistiveTool> _toolDatabase = {
    'pencil_grip': AssistiveTool(
      id: 'pencil_grip',
      name: 'Adjustable Pencil Grip',
      description: 'Provides better leverage and control for writing tools.',
      stlPath: 'tools/pencil_grip.stl',
      category: 'grip',
    ),
    'desk_incline': AssistiveTool(
      id: 'desk_incline',
      name: 'Desk Incline Wedge',
      description: 'Raises the learning surface to improve posture and head position.',
      stlPath: 'tools/desk_incline.stl',
      category: 'posture',
    ),
    'wrist_cuff': AssistiveTool(
      id: 'wrist_cuff',
      name: 'Weighted Wrist Cuff',
      description: 'Stabilizes the hand and wrist for learners with tremors or instability.',
      stlPath: 'tools/wrist_cuff.stl',
      category: 'stability',
    ),
    'hip_stabilizer': AssistiveTool(
      id: 'hip_stabilizer',
      name: 'Hip Stabilizer',
      description: 'Provides lateral support to ensure a stable seated position.',
      stlPath: 'tools/hip_stabilizer.stl',
      category: 'seating',
    ),
  };

  static AssistiveTool? mapFindingsToTool(Map<String, dynamic> analysisResults) {
    // Deterministic logic based on category and severity
    final String? category = analysisResults['category'];
    
    if (category == 'grip') return _toolDatabase['pencil_grip'];
    if (category == 'posture') return _toolDatabase['desk_incline'];
    if (category == 'stability') return _toolDatabase['wrist_cuff'];
    if (category == 'seating') return _toolDatabase['hip_stabilizer'];
    
    return null;
  }
}
