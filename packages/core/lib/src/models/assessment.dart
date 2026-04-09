import 'package:freezed_annotation/freezed_annotation.dart';

part 'assessment.freezed.dart';
part 'assessment.g.dart';

@freezed
class Assessment with _$Assessment {
  const factory Assessment({
    required String id,
    required String learnerId,
    required String userId,
    required String mediaUrl,
    required String mediaType, // 'image' or 'video'
    required DateTime timestamp,
    required Map<String, dynamic> analysisResults,
    required String reportSummary,
    String? recommendedToolId,
    @Default('pending') String status, // 'pending', 'completed', 'failed'
  }) = _Assessment;

  factory Assessment.fromJson(Map<String, dynamic> json) => _$AssessmentFromJson(json);
}
