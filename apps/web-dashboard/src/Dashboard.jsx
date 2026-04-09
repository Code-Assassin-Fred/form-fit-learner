import React, { useState } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
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

  const learners = [
    { id: 1, name: 'Alice Johnson', score: '85%', status: 'Improving', class: 'Grade 5B' },
    { id: 2, name: 'Mark Stevens', score: '42%', status: 'Critical', class: 'Therapy Hub' },
    { id: 3, name: 'Sophia Chen', score: '92%', status: 'Excellent', class: 'Grade 5B' },
    { id: 4, name: 'Leo Miller', score: '68%', status: 'Stable', class: 'Grade 4A' },
  ];

  const classes = [
    { id: 1, name: 'Product Design Tutorial', instructor: 'Expert', progress: 50, status: 'On Progress', time: '08:00 - 10:00' },
    { id: 2, name: 'Illustration Tutorial', instructor: 'Expert', progress: 80, status: 'On Progress', time: '11:00 - 12:00' },
    { id: 3, name: 'UX Research', instructor: 'Beginner', progress: 20, status: 'On Progress', time: '15:00 - 17:00' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <Zap size={32} fill="var(--primary)" color="var(--primary)" />
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
              <div className="avatar-sm">S</div>
              <span className="user-name">Selena</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'dashboard' ? (
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
                    <h3>124</h3>
                    <p>Total Learners</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="icon-box blue-light"><Search size={24} /></div>
                  <div>
                    <h3>42</h3>
                    <p>Pending Analysis</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="icon-box orange-light"><Printer size={24} /></div>
                  <div>
                    <h3>85</h3>
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
          <h3>Adeline Watson</h3>
          <p className="profile-meta">Basic Member ⭐</p>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h4>Activity</h4>
            <select className="period-select">
              <option>Weekly</option>
            </select>
          </div>
          <div className="chart-bar-container">
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} className={`chart-bar ${i === 3 ? 'active' : ''}`} style={{height: `${h}%`}}></div>
            ))}
          </div>
        </div>

        <div className="tasks-section">
          <h4>List Task</h4>
          <div className="task-list">
            <div className="card task-card">
              <div className="task-icon">👩‍💻</div>
              <div>
                <p className="task-title">Make user flow</p>
                <p className="task-due">Due date 14 Nov, 05:45</p>
              </div>
            </div>
            <div className="card task-card">
              <div className="task-icon">✍️</div>
              <div>
                <p className="task-title">Basic shape</p>
                <p className="task-due">Due date 13 Nov, 20:00</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;
