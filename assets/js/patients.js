/* Advanced patient manager
   - stores data in localStorage
   - supports tags, last visit, next appointment
   - import/export CSV & JSON
*/
const STORAGE_KEY = 'anupamPatients_v2';

const $ = id => document.getElementById(id);

function loadPatients(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY))||[] } catch { return [] } }
function savePatients(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

function formatDate(d){ if(!d) return ''; try { return new Date(d).toLocaleDateString() } catch { return d } }

function renderPatients(){
  const tbody = document.querySelector('#patientsTable tbody');
  const no = $('noPatients');
  const patients = loadPatients();
  const q = $('searchInput').value.trim().toLowerCase();
  const tag = $('filterTag').value;
  const upcoming = $('filterUpcoming').value;
  const now = Date.now();
  const in30 = now + 30*24*60*60*1000;

  let items = patients.filter(p => {
    if(q){ const hay = [p.name,p.contact,p.notes,(p.tags||[]).join(' ')].join(' ').toLowerCase(); if(!hay.includes(q)) return false }
    if(tag && !(p.tags||[]).includes(tag)) return false;
    if(upcoming==='upcoming'){ if(!p.appointment) return false; const t=new Date(p.appointment).getTime(); if(!(t>=now && t<=in30)) return false }
    return true
  });

  $('totalCount').textContent = items.length;
  tbody.innerHTML = '';
  if(!items.length){ no.style.display='block'; return }
  no.style.display='none';

  items.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width:36px;height:36px">${(p.name||'').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div></td>
      <td><strong>${escapeHtml(p.name)}</nobr></strong><div class="small text-muted">${escapeHtml(p.notes||'').slice(0,80)}</div></td>
      <td>${escapeHtml(p.contact||'')}</td>
      <td>${p.age||''}</td>
      <td>${formatDate(p.lastVisit)}</td>
      <td>${formatDate(p.appointment)}</td>
      <td>${(p.tags||[]).map(t=>`<span class="badge bg-secondary me-1">${escapeHtml(t)}</span>`).join('')}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" data-id="${p.id}" data-action="view">View</button>
          <button class="btn btn-outline-secondary" data-id="${p.id}" data-action="edit">Edit</button>
          <button class="btn btn-outline-danger" data-id="${p.id}" data-action="del">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
  rebuildTagOptions();
}

function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

function clearModal(){ $('patientId').value=''; $('pName').value=''; $('pAge').value=''; $('pContact').value=''; $('pNotes').value=''; $('pTags').value=''; $('pLastVisit').value=''; $('pAppointment').value=''; $('modalTitle').textContent='Add Patient'; }

function openEdit(id){
  const p = loadPatients().find(x=>x.id===id);
  if(!p) return;
  $('patientId').value=p.id;
  $('pName').value=p.name;
  $('pAge').value=p.age||'';
  $('pContact').value=p.contact||'';
  $('pNotes').value=p.notes||'';
  $('pTags').value=(p.tags||[]).join(', ');
  $('pLastVisit').value=p.lastVisit||'';
  $('pAppointment').value=p.appointment||'';
  $('modalTitle').textContent='Edit Patient';
  const modalEl = document.getElementById('patientModal');
  if(modalEl){
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } else {
    console.error('patientModal element not found');
  }
}

function openView(id){ const p = loadPatients().find(x=>x.id===id); if(!p) return; alert(`Name: ${p.name}\nContact: ${p.contact||''}\nAge: ${p.age||''}\nLast visit: ${p.lastVisit||''}\nNext appointment: ${p.appointment||''}\nTags: ${(p.tags||[]).join(', ')}\n\nNotes:\n${p.notes||''}`) }

function upsertPatient(e){ e.preventDefault(); const id = $('patientId').value; const patients = loadPatients(); const tags = $('pTags').value.split(',').map(s=>s.trim()).filter(Boolean); const data = { id: id||Date.now().toString(), name: $('pName').value.trim(), age: $('pAge').value, contact: $('pContact').value.trim(), notes: $('pNotes').value.trim(), tags, lastVisit: $('pLastVisit').value || null, appointment: $('pAppointment').value || null };
  if(!data.name){ alert('Enter name'); return }
  if(id){ const i = patients.findIndex(x=>x.id===id); if(i>-1) patients[i]=data } else { patients.unshift(data) }
  savePatients(patients); renderPatients(); clearModal();
  const modalEl = document.getElementById('patientModal');
  if(modalEl){
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
  }
}

function handleTableClick(e){ const btn = e.target.closest('button'); if(!btn) return; const id = btn.dataset.id; const action = btn.dataset.action; if(action==='del'){ if(!confirm('Delete patient?')) return; const updated = loadPatients().filter(p=>p.id!==id); savePatients(updated); renderPatients(); return } if(action==='edit'){ openEdit(id); return } if(action==='view'){ openView(id); return } }

function rebuildTagOptions(){ const set = new Set(); loadPatients().forEach(p=> (p.tags||[]).forEach(t=>set.add(t))); const sel = $('filterTag'); const current = sel.value; sel.innerHTML = '<option value="">All Tags</option>'; Array.from(set).sort().forEach(t=>{ const o=document.createElement('option'); o.value=t; o.textContent=t; sel.appendChild(o) }); sel.value = current; }

function exportJSON(){ const data = loadPatients(); const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}); downloadBlob(blob,'anupam-patients.json') }
function exportCSV(){ const data = loadPatients(); if(!data.length){ alert('No data'); return } const headers = ['id','name','age','contact','lastVisit','appointment','tags','notes']; const rows = data.map(p=> headers.map(h=>`"${String((h==='tags'? (p.tags||[]).join(';') : (p[h]||'')).replace(/"/g,'""'))}"`).join(',')); const csv = [headers.join(','), ...rows].join('\n'); const blob = new Blob([csv], {type:'text/csv'}); downloadBlob(blob,'anupam-patients.csv') }

