---
title: "React Hooks 完整参考"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "React Hooks 的完整 API 参考"
tags: [React, Hooks, JavaScript]
categories:
  - 生活随笔
  - 生活随笔
  - 生活随笔
  - 技术
  - 教程
author: Frida
---

import { 
  useState, useReducer, useEffect, useLayoutEffect,
  useRef, useCallback, useMemo, useContext,
  createContext, useTransition, useDeferredValue, useId,
  useDebugValue
} from "react";

// ============================================================
// useContext + createContext — 全局主题管理
// ============================================================
const ThemeContext = createContext();

// ============================================================
// useReducer — 复杂状态管理（任务的增删改查）
// ============================================================
const initialTasks = [
  { id: 1, text: "学习 React Hooks", done: true, priority: "high" },
  { id: 2, text: "构建任务管理应用", done: false, priority: "high" },
  { id: 3, text: "阅读官方文档", done: false, priority: "medium" },
  { id: 4, text: "写单元测试", done: false, priority: "low" },
];

function taskReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, { id: Date.now(), text: action.text, done: false, priority: action.priority }];
    case "TOGGLE":
      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case "DELETE":
      return state.filter(t => t.id !== action.id);
    case "CLEAR_DONE":
      return state.filter(t => !t.done);
    default:
      return state;
  }
}

// ============================================================
// 自定义 Hook — useLocalStorage（内含 useDebugValue）
// ============================================================
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  // useDebugValue：在 DevTools 中显示调试信息
  useDebugValue(value, v => `${key}: ${JSON.stringify(v).slice(0, 30)}`);

  const set = useCallback((val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  }, [key]);

  return [value, set];
}

// ============================================================
// 主应用
// ============================================================
export default function App() {
  // useState — 控制主题
  const [theme, setTheme] = useState("dark");

  return (
    // useContext Provider 包裹，传递主题
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TaskApp />
    </ThemeContext.Provider>
  );
}

