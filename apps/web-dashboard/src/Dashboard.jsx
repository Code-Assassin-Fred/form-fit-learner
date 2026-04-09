import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage, functions } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  LogOut, LayoutDashboard, Users, Search, 
  Settings, Bell, Zap, GraduationCap, 
  ClipboardCheck, Printer, FileText, Upload,
  Camera, X, CheckCircle
} from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddLearner, setShowAddLearner] = useState(false);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newLearnerData, setNewLearnerData] = useState({ name: '', age: '' });
  const [assessmentFile, setAssessmentFile] = useState(null);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [learners, setLearners] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const qLearners = query(collection(db, 'learners'));
    const unsubLearners = onSnapshot(qLearners, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLearners(data);
      setLoading(false); // Learners are primary data, show UI once they load
    }, (err) => {
      console.error("Learners load error", err);
      setLoading(false);
    });

    const qClasses = query(collection(db, 'classes'));
    const unsubClasses = onSnapshot(qClasses, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(data);
    }, (err) => console.error("Classes load error", err));

    const qTasks = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    }, (err) => console.error("Tasks load error", err));

    const qActivities = query(collection(db, 'activities'));
    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(data);
    }, (err) => console.error("Activities load error", err));

    const qAssessments = query(collection(db, 'assessments'));
    const unsubAssessments = onSnapshot(qAssessments, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssessments(data);
    }, (err) => console.error("Assessments load error", err));

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubAuth(); unsubLearners(); unsubClasses(); 
      unsubTasks(); unsubActivities(); unsubAssessments();
      clearTimeout(timeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) { console.error('Logout failed', err); }
  };

  const handleAddLearner = async (e) => {
    e.preventDefault();
    if (!newLearnerData.name || !newLearnerData.age) {
      alert("Please fill in all fields.");
      return;
    }
    if (!user) {
      alert("You must be logged in to add a learner.");
      return;
    }

    try {
      console.log("Adding learner via Cloud Function...");
      const addLearnerFn = httpsCallable(functions, 'addLearner');
      await addLearnerFn({
        name: newLearnerData.name,
        age: newLearnerData.age
      });
      
      setNewLearnerData({ name: '', age: '' });
      setShowAddLearner(false);
      alert("Learner added successfully!");
    } catch (err) { 
      console.error('Failed to add learner', err); 
      alert(`Error adding learner: ${err.message}`);
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
      alert("Camera access denied. Please check your browser permissions.");
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
      alert("Please select a learner and provide media.");
      return;
    }
    setAnalyzing(true);
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `assessments/${user.uid}/${Date.now()}_${assessmentFile.name}`);
      await uploadBytes(storageRef, assessmentFile);
      const mediaUrl = await getDownloadURL(storageRef);

      // 2. Call Cloud Function
      const analyzeMedia = httpsCallable(functions, 'analyzeMedia');
      await analyzeMedia({
        mediaUrl,
        mediaType: assessmentFile.type.includes('video') ? 'video' : 'image',
        learnerId: selectedLearnerId
      });

      setAssessmentFile(null);
      setSelectedLearnerId('');
      setShowNewAssessment(false);
      alert("Assessment analysis completed successfully!");
    } catch (err) {
      console.error('Assessment failed', err);
      alert(`AI Assessment Error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-container">
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
                        <td>{c.name}</td>
                        <td>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{width: `${c.progress}%`}}></div>
                          </div>
                        </td>
                        <td><span className="status-badge on-progress">{c.status}</span></td>
                      </tr>
                    ))}
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
                      <span className={`status-badge ${l.status === 'Critical' ? 'critical' : 'excellent'}`}>{l.status?.toUpperCase()}</span>
                    </div>
                    <h4>{l.name}</h4>
                    <p className="learner-meta">Age: {l.age} • {l.class}</p>
                    <div className="learner-score">
                      <span>Posture Score:</span>
                      <span className={`score-value ${parseInt(l.score) < 50 ? 'low' : 'high'}`}>{l.score}</span>
                    </div>
                  </div>
                ))}
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

                      <div className="modal-actions">
                        <button className="secondary-btn-sm" onClick={() => {setShowNewAssessment(false); setAssessmentFile(null); stopCamera();}}>Cancel</button>
                        <button 
                          className="primary-btn-sm" disabled={!assessmentFile || !selectedLearnerId || analyzing || useCamera}
                          onClick={runAssessment}
                        >
                          {analyzing ? 'AI Analyzing...' : 'Start Analysis'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card recent-activity no-print">
                <table className="data-table">
                  <thead>
                    <tr><th>Media</th><th>Learner</th><th>Issue</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {assessments.map(a => (
                      <tr key={a.id}>
                        <td>
                          {a.mediaType === 'image' 
                            ? <img src={a.mediaUrl} alt="Assessment" style={{width: 60, height: 60, borderRadius: 8, objectFit: 'cover'}} /> 
                            : '📹 Video'}
                        </td>
                        <td>{learners.find(l => l.id === a.learnerId)?.name || 'Unknown'}</td>
                        <td>{a.analysisResults?.issue || 'Pending'}</td>
                        <td><span className={`status-badge ${a.status === 'completed' ? 'excellent' : 'on-progress'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                    {assessments.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No assessments yet</td></tr>}
                  </tbody>
                </table>
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
                {assessments.map(a => (
                  <div key={`report-${a.id}`} className="report-container card">
                    <div className="report-header">
                      <h3>Report: {learners.find(l => l.id === a.learnerId)?.name}</h3>
                      <p>{new Date(a.timestamp?.seconds * 1000).toLocaleDateString()}</p>
                    </div>
                    <div className="report-content latex-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {a.reportSummary || 'Generating report...'}
                      </ReactMarkdown>
                    </div>
                    <div className="report-footer no-print">
                      <button className="secondary-btn-sm" onClick={() => {
                        const win = window.open('', '_blank');
                        win.document.write(`<html><head><title>Report</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"></head><body>${document.querySelector('.latex-content').innerHTML}</body></html>`);
                        win.print();
                      }}>Print This Report</button>
                    </div>
                  </div>
                ))}
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
        .latex-content section { margin-top: 24px; }
        .report-container { padding: 32px; margin-bottom: 24px; }
        .report-header { border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 24px; }
        
        @media print {
          .no-print { display: none !important; }
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
