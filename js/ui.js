/**
 * ui.js — DOM 渲染函数
 * 依赖：data.js（fmtNum, fmtDate, typeMap）、state.js（所有状态变量）
 */

// ── 表格渲染 ──

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const page = filteredRecords.slice(start, start + pageSize);

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:60px 20px;color:var(--text-muted);">
      <div style="font-size:15px;margin-bottom:8px;">暂无匹配的交易记录</div>
      <div style="font-size:12px;">尝试调整筛选条件</div>
    </td></tr>`;
    document.getElementById('resultCount').innerHTML = '0<span>条记录</span>';
    document.getElementById('paginationInfo').textContent = '无匹配记录';
    document.getElementById('paginationControls').innerHTML = '';
    updateSelectionUI();
    return;
  }

  tbody.innerHTML = page.map((r, idx) => `
    <tr style="animation-delay:${idx * 0.03}s" data-id="${r.id}">
      <td class="checkbox-col">
        <span class="custom-checkbox${selectedIds.has(r.id) ? ' checked' : ''}" onclick="toggleRow(${r.id}, event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="%230a0b0f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </td>
      <td class="cell-date">${r.dateStr}<br><span style="font-size:10px;color:var(--text-muted)">${r.timeStr}</span></td>
      <td><span class="cell-type ${r.typeColor}">${r.typeLabel}</span></td>
      <td>${r.counterparty}</td>
      <td style="font-family:'JetBrains Mono','DM Sans',monospace;font-size:12px;letter-spacing:0.03em;">${r.account.replace(/(\d{4})/g, '$1 ').trim()}</td>
      <td class="cell-amount ${r.isCredit ? 'cell-amount--credit' : 'cell-amount--debit'}">${r.amountStr}</td>
      <td class="cell-balance">${r.balanceStr}</td>
      <td class="cell-remark" title="${r.remark}">${r.remark}</td>
    </tr>
  `).join('');

  // Trigger row animations
  requestAnimationFrame(() => {
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      tr.style.animation = 'none';
      tr.offsetHeight;
      tr.style.animation = `rowReveal 0.45s var(--transition-smooth) ${i * 0.03}s both`;
    });
  });

  document.getElementById('resultCount').innerHTML = `${filteredRecords.length}<span>条记录</span>`;
  const end = Math.min(start + pageSize, filteredRecords.length);
  document.getElementById('paginationInfo').textContent =
    `显示第 ${start + 1}–${end} 条，共 ${filteredRecords.length} 条记录`;
  renderPagination(totalPages);
  updateSelectionUI();
}

// ── 分页渲染 ──

function renderPagination(totalPages) {
  const container = document.getElementById('paginationControls');
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '';
  html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }
  pages.forEach(p => {
    if (p === '…') html += '<span class="page-ellipsis">…</span>';
    else html += `<button class="page-btn${p === currentPage ? ' page-btn--active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  });
  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;
}

function goToPage(p) {
  const total = Math.ceil(filteredRecords.length / pageSize) || 1;
  if (p < 1 || p > total) return;
  currentPage = p;
  renderTable();
}

// ── 选择状态 UI 更新 ──

function updateSelectionUI() {
  const badge = document.getElementById('selectedBadge');
  const countEl = document.getElementById('selectedCount');
  const headerCb = document.getElementById('headerCheckbox');

  if (selectedIds.size > 0) {
    badge.style.display = 'inline-flex';
    countEl.textContent = selectedIds.size;
  } else {
    badge.style.display = 'none';
  }

  // Header checkbox 状态
  const total = Math.ceil(filteredRecords.length / pageSize) || 1;
  if (total === 0) { headerCb.classList.remove('checked'); return; }
  const start = (currentPage - 1) * pageSize;
  const page = filteredRecords.slice(start, start + pageSize);
  const allSelected = page.length > 0 && page.every(r => selectedIds.has(r.id));
  headerCb.classList.toggle('checked', allSelected);
}

// ── 激活筛选徽章 ──

function updateActiveBadges() {
  const container = document.getElementById('activeBadges');
  const badges = [];

  const search = document.getElementById('filterSearch').value.trim();
  const type = document.getElementById('filterType').value;
  const dateFrom = document.getElementById('filterDateFrom').value;
  const dateTo = document.getElementById('filterDateTo').value;
  const amount = document.getElementById('filterAmount').value;

  if (search) {
    badges.push({
      label: `搜索: "${search}"`,
      onclick: `document.getElementById('filterSearch').value='';applyFilters();`
    });
  }
  if (type !== 'all') {
    badges.push({
      label: typeMap[type],
      onclick: `document.getElementById('filterType').value='all';applyFilters();`
    });
  }
  if (dateFrom || dateTo) {
    badges.push({
      label: `${dateFrom || '…'} – ${dateTo || '…'}`,
      onclick: `document.getElementById('filterDateFrom').value='';document.getElementById('filterDateTo').value='';applyFilters();`
    });
  }
  if (amount !== 'all') {
    const amtLabels = { small: '<1,000', medium: '1K–10K', large: '10K–100K', xlarge: '>100K' };
    badges.push({
      label: amtLabels[amount],
      onclick: `document.getElementById('filterAmount').value='all';applyFilters();`
    });
  }

  container.innerHTML = badges.map(b => `
    <span class="badge-filter" onclick="event.stopPropagation();${b.onclick}" style="cursor:pointer;">
      <span class="badge-filter__dot"></span>${b.label}<span class="badge-filter__x">×</span>
    </span>
  `).join('');
}

// ── Toast 通知 ──

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('toast--visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('toast--visible'), 2200);
}
