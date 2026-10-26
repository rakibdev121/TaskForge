import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, CheckCheck, ChevronDown, CircleHelp, Clock3, Command, Filter,
  FolderKanban, LayoutDashboard, ListTodo, LogOut, Menu, MoreHorizontal,
  Plus, Search, Settings2, Sparkles, Target, Users, X, Zap
} from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const columns = [
  { id: 'todo', title: 'To do', tone: 'slate' },
  { id: 'progress', title: 'In progress', tone: 'purple' },
  { id: 'review', title: 'In review', tone: 'amber' },
  { id: 'done', title: 'Completed', tone: 'green' },
];

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function initials(name = 'TF') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
}
function niceDate(value) {
  if (!value) return 'No due date';
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(value, status) {
  return value && status !== 'done' && new Date(`${String(value).slice(0, 10)}T23:59:59`) < new Date();
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await request(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow glow-one" /><div className="auth-glow glow-two" />
      <section className="auth-card">
        <div className="brand auth-brand"><span className="brand-mark"><Command size={21}/></span><span>taskforge<span className="brand-dot">.</span></span></div>
        <div className="auth-intro">
          <span className="eyebrow"><Sparkles size={14}/> YOUR WORKSPACE, REIMAGINED</span>
          <h1>Make space for<br/><span>great work.</span></h1>
          <p>Bring your projects, your people, and your next big idea into one calm, focused space.</p>
        </div>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <label>Full name<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" required minLength={2}/></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required/></label>
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8}/></label>
          {error && <div className="error-message">{error}</div>}
          <button className="btn btn-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to TaskForge' : 'Create your workspace'} <ArrowRight size={17}/></button>
        </form>
        <p className="auth-foot"><span className="secure-dot"/> Your workspace is private by default.</p>
      </section>
      <aside className="auth-preview">
        <div className="preview-top"><span className="live-dot"/> WORKSPACE OVERVIEW <span className="preview-date">TODAY · 09:41 AM</span></div>
        <div className="preview-title"><div><span className="muted-label">MONDAY, OCTOBER 26</span><h2>Good work starts<br/>with a clear plan.</h2></div><div className="preview-spark"><Sparkles size={25}/></div></div>
        <div className="preview-stats">
          <div><span>Tasks completed</span><strong>24 <small>+18%</small></strong><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
          <div><span>On track</span><strong>86% <small>↗ 6.4%</small></strong><div className="progress-track"><i/></div></div>
        </div>
        <div className="preview-board">
          <div className="preview-board-head"><strong>Project board</strong><span>•••</span></div>
          <div className="preview-task"><span className="task-icon lilac"><Target size={15}/></span><div><b>Website refresh</b><small>Design system · 4 tasks</small></div><span className="avatar mini-avatar">AM</span></div>
          <div className="preview-task"><span className="task-icon peach"><Zap size={15}/></span><div><b>Launch campaign</b><small>Marketing · 2 tasks</small></div><span className="avatar mini-avatar avatar-pink">JL</span></div>
          <div className="preview-task"><span className="task-icon mint"><CheckCheck size={15}/></span><div><b>Product roadmap</b><small>Product · 8 tasks</small></div><span className="avatar mini-avatar avatar-blue">SK</span></div>
        </div>
        <div className="preview-note"><Sparkles size={16}/><span><b>A little more focus.</b> A lot more momentum.</span></div>
      </aside>
    </main>
  );
}

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal">
    <div className="modal-head"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
    {children}
  </section></div>;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('tf_token') || '');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [view, setView] = useState('board');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  };
  const logout = useCallback(() => {
    localStorage.removeItem('tf_token');
    setToken('');
    setUser(null);
    setProjects([]);
    setTasks([]);
  }, []);

  const loadData = useCallback(async (activeToken) => {
    const [p, t] = await Promise.all([
      request('/projects', { token: activeToken }),
      request('/tasks', { token: activeToken }),
    ]);
    setProjects(p.projects);
    setTasks(t.tasks);
  }, []);

  useEffect(() => {
    let alive = true;
    if (!token) { setAuthChecked(true); return; }
    request('/auth/me', { token })
      .then(async (data) => {
        if (!alive) return;
        setUser(data.user);
        await loadData(token);
      })
      .catch(() => { if (alive) logout(); })
      .finally(() => { if (alive) setAuthChecked(true); });
    return () => { alive = false; };
  }, [token, loadData, logout]);

  function handleAuth(data) {
    localStorage.setItem('tf_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setAuthChecked(true);
    loadData(data.token).catch((e) => flash(e.message));
  }

  const visibleTasks = useMemo(() => tasks.filter((t) => {
    const matchesProject = selectedProject === 'all' || String(t.project_id || '') === String(selectedProject);
    const q = query.toLowerCase().trim();
    return matchesProject && (!q || `${t.title} ${t.description} ${t.project_name || ''}`.toLowerCase().includes(q));
  }), [tasks, selectedProject, query]);

  const completed = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'progress').length;
  const overdue = tasks.filter((t) => isOverdue(t.due_date, t.status)).length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  async function saveTask(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      project_id: form.get('project_id') || null,
      status: form.get('status'),
      priority: form.get('priority'),
      due_date: form.get('due_date') || null,
    };
    setBusy(true);
    try {
      const data = editingTask
        ? await request(`/tasks/${editingTask.id}`, { token, method: 'PATCH', body: JSON.stringify(payload) })
        : await request('/tasks', { token, method: 'POST', body: JSON.stringify(payload) });
      setTasks((old) => editingTask ? old.map((t) => String(t.id) === String(data.task.id) ? { ...data.task, project_name: projects.find((p) => String(p.id) === String(data.task.project_id))?.name || '' } : t) : [{ ...data.task, project_name: projects.find((p) => String(p.id) === String(data.task.project_id))?.name || '' }, ...old]);
      setModal(''); setEditingTask(null); flash(editingTask ? 'Task updated.' : 'Task created.');
      loadData(token).catch(() => {});
    } catch (e2) { flash(e2.message); }
    finally { setBusy(false); }
  }

  async function moveTask(task, status) {
    try {
      const data = await request(`/tasks/${task.id}`, { token, method: 'PATCH', body: JSON.stringify({ status }) });
      setTasks((old) => old.map((t) => String(t.id) === String(task.id) ? { ...t, ...data.task } : t));
    } catch (e) { flash(e.message); }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await request(`/tasks/${task.id}`, { token, method: 'DELETE' });
      setTasks((old) => old.filter((t) => String(t.id) !== String(task.id)));
      flash('Task deleted.');
    } catch (e) { flash(e.message); }
  }

  async function saveProject(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = { name: form.get('name'), description: form.get('description'), color: form.get('color') };
    setBusy(true);
    try {
      const data = editingProject
        ? await request(`/projects/${editingProject.id}`, { token, method: 'PATCH', body: JSON.stringify(payload) })
        : await request('/projects', { token, method: 'POST', body: JSON.stringify(payload) });
      if (editingProject) setProjects((old) => old.map((p) => String(p.id) === String(data.project.id) ? data.project : p));
      else setProjects((old) => [data.project, ...old]);
      setModal(''); setEditingProject(null); flash(editingProject ? 'Project updated.' : 'Project created.');
      loadData(token).catch(() => {});
    } catch (e2) { flash(e2.message); }
    finally { setBusy(false); }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete project "${project.name}"? Tasks will remain without a project.`)) return;
    try {
      await request(`/projects/${project.id}`, { token, method: 'DELETE' });
      setProjects((old) => old.filter((p) => String(p.id) !== String(project.id)));
      setTasks((old) => old.map((t) => String(t.project_id) === String(project.id) ? { ...t, project_id: null, project_name: '' } : t));
      if (String(selectedProject) === String(project.id)) setSelectedProject('all');
      flash('Project deleted.');
    } catch (e) { flash(e.message); }
  }

  if (!authChecked) return <div className="loading-screen"><div className="loader-mark"><Command size={24}/></div><span>Preparing your workspace…</span></div>;
  if (!token || !user) return <AuthScreen onAuth={handleAuth}/>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Command size={20}/></span><span>taskforge<span className="brand-dot">.</span></span><button className="mobile-close icon-button" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><span className="workspace-icon">T</span><span><b>Team workspace</b><small>Free plan</small></span><ChevronDown size={15}/></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">
        <button className={view === 'overview' ? 'selected' : ''} onClick={() => { setView('overview'); setMobileNav(false); }}><LayoutDashboard size={18}/> Overview</button>
        <button className={view === 'board' ? 'selected' : ''} onClick={() => { setView('board'); setMobileNav(false); }}><FolderKanban size={18}/> My board <span className="nav-count">{tasks.length}</span></button>
        <button className={view === 'list' ? 'selected' : ''} onClick={() => { setView('list'); setMobileNav(false); }}><ListTodo size={18}/> All tasks</button>
      </nav>
      <div className="side-section-head"><span className="side-label">YOUR PROJECTS</span><button className="tiny-add" onClick={() => { setEditingProject(null); setModal('project'); }} aria-label="Add project"><Plus size={16}/></button></div>
      <div className="project-nav">
        <button className={selectedProject === 'all' ? 'project-selected' : ''} onClick={() => { setSelectedProject('all'); setView('board'); }}><span className="project-dot all-dot"/> All projects <span className="project-num">{tasks.length}</span></button>
        {projects.map((p) => <div className={`project-nav-row ${String(selectedProject) === String(p.id) ? 'project-selected' : ''}`} key={p.id}><button onClick={() => { setSelectedProject(String(p.id)); setView('board'); }}><span className="project-dot" style={{ background: p.color || '#8b5cf6' }}/><span className="project-name">{p.name}</span></button><button className="project-more" title="Project options" onClick={() => { setEditingProject(p); setModal('project'); }}><MoreHorizontal size={15}/></button></div>)}
        {!projects.length && <p className="empty-side">Your projects will show up here.</p>}
      </div>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><span className="upgrade-spark"><Sparkles size={16}/></span><b>Make room for more.</b><p>Your best work is just getting started.</p><button onClick={() => flash('You are on the TaskForge starter plan.')}>Explore workspace <ArrowRight size={14}/></button></div>
        <button className="side-bottom-link" onClick={() => flash('Help center coming soon.')}><CircleHelp size={17}/> Help & support</button>
        <button className="side-bottom-link" onClick={logout}><LogOut size={17}/> Sign out</button>
        <div className="user-profile"><div className="avatar">{initials(user.name)}</div><span><b>{user.name}</b><small>{user.email}</small></span><button className="icon-button" onClick={logout} title="Sign out"><MoreHorizontal size={18}/></button></div>
      </div>
    </aside>

    {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button>
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{view === 'overview' ? 'Overview' : view === 'list' ? 'All tasks' : 'My board'}</b></div>
        <div className="top-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search anything…"/><kbd>⌘ K</kbd></div><button className="icon-button notification-button" onClick={() => flash('You are all caught up!')} aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">{initials(user.name)}</div></div>
      </header>

      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR WORKSPACE AT A GLANCE</div><h1>{view === 'overview' ? 'Your overview' : view === 'list' ? 'All tasks' : 'Good to see you, ' + user.name.split(' ')[0] + '.'} <span className="wave">✦</span></h1><p>{view === 'overview' ? 'A little clarity goes a long way. Here’s your team’s progress.' : 'Small steps every day add up to remarkable things.'}</p></div><button className="btn btn-primary" onClick={() => { setEditingTask(null); setModal('task'); }}><Plus size={17}/> New task</button></section>

        <section className="stat-grid">
          <article className="stat-card stat-highlight"><div className="stat-top"><span className="stat-icon violet"><ListTodo size={18}/></span><span className="stat-trend"><ArrowUpRight size={14}/> All time</span></div><div className="stat-label">Total tasks</div><div className="stat-value">{tasks.length}<span className="stat-sub"> tasks</span></div><div className="stat-foot"><span className="stat-line"><i style={{ width: `${Math.min(100, tasks.length * 5)}%` }}/></span><span>Across your workspace</span></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon green"><CheckCheck size={18}/></span><span className="stat-trend positive"><ArrowUpRight size={14}/> {completion}%</span></div><div className="stat-label">Tasks completed</div><div className="stat-value">{completed}<span className="stat-sub"> / {tasks.length}</span></div><div className="stat-foot"><span className="stat-line green-line"><i style={{ width: `${completion}%` }}/></span><span>Keep it going</span></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Activity size={18}/></span><span className="stat-trend"><Clock3 size={14}/> In motion</span></div><div className="stat-label">In progress</div><div className="stat-value">{inProgress}</div><div className="stat-foot"><span className="stat-note"><span className="tiny-status purple-status"/> Moving forward</span></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon orange"><CalendarDays size={18}/></span><span className={`stat-trend ${overdue ? 'warning' : ''}`}>{overdue ? 'Needs attention' : 'Looking good'}</span></div><div className="stat-label">Overdue tasks</div><div className="stat-value">{overdue}</div><div className="stat-foot"><span className="stat-note"><span className={`tiny-status ${overdue ? 'orange-status' : 'green-status'}`}/>{overdue ? 'Let’s get these back on track' : 'You’re right on schedule'}</span></div></article>
        </section>

        {view === 'overview' && <section className="overview-grid">
          <article className="panel progress-panel"><div className="panel-heading"><div><h3>Progress snapshot</h3><p>Your productivity at a glance</p></div><span className="period-pill">All time <ChevronDown size={13}/></span></div><div className="progress-main"><div className="donut" style={{ '--progress': `${completion * 3.6}deg` }}><div><strong>{completion}%</strong><small>complete</small></div></div><div className="progress-legend"><p><i className="legend-dot done-dot"/>Completed <b>{completed}</b></p><p><i className="legend-dot progress-dot"/>In progress <b>{inProgress}</b></p><p><i className="legend-dot todo-dot"/>To do <b>{tasks.filter(t => t.status === 'todo').length}</b></p><p><i className="legend-dot review-dot"/>In review <b>{tasks.filter(t => t.status === 'review').length}</b></p></div></div></article>
          <article className="panel projects-panel"><div className="panel-heading"><div><h3>Your projects</h3><p>What you’re working on</p></div><button className="text-button" onClick={() => { setEditingProject(null); setModal('project'); }}>+ New project</button></div>{projects.length ? projects.slice(0, 5).map(p => <button className="overview-project" key={p.id} onClick={() => { setSelectedProject(String(p.id)); setView('board'); }}><span className="project-dot large-dot" style={{ background: p.color }}/><span><b>{p.name}</b><small>{p.description || 'Project workspace'}</small></span><span className="project-progress-text">{p.completed_count || 0}/{p.task_count || 0}</span><ArrowRight size={15}/></button>) : <EmptyState title="A fresh start" text="Create your first project to organize work." action="Create project" onAction={() => { setEditingProject(null); setModal('project'); }}/>}</article>
        </section>}

        {view === 'board' && <section className="board-section">
          <div className="section-toolbar"><div className="board-title"><h2>{selectedProject === 'all' ? 'Project board' : projects.find(p => String(p.id) === String(selectedProject))?.name || 'Project board'}</h2><span className="count-pill">{visibleTasks.length} tasks</span></div><div className="toolbar-actions"><button className="btn btn-secondary btn-small" onClick={() => { setEditingProject(null); setModal('project'); }}><Plus size={15}/> Project</button><button className="btn btn-secondary btn-small" onClick={() => flash('Showing tasks for the selected project.')}><Filter size={15}/> Filter</button><button className="btn btn-primary btn-small" onClick={() => { setEditingTask(null); setModal('task'); }}><Plus size={15}/> Add task</button></div></div>
          <div className="kanban-board">{columns.map(col => {
            const colTasks = visibleTasks.filter(t => t.status === col.id);
            return <section className="kanban-column" key={col.id}><div className="column-head"><span className={`column-dot ${col.tone}`}/><h3>{col.title}</h3><span className="column-count">{colTasks.length}</span><button className="column-add" onClick={() => { setEditingTask({ status: col.id }); setModal('task'); }} aria-label={`Add ${col.title} task`}><Plus size={16}/></button></div><div className="column-body">
              {colTasks.map(task => <TaskCard key={task.id} task={task} onEdit={() => { setEditingTask(task); setModal('task'); }} onDelete={() => deleteTask(task)} onMove={(status) => moveTask(task, status)}/>)}
              {!colTasks.length && <div className="empty-column"><span><Plus size={18}/></span><p>No tasks yet</p><button onClick={() => { setEditingTask({ status: col.id }); setModal('task'); }}>Add a task</button></div>}
              </div><button className="add-task-link" onClick={() => { setEditingTask({ status: col.id }); setModal('task'); }}><Plus size={15}/> Add task</button></section>;
          })}</div>
        </section>}

        {view === 'list' && <section className="panel task-list-panel"><div className="panel-heading"><div><h3>All tasks</h3><p>Everything on your plate, in one place.</p></div><button className="btn btn-primary btn-small" onClick={() => { setEditingTask(null); setModal('task'); }}><Plus size={15}/> New task</button></div>{visibleTasks.length ? <div className="task-table-wrap"><table className="task-table"><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due date</th><th/></tr></thead><tbody>{visibleTasks.map(t => <tr key={t.id}><td><button className="table-task-name" onClick={() => { setEditingTask(t); setModal('task'); }}>{t.title}</button><small>{t.description}</small></td><td>{t.project_name || '—'}</td><td><select value={t.status} onChange={e => moveTask(t, e.target.value)}>{columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></td><td><span className={`priority-pill ${t.priority}`}>{t.priority}</span></td><td>{niceDate(t.due_date)}</td><td><button className="icon-button" onClick={() => deleteTask(t)} aria-label="Delete task"><X size={16}/></button></td></tr>)}</tbody></table></div> : <EmptyState title="Nothing on the list yet" text="Create a task and it will appear here." action="Create task" onAction={() => { setEditingTask(null); setModal('task'); }}/>}</section>}

        <section className="bottom-note"><div className="note-icon"><Sparkles size={17}/></div><div><b>Progress over perfection.</b><span>Every task you finish is momentum you can build on.</span></div><span className="note-decoration">✳</span></section>
      </div>
    </main>

    {notice && <div className="toast"><span className="toast-check"><Check size={15}/></span>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}

    {modal === 'task' && <Modal title={editingTask?.id ? 'Edit task' : 'Create a new task'} onClose={() => { setModal(''); setEditingTask(null); }}><form className="modal-form" onSubmit={saveTask}>
      <label>Task title<input name="title" defaultValue={editingTask?.title || ''} placeholder="e.g. Design the landing page" required minLength={2} maxLength={180} autoFocus/></label>
      <label>Description <span className="optional">Optional</span><textarea name="description" defaultValue={editingTask?.description || ''} placeholder="What needs to get done?" rows="3"/></label>
      <div className="form-two"><label>Project<select name="project_id" defaultValue={editingTask?.project_id || (selectedProject !== 'all' ? selectedProject : '')}><option value="">No project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Status<select name="status" defaultValue={editingTask?.status || 'todo'}>{columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
      <div className="form-two"><label>Priority<select name="priority" defaultValue={editingTask?.priority || 'medium'}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input name="due_date" type="date" defaultValue={editingTask?.due_date ? String(editingTask.due_date).slice(0,10) : ''}/></label></div>
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => { setModal(''); setEditingTask(null); }}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editingTask?.id ? 'Save changes' : 'Create task'}</button></div>
    </form></Modal>}

    {modal === 'project' && <Modal title={editingProject?.id ? 'Edit project' : 'Create a project'} onClose={() => { setModal(''); setEditingProject(null); }}><form className="modal-form" onSubmit={saveProject}>
      <label>Project name<input name="name" defaultValue={editingProject?.name || ''} placeholder="e.g. Website redesign" required minLength={2} maxLength={120} autoFocus/></label>
      <label>Description <span className="optional">Optional</span><textarea name="description" defaultValue={editingProject?.description || ''} placeholder="What is this project about?" rows="3"/></label>
      <label>Project color<div className="color-field"><input type="color" name="color" defaultValue={editingProject?.color || '#8b5cf6'}/><span>Choose a color to make this project easy to spot.</span></div></label>
      <div className="modal-actions">{editingProject?.id && <button type="button" className="btn btn-danger" onClick={() => { setModal(''); deleteProject(editingProject); }}>Delete</button>}<span className="modal-spacer"/><button type="button" className="btn btn-secondary" onClick={() => { setModal(''); setEditingProject(null); }}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editingProject?.id ? 'Save changes' : 'Create project'}</button></div>
    </form></Modal>}
  </div>;
}

function TaskCard({ task, onEdit, onDelete, onMove }) {
  const [menu, setMenu] = useState(false);
  return <article className="task-card"><div className="task-card-top"><span className={`priority-pill ${task.priority}`}><i/> {task.priority}</span><div className="task-menu-wrap"><button className="icon-button task-more" onClick={() => setMenu(v => !v)} aria-label="Task options"><MoreHorizontal size={17}/></button>{menu && <div className="task-menu"><button onClick={() => { setMenu(false); onEdit(); }}>Edit task</button>{columns.filter(c => c.id !== task.status).map(c => <button key={c.id} onClick={() => { setMenu(false); onMove(c.id); }}>Move to {c.title}</button>)}<button className="menu-danger" onClick={() => { setMenu(false); onDelete(); }}>Delete task</button></div>}</div></div><button className="task-card-title" onClick={onEdit}>{task.title}</button>{task.description && <p className="task-card-description">{task.description}</p>}{task.project_name && <span className="task-project-label"><FolderKanban size={12}/>{task.project_name}</span>}<div className="task-card-footer"><span className={`due-date ${isOverdue(task.due_date, task.status) ? 'overdue' : ''}`}><CalendarDays size={13}/>{niceDate(task.due_date)}</span><span className="task-avatar">{initials(task.title)}</span></div></article>;
}

function EmptyState({ title, text, action, onAction }) {
  return <div className="empty-state"><div className="empty-illustration"><FolderKanban size={25}/></div><h3>{title}</h3><p>{text}</p>{action && <button className="btn btn-primary btn-small" onClick={onAction}><Plus size={15}/>{action}</button>}</div>;
}

export default App;
