import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, Search, 
  Settings, Bell, Zap, GraduationCap, 
  ClipboardCheck, Printer, FileText 
} from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

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
    }, (error) => {
      console.error("Error fetching learners: ", error);
    });

    const qClasses = query(collection(db, 'classes'));
    const unsubClasses = onSnapshot(qClasses, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching classes: ", error);
      setLoading(false);
    });

    const qTasks = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
    });

    const qActivities = query(collection(db, 'activities'));
    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(data);
    }, (error) => {
      console.error("Error fetching activities: ", error);
    });

    const qAssessments = query(collection(db, 'assessments'));
    const unsubAssessments = onSnapshot(qAssessments, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssessments(data);
    }, (error) => {
      console.error("Error fetching assessments: ", error);
    });

    // Provide a fallback to disable loading state if everything fails.
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      unsubAuth();
      unsubLearners();
      unsubClasses();
      unsubTasks();
      unsubActivities();
      unsubAssessments();
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
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
          <div className="premium-card">
            <Zap size={24} className="zap-icon" />
            <p>Upgrade Premium</p>
            <button className="premium-btn">Get Premium</button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
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
              <div className="banner">
                <div className="banner-content">
                  <p className="banner-label">Innovation Hub</p>
                  <h1>Empowering Learners through Personalized Ergonomic AI</h1>
                  <button className="banner-btn">Review Recent Reports</button>
                </div>
                <div className="banner-bg-icon">🚀</div>
              </div>

              <div className="stats-grid">
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
                    <h3>{assessments.length}</h3>
                    <p>Prints Completed</p>
                  </div>
                </div>
              </div>

              <div className="card recent-activity">
                <div className="card-header">
                  <h3>Recent Class Progress</h3>
                  <button className="link-btn">See All</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className="class-info">
                            <div className="class-icon">🏫</div>
                            <div>
                              <p className="class-name">{c.name}</p>
                              <p className="class-meta">{c.instructor} • {c.time}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{width: `${c.progress}%`}}></div>
                            </div>
                            <span className="progress-text">{c.progress}% Finish</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge on-progress">{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'learners' ? (
            <div className="learners-page">
              <div className="page-header">
                <h2>Learner Management</h2>
                <button className="primary-btn-sm">+ Add New Learner</button>
              </div>
              <div className="learners-grid">
                {learners.map(l => (
                  <div key={l.id} className="card learner-card">
                    <div className="learner-card-header">
                      <div className="avatar-md">👤</div>
                      <span className={`status-badge ${l.status === 'Critical' ? 'critical' : 'excellent'}`}>
                        {l.status.toUpperCase()}
                      </span>
                    </div>
                    <h4>{l.name}</h4>
                    <p className="learner-meta">{l.class}</p>
                    <div className="learner-score">
                      <span>Posture Score:</span>
                      <span className={`score-value ${l.score === '42%' ? 'low' : 'high'}`}>{l.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'assessments' ? (
            <div className="assessments-page">
              <div className="page-header">
                <h2>AI Assessments</h2>
              </div>
              <div className="card recent-activity">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Media</th>
                      <th>Learner ID</th>
                      <th>Issue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.length > 0 ? assessments.map(a => (
                      <tr key={a.id}>
                        <td>
                          {a.mediaType === 'image' 
                            ? <img src={a.mediaUrl} alt="Assessment" style={{width: 60, height: 60, borderRadius: 8, objectFit: 'cover'}} /> 
                            : '📹 Video'}
                        </td>
                        <td>{a.learnerId}</td>
                        <td>{a.analysisResults?.issue || 'Pending'}</td>
                        <td><span className={`status-badge ${a.status === 'completed' ? 'excellent' : 'on-progress'}`}>{a.status}</span></td>
                      </tr>
                    )) : <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No assessments yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'tools' ? (
            <div className="tools-page">
              <div className="page-header">
                <h2>3D Printed Assistive Tools</h2>
              </div>
              <div className="learners-grid">
                {assessments.filter(a => a.recommendedToolId).map(a => (
                  <div key={`tool-${a.id}`} className="card learner-card">
                    <div className="learner-card-header">
                      <div className="avatar-md">🖨️</div>
                    </div>
                    <h4>{a.recommendedToolId.replace('_', ' ')}</h4>
                    <p className="learner-meta">For Learner: {a.learnerId}</p>
                    <div className="learner-score" style={{marginTop: 16}}>
                      <button className="primary-btn-sm" style={{width: '100%'}}>Download STL</button>
                    </div>
                  </div>
                ))}
                {assessments.filter(a => a.recommendedToolId).length === 0 && <p>No tools recommended yet.</p>}
              </div>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="reports-page">
              <div className="page-header">
                <h2>AI Ergonomic Reports</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {assessments.map(a => (
                  <div key={`report-${a.id}`} className="card" style={{padding: '24px'}}>
                    <h3 style={{marginBottom: '12px'}}>Report for {a.learnerId}</h3>
                    <p style={{lineHeight: 1.6, color: 'var(--text-secondary)'}}>{a.reportSummary || 'Generating report...'}</p>
                  </div>
                ))}
                {assessments.length === 0 && <p>No reports generated yet.</p>}
              </div>
            </div>
          ) : (
            <div className="card empty-state">
              <h2>Coming Soon</h2>
              <p>This module is currently under development.</p>
            </div>
          )}

        </div>
      </main>

      {/* Right Panel */}
      <aside className="right-panel">
        <h3>My profile</h3>
        <div className="profile-section">
          <div className="avatar-lg">👩‍💻</div>
          <h3>{user?.email?.split('@')[0] || 'User'}</h3>
          <p className="profile-meta">{user?.email || 'Basic Member ⭐'}</p>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h4>Activity</h4>
            <select className="period-select">
              <option>Weekly</option>
            </select>
          </div>
          <div className="chart-bar-container">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className={`chart-bar ${i === 3 ? 'active' : ''}`} style={{height: `${activity.value || 0}%`}}></div>
              ))
            ) : (
              <p style={{textAlign: 'center', width: '100%', color: 'var(--text-secondary)'}}>No activity data</p>
            )}
          </div>
        </div>

        <div className="tasks-section">
          <h4>List Task</h4>
          <div className="task-list">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task.id} className="card task-card">
                  <div className="task-icon">{task.icon || '📌'}</div>
                  <div>
                    <p className="task-title">{task.title}</p>
                    <p className="task-due">{task.dueDate}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No tasks available</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;
