/**
 * ui.js — DOM 渲染函数
 * 依赖：data.js、state.js
 */

// ══════════════════════════════════════════
// 视图容器切换
// ══════════════════════════════════════════

function showView(view) {
  currentView = view;
  document.getElementById('viewDashboard').style.display = view === 'dashboard' ? 'block' : 'none';
  document.getElementById('viewDetail').style.display = view === 'detail' ? 'block' : 'none';
}

// ══════════════════════════════════════════
// 仪表盘渲染
// ══════════════════════════════════════════

function renderDashboard() {
  updateDashboardStats();
  renderDashboardTable();
  updateDashboardBadges();
}

function updateDashboardStats() {
  const total = allAccounts.length;
  const pending = allAccounts.filter(a => a.status === 'pending').length;
  const loggingIn = allAccounts.filter(a => a.status === 'logging_in').length;
  const downloading = allAccounts.filter(a => a.status === 'downloading').length;
  const processing = allAccounts.filter(a => a.status === 'processing').length;
  const completed = allAccounts.filter(a => a.status === 'completed').length;
  const failed = allAccounts.filter(a => a.status === 'failed').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statLoggingIn').textContent = loggingIn;
  document.getElementById('statDownloading').textContent = downloading;
  document.getElementById('statProcessing').textContent = processing;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statFailed').textContent = failed;
}

function renderDashboardTable() {
  const totalPages = Math.ceil(dashboardFiltered.length / pageSize) || 1;
  if (dashboardCurrentPage > totalPages) dashboardCurrentPage = totalPages;
  const start = (dashboardCurrentPage - 1) * pageSize;
  const page = dashboardFiltered.slice(start, start + pageSize);

  const tbody = document.getElementById('dashboardBody');

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:60px 20px;color:var(--text-muted);">
      <div style="font-size:15px;margin-bottom:8px;">暂无匹配的银行账户</div>
      <div style="font-size:12px;">尝试调整筛选条件</div>
    </td></tr>`;
  } else {
    tbody.innerHTML = page.map((a, idx) => `
      <tr style="animation-delay:${idx * 0.02}s" data-id="${a.id}" class="${a.status === 'completed' ? 'row--clickable' : ''}" onclick="${a.status === 'completed' ? `navigateToDetail(${a.id})` : ''}">
        <td>
          <div class="bank-name">${a.bankName}</div>
          <div class="bank-sub">${a.subBranch} · ${a.accountName}</div>
        </td>
        <td>
          <span class="account-number">${a.accountNumber}</span>
        </td>
        <td>
          <span class="status-badge ${statusColors[a.status]}">
            ${a.status === 'logging_in' || a.status === 'downloading' ? '<span class="status-dot status-dot--pulse"></span>' : '<span class="status-dot"></span>'}
            ${statusLabels[a.status]}
          </span>
          ${a.status === 'downloading' || a.status === 'processing' ? renderProgressBar(a.progress) : ''}
        </td>
        <td class="cell-progress">
          ${a.status === 'completed' ? `<span class="txn-count">${a.transactionCount} 笔</span>` :
            a.status === 'failed' ? `<span class="error-hint" title="${a.errorMsg || ''}">${a.errorMsg || '未知错误'}</span>` :
            a.status === 'pending' ? '<span class="muted-hint">—</span>' :
            `<span class="progress-text">${a.progress}%</span>`}
        </td>
        <td class="cell-time">${fmtDateTime(a.lastUpdated)}</td>
        <td class="cell-action">
          ${a.status === 'completed' ? `<button class="btn btn--tiny" onclick="event.stopPropagation();navigateToDetail(${a.id})">查看流水 →</button>` :
            a.status === 'failed' ? `<button class="btn btn--tiny btn--retry" onclick="event.stopPropagation();showToast('已重新加入下载队列')">重试</button>` :
            '<span class="muted-hint">—</span>'}
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('dashboardResultCount').innerHTML = `${dashboardFiltered.length}<span>个账户</span>`;
  const end = Math.min(start + pageSize, dashboardFiltered.length);
  document.getElementById('dashboardPaginationInfo').textContent =
    dashboardFiltered.length === 0 ? '无匹配账户' : `显示第 ${start + 1}–${end} 个，共 ${dashboardFiltered.length} 个账户`;
  renderPagination('dashboardPaginationControls', totalPages, dashboardCurrentPage, 'goToDashboardPage');
}

function renderProgressBar(pct) {
  return `<div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%"></div></div>`;
}

