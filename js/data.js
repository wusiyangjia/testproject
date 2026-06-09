/**
 * data.js — 数据加载、常量、工具函数
 * 依赖：无
 *
 * 所有业务数据存储在独立的 JSON 文件中：
 *   data/counterparties.json  — 对方户名池
 *   data/remarks.json         — 备注池
 *   data/config.json          — 类型映射 & 颜色配置
 *   data/transactions.json    — 交易流水记录
 */

// ── 全局数据变量（由 loadData() 填充）──
let counterparties = [];
let remarks = [];
let typeMap = {};
let typeColors = {};
let allRecords = [];

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

// ── 数据加载（异步）──

async function loadData() {
  try {
    const [c, r, cfg, txn] = await Promise.all([
      fetch('data/counterparties.json').then(res => res.json()),
      fetch('data/remarks.json').then(res => res.json()),
      fetch('data/config.json').then(res => res.json()),
      fetch('data/transactions.json').then(res => res.json())
    ]);

    counterparties = c;
    remarks = r;
    typeMap = cfg.typeMap;
    typeColors = cfg.typeColors;

    // 将 ISO 日期字符串还原为 Date 对象
    allRecords = txn.map(record => ({
      ...record,
      date: new Date(record.date)
    }));

    return allRecords;
  } catch (err) {
    console.error('数据加载失败，请确保通过 HTTP 服务器打开页面（非 file:// 协议）', err);
    throw err;
  }
}
