import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, storage } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  LogOut, LayoutDashboard, Users, Search, 
  Settings, Bell, Zap, GraduationCap, 
  ClipboardCheck, Printer, FileText, Upload,
  Camera, X, CheckCircle, AlertCircle, Info,
  ChevronDown, ChevronUp
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddLearner, setShowAddLearner] = useState(false);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newLearnerData, setNewLearnerData] = useState({ name: '', age: '', disabilityInfo: '' });
  const [assessmentFile, setAssessmentFile] = useState(null);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [learners, setLearners] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedReportId, setExpandedReportId] = useState(null);

  // Helper: Clean up LaTeX boilerplate if present
  const cleanReportContent = (content) => {
    if (!content) return '';
    
    let cleaned = content
      // 1. Remove full LaTeX document structure
      .replace(/\\documentclass\{[\s\S]*?\\begin\{document\}/g, '')
      .replace(/\\end\{document\}/g, '')
      .replace(/\\title\{[\s\S]*?\}/g, '')
      .replace(/\\author\{[\s\S]*?\}/g, '')
      .replace(/\\date\{[\s\S]*?\}/g, '')
      .replace(/\\maketitle/g, '')
      .replace(/\\thispagestyle\{[\s\S]*?\}/g, '')
      .replace(/\\newpage/g, '')
      
      // 2. Translate common structural commands to Markdown
      .replace(/\\section\*?\{([\s\S]*?)\}/g, '## **$1**')
      .replace(/\\subsection\*?\{([\s\S]*?)\}/g, '### **$1**')
      .replace(/\\subsubsection\*?\{([\s\S]*?)\}/g, '#### **$1**')
      .replace(/\\textbf\{([\s\S]*?)\}/g, '**$1**')
      .replace(/\\textit\{([\s\S]*?)\}/g, '*$1*')
      
      // 3. Handle Lists
      .replace(/\\begin\{itemize\}(\[.*?\])?/g, '')
      .replace(/\\end\{itemize\}/g, '')
      .replace(/\\begin\{enumerate\}(\[.*?\])?/g, '')
      .replace(/\\end\{enumerate\}/g, '')
      .replace(/\\item/g, '\n* ')
      
      // 4. Clean up other common commands and special chars
      .replace(/\\label=\{[\s\S]*?\}/g, '')
      .replace(/\\large/g, '')
      .replace(/\\small/g, '')
      .replace(/\\centering/g, '')
      .replace(/\\\&/g, '&')
      .replace(/\\%/g, '%')
      .replace(/\\\$/g, '$')
      .replace(/\\_/g, '_')
      .replace(/\\\{/g, '{')
      .replace(/\\\}/g, '}')
      
      // 5. Handle double backslashes for line breaks
      .replace(/\\\\/g, '\n\n')
      .trim();

    return cleaned;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all data from Admin SDK backend
  const fetchAllData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [learnersRes, assessmentsRes, classesRes, tasksRes, activitiesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/learners`, { headers }),
        fetch(`${BACKEND_URL}/api/assessments`, { headers }),
        fetch(`${BACKEND_URL}/api/classes`, { headers }),
        fetch(`${BACKEND_URL}/api/tasks`, { headers }),
        fetch(`${BACKEND_URL}/api/activities`, { headers }),
      ]);

      if (learnersRes.ok) setLearners(await learnersRes.json());
      if (assessmentsRes.ok) setAssessments(await assessmentsRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
    } catch (err) {
      console.error('Failed to fetch data from backend:', err);
      showToast(`Backend connection failed. Please ensure the local server is running on port 3001.`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let pollInterval;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Clear previous polling
      if (pollInterval) clearInterval(pollInterval);

      if (currentUser) {
        // Initial fetch
        fetchAllData(currentUser);
        // Poll every 10 seconds for updates
        pollInterval = setInterval(() => fetchAllData(currentUser), 10000);
      } else {
        setLoading(false);
      }
    });

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubAuth();
      if (pollInterval) clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [fetchAllData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) { console.error('Logout failed', err); }
  };



  const handleAddLearner = async (e) => {
    e.preventDefault();
    if (!newLearnerData.name || !newLearnerData.age) {
      showToast("Please fill in all fields.", 'error');
      return;
    }
    if (!user) {
      showToast("You must be logged in to add a learner.", 'error');
      return;
    }

    try {
      console.log("Adding learner via Admin SDK backend...");
      const token = await user.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/learners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newLearnerData.name,
          age: newLearnerData.age,
          disabilityInfo: newLearnerData.disabilityInfo,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add learner');
      
      console.log("Learner added via Admin SDK:", result.learnerId);
      setNewLearnerData({ name: '', age: '', disabilityInfo: '' });
      setShowAddLearner(false);
      showToast("Learner added successfully!");
      fetchAllData(user);
    } catch (err) { 
      console.error('AddLearner Error:', err); 
      showToast(`Error adding learner: ${err.message}`, 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) setAssessmentFile(file);
  };

  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      showToast("Camera access denied. Please check your browser permissions.", 'error');
      setUseCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setAssessmentFile(file);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setUseCamera(false);
  };

  const runAssessment = async () => {
    if (!assessmentFile || !selectedLearnerId) {
      showToast("Please select a learner and provide media.", 'error');
      return;
    }
    
    setAnalyzing(true);
    setAnalysisStep('Initializing...');
    setAnalysisProgress(5);

    try {
      // 1. Prepare file for AI (Convert to base64)
      setAnalysisStep('Preparing media for AI...');
      setAnalysisProgress(10);
      
      const arrayBuffer = await assessmentFile.arrayBuffer();
      const mediaBase64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const mimeType = assessmentFile.type || 'image/jpeg';
      const mediaType = assessmentFile.type.includes('video') ? 'video' : 'image';

      // 2. Call local backend for analysis
      setAnalysisStep('Starting AI Analysis...');
      setAnalysisProgress(15);
      
      const token = await user.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mediaBase64,
          mimeType,
          mediaType,
          learnerId: selectedLearnerId
        }),
      });

      if (!response.ok) throw new Error('Backend failed to start analysis');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.type === 'progress') {
                setAnalysisStep(data.message);
                setAnalysisProgress(data.progress);
              } else if (data.type === 'complete') {
                console.log("Assessment completed via SSE:", data.assessmentId);
                setAnalysisProgress(100);
                setAnalysisStep('Analysis complete!');
                
                setTimeout(() => {
                  setAssessmentFile(null);
                  setSelectedLearnerId('');
                  setShowNewAssessment(false);
                  showToast('Assessment analysis completed successfully!');
                  fetchAllData(user);
                  setAnalyzing(false);
                }, 1000);
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              console.warn("Soft parse error for SSE chunk:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Assessment failed', err);
      showToast(`AI Assessment Error: ${err.message}`, 'error');
      setAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? <CheckCircle size={20} /> : 
             toast.type === 'error' ? <AlertCircle size={20} /> : 
             <Info size={20} />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar no-print">
        <div className="logo-section">
          <img src="/logo.png" alt="Form-Fit Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <h2>Form-Fit</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'learners' ? 'active' : ''}`} onClick={() => setActiveTab('learners')}>
            <Users size={20} /> Learners
          </button>
          <button className={`nav-item ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => setActiveTab('assessments')}>
            <Search size={20} /> Assessments
          </button>
          <button className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>
            <Printer size={20} /> 3D Tools
          </button>
          <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <FileText size={20} /> Report
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar no-print">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className="top-bar-right">
            <button 
              className="icon-btn" title="Sync Data" 
              onClick={() => {
                showToast("Syncing data with backend...");
                fetchAllData(user);
              }}
              style={{ marginRight: 12 }}
            >
              <Zap size={20} className={loading ? "pulse-icon" : ""} />
            </button>
            <Bell size={20} className="header-icon" />
            <div className="user-profile-sm">
              <div className="avatar-sm">{(user?.email || 'U').charAt(0).toUpperCase()}</div>
              <span className="user-name">{user?.email?.split('@')[0] || 'User'}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {loading ? (
            <div className="loading-screen">
              <div className="loader"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading Dashboard Data...</p>
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              <div className="banner no-print">
                <div className="banner-content">
                  <p className="banner-label">Innovation Hub</p>
                  <h1>Empowering Learners through Personalized Ergonomic AI</h1>
                  <button className="banner-btn" onClick={() => setActiveTab('reports')}>Review Recent Reports</button>
                </div>
                <div className="banner-bg-icon">🚀</div>
              </div>

              <div className="stats-grid no-print">
                <div className="card stat-card">
                  <div className="icon-box yellow-light"><GraduationCap size={24} /></div>
                  <div>
                    <h3>{learners.length}</h3>
                    <p>Total Learners</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="icon-box blue-light"><Search size={24} /></div>
                  <div>
                    <h3>{assessments.filter(a => a.status === 'pending').length}</h3>
                    <p>Pending Analysis</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="icon-box orange-light"><Printer size={24} /></div>
                  <div>
                    <h3>{assessments.filter(a => a.recommendedToolId).length}</h3>
                    <p>3D Tools Ready</p>
                  </div>
                </div>
              </div>

              <div className="card recent-activity no-print">
                <div className="card-header">
                  <h3>Recent Class Progress</h3>
                  <button className="link-btn">See All</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Class</th><th>Progress</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {classes.map(c => (
                      <tr key={c.id}>
                        <td>
                          <h3 style={{fontSize: '1rem', margin: 0}}>{c.name}</h3>
                          <p className="learner-meta" style={{margin: 0}}>Class: Main Campus</p>
                        </td>
                        <td>
                          <div style={{width: '100%', backgroundColor: '#eee', height: 8, borderRadius: 4, overflow: 'hidden'}}>
                            <div style={{width: `${c.progress || 0}%`, backgroundColor: 'var(--primary-color)', height: '100%'}}></div>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge on-progress">Active</span>
                        </td>
                      </tr>
                    ))}
                    {classes.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No class data found</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'learners' ? (
            <div className="learners-page">
              <div className="page-header no-print">
                <h2>Learner Management</h2>
                <button className="primary-btn-sm" onClick={() => setShowAddLearner(true)}>+ Add New Learner</button>
              </div>

              {showAddLearner && (
                <div className="modal-overlay">
                  <div className="card modal-content" style={{maxWidth: 400}}>
                    <h3>Add New Learner</h3>
                    <form onSubmit={handleAddLearner} style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16}}>
                      <input 
                        type="text" placeholder="Learner Full Name" className="text-input" 
                        value={newLearnerData.name} onChange={e => setNewLearnerData({...newLearnerData, name: e.target.value})} 
                      />
                      <input 
                        type="number" placeholder="Age" className="text-input" 
                        value={newLearnerData.age} onChange={e => setNewLearnerData({...newLearnerData, age: e.target.value})} 
                      />
                      <textarea 
                        placeholder="Special Needs / Disability Details (e.g., No right hand, limited mobility)" className="text-input" 
                        style={{minHeight: 80, resize: 'vertical'}}
                        value={newLearnerData.disabilityInfo} onChange={e => setNewLearnerData({...newLearnerData, disabilityInfo: e.target.value})} 
                      />
                      <div className="modal-actions">
                        <button type="button" className="secondary-btn-sm" onClick={() => setShowAddLearner(false)}>Cancel</button>
                        <button type="submit" className="primary-btn-sm">Save Learner</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="learners-grid no-print">
                {learners.map(l => (
                  <div key={l.id} className="card learner-card">
                    <div className="learner-card-header">
                      <div className="avatar-md">👤</div>
                    </div>
                    <h4>{l.name}</h4>
                    <p className="learner-meta">Age: {l.age}</p>
                    <div className="learner-details" style={{marginTop: 12}}>
                      <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500}}>Special Needs:</p>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 4}}>{l.disabilityInfo || 'General Ergonomic Review'}</p>
                    </div>
                  </div>
                ))}
                {learners.length === 0 && (
                  <div className="card" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
                    <Users size={48} color="#ccc" style={{marginBottom: 16, margin: '0 auto'}} />
                    <p>No learners found in Firestore. Add your first learner to get started.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'assessments' ? (
            <div className="assessments-page">
              <div className="page-header no-print">
                <h2>AI Assessments</h2>
                <button className="primary-btn-sm" onClick={() => setShowNewAssessment(true)}>+ Run New Assessment</button>
              </div>

              {showNewAssessment && (
                <div className="modal-overlay">
                  <div className="card modal-content" style={{maxWidth: 600}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <h3>New AI Assessment</h3>
                      <button className="icon-btn" onClick={() => {setShowNewAssessment(false); stopCamera();}}><X size={20}/></button>
                    </div>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16}}>
                      <select 
                        className="text-input" value={selectedLearnerId} 
                        onChange={e => setSelectedLearnerId(e.target.value)}
                      >
                        <option value="">Select Learner...</option>
                        {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                      
                      {!useCamera ? (
                        <div style={{display: 'flex', gap: 12}}>
                          <div 
                            className="upload-dropzone" 
                            onClick={() => fileInputRef.current.click()}
                            style={{flex: 1, border: assessmentFile ? '2px solid var(--primary-color)' : '2px dashed #ddd'}}
                          >
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
                            {assessmentFile ? (
                              <div style={{textAlign: 'center'}}><CheckCircle color="var(--primary-color)" /> <p>{assessmentFile.name}</p></div>
                            ) : (
                              <div style={{textAlign: 'center'}}><Upload size={40} color="#666" /><p>Upload Media</p></div>
                            )}
                          </div>
                          
                          <div 
                            className="upload-dropzone" 
                            onClick={startCamera}
                            style={{flex: 1}}
                          >
                            <Camera size={40} color="#666" />
                            <p>Use Camera</p>
                          </div>
                        </div>
                      ) : (
                        <div className="camera-view">
                          <video ref={videoRef} autoPlay playsInline style={{width: '100%', borderRadius: 8}}></video>
                          <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
                          <div className="modal-actions" style={{justifyContent: 'center'}}>
                            <button className="primary-btn-sm" onClick={capturePhoto}>Take Photo</button>
                            <button className="secondary-btn-sm" onClick={stopCamera}>Cancel Camera</button>
                          </div>
                        </div>
                      )}

                      {analyzing ? (
                        <div className="analysis-progress-container">
                          <div className="analysis-progress-header">
                            <Zap size={20} className="pulse-icon" />
                            <span>{analysisStep}</span>
                          </div>
                          <div className="analysis-progress-bar-bg">
                            <div className="analysis-progress-bar-fill" style={{ width: `${analysisProgress}%` }}></div>
                          </div>
                          <div className="analysis-steps-indicators">
                            <div className={`step-dot ${analysisProgress >= 25 ? 'active' : ''}`}>
                              {analysisProgress > 25 ? <CheckCircle size={14} /> : <div className="dot"></div>}
                              <span>Observe</span>
                            </div>
                            <div className={`step-dot ${analysisProgress >= 50 ? 'active' : ''}`}>
                              {analysisProgress > 50 ? <CheckCircle size={14} /> : <div className="dot"></div>}
                              <span>Analyze</span>
                            </div>
                            <div className={`step-dot ${analysisProgress >= 75 ? 'active' : ''}`}>
                              {analysisProgress > 75 ? <CheckCircle size={14} /> : <div className="dot"></div>}
                              <span>Recommend</span>
                            </div>
                            <div className={`step-dot ${analysisProgress >= 90 ? 'active' : ''}`}>
                              {analysisProgress >= 100 ? <CheckCircle size={14} /> : <div className="dot"></div>}
                              <span>Finalize</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="modal-actions">
                          <button className="secondary-btn-sm" onClick={() => {setShowNewAssessment(false); setAssessmentFile(null); stopCamera();}}>Cancel</button>
                          <button 
                            className="primary-btn-sm" disabled={!assessmentFile || !selectedLearnerId || useCamera}
                            onClick={runAssessment}
                          >
                            Start Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="card assessment-log-card no-print">
                <div className="card-header">
                  <h3>Assessment History</h3>
                  <span className="badge-count">{assessments.length} Records</span>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Media</th>
                        <th style={{ width: '150px' }}>Learner</th>
                        <th>Analysis Finding</th>
                        <th style={{ width: '120px', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map(a => (
                        <tr key={a.id} className="assessment-row">
                          <td>
                            <div className="media-preview-container">
                              {a.mediaType === 'image' 
                                ? <img src={a.mediaUrl} alt="Assessment" className="media-thumb" /> 
                                : <div className="video-icon-placeholder">📹</div>}
                            </div>
                          </td>
                          <td>
                            <div className="learner-info">
                              <span className="learner-name">{learners.find(l => l.id === a.learnerId)?.name || 'Unknown'}</span>
                              <span className="learner-id-tag">#{a.learnerId.substring(0, 5)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="issue-details">
                              <p className="issue-text">{a.analysisResults?.issue || 'Analysis pending...'}</p>
                              {a.toolDescription && <span className="tool-suggestion">Rec: {a.toolDescription}</span>}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`status-badge-new ${a.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {assessments.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#888'}}>No assessments found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'tools' ? (
            <div className="tools-page no-print">
              <div className="page-header">
                <h2>3D Printed Assistive Tools</h2>
              </div>
              <div className="learners-grid">
                {assessments.filter(a => a.recommendedToolId).map(a => (
                  <div key={`tool-${a.id}`} className="card learner-card">
                    <div className="learner-card-header">
                      <div className="avatar-md">🖨️</div>
                    </div>
                    <h4>{a.toolDescription || a.recommendedToolId.replace('_', ' ')}</h4>
                    <p className="learner-meta">For: {learners.find(l => l.id === a.learnerId)?.name}</p>
                    <div className="learner-score" style={{marginTop: 16}}>
                      <button className="primary-btn-sm" style={{width: '100%'}}>Download STL</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="reports-page">
              <div className="page-header no-print">
                <h2>Ergonomic Reports</h2>
                <button className="primary-btn-sm" onClick={handlePrint}><Printer size={16} /> Print All Reports</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {assessments.filter(a => a.status === 'completed').map(a => {
                  const isExpanded = expandedReportId === a.id;
                  const date = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000).toLocaleDateString() : 'Recent';
                  
                  return (
                    <div key={`report-${a.id}`} className={`report-container card ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="report-header clickable" 
                        onClick={() => setExpandedReportId(isExpanded ? null : a.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="icon-box blue-light" style={{ padding: 8 }}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <h3>Report: {learners.find(l => l.id === a.learnerId)?.name || 'Unknown Learner'}</h3>
                            <p className="report-meta">{date} • {a.analysisResults?.issue || 'Ergonomic Review'}</p>
                          </div>
                        </div>
                        <button className="expand-toggle">
                          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <>
                          <div className="report-content latex-content">
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                            >
                              {cleanReportContent(a.reportSummary || 'Generating report...')}
                            </ReactMarkdown>
                          </div>
                          <div className="report-footer no-print">
                            <button className="primary-btn-sm" onClick={(e) => {
                              e.stopPropagation();
                              const win = window.open('', '_blank');
                              win.document.write(`<html><head><title>Report</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"></head><body>${document.querySelector('.latex-content').innerHTML}</body></html>`);
                              win.print();
                            }}>Print This Report</button>
                            <button className="secondary-btn-sm" onClick={() => setExpandedReportId(null)} style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ChevronUp size={16} /> Collapse Report
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Right Panel */}
      <aside className="right-panel no-print">
        <h3>My profile</h3>
        <div className="profile-section">
          <div className="avatar-lg">👩‍💻</div>
          <h3>{user?.email?.split('@')[0] || 'User'}</h3>
          <p className="profile-meta">{user?.email}</p>
        </div>

        <div className="activity-section">
          <div className="section-header"><h4>Activity</h4></div>
          <div className="chart-bar-container">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className={`chart-bar ${i === 3 ? 'active' : ''}`} style={{height: `${h}%`}}></div>
            ))}
          </div>
        </div>

        <div className="tasks-section">
          <h4>List Task</h4>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="card task-card">
                <div className="task-icon">{task.icon || '📌'}</div>
                <div>
                  <p className="task-title">{task.title}</p>
                  <p className="task-due">{task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <style>{`
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          min-width: 320px;
          max-width: 480px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          animation: toast-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          font-size: 0.95rem;
          font-weight: 500;
          backdrop-filter: blur(12px);
        }
        .toast-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
        }
        .toast-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
        }
        .toast-info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
        }
        .toast-icon { display: flex; align-items: center; flex-shrink: 0; }
        .toast-message { flex: 1; line-height: 1.4; }
        .toast-close {
          background: none; border: none; color: inherit; cursor: pointer;
          opacity: 0.7; transition: opacity 0.2s; padding: 2px; display: flex;
        }
        .toast-close:hover { opacity: 1; }
        @keyframes toast-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 90%; }
        .text-input { padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .upload-dropzone { 
          padding: 40px; border: 2px dashed #ddd; border-radius: 12px; 
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .upload-dropzone:hover { background: #f8f9fa; border-color: var(--primary-color); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .latex-content { font-family: 'Inter', sans-serif; line-height: 1.8; color: #333; }
        .latex-content h2, .latex-content h3, .latex-content h4 { font-weight: 800; color: #1a202c; margin-top: 2rem; margin-bottom: 1rem; }
        .latex-content p { margin-bottom: 1.2rem; }
        .latex-content strong { font-weight: 700; color: #000; }
        .latex-content section { margin-top: 24px; }
        .report-container { padding: 32px; margin-bottom: 24px; }
        .report-header { border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 24px; }
        
        .analysis-progress-container {
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
          margin-top: 16px;
          border: 1px solid #e2e8f0;
        }
        .analysis-progress-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--primary-color);
          font-weight: 600;
        }
        .pulse-icon {
          animation: icon-pulse 2s infinite;
        }
        @keyframes icon-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .analysis-progress-bar-bg {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .analysis-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .analysis-steps-indicators {
          display: flex;
          justify-content: space-between;
        }
        .step-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.3s;
        }
        .step-dot.active {
          color: var(--primary-color);
        }
        .step-dot .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
        }
        .step-dot.active .dot {
          background: var(--primary-color);
          box-shadow: 0 0 0 4px #dbeafe;
        }
        .step-dot svg {
          color: #10b981;
        }

        /* --- Premium Assessment & Report Styling --- */
        .assessment-log-card { padding: 0; overflow: hidden; }
        .assessment-log-card .card-header { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .badge-count { background: #f0f4f8; color: #555; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 16px 24px; background: #fafafa; color: #666; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-table td { padding: 16px 24px; border-top: 1px solid #f0f0f0; vertical-align: middle; }
        .assessment-row:hover { background: #fcfcfc; }
        
        .media-preview-container { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; border: 1px solid #eef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .media-thumb { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
        .media-thumb:hover { transform: scale(1.1); }
        .video-icon-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; font-size: 1.2rem; }
        
        .learner-info { display: flex; flex-direction: column; gap: 2px; }
        .learner-name { font-weight: 600; color: #333; font-size: 0.95rem; }
        .learner-id-tag { font-size: 0.7rem; color: #999; font-family: monospace; }
        
        .issue-details { display: flex; flex-direction: column; gap: 4px; }
        .issue-text { margin: 0; color: #444; font-size: 0.95rem; line-height: 1.4; }
        .tool-suggestion { display: inline-block; font-size: 0.75rem; background: #fff8e1; color: #f57f17; padding: 2px 8px; border-radius: 4px; font-weight: 500; border: 1px solid #ffecb3; width: fit-content; }
        
        .status-badge-new { padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-completed { background: #e6f7ef; color: #008a4e; }
        .status-pending { background: #fff4e6; color: #d97706; }

        .latex-content { font-family: 'Inter', sans-serif; line-height: 1.8; color: #333; }
        .report-container { border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eee; overflow: hidden; margin-bottom: 20px; transition: all 0.3s ease; }
        .report-container.expanded { border-color: var(--primary-color); box-shadow: 0 15px 40px rgba(0,0,0,0.12); margin-bottom: 30px; }
        .report-header.clickable { background: #f8fafc; padding: 20px 32px; border-bottom: 1px solid transparent; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
        .report-container.expanded .report-header.clickable { border-bottom: 1px solid #edf2f7; background: #fff; }
        .report-header.clickable:hover { background: #f1f5f9; }
        .report-header h3 { margin: 0; color: #1a202c; font-size: 1.1rem; }
        .report-meta { margin: 4px 0 0 0; color: #718096; font-size: 0.85rem; }
        .expand-toggle { background: #f1f5f9; border: none; color: #64748b; cursor: pointer; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .report-container.expanded .expand-toggle { background: var(--primary-color); color: white; }
        .report-content { padding: 32px; animation: slideDown 0.3s ease-out; }
        .report-footer { padding: 16px 32px; background: #fdfdfd; border-top: 1px solid #f7f7f7; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media print {
          .no-print { display: none !important; }
          .toast-notification { display: none !important; }
          .main-content { margin: 0; padding: 0; width: 100%; }
          .content-area { padding: 0; }
          body { background: white; }
          .card { border: none; box-shadow: none; margin: 0; padding: 0; }
          .report-container { page-break-after: always; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
