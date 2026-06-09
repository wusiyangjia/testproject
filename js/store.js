/**
 * store.js — 业务逻辑：筛选、排序
 * 依赖：data.js、state.js、ui.js
 */

// ══════════════════════════════════════════
// 仪表盘筛选 & 排序
// ══════════════════════════════════════════

function applyDashboardFilters() {
  dashboardFiltered = allAccounts.filter(a => {
    if (dashboardSearch) {
      const q = dashboardSearch.toLowerCase();
      if (!a.bankName.toLowerCase().includes(q) &&
          !a.subBranch.toLowerCase().includes(q) &&
          !a.accountName.toLowerCase().includes(q) &&
          !a.accountNumber.includes(q)) return false;
    }
    if (dashboardBankFilter !== 'all' && a.bankName !== dashboardBankFilter) return false;
    if (dashboardStatusFilter !== 'all' && a.status !== dashboardStatusFilter) return false;
    return true;
  });

  sortDashboard();
  dashboardCurrentPage = 1;
  renderDashboard();
}

function sortDashboard() {
  const dir = dashboardSortDir === 'asc' ? 1 : -1;
  dashboardFiltered.sort((a, b) => {
    if (dashboardSortField === 'lastUpdated') return (a.lastUpdated - b.lastUpdated) * dir;
    if (dashboardSortField === 'bankName') return a.bankName.localeCompare(b.bankName, 'zh') * dir;
    if (dashboardSortField === 'status') {
      const orderA = config.statusOrder.indexOf(a.status);
      const orderB = config.statusOrder.indexOf(b.status);
      return (orderA - orderB) * dir;
    }
    return 0;
  });
}

function sortDashboardBy(field) {
  if (dashboardSortField === field) {
    dashboardSortDir = dashboardSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    dashboardSortField = field;
    dashboardSortDir = 'asc';
  }
  applyDashboardFilters();
}

function resetDashboardFilters() {
  dashboardSearch = '';
  dashboardBankFilter = 'all';
  dashboardStatusFilter = 'all';
  document.getElementById('filterSearch').value = '';
  document.getElementById('filterBank').value = 'all';
  document.getElementById('filterStatus').value = 'all';
  applyDashboardFilters();
}

// ══════════════════════════════════════════
// 明细页排序
// ══════════════════════════════════════════

function sortDetailBy(field) {
  if (detailSortField === field) {
    detailSortDir = detailSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    detailSortField = field;
    detailSortDir = field === 'date' ? 'desc' : 'asc';
  }

  detailFilteredRecords.sort((a, b) => {
    let va, vb;
    if (field === 'date') { va = a.date.getTime(); vb = b.date.getTime(); }
    else if (field === 'amount') { va = a.amount; vb = b.amount; }
    else if (field === 'balance') { va = a.balance; vb = b.balance; }
    else { va = a.typeLabel; vb = b.typeLabel; }
    if (va < vb) return detailSortDir === 'asc' ? -1 : 1;
    if (va > vb) return detailSortDir === 'asc' ? 1 : -1;
    return 0;
  });

  detailCurrentPage = 1;
  renderDetail();
}
