import 'package:freezed_annotation/freezed_annotation.dart';

part 'learner.freezed.dart';
part 'learner.g.dart';

@freezed
class Learner with _$Learner {
  const factory Learner({
    required String id,
    required String userId,
    required String name,
    required int age,
    @Default({}) Map<String, dynamic> metadata,
    required DateTime createdAt,
  }) = _Learner;

  factory Learner.fromJson(Map<String, dynamic> json) => _$LearnerFromJson(json);
}
