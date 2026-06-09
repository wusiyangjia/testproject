/**
 * state.js — 应用状态变量
 * 依赖：data.js（allRecords）
 */

let filteredRecords = [];  // 由 init() 在 loadData() 后填充
let currentPage = 1;
const pageSize = 15;
let sortField = 'date';
let sortDir = 'desc';
let selectedIds = new Set();
