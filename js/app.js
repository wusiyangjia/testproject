/**
 * app.js — 操作处理和初始化入口
 * 依赖：data.js、state.js、ui.js、store.js
 */

// ── 下载流水 ──

function handleDownload() {
  const ids = selectedIds.size > 0 ? [...selectedIds] : filteredRecords.map(r => r.id);
  const records = allRecords.filter(r => ids.includes(r.id));

  // 构建 CSV
  const header = '交易日期,时间,类型,对方户名,对方账号,金额,余额,摘要\n';
  const rows = records.map(r =>
    `${r.dateStr},${r.timeStr},${r.typeLabel},${r.counterparty},${r.account},${r.isCredit ? '+' : '-'}${r.amount},${r.balance},${r.remark}`
  ).join('\n');
  const bom = '﻿';
  const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `交易流水_${fmtDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast(`已下载 ${records.length} 笔交易记录`);
}

// ── 打印流水 ──

function handlePrint() {
  const ids = selectedIds.size > 0 ? [...selectedIds] : filteredRecords.map(r => r.id);
  const records = allRecords.filter(r => ids.includes(r.id));

  const w = window.open('', '_blank', 'width=1000,height=700');
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>交易流水打印</title>
  <style>
    body { font-family: 'DM Sans', 'Microsoft YaHei', sans-serif; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 22px; margin-bottom: 6px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f5f5f5; text-align: left; padding: 8px 10px; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 8px 10px; border-bottom: 1px solid #eee; }
    .credit { color: #4e90c8; } .debit { color: #d4716a; }
    @media print { body { padding: 20px; } button { display: none; } }
  </style></head><body>
  <h1>交易流水明细</h1>
  <div class="meta">导出日期: ${fmtDate(new Date())} · 共 ${records.length} 笔交易</div>
  <table><thead><tr><th>日期</th><th>时间</th><th>类型</th><th>对方户名</th><th>对方账号</th><th>金额</th><th>余额</th><th>摘要</th></tr></thead><tbody>
  ${records.map(r => `<tr>
    <td>${r.dateStr}</td><td>${r.timeStr}</td><td>${r.typeLabel}</td><td>${r.counterparty}</td>
    <td style="font-family:monospace">${r.account}</td>
    <td class="${r.isCredit ? 'credit' : 'debit'}">${r.amountStr}</td><td style="font-family:monospace">${r.balanceStr}</td>
    <td>${r.remark}</td></tr>`).join('')}
  </tbody></table>
  <div style="margin-top:16px;text-align:right;"><button onclick="window.print()" style="padding:8px 20px;font-size:13px;cursor:pointer;">🖨 打印</button></div>
  </body></html>`;
  w.document.write(html);
  w.document.close();
}

// ── 刷新数据 ──

function handleRefresh() {
  const tbody = document.getElementById('tableBody');
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.style.opacity = '0.4';
    tr.style.transition = 'opacity 0.2s';
  });
  setTimeout(() => {
    applyFilters();
    showToast('数据已刷新');
  }, 400);
}

// ── 初始化入口（异步）──

async function init() {
  try {
    // 从独立 JSON 文件加载数据
    await loadData();
  } catch (err) {
    document.getElementById('tableBody').innerHTML =
      `<tr><td colspan="8" style="text-align:center;padding:60px 20px;color:var(--text-muted);">
        <div style="font-size:15px;margin-bottom:8px;">数据加载失败</div>
        <div style="font-size:12px;">请通过 HTTP 服务器打开页面（如 npx serve . 或 python -m http.server）</div>
      </td></tr>`;
    return;
  }

  // 数据就绪后初始化状态
  filteredRecords = [...allRecords];

  // 设置默认日期范围（近30天）
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  document.getElementById('filterDateFrom').value = fmtDate(from);
  document.getElementById('filterDateTo').value = fmtDate(to);

  applyFilters();
  // 初始排序指示器
  document.getElementById('th-date').classList.add('sorted');
}

init();
