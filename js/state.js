/**
 * state.js — 应用状态变量
 * 依赖：data.js（allAccounts, allRecords）
 */

// ── 视图状态 ──
let currentView = 'dashboard';   // 'dashboard' | 'detail'
let selectedAccount = null;      // 当前选中的账户对象

// ── 仪表盘筛选状态 ──
let dashboardFiltered = [];      // 筛选后的账户列表
let dashboardSearch = '';
let dashboardBankFilter = 'all';
let dashboardStatusFilter = 'all';
let dashboardCurrentPage = 1;
let dashboardSortField = 'lastUpdated';
let dashboardSortDir = 'desc';

// ── 明细页状态 ──
let detailFilteredRecords = [];
let detailCurrentPage = 1;
let detailSortField = 'date';
let detailSortDir = 'desc';

const pageSize = 15;
