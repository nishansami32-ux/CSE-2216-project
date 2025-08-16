// ---------- Utilities ----------
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const STORAGE_KEY = 'zzone_students_v1';

const COURSES = [
  { id: 'c-js',  title: 'JavaScript Fundamentals',        weeks: 6,  level: 'Beginner',    desc: 'Syntax, data types, DOM, events, projects.' },
  { id: 'c-py',  title: 'Python for Developers',          weeks: 8,  level: 'Beginner',    desc: 'Problem solving, OOP, file I/O, modules.' },
  { id: 'c-cpp', title: 'C++ with STL',                   weeks: 8,  level: 'Intermediate',desc: 'Pointers, templates, STL, performance.' },
  { id: 'c-dsa', title: 'Data Structures & Algorithms',   weeks:10,  level: 'Intermediate',desc: 'Arrays, lists, trees, graphs, DP.' },
  { id: 'c-web', title: 'Full-Stack Web (HTML/CSS/JS)',   weeks:10,  level: 'Beginner',    desc: 'Responsive layouts, forms, fetch, CRUD.' },
];

const SERVICES = [
  { title: 'Mentorship',      desc: '1:1 guidance for projects and career.' },
  { title: 'Mock Interviews', desc: 'Practice technical and behavioral interviews.' },
  { title: 'Career Office',   desc: 'Resume review, job search support.' },
  { title: 'Contest Training',desc: 'Algorithmic problem solving sessions.' },
];

function loadStudents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveStudents(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

// Sample data for first run
function ensureSeedData() {
  let data = loadStudents();
  if (data.length) return data;
  data = [
   /* { name: 'Nishan Ahmed', studentId: 'ZZ-2025-001', section: 'Alpha', contact: '01700000001', courses: ['c-js','c-web'], score: 88, remarks: 'Strong JS' },
    { name: 'Aisha Khan',   studentId: 'ZZ-2025-002', section: 'Beta',  contact: '01700000002', courses: ['c-py'],      score: 76, remarks: '' },
    { name: 'Rahim Uddin',  studentId: 'ZZ-2025-003', section: 'Gamma', contact: '01700000003', courses: ['c-cpp','c-dsa'], score: 91, remarks: 'Top of class' },
  */];
  saveStudents(data);
  return data;
}

let students = ensureSeedData();
let sortState = { key: 'name', dir: 'asc' };
let editIndex = -1; // -1 means add mode

// ---------- Tabs (ARIA) ----------
function switchTab(tabId) {
  const btn = document.getElementById(tabId);
  if (!btn) return;
  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.id === tabId)));
  const panelId = btn.getAttribute('aria-controls');
  $$('.panel').forEach(p => p.setAttribute('aria-hidden', String(p.id !== panelId)));
  btn.focus();
}

function initTabs() {
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.id));
    tab.addEventListener('keydown', (e) => {
      const tabs = $$('.tab');
      const idx = tabs.indexOf(e.currentTarget);
      if (e.key === 'ArrowRight') { tabs[(idx + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft')  { tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
      if (e.key === 'Home') { tabs[0].focus(); }
      if (e.key === 'End')  { tabs[tabs.length - 1].focus(); }
      if (e.key === 'Enter' || e.key === ' ') { switchTab(e.currentTarget.id); e.preventDefault(); }
    });
  });
}

// ---------- Render helpers ----------
function renderCourses() {
  const wrap = $('#panel-courses .cards');
  wrap.innerHTML = '';
  COURSES.forEach(c => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <h3>${c.title}</h3>
      <div class="note">Level: ${c.level} • ${c.weeks} weeks</div>
      <p style="margin:10px 0 0;">${c.desc}</p>
    `;
    wrap.appendChild(el);
  });

  // populate course multi-select
  const select = $('#courses');
  select.innerHTML = '';
  COURSES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = `${c.title}`;
    select.appendChild(opt);
  });

  $('#kpi-courses').textContent = COURSES.length;
}

function renderServices() {
  const wrap = $('#panel-services .cards');
  wrap.innerHTML = '';
  SERVICES.forEach(s => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<h3>${s.title}</h3><p style="margin:10px 0 0;">${s.desc}</p>`;
    wrap.appendChild(el);
  });
}

function formatCourses(ids) {
  const byId = Object.fromEntries(COURSES.map(c => [c.id, c.title]));
  return ids.map(id => byId[id] || id).join(', ');
}

function gradeBadge(score) {
  if (score == null || score === '') return '<span class="badge">—</span>';
  const cls = score >= 85 ? 'ok' : (score >= 70 ? '' : 'warn');
  return `<span class="badge ${cls}">${score}</span>`;
}

