/**
 * data.js — 数据加载模块
 * 依赖：无
 *
 * 从独立 JSON 文件加载：
 *   data/config.json   — 类型/状态配置
 *   data/banks.json    — 银行账户监控数据
 *   data/transactions/ — 各账户的流水明细
 */

// ── 全局数据 ──
let config = {};
let typeMap = {};
let typeColors = {};
let statusLabels = {};
let statusColors = {};
let bankList = [];
let allAccounts = [];
let allRecords = [];        // 当前查看的账户流水

// ── 工具函数 ──
function fmtNum(n) {
  return n.toLocaleString('zh-CN');
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return diffMin + '分钟前';
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + '小时前';
  return fmtDate(d) + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

// ── 数据加载 ──
async function loadConfig() {
  const res = await fetch('data/config.json');
  config = await res.json();
  typeMap = config.typeMap;
  typeColors = config.typeColors;
  statusLabels = config.statusLabels;
  statusColors = config.statusColors;
  bankList = config.bankList;
  return config;
}

async function loadBanks() {
  const res = await fetch('data/banks.json');
  allAccounts = await res.json();
  // parse dates
  allAccounts.forEach(a => { a.lastUpdated = new Date(a.lastUpdated); });
  return allAccounts;
}

async function loadTransactions(accountId) {
  const acct = allAccounts.find(a => a.id === accountId);
  if (!acct || !acct.transactionFile) {
    allRecords = [];
    return [];
  }
  const res = await fetch('data/transactions/' + acct.transactionFile);
  const records = await res.json();
  // parse dates back to Date objects
  allRecords = records.map(r => ({ ...r, date: new Date(r.date) }));
  return allRecords;
}
