'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  LogOut, LayoutDashboard, Users, Search,
  Bell, Zap, GraduationCap,
  Printer, FileText, Upload,
  Camera, X, CheckCircle, AlertCircle, Info,
  ChevronDown, ChevronUp, Trash2
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddLearner, setShowAddLearner] = useState(false);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newLearnerData, setNewLearnerData] = useState({ name: '', age: '', disabilityInfo: '' });
  const [assessmentFile, setAssessmentFile] = useState(null);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [fakeStep, setFakeStep] = useState('thinking...');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [learnerToDelete, setLearnerToDelete] = useState(null);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [learners, setLearners] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedReportId, setExpandedReportId] = useState(null);

  const cleanReportContent = (content) => {
    if (!content) return '';
    return content.replace(/\\documentclass\{[\s\S]*?\\begin\{document\}/g, '').replace(/\\end\{document\}/g, '').trim();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [learnersRes, assessmentsRes, classesRes, tasksRes, activitiesRes] = await Promise.all([
        fetch('/api/learners', { headers }),
        fetch('/api/assessments', { headers }),
        fetch('/api/classes', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/activities', { headers }),
      ]);

      if (learnersRes.ok) setLearners(await learnersRes.json());
      if (assessmentsRes.ok) setAssessments(await assessmentsRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showToast(`Connection failed.`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAllData(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubAuth();
  }, [fetchAllData, router]);

  useEffect(() => {
    if (!analyzing) {
      setFakeStep('thinking...');
      return;
    }
    const messages = ['thinking...', 'generating...', 'verifying...'];
    const interval = setInterval(() => {
      setFakeStep(prev => messages[(messages.indexOf(prev) + 1) % messages.length]);
    }, 1500);
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleAddLearner = async (e) => {
    e.preventDefault();
    const token = await user.getIdToken();
    const response = await fetch('/api/learners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newLearnerData),
    });
    if (response.ok) {
      showToast("Learner added!");
      setShowAddLearner(false);
      setNewLearnerData({ name: '', age: '', disabilityInfo: '' });
      fetchAllData(user);
    }
  };

  const runAssessment = async () => {
    setAnalyzing(true);
    setAnalysisProgress(10);
    const arrayBuffer = await assessmentFile.arrayBuffer();
    const mediaBase64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    const token = await user.getIdToken();
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        mediaBase64,
        mimeType: assessmentFile.type,
        mediaType: assessmentFile.type.includes('video') ? 'video' : 'image',
        learnerId: selectedLearnerId
      }),
    });

    if (!response.ok) {
      showToast("Analysis failed.", 'error');
      setAnalyzing(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.substring(6));
          if (data.type === 'progress') {
            setAnalysisStep(data.message);
            setAnalysisProgress(data.progress);
          } else if (data.type === 'complete') {
            setAnalysisProgress(100);
            showToast("Analysis complete!");
            setAnalyzing(false);
            setShowNewAssessment(false);
            fetchAllData(user);
          }
        }
      }
    }
  };

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <div className="dashboard-layout dashboard-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <img src="/logo.png" alt="Logo" style={{ width: '32px' }} />
          <h2>Form-Fit</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /> Dashboard</button>
          <button className="nav-item" onClick={() => setActiveTab('learners')}><Users size={20} /> Learners</button>
          <button className="nav-item" onClick={() => setActiveTab('assessments')}><Search size={20} /> Assessments</button>
          <button className="nav-item" onClick={() => setActiveTab('tools')}><Printer size={20} /> 3D Tools</button>
          <button className="nav-item" onClick={() => setActiveTab('reports')}><FileText size={20} /> Reports</button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', gap: '8px', color: '#ef4444' }} onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="user-profile-sm">
            <div className="avatar-sm" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <span>{user?.email}</span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="content-area">
            <div className="banner">
              <h1>Empowering Inclusive Learning with AI</h1>
              <p>Custom assistive tools at the push of a button.</p>
            </div>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div className="card"><h3>{learners.length}</h3><p>Learners</p></div>
              <div className="card"><h3>{assessments.length}</h3><p>Assessments</p></div>
              <div className="card"><h3>{assessments.filter(a => a.recommendedToolId).length}</h3><p>Tools Designed</p></div>
            </div>
          </div>
        )}

        {activeTab === 'learners' && (
          <div className="content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Learners</h2>
              <button className="primary-btn-sm" onClick={() => setShowAddLearner(true)}>Add Learner</button>
            </div>
            <div className="learners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {learners.map(l => (
                <div key={l.id} className="card">
                  <h4>{l.name}</h4>
                  <p>Age: {l.age}</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>{l.disabilityInfo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="content-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>AI Assessments</h2>
              <button className="primary-btn-sm" onClick={() => setShowNewAssessment(true)}>New Assessment</button>
            </div>
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Learner</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Issue</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{learners.find(l => l.id === a.learnerId)?.name}</td>
                      <td style={{ padding: '10px' }}>{a.analysisResults?.issue}</td>
                      <td style={{ padding: '10px' }}><span style={{ color: '#10b981' }}>● Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Assessment Modal */}
        {showNewAssessment && (
          <div className="modal-overlay">
            <div className="card modal-content">
              <h3>Run AI Assessment</h3>
              {!analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  <select className="text-input" onChange={e => setSelectedLearnerId(e.target.value)}>
                    <option value="">Select Learner</option>
                    {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <input type="file" className="text-input" onChange={e => setAssessmentFile(e.target.files[0])} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="primary-btn-sm" onClick={runAssessment}>Start</button>
                    <button className="secondary-btn-sm" onClick={() => setShowNewAssessment(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="premium-assessment">
                  <span className="fake-step-text">{fakeStep}</span>
                  <div className="marching-ants-wrapper">
                    <div className="analysis-progress-bar-bg">
                      <div className="analysis-progress-bar-fill" style={{ width: `${analysisProgress}%` }}></div>
                    </div>
                  </div>
                  <p style={{ color: '#fff', textAlign: 'center', marginTop: '10px' }}>{analysisStep}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Learner Modal */}
        {showAddLearner && (
          <div className="modal-overlay">
            <div className="card modal-content">
              <h3>New Learner</h3>
              <form onSubmit={handleAddLearner} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <input className="text-input" placeholder="Name" onChange={e => setNewLearnerData({ ...newLearnerData, name: e.target.value })} />
                <input className="text-input" type="number" placeholder="Age" onChange={e => setNewLearnerData({ ...newLearnerData, age: e.target.value })} />
                <textarea className="text-input" placeholder="Needs" onChange={e => setNewLearnerData({ ...newLearnerData, disabilityInfo: e.target.value })} />
                <button className="primary-btn-sm" type="submit">Save</button>
                <button className="secondary-btn-sm" type="button" onClick={() => setShowAddLearner(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
