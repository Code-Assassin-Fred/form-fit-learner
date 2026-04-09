import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> assessment;

  const ResultScreen({super.key, required this.assessment});

  @override
  Widget build(BuildContext context) {
    final results = assessment['analysisResults'] as Map<String, dynamic>;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        title: const Text('Assessment Result', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _HeaderSection(issue: results['issue'] ?? 'Unknown Issue'),
                const SizedBox(height: 32),
                const Text(
                  'Analysis Details',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ).animate().fadeIn(delay: 200.ms),
                const SizedBox(height: 16),
                _ResultCard(
                  title: 'Observation',
                  content: results['details'] ?? 'No details provided.',
                  icon: Icons.search_rounded,
                  color: Colors.blue.shade700,
                ).animate().fadeIn(delay: 300.ms).slideX(begin: 0.1),
                const SizedBox(height: 16),
                _ResultCard(
                  title: 'Impact',
                  content: results['impact'] ?? 'No impact analysis.',
                  icon: Icons.warning_amber_rounded,
                  color: Colors.orange.shade800,
                ).animate().fadeIn(delay: 400.ms).slideX(begin: 0.1),
                const SizedBox(height: 40),
                const Text(
                  'Recommended Solution',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ).animate().fadeIn(delay: 500.ms),
                const SizedBox(height: 16),
                _ToolCard(
                  name: 'Desk Incline Wedge',
                  description: 'Raises the surface to improve spinal alignment.',
                  onDownload: () => {},
                ).animate().fadeIn(delay: 600.ms).scale(),
                const SizedBox(height: 40),
                const Text(
                  'Summary Report',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ).animate().fadeIn(delay: 700.ms),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.grey.shade100),
                  ),
                  child: Text(
                    assessment['reportSummary'] ?? 'No summary available.',
                    style: TextStyle(fontSize: 16, height: 1.6, color: Colors.grey.shade800),
                  ),
                ).animate().fadeIn(delay: 800.ms),
                const SizedBox(height: 64),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 60),
                  ),
                  child: const Text('Return to Dashboard', style: TextStyle(fontSize: 16)),
                ).animate().fadeIn(delay: 1000.ms),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HeaderSection extends StatelessWidget {
  final String issue;

  const _HeaderSection({required this.issue});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Theme.of(context).colorScheme.primary, Theme.of(context).colorScheme.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Primary Detection',
            style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            issue,
            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    ).animate().fadeIn().scale(duration: 600.ms, curve: Curves.backOut);
  }
}

class _ResultCard extends StatelessWidget {
  final String title;
  final String content;
  final IconData icon;
  final Color color;

  const _ResultCard({
    required this.title,
    required this.content,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(content, style: TextStyle(color: Colors.grey.shade700, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ToolCard extends StatelessWidget {
  final String name;
  final String description;
  final VoidCallback onDownload;

  const _ToolCard({
    required this.name,
    required this.description,
    required this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.teal.shade50,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.teal.shade100),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 30,
            backgroundColor: Colors.white,
            child: Icon(Icons.build_circle_rounded, color: Colors.teal, size: 36),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF004D40))),
                const SizedBox(height: 4),
                Text(description, style: const TextStyle(color: Color(0xFF00695C))),
              ],
            ),
          ),
          IconButton.filled(
            onPressed: onDownload,
            icon: const Icon(Icons.download_rounded),
            style: IconButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.primary),
          ),
        ],
      ),
    );
  }
}
