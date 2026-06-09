/**
 * store.js — 业务逻辑：筛选、排序、选择
 * 依赖：data.js、state.js、ui.js
 */

// ── 筛选 ──

function applyFilters() {
  const search = (document.getElementById('filterSearch').value || '').toLowerCase().trim();
  const typeFilter = document.getElementById('filterType').value;
  const dateFrom = document.getElementById('filterDateFrom').value;
  const dateTo = document.getElementById('filterDateTo').value;
  const amountFilter = document.getElementById('filterAmount').value;

  filteredRecords = allRecords.filter(r => {
    if (search && !r.counterparty.toLowerCase().includes(search) &&
        !r.remark.toLowerCase().includes(search) && !r.account.includes(search)) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (dateFrom && r.dateStr < dateFrom) return false;
    if (dateTo && r.dateStr > dateTo) return false;
    if (amountFilter === 'small' && r.amount >= 1000) return false;
    if (amountFilter === 'medium' && (r.amount < 1000 || r.amount > 10000)) return false;
    if (amountFilter === 'large' && (r.amount < 10000 || r.amount > 100000)) return false;
    if (amountFilter === 'xlarge' && r.amount <= 100000) return false;
    return true;
  });

  currentPage = 1;
  selectedIds.clear();
  updateActiveBadges();
  renderTable();
}

function resetFilters() {
  document.getElementById('filterSearch').value = '';
  document.getElementById('filterType').value = 'all';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value = '';
  document.getElementById('filterAmount').value = 'all';
  applyFilters();
}

// ── 排序 ──

function sortTable(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir = field === 'date' ? 'desc' : 'asc';
  }

  filteredRecords.sort((a, b) => {
    let va, vb;
    if (field === 'date') { va = a.date.getTime(); vb = b.date.getTime(); }
    else if (field === 'amount') { va = a.amount; vb = b.amount; }
    else if (field === 'balance') { va = a.balance; vb = b.balance; }
    else { va = a.typeLabel; vb = b.typeLabel; }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // 更新排序表头指示器
  document.querySelectorAll('thead th').forEach(th => th.classList.remove('sorted'));
  const thMap = { date: 'th-date', type: 'th-type', amount: 'th-amount', balance: 'th-balance' };
  if (thMap[field]) document.getElementById(thMap[field]).classList.add('sorted');

  currentPage = 1;
  renderTable();
}

// ── 选择操作 ──

function toggleRow(id, e) {
  e.stopPropagation();
  if (selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  renderTable();
}

function toggleSelectAll() {
  const total = Math.ceil(filteredRecords.length / pageSize) || 1;
  if (total === 0) return;
  const start = (currentPage - 1) * pageSize;
  const page = filteredRecords.slice(start, start + pageSize);
  const allSelected = page.every(r => selectedIds.has(r.id));
  if (allSelected) { page.forEach(r => selectedIds.delete(r.id)); }
  else { page.forEach(r => selectedIds.add(r.id)); }
  renderTable();
}

function selectAll() {
  filteredRecords.forEach(r => selectedIds.add(r.id));
  renderTable();
}

function clearSelection() {
  selectedIds.clear();
  renderTable();
}