function downloadBlob(blob, filename){ const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

function importFile(file){ const reader = new FileReader(); reader.onload = ()=>{
  const text = reader.result;
  try{
    if(file.type.includes('json') || file.name.endsWith('.json')){
      const parsed = JSON.parse(text); if(Array.isArray(parsed)){ const existing = loadPatients(); savePatients(parsed.concat(existing)); renderPatients(); alert('Imported JSON.') }
    } else {
      // simple CSV parse
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines.shift().split(/,|;/).map(h=>h.replace(/"/g,'').trim());
      const parsed = lines.map(line=>{
        // naive split on commas that ignores quotes for brevity
        const cols = line.split(','); const obj = {}; headers.forEach((h,i)=> obj[h]= (cols[i]||'').replace(/"/g,'').trim()); return obj
      }).map(r=>({ id: r.id || Date.now().toString()+Math.random().toString(36).slice(2,6), name: r.name || '', age: r.age||'', contact: r.contact||'', lastVisit: r.lastVisit||'', appointment: r.appointment||'', tags: (r.tags||'').split(/[;|,]/).map(s=>s.trim()).filter(Boolean), notes: r.notes||'' }))
      const existing = loadPatients(); savePatients(parsed.concat(existing)); renderPatients(); alert('Imported CSV.')
    }
  }catch(err){ alert('Import failed: '+err.message) }
}
reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderPatients();
  $('patientForm').addEventListener('submit', upsertPatient);
  document.querySelector('#patientsTable tbody').addEventListener('click', handleTableClick);
  $('searchInput').addEventListener('input', ()=>renderPatients());
  $('filterTag').addEventListener('change', ()=>renderPatients());
  $('filterUpcoming').addEventListener('change', ()=>renderPatients());
  $('exportJson').addEventListener('click', exportJSON);
  $('exportCsv').addEventListener('click', exportCSV);
  $('importFile').addEventListener('change', e=>{ const f=e.target.files[0]; if(f) importFile(f); e.target.value=''; });
});
