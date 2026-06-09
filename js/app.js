/**
 * app.js — 操作处理和初始化入口
 * 依赖：data.js、state.js、ui.js、store.js
 */

// ══════════════════════════════════════════
// 视图导航
// ══════════════════════════════════════════

async function navigateToDetail(accountId) {
  selectedAccount = allAccounts.find(a => a.id === accountId);
  if (!selectedAccount || selectedAccount.status !== 'completed') return;

  showView('detail');
  document.getElementById('detailBody').innerHTML =
    `<tr><td colspan="7" style="text-align:center;padding:80px 20px;">
      <div class="shimmer" style="width:200px;height:20px;border-radius:4px;margin:0 auto 12px;"></div>
      <div style="font-size:12px;color:var(--text-muted);">正在加载流水数据…</div>
    </td></tr>`;

  try {
    await loadTransactions(accountId);
    detailFilteredRecords = [...allRecords];
    detailSortField = 'date';
    detailSortDir = 'desc';
    // 默认按日期倒序
    detailFilteredRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
    detailCurrentPage = 1;
    renderDetail();
  } catch (err) {
    document.getElementById('detailBody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:60px 20px;color:var(--red-ink);">
        <div>流水数据加载失败</div>
      </td></tr>`;
  }
}

function navigateToDashboard() {
  selectedAccount = null;
  allRecords = [];
  detailFilteredRecords = [];
  showView('dashboard');
  applyDashboardFilters();
}

// ══════════════════════════════════════════
// 仪表盘事件处理
// ══════════════════════════════════════════

function handleDashboardSearch() {
  dashboardSearch = document.getElementById('filterSearch').value.toLowerCase().trim();
  applyDashboardFilters();
}

function handleDashboardBankFilter() {
  dashboardBankFilter = document.getElementById('filterBank').value;
  applyDashboardFilters();
}

function handleDashboardStatusFilter() {
  dashboardStatusFilter = document.getElementById('filterStatus').value;
  applyDashboardFilters();
}

function handleRefresh() {
  // 模拟刷新：重新加载银行数据
  const tbody = document.getElementById('dashboardBody');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.style.opacity = '0.4';
      tr.style.transition = 'opacity 0.2s';
    });
  }
  setTimeout(async () => {
    await loadBanks();
    applyDashboardFilters();
    showToast('数据已刷新');
  }, 400);
}

// ══════════════════════════════════════════
// 筛选下拉框填充
// ══════════════════════════════════════════

function populateFilters() {
  // 银行下拉
  const bankSelect = document.getElementById('filterBank');
  bankSelect.innerHTML = '<option value="all">全部银行</option>' +
    bankList.map(b => `<option value="${b}">${b}</option>`).join('');

  // 状态下拉
  const statusSelect = document.getElementById('filterStatus');
  statusSelect.innerHTML = '<option value="all">全部状态</option>' +
    Object.entries(statusLabels).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
}

// ══════════════════════════════════════════
// 初始化入口
// ══════════════════════════════════════════

async function init() {
  try {
    await loadConfig();
    await loadBanks();
  } catch (err) {
    document.getElementById('dashboardBody').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:60px 20px;color:var(--text-muted);">
        <div style="font-size:15px;margin-bottom:8px;">数据加载失败</div>
        <div style="font-size:12px;">请通过 HTTP 服务器打开页面</div>
      </td></tr>`;
    console.error('初始化失败', err);
    return;
  }

  // 填充筛选下拉
  populateFilters();

  // 初始化仪表盘
  showView('dashboard');
  applyDashboardFilters();

  // 设置默认排序指示器
  document.getElementById('th-updated').classList.add('sorted');
}

init();
