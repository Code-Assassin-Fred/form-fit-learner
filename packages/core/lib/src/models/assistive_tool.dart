import 'package:freezed_annotation/freezed_annotation.dart';

part 'assistive_tool.freezed.dart';
part 'assistive_tool.g.dart';

@freezed
class AssistiveTool with _$AssistiveTool {
  const factory AssistiveTool({
    required String id,
    required String name,
    required String description,
    required String stlPath, // Path in Firebase Storage
    required String category, // e.g., 'grip', 'posture'
  }) = _AssistiveTool;

  factory AssistiveTool.fromJson(Map<String, dynamic> json) => _$AssistiveToolFromJson(json);
}