function renderStudentsTable() {
  const tbody = $('#students-table tbody');
  const q = $('#search').value.trim().toLowerCase();
  let rows = students
    .filter(s => !q || `${s.name} ${s.studentId} ${s.section}`.toLowerCase().includes(q))
    .slice();

  // sort
  rows.sort((a, b) => {
    const { key, dir } = sortState;
    const va = (a[key] ?? '').toString().toLowerCase();
    const vb = (b[key] ?? '').toString().toLowerCase();
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ?  1 : -1;
    return 0;
  });

  tbody.innerHTML = rows.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.studentId}</td>
      <td>${s.section}</td>
      <td><a href="tel:${s.contact}">${s.contact}</a></td>
      <td>${formatCourses(s.courses || [])}</td>
      <td>${gradeBadge(s.score)}</td>
      <td>
        <button class="btn" data-action="edit" data-id="${s.studentId}">Edit</button>
        <button class="btn warn" data-action="delete" data-id="${s.studentId}">Delete</button>
      </td>
    </tr>
  `).join('');

  // KPIs
  $('#kpi-total').textContent = students.length;
  const scores = students.map(s => Number(s.score)).filter(n => !Number.isNaN(n));
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '–';
  $('#kpi-avg').textContent = avg;
}

function renderRecentResults() {
  const wrap = $('#recent-results');
  const latest = students
    .filter(s => s.score != null && s.score !== '')
    .sort((a,b) => b.score - a.score)
    .slice(0, 6);
  wrap.innerHTML = latest.map(s => {
    const pct = Math.max(0, Math.min(100, Number(s.score) || 0));
    return `
      <div>
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:6px;">
          <strong>${s.name}</strong>
          <span class="note">${s.studentId} • ${s.section}</span>
        </div>
        <div class="bar"><span style="width:${pct}%"></span></div>
      </div>
    `;
  }).join('');
}

function renderResultsList() {
  const wrap = $('#results-list');
  const section = $('#filter-section').value;
  const list = students.filter(s => !section || s.section === section);
  const avg = list.length ? Math.round(list.reduce((acc, s) => acc + (Number(s.score) || 0), 0) / list.length) : 0;
  $('#avg-pill').textContent = `Average: ${list.length ? avg : '—'}`;

  wrap.innerHTML = list.map(s => {
    const pct = Math.max(0, Math.min(100, Number(s.score) || 0));
    return `
      <div style="display:grid; gap:6px; border:1px solid var(--border); border-radius: var(--radius); padding: 12px;">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div><strong>${s.name}</strong> <span class="note">• ${s.studentId}</span></div>
          <div class="note">Section: ${s.section}</div>
        </div>
        <div class="bar"><span style="width:${pct}%"></span></div>
      </div>
    `;
  }).join('');
}

// ---------- Students: CRUD ----------
function upsertStudent() {
  const form = $('#student-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const name = $('#name').value.trim();
  const studentId = $('#studentId').value.trim();
  const section = $('#section').value;
  const contact = $('#contact').value.trim();
  const courses = Array.from($('#courses').selectedOptions).map(o => o.value);
  const scoreRaw = $('#score').value;
  const score = scoreRaw === '' ? '' : Math.max(0, Math.min(100, Number(scoreRaw)));
  const remarks = $('#remarks').value.trim();

  const payload = { name, studentId, section, contact, courses, score, remarks };

  // unique ID check
  const existsAt = students.findIndex(s => s.studentId === studentId);
  if (editIndex === -1 && existsAt !== -1) {
    alert('Student ID already exists. Use a unique ID.');
    return;
  }
  if (editIndex !== -1 && existsAt !== -1 && existsAt !== editIndex) {
    alert('Another student already uses this ID.');
    return;
  }

  if (editIndex === -1) {
    students.push(payload);
  } else {
    students[editIndex] = payload;
  }

  saveStudents(students);
  renderStudentsTable();
  renderRecentResults();
  renderResultsList();
  resetForm();
}

function onTableClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const idx = students.findIndex(s => s.studentId === id);
  if (idx === -1) return;
  const action = btn.getAttribute('data-action');
  if (action === 'delete') {
    if (confirm('Delete this student?')) {
      students.splice(idx, 1);
      saveStudents(students);
      renderStudentsTable();
      renderRecentResults();
      renderResultsList();
    }
  } else if (action === 'edit') {
    editIndex = idx;
    const s = students[idx];
    $('#form-title').textContent = 'Edit Student';
    $('#btn-save').textContent = 'Update';
    $('#btn-cancel').style.display = '';

    $('#name').value = s.name;
    $('#studentId').value = s.studentId;
    $('#section').value = s.section;
    $('#contact').value = s.contact;
    Array.from($('#courses').options).forEach(opt => opt.selected = s.courses?.includes(opt.value));
    $('#score').value = s.score;
    $('#remarks').value = s.remarks || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function resetForm() {
  editIndex = -1;
  $('#student-form').reset();
  $('#form-title').textContent = 'Add Student';
  $('#btn-save').textContent = 'Save';
  $('#btn-cancel').style.display = 'none';
}

// ---------- Export / Reset ----------
function downloadJSON() {
  const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'zzone-students.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function clearAllData() {
  if (!confirm('This will clear all students and reload sample data. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  students = ensureSeedData();
  renderStudentsTable();
  renderRecentResults();
  renderResultsList();
}

// ---------- Event wiring ----------
function initStudents() {
  $('#student-form').addEventListener('submit', (e) => { e.preventDefault(); upsertStudent(); });
  $('#btn-cancel').addEventListener('click', resetForm);
  $('#students-table').addEventListener('click', onTableClick);
  $('#search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && e.target.value) { e.target.value = ''; }
    renderStudentsTable();
  });
  $$('#students-table thead .th-sort').forEach(th => th.addEventListener('click', () => {
    const key = th.getAttribute('data-key');
    sortState.dir = (sortState.key === key && sortState.dir === 'asc') ? 'desc' : 'asc';
    sortState.key = key;
    renderStudentsTable();
  }));
}
function initResults() { $('#filter-section').addEventListener('change', renderResultsList); }
function initContact() {
  $('#contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
    alert('Thanks! This demo does not send email.');
    e.target.reset();
  });
}

// ---------- Boot ----------
function boot() {
  initTabs();
  initStudents();
  initResults();
  initContact();
  renderCourses();
  renderServices();
  renderStudentsTable();
  renderRecentResults();
  renderResultsList();
  $('#year').textContent = new Date().getFullYear();
}
document.addEventListener('DOMContentLoaded', boot);

// Expose for inline onclick
window.switchTab = switchTab;
window.downloadJSON = downloadJSON;
window.clearAllData = clearAllData;
