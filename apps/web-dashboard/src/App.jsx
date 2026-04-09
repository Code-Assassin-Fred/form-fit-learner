import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
        <div className="logo-section" style={{marginBottom: '2rem'}}>
          <img src="/logo.png" alt="Logo" style={{height: '40px'}} />
          <h2 style={{fontSize: '1.25rem', color: 'var(--primary)', margin: 0}}>Form-Fit</h2>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span>📊</span> Dashboard
          </a>
          <a href="#" className={`nav-item ${activeTab === 'learners' ? 'active' : ''}`} onClick={() => setActiveTab('learners')}>
            <span>👥</span> Learners
          </a>
          <a href="#" className={`nav-item ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => setActiveTab('assessments')}>
            <span>🔍</span> Assessments
          </a>
          <a href="#" className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>
            <span>🖨️</span> 3D Tools
          </a>
          <a href="#" className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span>📝</span> Report
          </a>
        </nav>

        <div style={{marginTop: 'auto', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem'}}>🚀</div>
          <p style={{fontSize: '0.875rem', fontWeight: '600', margin: '0.5rem 0'}}>Upgrade Premium</p>
          <button className="btn-white" style={{background: '#0F172A', color: 'white', fontSize: '0.75rem'}}>Get Premium</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search anything..." />
          </div>
          <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
            <span style={{cursor: 'pointer'}}>🔔</span>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyCenter: 'center'}}>S</div>
              <span style={{fontWeight: '600'}}>Selena</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'dashboard' ? (
            <>
              <div className="banner">
                <div className="banner-content">
                  <p style={{textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em'}}>Innovation Hub</p>
                  <h1>Empowering Learners through Personalized Ergonomic AI</h1>
                  <button className="btn-white">Review Recent Reports</button>
                </div>
                <div style={{position: 'absolute', right: '5%', top: '10%', fontSize: '8rem', opacity: '0.3'}}>🚀</div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem'}}>
                <div className="card stat-card">
                  <div className="icon-box yellow-light">🎓</div>
                  <div>
                    <h3 style={{margin: 0}}>124</h3>
                    <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Total Learners</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="icon-box blue-light">🔍</div>
                  <div>
                    <h3 style={{margin: 0}}>42</h3>
                    <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Pending Analysis</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="icon-box orange-light">🖨️</div>
                  <div>
                    <h3 style={{margin: 0}}>85</h3>
                    <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Prints Completed</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                  <h3 style={{margin: 0}}>Recent Class Progress</h3>
                  <a href="#" style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: '600'}}>See All</a>
                </div>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
                      <th style={{paddingBottom: '1rem'}}>Class</th>
                      <th style={{paddingBottom: '1rem'}}>Progress</th>
                      <th style={{paddingBottom: '1rem'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(c => (
                      <tr key={c.id} style={{borderTop: '1px solid var(--border-color)'}}>
                        <td style={{padding: '1rem 0'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <div style={{fontSize: '1.5rem', background: '#F1F5F9', padding: '8px', borderRadius: '8px'}}>🏫</div>
                            <div>
                              <p style={{margin: 0, fontWeight: '600'}}>{c.name}</p>
                              <p style={{margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{c.instructor} • {c.time}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{width: '150px', height: '8px', background: '#E2E8F0', borderRadius: '4px'}}>
                            <div style={{width: `${c.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px'}}></div>
                          </div>
                          <span style={{fontSize: '0.75rem'}}>{c.progress}% Finish</span>
                        </td>
                        <td>
                          <span style={{padding: '0.25rem 0.75rem', background: '#ecfdf5', color: '#10b981', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600'}}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'learners' ? (
            <div className="learners-page">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 style={{margin: 0}}>Learner Management</h2>
                <button className="btn-white" style={{background: 'var(--primary)', color: 'white'}}>+ Add New Learner</button>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
                {learners.map(l => (
                  <div key={l.id} className="card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                      <div style={{width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>👤</div>
                      <span style={{
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: '700',
                        background: l.status === 'Critical' ? '#fee2e2' : '#ecfdf5',
                        color: l.status === 'Critical' ? '#ef4444' : '#10b981'
                      }}>{l.status.toUpperCase()}</span>
                    </div>
                    <h4 style={{margin: '0 0 0.25rem'}}>{l.name}</h4>
                    <p style={{margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)'}}>{l.class}</p>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontSize: '0.875rem', fontWeight: '600'}}>Posture Score:</span>
                      <span style={{fontSize: '1.25rem', fontWeight: '700', color: l.score === '42%' ? '#ef4444' : 'var(--primary)'}}>{l.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{textAlign: 'center', padding: '4rem'}}>
              <h2 style={{color: 'var(--text-secondary)'}}>Coming Soon</h2>
              <p>This module is currently under development.</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      <aside className="right-panel">
        <h3 style={{marginTop: 0}}>My profile</h3>
        <div style={{textAlign: 'center', padding: '1rem 0 2rem'}}>
          <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#E2E8F0', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}>👩‍💻</div>
          <h3 style={{margin: 0}}>Adeline Watson</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Basic Member ⭐</p>
        </div>

        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h4 style={{margin: 0}}>Activity</h4>
            <select style={{border: 'none', background: 'transparent', fontWeight: '600'}}>
              <option>Weekly</option>
            </select>
          </div>
          <div style={{height: '100px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem'}}>
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} style={{flex: 1, height: `${h}%`, background: i === 3 ? 'var(--primary)' : '#E2E8F0', borderRadius: '4px'}}></div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{marginBottom: '1rem'}}>List Task</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div className="card" style={{padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{fontSize: '1.25rem'}}>👩‍💻</div>
              <div>
                <p style={{margin: 0, fontWeight: '600', fontSize: '0.875rem'}}>Make user flow</p>
                <p style={{margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Due date 14 Nov, 05:45</p>
              </div>
            </div>
            <div className="card" style={{padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{fontSize: '1.25rem'}}>✍️</div>
              <div>
                <p style={{margin: 0, fontWeight: '600', fontSize: '0.875rem'}}>Basic shape</p>
                <p style={{margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Due date 13 Nov, 20:00</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default App