function renderPagination(containerId, totalPages, currentPage, goFnName) {
  const container = document.getElementById(containerId);
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '';
  html += `<button class="page-btn" onclick="${goFnName}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

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
    else html += `<button class="page-btn${p === currentPage ? ' page-btn--active' : ''}" onclick="${goFnName}(${p})">${p}</button>`;
  });
  html += `<button class="page-btn" onclick="${goFnName}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;
}

function goToDashboardPage(p) {
  const total = Math.ceil(dashboardFiltered.length / pageSize) || 1;
  if (p < 1 || p > total) return;
  dashboardCurrentPage = p;
  renderDashboardTable();
}

function updateDashboardBadges() {
  const container = document.getElementById('activeBadges');
  const badges = [];
  if (dashboardSearch) {
    badges.push({
      label: `搜索: "${dashboardSearch}"`,
      onclick: `dashboardSearch='';document.getElementById('filterSearch').value='';applyDashboardFilters();`
    });
  }
  if (dashboardBankFilter !== 'all') {
    badges.push({
      label: dashboardBankFilter,
      onclick: `dashboardBankFilter='all';document.getElementById('filterBank').value='all';applyDashboardFilters();`
    });
  }
  if (dashboardStatusFilter !== 'all') {
    badges.push({
      label: statusLabels[dashboardStatusFilter],
      onclick: `dashboardStatusFilter='all';document.getElementById('filterStatus').value='all';applyDashboardFilters();`
    });
  }
  container.innerHTML = badges.map(b => `
    <span class="badge-filter" onclick="event.stopPropagation();${b.onclick}" style="cursor:pointer;">
      <span class="badge-filter__dot"></span>${b.label}<span class="badge-filter__x">×</span>
    </span>
  `).join('');
}

// ══════════════════════════════════════════
// 明细页渲染
// ══════════════════════════════════════════

async function renderDetail() {
  if (!selectedAccount) return;

  // 更新面包屑
  document.getElementById('detailBankName').textContent = selectedAccount.bankName;
  document.getElementById('detailSubBranch').textContent = selectedAccount.subBranch;
  document.getElementById('detailAccountInfo').textContent =
    `账号: ${selectedAccount.accountNumber} · ${selectedAccount.accountName} · 本次下载 ${selectedAccount.transactionCount} 条交易`;

  const totalPages = Math.ceil(detailFilteredRecords.length / pageSize) || 1;
  if (detailCurrentPage > totalPages) detailCurrentPage = totalPages;
  const start = (detailCurrentPage - 1) * pageSize;
  const page = detailFilteredRecords.slice(start, start + pageSize);

  const tbody = document.getElementById('detailBody');

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:60px 20px;color:var(--text-muted);">
      <div style="font-size:15px;margin-bottom:8px;">暂无交易记录</div>
    </td></tr>`;
  } else {
    tbody.innerHTML = page.map((r, idx) => `
      <tr style="animation-delay:${idx * 0.02}s">
        <td class="cell-date">${r.dateStr}<br><span style="font-size:10px;color:var(--text-muted)">${r.timeStr}</span></td>
        <td><span class="cell-type ${r.typeColor || typeColors[r.type] || ''}">${r.typeLabel}</span></td>
        <td>${r.counterparty}</td>
        <td style="font-family:'JetBrains Mono','DM Sans',monospace;font-size:12px;letter-spacing:0.03em;">${r.account.replace(/(\\d{4})/g, '$1 ').trim()}</td>
        <td class="cell-amount ${r.isCredit ? 'cell-amount--credit' : 'cell-amount--debit'}">${r.amountStr}</td>
        <td class="cell-balance">${r.balanceStr}</td>
        <td class="cell-remark" title="${r.remark}">${r.remark}</td>
      </tr>
    `).join('');
  }

  document.getElementById('detailResultCount').innerHTML = `${detailFilteredRecords.length}<span>条记录</span>`;
  const end = Math.min(start + pageSize, detailFilteredRecords.length);
  document.getElementById('detailPaginationInfo').textContent =
    detailFilteredRecords.length === 0 ? '无交易记录' : `显示第 ${start + 1}–${end} 条，共 ${detailFilteredRecords.length} 条记录`;
  renderPagination('detailPaginationControls', totalPages, detailCurrentPage, 'goToDetailPage');
}

function goToDetailPage(p) {
  const total = Math.ceil(detailFilteredRecords.length / pageSize) || 1;
  if (p < 1 || p > total) return;
  detailCurrentPage = p;
  renderDetail();
}

// ══════════════════════════════════════════
// Toast 通知
// ══════════════════════════════════════════

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('toast--visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('toast--visible'), 2200);
}
