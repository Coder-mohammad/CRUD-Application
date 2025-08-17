document.addEventListener('DOMContentLoaded', () => {
  console.log('App ready'); // quick sanity check

  const STORAGE_KEY = 'students_basic_v2';

  const form = document.getElementById('studentForm');
  const studentId = document.getElementById('studentId');
  const studentName = document.getElementById('studentName');
  const studentClass = document.getElementById('studentClass');
  const studentContact = document.getElementById('studentContact');
  const editingId = document.getElementById('editingId');
  const submitBtn = document.getElementById('submitBtn');
  const formTitle = document.getElementById('formTitle');

  const tbody = document.getElementById('tbody');
  const emptyState = document.getElementById('emptyState');
  const resetBtn = document.getElementById('resetBtn');

  if (!form || !studentId || !studentName || !tbody) {
    console.error('script.js loaded but required DOM elements not found. Check IDs and ensure the script is included with defer.');
  }

  // storage fallback
  const storage = (() => {
    let memory = [];
    let ok = true;
    try {
      const t = '__test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
    } catch (e) {
      ok = false;
    }
    let warned = false;
    function warnOnce() {
      if (!warned) { warned = true; alert('Browser storage is disabled. Data won’t persist after refresh.'); }
    }
    return {
      load() {
        if (ok) {
          try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
          catch { return []; }
        }
        return memory;
      },
      save(list) {
        if (ok) {
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return; }
          catch { ok = false; }
        }
        warnOnce();
        memory = list.slice();
      }
    };
  })();

  function render(list = storage.load()) {
    tbody.innerHTML = '';
    if (!list.length) {
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');
    for (const s of list) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.contact || ''}</td>
        <td>${s.className || ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-light me-2" data-action="edit" data-id="${s.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-action="delete" data-id="${s.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  function resetForm() {
    form.reset();
    editingId.value = '';
    studentId.disabled = false;
    submitBtn.textContent = 'Add';
    formTitle.textContent = 'Add Student';
    studentId.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = studentId.value.trim();
    const name = studentName.value.trim();
    const cls = studentClass.value.trim();
    const contact = studentContact.value.trim();

    if (!id || !name) {
      alert('ID and Name are required.');
      return;
    }

    const list = storage.load();

    if (editingId.value) {
      const idx = list.findIndex(s => s.id === editingId.value);
      if (idx === -1) return alert('Record not found.');
      list[idx] = { id: list[idx].id, name, contact, className: cls };
      storage.save(list);
    } else {
      if (list.some(s => s.id === id)) return alert('This ID already exists.');
      list.unshift({ id, name, contact, className: cls });
      storage.save(list);
    }

    render();
    resetForm();
  });

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const list = storage.load();

    if (action === 'edit') {
      const s = list.find(st => st.id === id);
      if (!s) return;
      studentId.value = s.id;
      studentName.value = s.name;
      studentContact.value = s.contact || '';
      studentClass.value = s.className || '';
      editingId.value = s.id;
      studentId.disabled = true;
      submitBtn.textContent = 'Update';
      formTitle.textContent = 'Edit Student';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (action === 'delete') {
      if (!confirm('Delete this student?')) return;
      const next = list.filter(s => s.id !== id);
      storage.save(next);
      render(next);
    }
  });

  resetBtn.addEventListener('click', resetForm);

  // initial
  render();
  studentId.focus();
});