function TaskApp() {
  // useContext — 消费全局主题
  const { theme, setTheme } = useContext(ThemeContext);

  // useReducer — 管理任务列表
  const [tasks, dispatch] = useReducer(taskReducer, initialTasks);

  // useState — 输入框、优先级、搜索词
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [search, setSearch] = useState("");

  // useLocalStorage (自定义Hook) — 持久化过滤条件
  const [filter, setFilter] = useLocalStorage("task-filter", "all");

  // useRef — 自动聚焦输入框
  const inputRef = useRef(null);

  // useRef — 记录渲染次数（不触发重渲染）
  const renderCount = useRef(0);
  renderCount.current += 1;

  // useTransition — 搜索为"低优先级"更新，保持输入流畅
  const [isPending, startTransition] = useTransition();

  // useDeferredValue — 延迟搜索词，避免频繁过滤
  const deferredSearch = useDeferredValue(search);

  // useId — 生成无障碍用的唯一 ID
  const inputId = useId();
  const searchId = useId();

  // useEffect — 页面标题随任务数变化
  useEffect(() => {
    const undone = tasks.filter(t => !t.done).length;
    document.title = undone > 0 ? `(${undone}) 任务管理` : "任务管理";
    return () => { document.title = "任务管理"; }; // 清理函数
  }, [tasks]);

  // useLayoutEffect — 任务新增后同步滚动到底部（需在绘制前执行）
  const listRef = useRef(null);
  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [tasks.length]);

  // useMemo — 过滤 + 搜索计算，依赖不变时跳过
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (filter === "done") return t.done;
        if (filter === "todo") return !t.done;
        return true;
      })
      .filter(t => t.text.toLowerCase().includes(deferredSearch.toLowerCase()));
  }, [tasks, filter, deferredSearch]);

  // useMemo — 统计数字
  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    todo: tasks.filter(t => !t.done).length,
  }), [tasks]);

  // useCallback — 缓存提交函数，避免子组件重渲染
  const handleAdd = useCallback(() => {
    if (!input.trim()) return;
    dispatch({ type: "ADD", text: input.trim(), priority });
    setInput("");
    inputRef.current?.focus();
  }, [input, priority]);

  // useCallback — 缓存搜索处理（搜索用 transition 包裹）
  const handleSearch = useCallback((e) => {
    startTransition(() => setSearch(e.target.value));
  }, []);

  const isDark = theme === "dark";

  const styles = {
    app: {
      minHeight: "100vh",
      background: isDark
        ? "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)"
        : "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #dce8fb 100%)",
      fontFamily: "'Syne', 'Noto Sans SC', sans-serif",
      padding: "0",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    },
    container: {
      width: "100%",
      maxWidth: 680,
      padding: "40px 24px 80px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 32,
    },
    title: {
      fontSize: 36,
      fontWeight: 800,
      letterSpacing: "-1.5px",
      color: isDark ? "#e8eaf6" : "#1a237e",
      margin: 0,
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? "#7986cb" : "#5c6bc0",
      marginTop: 6,
      fontWeight: 500,
      letterSpacing: "0.5px",
    },
    themeBtn: {
      background: isDark ? "rgba(121,134,203,0.15)" : "rgba(92,107,192,0.12)",
      border: `1px solid ${isDark ? "rgba(121,134,203,0.3)" : "rgba(92,107,192,0.25)"}`,
      borderRadius: 12,
      padding: "8px 16px",
      color: isDark ? "#9fa8da" : "#5c6bc0",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      transition: "all 0.2s",
    },
    statsRow: {
      display: "flex",
      gap: 12,
      marginBottom: 28,
    },
    statCard: (color) => ({
      flex: 1,
      padding: "14px 16px",
      borderRadius: 14,
      background: isDark ? `rgba(${color}, 0.12)` : `rgba(${color}, 0.08)`,
      border: `1px solid rgba(${color}, 0.25)`,
      textAlign: "center",
    }),
    statNum: (color) => ({
      fontSize: 28,
      fontWeight: 800,
      color: `rgb(${color})`,
      lineHeight: 1,
    }),
    statLabel: {
      fontSize: 11,
      color: isDark ? "#90a4ae" : "#78909c",
      marginTop: 4,
      fontWeight: 600,
      letterSpacing: "0.8px",
      textTransform: "uppercase",
    },
    inputSection: {
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
      borderRadius: 18,
      padding: "20px",
      marginBottom: 20,
      backdropFilter: "blur(10px)",
    },
    inputRow: {
      display: "flex",
      gap: 10,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      border: `1.5px solid ${isDark ? "rgba(121,134,203,0.3)" : "rgba(92,107,192,0.2)"}`,
      borderRadius: 12,
      padding: "11px 16px",
      color: isDark ? "#e8eaf6" : "#1a237e",
      fontSize: 15,
      outline: "none",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    addBtn: {
      background: "linear-gradient(135deg, #5c6bc0, #7986cb)",
      border: "none",
      borderRadius: 12,
      padding: "11px 22px",
      color: "white",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "opacity 0.2s, transform 0.1s",
      letterSpacing: "0.3px",
    },
    priorityRow: {
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    priorityLabel: {
      fontSize: 12,
      color: isDark ? "#78909c" : "#90a4ae",
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
    priorityBtn: (p) => ({
      padding: "5px 14px",
      borderRadius: 8,
      border: `1.5px solid ${priority === p ? priorityColor(p) : "transparent"}`,
      background: priority === p
        ? `${priorityColor(p)}22`
        : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      color: priority === p ? priorityColor(p) : isDark ? "#78909c" : "#90a4ae",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      transition: "all 0.15s",
    }),
    filterRow: {
      display: "flex",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    filterBtn: (active) => ({
      padding: "7px 18px",
      borderRadius: 10,
      border: "none",
      background: active
        ? isDark ? "rgba(121,134,203,0.25)" : "rgba(92,107,192,0.15)"
        : "transparent",
      color: active
        ? isDark ? "#9fa8da" : "#5c6bc0"
        : isDark ? "#546e7a" : "#b0bec5",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      transition: "all 0.15s",
    }),
    searchInput: {
      width: "100%",
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
      borderRadius: 12,
      padding: "10px 16px",
      color: isDark ? "#e8eaf6" : "#1a237e",
      fontSize: 14,
      outline: "none",
      fontFamily: "inherit",
      marginBottom: 16,
      boxSizing: "border-box",
    },
    taskList: {
      maxHeight: 380,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      paddingRight: 4,
    },
    taskItem: (done) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 14,
      background: isDark
        ? done ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)"
        : done ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.8)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      cursor: "pointer",
      transition: "all 0.2s",
      opacity: done ? 0.55 : 1,
    }),
    checkbox: (done) => ({
      width: 20,
      height: 20,
      borderRadius: 6,
      border: `2px solid ${done ? "#7986cb" : isDark ? "#455a64" : "#b0bec5"}`,
      background: done ? "linear-gradient(135deg, #5c6bc0, #7986cb)" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.2s",
    }),
    taskText: (done) => ({
      flex: 1,
      fontSize: 15,
      color: isDark ? (done ? "#546e7a" : "#cfd8dc") : (done ? "#b0bec5" : "#37474f"),
      textDecoration: done ? "line-through" : "none",
      fontWeight: done ? 400 : 500,
      transition: "all 0.2s",
    }),
    badge: (p) => ({
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.8px",
      color: priorityColor(p),
      background: `${priorityColor(p)}18`,
      padding: "2px 8px",
      borderRadius: 6,
      textTransform: "uppercase",
    }),
    deleteBtn: {
      background: "none",
      border: "none",
      color: isDark ? "#455a64" : "#cfd8dc",
      cursor: "pointer",
      fontSize: 16,
      padding: "2px 6px",
      borderRadius: 6,
      transition: "color 0.15s",
      lineHeight: 1,
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      padding: "0 4px",
    },
    renderCount: {
      fontSize: 11,
      color: isDark ? "#37474f" : "#cfd8dc",
      fontWeight: 600,
    },
    clearBtn: {
      background: "none",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      borderRadius: 8,
      padding: "6px 14px",
      color: isDark ? "#546e7a" : "#b0bec5",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      transition: "all 0.15s",
    },
    pendingHint: {
      fontSize: 12,
      color: "#7986cb",
      marginBottom: 8,
      height: 18,
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    hookTag: {
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 6,
      background: "rgba(121,134,203,0.15)",
      color: "#7986cb",
      letterSpacing: "0.5px",
      marginLeft: 6,
    },
    sectionLabel: {
      fontSize: 11,
      color: isDark ? "#455a64" : "#cfd8dc",
      fontWeight: 700,
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    emptyState: {
      textAlign: "center",
      padding: "40px 0",
      color: isDark ? "#37474f" : "#cfd8dc",
      fontSize: 14,
    },
  };

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={styles.container}>

        {/* 顶部标题 */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>任务管理器</h1>
            <div style={styles.subtitle}>React Hooks 综合案例演示</div>
          </div>
          {/* useContext 消费主题 */}
          <button style={styles.themeBtn} onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? "☀ 浅色" : "☾ 深色"}
          </button>
        </div>

        {/* 统计卡片 — useMemo */}
        <div style={styles.statsRow}>
          {[
            { label: "全部", val: stats.total, color: "121,134,203" },
            { label: "待完成", val: stats.todo, color: "255,167,38" },
            { label: "已完成", val: stats.done, color: "102,187,106" },
          ].map(s => (
            <div key={s.label} style={styles.statCard(s.color)}>
              <div style={styles.statNum(s.color)}>{s.val}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 添加任务 — useState + useRef + useCallback + useId */}
        <div style={styles.inputSection}>
          <div style={styles.sectionLabel}>
            添加任务
            <span style={styles.hookTag}>useState</span>
            <span style={styles.hookTag}>useRef</span>
            <span style={styles.hookTag}>useCallback</span>
            <span style={styles.hookTag}>useId</span>
          </div>
          <div style={styles.inputRow}>
            <label htmlFor={inputId} style={{ display: "none" }}>任务内容</label>
            <input
              id={inputId} // useId 生成的无障碍 ID
              ref={inputRef} // useRef 访问 DOM
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="输入任务内容，回车添加…"
            />
            <button style={styles.addBtn} onClick={handleAdd}>+ 添加</button>
          </div>
          <div style={styles.priorityRow}>
            <span style={styles.priorityLabel}>优先级：</span>
            {["high", "medium", "low"].map(p => (
              <button key={p} style={styles.priorityBtn(p)} onClick={() => setPriority(p)}>
                {p === "high" ? "🔴 高" : p === "medium" ? "🟡 中" : "🟢 低"}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索 — useTransition + useDeferredValue */}
        <div style={styles.sectionLabel}>
          搜索与过滤
          <span style={styles.hookTag}>useTransition</span>
          <span style={styles.hookTag}>useDeferredValue</span>
          <span style={styles.hookTag}>useMemo</span>
        </div>
        <label htmlFor={searchId} style={{ display: "none" }}>搜索任务</label>
        <input
          id={searchId}
          style={styles.searchInput}
          placeholder="🔍  搜索任务…"
          onChange={handleSearch} // useTransition 包裹，低优先级更新
        />

        {/* Transition 状态提示 */}
        <div style={styles.pendingHint}>
          {isPending && <><span>⏳</span> 搜索中…</>}
        </div>

        {/* 过滤按钮 — useLocalStorage（自定义Hook） */}
        <div style={styles.filterRow}>
          {[
            { key: "all", label: "全部" },
            { key: "todo", label: "待完成" },
            { key: "done", label: "已完成" },
          ].map(f => (
            <button key={f.key} style={styles.filterBtn(filter === f.key)} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* 任务列表 — useReducer + useLayoutEffect */}
        <div style={styles.sectionLabel}>
          任务列表
          <span style={styles.hookTag}>useReducer</span>
          <span style={styles.hookTag}>useLayoutEffect</span>
        </div>
        <div ref={listRef} style={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>暂无任务 ✨</div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                isDark={isDark}
                styles={styles}
                onToggle={() => dispatch({ type: "TOGGLE", id: task.id })}
                onDelete={() => dispatch({ type: "DELETE", id: task.id })}
              />
            ))
          )}
        </div>

        {/* 底部 */}
        <div style={styles.footer}>
          <span style={styles.renderCount}>渲染次数：{renderCount.current} 次（useRef 记录）</span>
          {stats.done > 0 && (
            <button style={styles.clearBtn} onClick={() => dispatch({ type: "CLEAR_DONE" })}>
              清除已完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件 — 接收 useCallback 缓存的函数，避免不必要重渲染
// ============================================================
function TaskItem({ task, isDark, styles, onToggle, onDelete }) {
  return (
    <div style={styles.taskItem(task.done)} onClick={onToggle}>
      <div style={styles.checkbox(task.done)}>
        {task.done && <span style={{ color: "white", fontSize: 12, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={styles.taskText(task.done)}>{task.text}</span>
      <span style={styles.badge(task.priority)}>
        {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
      </span>
      <button
        style={styles.deleteBtn}
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="删除"
      >✕</button>
    </div>
  );
}

function priorityColor(p) {
  return p === "high" ? "#ef5350" : p === "medium" ? "#ffa726" : "#66bb6a";
}
