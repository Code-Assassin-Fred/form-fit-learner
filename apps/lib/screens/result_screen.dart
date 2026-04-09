import 'package:flutter/material.dart';

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> assessment;

  const ResultScreen({super.key, required this.assessment});

  @override
  Widget build(BuildContext context) {
    final results = assessment['analysisResults'] as Map<String, dynamic>;

    return Scaffold(
      appBar: AppBar(title: const Text('Assessment Result')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AI Barrier Analysis',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              color: Colors.teal[50],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Detected Issue: ${results['issue']}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Text('Observation: ${results['details']}'),
                    const SizedBox(height: 8),
                    Text(
                      'Impact: ${results['impact']}',
                      style: const TextStyle(fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Recommended Tool',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ListTile(
              leading: const Icon(Icons.build_circle, color: Colors.teal, size: 40),
              title: const Text('Desk Incline Wedge'),
              subtitle: const Text('Raises the surface to improve spinal alignment.'),
              trailing: IconButton(
                icon: const Icon(Icons.download_for_offline, size: 30),
                onPressed: () {
                  // TODO: Implement STL Download
                },
              ),
              tileColor: Colors.grey[100],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            const SizedBox(height: 32),
            const Text(
              'Caregiver Report',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              assessment['reportSummary'] ?? 'No summary available.',
              style: const TextStyle(fontSize: 16, height: 1.5),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
              child: const Center(child: Text('Back to Dashboard')),
            ),
          ],
        ),
      ),
    );
  }
}
