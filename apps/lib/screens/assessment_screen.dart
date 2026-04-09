import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
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

    // TODO: Implement Firebase Storage Upload
    // TODO: Call 'analyzeMedia' Cloud Function
    
    await Future.delayed(const Duration(seconds: 3)); // Mock delay

    if (mounted) {
      setState(() {
        _isUploading = false;
      });
      // Navigate to results (Placeholder navigation)
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Assessment triggered successfully!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Assessment')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Select Media for Analysis',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey[400]!),
                ),
                child: _mediaFile == null
                    ? const Center(child: Text('No media selected'))
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: _mediaFile!.path.endsWith('.mp4') 
                            ? const Center(child: Icon(Icons.video_file, size: 100))
                            : Image.file(File(_mediaFile!.path), fit: BoxFit.cover),
                      ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickMedia(ImageSource.gallery, false),
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickMedia(ImageSource.camera, false),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () => _pickMedia(ImageSource.gallery, true),
              icon: const Icon(Icons.videocam),
              label: const Text('Pick Video'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.teal[50]),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _mediaFile == null || _isUploading ? null : _startAssessment,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
              ),
              child: _isUploading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Analyze Barriers', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
