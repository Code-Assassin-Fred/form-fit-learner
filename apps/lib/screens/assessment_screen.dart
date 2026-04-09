import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:io';

class AssessmentScreen extends StatefulWidget {
  const AssessmentScreen({super.key});

  @override
  State<AssessmentScreen> createState() => _AssessmentScreenState();
}

class _AssessmentScreenState extends State<AssessmentScreen> {
  final ImagePicker _picker = ImagePicker();
  XFile? _mediaFile;
  bool _isUploading = false;

  Future<void> _pickMedia(ImageSource source, bool isVideo) async {
    final XFile? file = isVideo 
        ? await _picker.pickVideo(source: source)
        : await _picker.pickImage(source: source);
    
    if (file != null) {
      setState(() {
        _mediaFile = file;
      });
    }
  }

  Future<void> _startAssessment() async {
    if (_mediaFile == null) return;

    setState(() {
      _isUploading = true;
    });

    // Mock delay for analysis
    await Future.delayed(const Duration(seconds: 4));

    if (mounted) {
      setState(() {
        _isUploading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('AI Analysis Complete!'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      // Navigation would go here in a real app
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        title: const Text('New Assessment', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Upload Media for AI Analysis',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                  textAlign: TextAlign.center,
                ).animate().fadeIn().slideY(begin: -0.2),
                const SizedBox(height: 8),
                Text(
                  'Record a video or take a photo of the posture.',
                  style: TextStyle(color: Colors.grey.shade600),
                  textAlign: TextAlign.center,
                ).animate().fadeIn(delay: 200.ms),
                const SizedBox(height: 40),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _pickMedia(ImageSource.gallery, false),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(
                          color: _mediaFile == null 
                              ? Colors.grey.shade300 
                              : Theme.of(context).colorScheme.primary.withOpacity(0.5),
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 30,
                            offset: const Offset(0, 15),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(30),
                        child: _mediaFile == null
                            ? Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.cloud_upload_outlined,
                                    size: 64,
                                    color: Colors.grey.shade400,
                                  ),
                                  const SizedBox(height: 20),
                                  Text(
                                    'Drag & Drop or Click to Upload',
                                    style: TextStyle(
                                      color: Colors.grey.shade500,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              )
                            : Stack(
                                fit: StackFit.expand,
                                children: [
                                  _mediaFile!.path.endsWith('.mp4')
                                      ? Container(
                                          color: Colors.teal.shade50,
                                          child: const Center(
                                            child: Icon(Icons.video_file, size: 80, color: Colors.teal),
                                          ),
                                        )
                                      : Image.file(File(_mediaFile!.path), fit: BoxFit.cover),
                                  Positioned(
                                    top: 16,
                                    right: 16,
                                    child: IconButton.filled(
                                      onPressed: () => setState(() => _mediaFile = null),
                                      icon: const Icon(Icons.close),
                                      style: IconButton.styleFrom(backgroundColor: Colors.black54),
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ).animate().scale(curve: Curves.easeOutCubic, duration: 500.ms),
                  ),
                ),
                const SizedBox(height: 40),
                if (_mediaFile == null)
                  Row(
                    children: [
                      Expanded(
                        child: _ActionButton(
                          onPressed: () => _pickMedia(ImageSource.camera, false),
                          icon: Icons.camera_alt_rounded,
                          label: 'Camera',
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _ActionButton(
                          onPressed: () => _pickMedia(ImageSource.gallery, true),
                          icon: Icons.videocam_rounded,
                          label: 'Video',
                          isSecondary: true,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1)
                else
                  ElevatedButton(
                    onPressed: _isUploading ? null : _startAssessment,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 20),
                    ),
                    child: _isUploading
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text('Analyze Posture & Barriers', style: TextStyle(fontSize: 18)),
                  ).animate().fadeIn().scale(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String label;
  final bool isSecondary;

  const _ActionButton({
    required this.onPressed,
    required this.icon,
    required this.label,
    this.isSecondary = false,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: isSecondary ? Colors.teal.shade50 : Colors.white,
        foregroundColor: isSecondary ? Colors.teal.shade900 : Colors.black87,
        side: BorderSide(color: isSecondary ? Colors.transparent : Colors.grey.shade200),
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
    );
  }
}
