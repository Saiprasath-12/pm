import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, AreaChart, Area, LineChart, Line
} from "recharts";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg:       "#f4f6f9",
  surface:  "#ffffff",
  card:     "#ffffff",
  sidebar:  "#1c2b3a",
  sideHov:  "#243648",
  sideAct:  "#2e4460",
  border:   "#e2e8f0",
  text:     "#1a2636",
  muted:    "#64748b",
  faint:    "#f1f5f9",
  accent:   "#1d6fcc",
  accentBg: "#edf4fd",
  green:    "#16a34a",
  greenBg:  "#f0fdf4",
  amber:    "#b45309",
  amberBg:  "#fffbeb",
  red:      "#dc2626",
  redBg:    "#fef2f2",
  purple:   "#7c3aed",
  purpleBg: "#f5f3ff",
};

// ─── PROFILES ─────────────────────────────────────────────────────────────────
const DEFAULT_PROFILES = {
  default:    { label: "Default",        fri: 0.30, dri: 0.25, cii: 0.25, gsi: 0.20 },
  compliance: { label: "Compliance",     fri: 0.20, dri: 0.15, cii: 0.15, gsi: 0.50 },
  innovation: { label: "Innovation",     fri: 0.20, dri: 0.35, cii: 0.30, gsi: 0.15 },
  erp:        { label: "ERP / Finance",  fri: 0.40, dri: 0.25, cii: 0.20, gsi: 0.15 },
  cloud:      { label: "Cloud",          fri: 0.25, dri: 0.35, cii: 0.25, gsi: 0.15 },
};

const REASON_CODES = [
  "Strategic Pivot", "Force Majeure", "Executive Directive",
  "Risk Appetite Change", "Vendor Delay", "Regulatory Update",
  "Resource Reallocation", "Scope Clarification", "Budget Rebaseline",
  "Stakeholder Request",
];

// ─── DATA ─────────────────────────────────────────────────────────────────────
const INIT_PROJECTS = [
  { id:"PRJ-001", name:"Project Alpha",   domain:"ERP Migration",       profile:"erp",
    budget:42000000, spent:39900000, burnRate:96.2,
    milestones:12, completed:11, slippage:2,  changeRequests:4,  complianceFlags:0,
    fri:28, dri:22, cii:18, gsi:12, owner:"Priya Sharma",  system:"SAP S/4HANA",
    sapLink:"https://s4hana.example.com/fiori#/transaction/FAGLB03?project=PRJ001",
    snowLink:"https://example.service-now.com/task_list?project=PRJ001",
  },
  { id:"PRJ-002", name:"Project Beta",    domain:"Process Automation",  profile:"default",
    budget:18000000, spent:15300000, burnRate:81.4,
    milestones:8,  completed:5,  slippage:12, changeRequests:14, complianceFlags:2,
    fri:55, dri:63, cii:71, gsi:48, owner:"Marcus Lee",    system:"SAP Signavio + Celonis",
    sapLink:"https://signavio.example.com/p/model?project=PRJ002",
    snowLink:"https://example.service-now.com/task_list?project=PRJ002",
  },
  { id:"PRJ-003", name:"Project Gamma",   domain:"Compliance Overhaul", profile:"compliance",
    budget:31000000, spent:29450000, burnRate:98.8,
    milestones:15, completed:9,  slippage:28, changeRequests:21, complianceFlags:7,
    fri:87, dri:81, cii:89, gsi:92, owner:"Elena Voss",    system:"ServiceNow + GRC",
    sapLink:"https://grc.example.com/control?project=PRJ003",
    snowLink:"https://example.service-now.com/task_list?project=PRJ003",
  },
  { id:"PRJ-004", name:"Project Delta",   domain:"Analytics Uplift",    profile:"default",
    budget:9500000, spent:3800000, burnRate:40.0,
    milestones:6,  completed:3,  slippage:0,  changeRequests:2,  complianceFlags:0,
    fri:14, dri:10, cii:8,  gsi:5,  owner:"Rahul Menon",   system:"SAP Analytics Cloud",
    sapLink:"https://sac.example.com/story?project=PRJ004",
    snowLink:"https://example.service-now.com/task_list?project=PRJ004",
  },
  { id:"PRJ-005", name:"Project Epsilon", domain:"Cloud Integration",   profile:"cloud",
    budget:22000000, spent:17600000, burnRate:74.6,
    milestones:10, completed:6,  slippage:8,  changeRequests:9,  complianceFlags:1,
    fri:44, dri:49, cii:38, gsi:29, owner:"Sarah Chen",    system:"SAP BTP + Azure",
    sapLink:"https://btp.example.com/cockpit?project=PRJ005",
    snowLink:"https://example.service-now.com/task_list?project=PRJ005",
  },
];

const INIT_LOG = [
  { id:1, ts:"2026-02-28 09:14", project:"PRJ-003", action:"Escalated to steering committee — GSI threshold breached", tier:"Escalation", outcome:"Pending",   human:null,           reason:null },
  { id:2, ts:"2026-02-28 08:52", project:"PRJ-002", action:"Resource freeze approved by project owner",                tier:"Review",     outcome:"Approved",  human:"Marcus Lee",   reason:null },
  { id:3, ts:"2026-02-28 07:31", project:"PRJ-001", action:"Budget buffer applied — within policy rules",              tier:"Rule-based",  outcome:"Completed", human:null,           reason:null },
  { id:4, ts:"2026-02-27 16:45", project:"PRJ-005", action:"Dependency delay overridden by project manager",           tier:"Review",     outcome:"Override",  human:"Sarah Chen",   reason:"Vendor Delay" },
  { id:5, ts:"2026-02-27 14:12", project:"PRJ-004", action:"Velocity adjustment applied per schedule rules",           tier:"Rule-based",  outcome:"Completed", human:null,           reason:null },
  { id:6, ts:"2026-02-27 11:09", project:"PRJ-003", action:"Audit exposure escalated — 7 compliance flags open",       tier:"Escalation", outcome:"In Review", human:"Elena Voss",   reason:"Regulatory Update" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(1) + " L";
  return "₹" + n.toLocaleString("en-IN");
}

function computeRIx(p, profiles) {
  const w = profiles[p.profile] || profiles.default;
  return Math.min(99, Math.round(p.fri * w.fri + p.dri * w.dri + p.cii * w.cii + p.gsi * w.gsi));
}

function getStatus(rix) {
  if (rix < 35) return { label: "On Track",  color: C.green,  bg: C.greenBg,  border: "#bbf7d0", dot: C.green  };
  if (rix < 65) return { label: "At Risk",   color: C.amber,  bg: C.amberBg,  border: "#fde68a", dot: C.amber  };
  return              { label: "Critical",   color: C.red,    bg: C.redBg,    border: "#fecaca", dot: C.red    };
}

function getAction(rix) {
  if (rix < 35) return "Rule-based action applied";
  if (rix < 65) return "Pending manager review";
  return "Escalate to steering committee";
}

function runMonteCarlo(project, scenario, iterations = 1000) {
  const baseDelay = { budget_cut:14, scope_expand:21, resource_loss:28, deadline_compress:-5, compliance_breach:10 }[scenario] || 10;
  const baseCost  = { budget_cut:-0.12, scope_expand:0.18, resource_loss:0.08, deadline_compress:0.14, compliance_breach:0.06 }[scenario] || 0.06;
  const delays = [], costs = [];
  for (let i = 0; i < iterations; i++) {
    const u1 = Math.random() || 1e-10, u2 = Math.random() || 1e-10;
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u2)) * Math.cos(2 * Math.PI * u1);
    delays.push(Math.round(baseDelay + z1 * 8 + project.dri / 10));
    costs.push(+(baseCost + z2 * 0.04 + project.fri / 500).toFixed(3));
  }
  delays.sort((a, b) => a - b);
  costs.sort((a, b) => a - b);
  const min = delays[0], max = delays[delays.length - 1];
  const bkt = Math.ceil((max - min) / 18) || 1;
  const histogram = Array.from({ length: 18 }, (_, i) => {
    const lo = min + i * bkt, hi = lo + bkt;
    const count = delays.filter(d => d >= lo && d < hi).length;
    return { label: lo, count, pct: +(count / iterations * 100).toFixed(1) };
  });
  return {
    histogram,
    p10: delays[Math.floor(iterations * 0.10)],
    p50: delays[Math.floor(iterations * 0.50)],
    p80: delays[Math.floor(iterations * 0.80)],
    p90: delays[Math.floor(iterations * 0.90)],
    avgDelay: +(delays.reduce((a, d) => a + d, 0) / iterations).toFixed(1),
    avgCost:  +(costs.reduce((a, c) => a + c, 0) / iterations * 100).toFixed(1),
    costP80:  +(costs[Math.floor(iterations * 0.80)] * 100).toFixed(1),
    worstDelay: delays[Math.floor(iterations * 0.95)],
  };
}

function genHistory(base) {
  return Array.from({ length: 10 }, (_, i) => ({
    t: i, v: Math.min(99, Math.max(5, base + (Math.random() - 0.5) * 20 - (9 - i) * 0.5))
  }));
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${C.bg};color:${C.text};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;font-size:14px}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:${C.border}}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-in{animation:fadeIn .25s ease forwards}
.mono{font-family:'IBM Plex Mono',monospace}

/* Cards & surfaces */
.card{background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px}
.card-sm{background:${C.card};border:1px solid ${C.border};border-radius:8px;padding:14px}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:6px;border:none;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.btn:hover{filter:brightness(.95)}
.btn:disabled{opacity:.45;cursor:not-allowed;filter:none}
.btn-primary{background:${C.accent};color:#fff}
.btn-secondary{background:${C.card};color:${C.text};border:1px solid ${C.border}}
.btn-secondary:hover{background:${C.faint}}
.btn-danger{background:${C.redBg};color:${C.red};border:1px solid #fecaca}
.btn-success{background:${C.greenBg};color:${C.green};border:1px solid #bbf7d0}
.btn-amber{background:${C.amberBg};color:${C.amber};border:1px solid #fde68a}
.btn-sm{padding:5px 10px;font-size:11px}

/* Badges */
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}

/* Form inputs */
input,select,textarea{background:${C.card};border:1px solid ${C.border};color:${C.text};border-radius:6px;padding:8px 10px;font-family:'Inter',sans-serif;font-size:13px;outline:none;transition:border-color .15s;width:100%}
input:focus,select:focus,textarea:focus{border-color:${C.accent};box-shadow:0 0 0 3px rgba(29,111,204,.1)}

/* Tabs */
.tab{padding:7px 14px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid transparent;background:none;color:${C.muted};transition:all .15s}
.tab.active{background:${C.card};color:${C.accent};border-color:${C.border};font-weight:600}
.tab:hover:not(.active){color:${C.text}}

/* Table rows */
.trow{display:grid;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid ${C.border};cursor:pointer;transition:background .12s}
.trow:hover{background:${C.faint}}
.trow:last-child{border-bottom:none}

/* Sidebar nav items */
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:500;color:rgba(255,255,255,.65);transition:all .15s;margin-bottom:2px}
.nav-item:hover{background:${C.sideHov};color:#fff}
.nav-item.active{background:${C.sideAct};color:#fff;font-weight:600}

/* Risk bars */
.rbar-wrap{height:5px;background:${C.faint};border-radius:3px;overflow:hidden;border:1px solid ${C.border}}
.rbar{height:100%;border-radius:3px;transition:width .8s ease}

/* Deep links */
.ext-link{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:5px;background:${C.accentBg};border:1px solid #bfdbfe;color:${C.accent};font-size:11px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .15s}
.ext-link:hover{background:#dbeafe}

/* Section headers */
.sec-title{font-size:11px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px}
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function RiskBar({ label, value, color, bg }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color }}>{Math.round(value)}</span>
      </div>
      <div className="rbar-wrap">
        <div className="rbar" style={{ width: `${Math.round(value)}%`, background: color, opacity: 0.85 }} />
      </div>
    </div>
  );
}

function RixGauge({ value, size = 64 }) {
  const st = getStatus(value);
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={st.color} strokeWidth={5}
        strokeDasharray={`${circ * (value / 100)} ${circ * (1 - value / 100)}`}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dasharray .8s ease" }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={st.color} fontSize={size > 60 ? 13 : 10} fontFamily="IBM Plex Mono" fontWeight="600">{value}</text>
    </svg>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 148 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{label}</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: color || C.text, lineHeight: 1.1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: C.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
      </div>
    </div>
  );
}

function TrendArrow({ history }) {
  if (!history || history.length < 3) return null;
  const slice = history.slice(-4);
  const delta = slice[slice.length - 1].v - slice[0].v;
  if (Math.abs(delta) < 3) return <span style={{ color: C.muted, fontSize: 13 }} title="Stable">→</span>;
  return delta > 0
    ? <span style={{ color: C.red,   fontSize: 13 }} title={`Worsening +${delta.toFixed(1)}`}>↑</span>
    : <span style={{ color: C.green, fontSize: 13 }} title={`Improving ${delta.toFixed(1)}`}>↓</span>;
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const nav = [
    { id: "overview",  icon: "▦",  label: "Overview"     },
    { id: "portfolio", icon: "≡",  label: "Portfolio"    },
    { id: "risk",      icon: "◎",  label: "Risk Monitor" },
    { id: "simulator", icon: "⟳",  label: "Simulator"    },
    { id: "log",       icon: "☰",  label: "Audit Log"    },
    { id: "settings",  icon: "⚙",  label: "Settings"     },
  ];
  return (
    <div style={{ width: 210, minHeight: "100vh", background: C.sidebar, display: "flex", flexDirection: "column", position: "sticky", top: 0, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>▦</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>Portfolio Hub</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 10, letterSpacing: ".5px" }}>Governance Platform</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "14px 10px" }}>
        {nav.map(n => (
          <div key={n.id} className={`nav-item${active === n.id ? " active" : ""}`} onClick={() => setActive(n.id)}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </nav>

      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>PM</div>
          <div>
            <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Portfolio Admin</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Enterprise · Tier 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewView({ projects, profiles, govLog }) {
  const allRix = projects.map(p => computeRIx(p, profiles));
  const onTrack  = allRix.filter(r => r < 35).length;
  const atRisk   = allRix.filter(r => r >= 35 && r < 65).length;
  const critical = allRix.filter(r => r >= 65).length;
  const total    = projects.reduce((s, p) => s + p.budget, 0);
  const spent    = projects.reduce((s, p) => s + p.spent, 0);
  const overrides = govLog.filter(l => l.outcome === "Override").length;

  const recentAlerts = [
    { proj: "PRJ-003", msg: "7 compliance flags exceed policy threshold — escalation required",    sev: "critical" },
    { proj: "PRJ-002", msg: "Scope drift index (71) is above review threshold — manager action needed", sev: "warning"  },
    { proj: "PRJ-005", msg: "Delivery risk rising — sprint velocity below baseline",               sev: "info"     },
  ];

  return (
    <div className="fade-in" style={{ padding: "28px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 3 }}>Portfolio Overview</h1>
          <div style={{ fontSize: 13, color: C.muted }}>Enterprise IT Portfolio Management · FY 2025–26</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          <span style={{ fontSize: 12, color: C.muted }}>All systems operational</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Total Portfolio Value" value={fmt(total)} sub={`${fmt(spent)} utilised`} color={C.accent} icon="₹" />
        <StatCard label="Active Projects" value={projects.length} sub="Across 5 domains" icon="▦" />
        <StatCard label="On Track" value={onTrack} sub="RIx < 35" color={C.green} icon="✓" />
        <StatCard label="At Risk" value={atRisk} sub="RIx 35–65" color={C.amber} icon="!" />
        <StatCard label="Critical" value={critical} sub="Escalation required" color={C.red} icon="▲" />
        <StatCard label="Overrides This Month" value={overrides} sub="Human interventions" color={C.purple} icon="↩" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
        {/* Alerts */}
        <div className="card">
          <div className="sec-title">Alerts & Exceptions</div>
          {recentAlerts.map((a, i) => {
            const c = { critical: C.red, warning: C.amber, info: C.accent }[a.sev];
            const bg = { critical: C.redBg, warning: C.amberBg, info: C.accentBg }[a.sev];
            const border = { critical: "#fecaca", warning: "#fde68a", info: "#bfdbfe" }[a.sev];
            const p = projects.find(pr => pr.id === a.proj);
            return (
              <div key={i} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: i < recentAlerts.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: c, flexShrink: 0 }}>
                  {a.sev === "critical" ? "▲" : a.sev === "warning" ? "!" : "i"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{a.proj}</span>
                    {p && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <a href={p.sapLink} target="_blank" rel="noreferrer" className="ext-link">↗ SAP</a>
                        <a href={p.snowLink} target="_blank" rel="noreferrer" className="ext-link">↗ SNOW</a>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{a.msg}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Health summary */}
        <div className="card">
          <div className="sec-title">Portfolio Health</div>
          {[["On Track", C.green, "#bbf7d0", onTrack], ["At Risk", C.amber, "#fde68a", atRisk], ["Critical", C.red, "#fecaca", critical]].map(([label, color, border, count]) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                </div>
                <span className="mono" style={{ fontSize: 12, color: C.muted }}>{count} / {projects.length}</span>
              </div>
              <div style={{ height: 7, background: C.faint, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <div style={{ height: "100%", width: `${(count / projects.length) * 100}%`, background: color, borderRadius: 4, opacity: .8, transition: "width .8s" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div className="sec-title">Budget Utilisation</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Total Budget", fmt(total), C.text], ["Spent", fmt(spent), C.accent],
                ["Utilisation", `${Math.round(spent / total * 100)}%`, spent / total > 0.9 ? C.red : C.green],
                ["Remaining", fmt(total - spent), C.green]].map(([k, v, c]) => (
                <div key={k} style={{ background: C.faint, borderRadius: 7, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
function PortfolioView({ projects, profiles, setSelected, histories }) {
  const [search, setSearch] = useState("");
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.domain.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ padding: "28px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Portfolio Registry</h1>
        <span style={{ flex: 1 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ width: 220 }} />
        <button className="btn btn-primary btn-sm">+ New Project</button>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 120px 180px 110px 90px 30px",
        gap: 12, padding: "8px 18px", fontSize: 11, fontWeight: 700, color: C.muted,
        textTransform: "uppercase", letterSpacing: ".7px", borderBottom: `1px solid ${C.border}` }}>
        <span>ID</span><span>Project</span><span>Status</span><span>Risk Indices</span><span>Budget</span><span>RIx</span><span></span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.map(p => {
          const rix = computeRIx(p, profiles);
          const st  = getStatus(rix);
          const bpct = Math.round(p.spent / p.budget * 100);
          const hist = histories[p.id] || [];
          return (
            <div key={p.id} className="trow" style={{ gridTemplateColumns: "100px 1fr 120px 180px 110px 90px 30px" }} onClick={() => setSelected(p)}>
              <span className="mono" style={{ fontSize: 11, color: C.muted }}>{p.id}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.domain} · {p.owner}</div>
              </div>
              <span className="badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                {st.label}
              </span>
              <div>
                <RiskBar label="Financial (FRI)" value={p.fri} color={C.red} />
                <RiskBar label="Delivery (DRI)"  value={p.dri} color={C.amber} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: 11, color: bpct > 90 ? C.red : C.muted, marginBottom: 3 }}>{bpct}% used</div>
                <div style={{ height: 4, background: C.faint, borderRadius: 3, border: `1px solid ${C.border}` }}>
                  <div style={{ height: "100%", width: `${bpct}%`, background: bpct > 90 ? C.red : bpct > 75 ? C.amber : C.green, borderRadius: 3, opacity: .8 }} />
                </div>
              </div>
              <RixGauge value={rix} size={48} />
              <TrendArrow history={hist} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>No projects match your search.</div>
        )}
      </div>
    </div>
  );
}

// ─── PROJECT DETAIL MODAL ────────────────────────────────────────────────────
function ProjectDetail({ project, onClose, profiles, histories, setLog }) {
  const [reason, setReason]     = useState("");
  const [note, setNote]         = useState("");
  const rix  = computeRIx(project, profiles);
  const st   = getStatus(rix);
  const hist = histories[project.id] || [];
  const bpct = Math.round(project.spent / project.budget * 100);
  const w    = profiles[project.profile] || profiles.default;

  const handleOverride = () => {
    if (!reason) return;
    setLog(prev => [{
      id: Date.now(),
      ts: new Date().toISOString().slice(0, 16).replace("T", " "),
      project: project.id,
      action: `Manager override: ${reason}${note ? ` — ${note}` : ""}`,
      tier: "Review", outcome: "Override",
      human: "Portfolio Admin", reason,
    }, ...prev]);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,43,58,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
      onClick={onClose}>
      <div className="card fade-in" style={{ width: 760, maxHeight: "90vh", overflow: "auto",
        borderRadius: 12, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{project.id} · {project.system}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{project.name}</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />{st.label}
              </span>
              <a href={project.sapLink} target="_blank" rel="noreferrer" className="ext-link">↗ {project.system.split(" ")[0]}</a>
              <a href={project.snowLink} target="_blank" rel="noreferrer" className="ext-link">↗ ServiceNow</a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "center" }}>
              <RixGauge value={rix} size={68} />
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Risk Index</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Risk indices */}
          <div className="card-sm" style={{ background: C.faint }}>
            <div className="sec-title">Risk Indices</div>
            <RiskBar label="Financial Risk (FRI)"      value={project.fri} color={C.red}    />
            <RiskBar label="Delivery Risk (DRI)"       value={project.dri} color={C.amber}  />
            <RiskBar label="Change Impact (CII)"       value={project.cii} color={C.purple} />
            <RiskBar label="Governance Stability (GSI)" value={project.gsi} color={C.accent} />
            <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
              Profile: <strong style={{ color: C.accent }}>{w.label}</strong> ·
              Weights: FRI {(w.fri*100).toFixed(0)}% · DRI {(w.dri*100).toFixed(0)}% · CII {(w.cii*100).toFixed(0)}% · GSI {(w.gsi*100).toFixed(0)}%
            </div>
          </div>

          {/* Metrics */}
          <div className="card-sm" style={{ background: C.faint }}>
            <div className="sec-title">Project Metrics</div>
            {[
              ["Budget",             fmt(project.budget),                                C.text],
              ["Spent",             `${fmt(project.spent)} (${bpct}%)`,                 bpct > 90 ? C.red : C.amber],
              ["Milestones",        `${project.completed} / ${project.milestones}`,     C.green],
              ["Schedule Slippage", `${project.slippage} days`,                         project.slippage > 15 ? C.red : project.slippage > 5 ? C.amber : C.green],
              ["Change Requests",    project.changeRequests,                             project.changeRequests > 15 ? C.red : C.text],
              ["Compliance Flags",   project.complianceFlags,                            project.complianceFlags > 3 ? C.red : C.text],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span className="mono" style={{ fontWeight: 600, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIx trend */}
        <div className="card-sm" style={{ background: C.faint, marginBottom: 16 }}>
          <div className="sec-title">Risk Index Trend (last 10 readings)</div>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={hist}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={st.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={st.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <ReferenceLine y={35} stroke={C.green} strokeDasharray="3 3" opacity={0.6} />
              <ReferenceLine y={65} stroke={C.red}   strokeDasharray="3 3" opacity={0.6} />
              <Area type="monotone" dataKey="v" stroke={st.color} fill="url(#rg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
            <span style={{ fontSize: 10, color: C.green }}>— On Track ceiling (35)</span>
            <span style={{ fontSize: 10, color: C.red   }}>— Critical floor (65)</span>
          </div>
        </div>

        {/* Override */}
        <div className="card-sm" style={{ background: C.faint }}>
          <div className="sec-title">Record Manual Override</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Reason Code *</label>
              <select value={reason} onChange={e => setReason(e.target.value)}>
                <option value="">— Select reason —</option>
                {REASON_CODES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Additional Note</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional detail..." />
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleOverride} disabled={!reason}>
            Submit Override to Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RISK MONITOR ─────────────────────────────────────────────────────────────
function RiskView({ projects, profiles, histories }) {
  return (
    <div className="fade-in" style={{ padding: "28px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Risk Monitor</h1>
        <span style={{ fontSize: 13, color: C.muted }}>Composite Risk Index (RIx) across portfolio</span>
      </div>

      {/* Formula */}
      <div style={{ background: C.accentBg, border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 16px", marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 4 }}>RISK INDEX FORMULA</div>
        <div className="mono" style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>
          RIx = FRI × w₁ + DRI × w₂ + CII × w₃ + GSI × w₄ &nbsp;(weights from domain profile)
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
        {projects.map(p => {
          const rix  = computeRIx(p, profiles);
          const st   = getStatus(rix);
          const hist = histories[p.id] || [];
          const action = getAction(rix);
          return (
            <div key={p.id} className="card" style={{ border: `1px solid ${st.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{p.id}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{(profiles[p.profile] || profiles.default).label} profile</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendArrow history={hist} />
                  <RixGauge value={rix} size={54} />
                </div>
              </div>

              <span className="badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                {st.label}
              </span>

              <RiskBar label="Financial Risk (FRI)"      value={p.fri} color={C.red}    />
              <RiskBar label="Delivery Risk (DRI)"       value={p.dri} color={C.amber}  />
              <RiskBar label="Change Impact (CII)"       value={p.cii} color={C.purple} />
              <RiskBar label="Governance Stability (GSI)" value={p.gsi} color={C.accent} />

              {/* Sparkline */}
              {hist.length > 2 && (
                <div style={{ marginTop: 10 }}>
                  <ResponsiveContainer width="100%" height={28}>
                    <LineChart data={hist}>
                      <Line type="monotone" dataKey="v" stroke={st.color} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
                <strong style={{ color: C.text }}>Recommended: </strong>{action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SIMULATOR ────────────────────────────────────────────────────────────────
function SimulatorView({ projects, profiles }) {
  const [selProj, setSelProj] = useState(projects[2]);
  const [scenario, setScenario] = useState("budget_cut");
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("single");
  const [staged, setStaged] = useState([]);
  const [sandboxRes, setSandboxRes] = useState(null);
  const [sbRunning, setSbRunning] = useState(false);

  const runMC = () => {
    setRunning(true); setResult(null);
    setTimeout(() => { setResult(runMonteCarlo(selProj, scenario, iterations)); setRunning(false); }, 700);
  };

  const addStaged = () => {
    if (!staged.find(s => s.pid === selProj.id && s.sc === scenario))
      setStaged(prev => [...prev, { id: Date.now(), pid: selProj.id, name: selProj.name, sc: scenario }]);
  };

  const runSandbox = () => {
    setSbRunning(true); setSandboxRes(null);
    setTimeout(() => {
      const delays = { budget_cut:14, scope_expand:21, resource_loss:28, deadline_compress:-5, compliance_breach:10 };
      const costs  = { budget_cut:-12, scope_expand:18, resource_loss:8, deadline_compress:14, compliance_breach:6 };
      const totalD = staged.reduce((s, x) => s + (delays[x.sc] || 10), 0);
      const totalC = staged.reduce((s, x) => s + (costs[x.sc] || 6), 0);
      setSandboxRes({ delay: totalD, cost: totalC, count: staged.length, risk: totalD > 40 ? "High" : totalD > 20 ? "Medium" : "Low" });
      setSbRunning(false);
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ padding: "28px 28px" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Impact Simulator</h1>
        <p style={{ color: C.muted, fontSize: 13 }}>Run Monte Carlo analysis on scenarios before committing decisions.</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, background: C.faint, padding: 5, borderRadius: 8, border: `1px solid ${C.border}`, width: "fit-content" }}>
        {[["single", "Single Scenario"], ["sandbox", `Multi-Project Sandbox${staged.length ? ` (${staged.length})` : ""}`]].map(([id, label]) => (
          <button key={id} className={`tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 20 }}>
        {/* Config panel */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="sec-title">Configuration</div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Target Project</label>
              <select value={selProj.id} onChange={e => setSelProj(projects.find(p => p.id === e.target.value))}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Scenario</label>
              <select value={scenario} onChange={e => setScenario(e.target.value)}>
                <option value="budget_cut">Budget Reduction (−15%)</option>
                <option value="scope_expand">Scope Expansion (+20%)</option>
                <option value="resource_loss">Key Resource Departure</option>
                <option value="deadline_compress">Deadline Compression (−30 days)</option>
                <option value="compliance_breach">Compliance Threshold Breach</option>
              </select>
            </div>
            {tab === "single" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>
                  Iterations: <strong>{iterations.toLocaleString()}</strong>
                </label>
                <input type="range" min={200} max={5000} step={200} value={iterations}
                  onChange={e => setIterations(+e.target.value)} style={{ accentColor: C.accent }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              {tab === "single"
                ? <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={runMC} disabled={running}>{running ? "Running..." : "▶ Run Simulation"}</button>
                : <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={addStaged}>+ Stage Scenario</button>}
            </div>
          </div>

          {/* Percentile table (single) */}
          {tab === "single" && result && (
            <div className="card" style={{ background: C.faint }}>
              <div className="sec-title">Schedule Delay Percentiles</div>
              {[["P10 — Best Case", result.p10, C.green], ["P50 — Median", result.p50, C.accent], ["P80 — Likely", result.p80, C.amber], ["P90 — Worst Case", result.p90, C.red]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{l}</span>
                  <span className="mono" style={{ fontWeight: 700, color: c }}>{v}d</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 12 }}>
                <span style={{ color: C.muted }}>Cost Impact (P80)</span>
                <span className="mono" style={{ fontWeight: 700, color: C.red }}>+{result.costP80}%</span>
              </div>
            </div>
          )}

          {/* Sandbox staged list */}
          {tab === "sandbox" && staged.length > 0 && (
            <div className="card" style={{ background: C.faint }}>
              <div className="sec-title">Staged Scenarios ({staged.length})</div>
              {staged.map((s, i) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < staged.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{s.sc.replace("_", " ")}</div>
                  </div>
                  <button onClick={() => setStaged(prev => prev.filter(x => x.id !== s.id))} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={runSandbox} disabled={sbRunning}>{sbRunning ? "Running..." : "▶ Simulate All"}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setStaged([]); setSandboxRes(null); }}>Clear</button>
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div>
          {tab === "single" && (
            <>
              {!result && !running && (
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 380, color: C.muted }}>
                  <div style={{ fontSize: 32, marginBottom: 10, opacity: .3 }}>⟳</div>
                  <div style={{ fontSize: 13 }}>Configure a scenario and run simulation</div>
                  <div style={{ fontSize: 11, marginTop: 6 }}>Runs {iterations.toLocaleString()} stochastic iterations</div>
                </div>
              )}
              {running && (
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 380 }}>
                  <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 14 }} />
                  <div style={{ fontSize: 13, color: C.muted }}>Running {iterations.toLocaleString()} iterations...</div>
                </div>
              )}
              {result && !running && (
                <div className="fade-in">
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <div className="sec-title" style={{ margin: 0 }}>Schedule Delay Distribution ({iterations.toLocaleString()} iterations)</div>
                      <span className="mono" style={{ fontSize: 11, color: C.muted }}>μ = {result.avgDelay}d</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={result.histogram} margin={{ top: 4, right: 0, bottom: 4, left: -20 }}>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: C.muted }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: C.muted }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 }} formatter={v => [v, "Iterations"]} />
                        <ReferenceLine x={result.p50} stroke={C.amber} strokeDasharray="3 3" label={{ value: "P50", fill: C.amber, fontSize: 9 }} />
                        <ReferenceLine x={result.p80} stroke={C.red}   strokeDasharray="3 3" label={{ value: "P80", fill: C.red,   fontSize: 9 }} />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                          {result.histogram.map((e, i) => (
                            <Cell key={i} fill={e.label > result.p80 ? C.red : e.label > result.p50 ? C.amber : C.accent} opacity={0.7} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                    {[["80% delay confidence", `${result.p80}d`, C.red], ["Median delay", `${result.p50}d`, C.amber], ["Avg cost impact", `+${result.avgCost}%`, C.accent], ["P95 worst case", `${result.worstDelay}d`, C.red]].map(([k, v, c]) => (
                      <div key={k} className="card-sm" style={{ background: C.faint }}>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{k}</div>
                        <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "sandbox" && (
            <>
              {staged.length === 0 && (
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 380, color: C.muted }}>
                  <div style={{ fontSize: 32, marginBottom: 10, opacity: .3 }}>◈</div>
                  <div style={{ fontSize: 13 }}>Stage overrides from multiple projects</div>
                  <div style={{ fontSize: 11, marginTop: 6 }}>Simulate aggregate portfolio effect before committing</div>
                </div>
              )}
              {staged.length > 0 && !sandboxRes && (
                <div className="card" style={{ minHeight: 380 }}>
                  <div className="sec-title">Staged Override Preview</div>
                  {staged.map((s, i) => {
                    const p = projects.find(pr => pr.id === s.pid);
                    const rix = p ? computeRIx(p, profiles) : 0;
                    const st2 = getStatus(rix);
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < staged.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <RixGauge value={rix} size={42} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{s.sc.replace("_", " ")}</div>
                        </div>
                        <span className="badge" style={{ background: st2.bg, color: st2.color, border: `1px solid ${st2.border}` }}>{st2.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {sandboxRes && (
                <div className="fade-in">
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div className="sec-title">Aggregate Portfolio Impact — {sandboxRes.count} projects</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                      {[["Combined Delay", `${sandboxRes.delay}d`, C.amber], ["Cost Pressure", `+${sandboxRes.cost}%`, C.red], ["Projects", sandboxRes.count, C.accent], ["Risk Level", sandboxRes.risk, sandboxRes.risk === "High" ? C.red : C.amber]].map(([k, v, c]) => (
                        <div key={k} className="card-sm" style={{ background: C.faint }}>
                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{k}</div>
                          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{ background: C.accentBg, border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 8 }}>RECOMMENDATION</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                      Committing all {sandboxRes.count} staged scenarios simultaneously creates compounding portfolio risk.
                      Recommend sequencing low-risk items first, then reassessing before proceeding.
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-primary btn-sm">Commit All to Audit Log</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSandboxRes(null)}>Revise</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setStaged([]); setSandboxRes(null); }}>Discard</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
function LogView({ govLog }) {
  const [filterReason, setFilterReason] = useState("");
  const [filterTier,   setFilterTier]   = useState("");
  const [filterProj,   setFilterProj]   = useState("");

  const filtered = govLog.filter(l =>
    (!filterReason || l.reason === filterReason) &&
    (!filterTier   || l.tier   === filterTier)   &&
    (!filterProj   || l.project === filterProj)
  );

  const tierColor   = { "Rule-based": C.green, Review: C.amber, Escalation: C.red };
  const outcomeBg   = { Completed: C.greenBg, Approved: C.accentBg, Override: C.amberBg, "In Review": C.purpleBg, Pending: C.faint };
  const outcomeColor= { Completed: C.green,   Approved: C.accent,   Override: C.amber,   "In Review": C.purple,   Pending: C.muted };

  const reasonCounts = REASON_CODES.reduce((acc, r) => { acc[r] = govLog.filter(l => l.reason === r).length; return acc; }, {});
  const projects = [...new Set(govLog.map(l => l.project))];

  return (
    <div className="fade-in" style={{ padding: "28px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Governance Audit Log</h1>
        <span style={{ fontSize: 13, color: C.muted }}>{govLog.length} entries</span>
        <span style={{ flex: 1 }} />
        <button className="btn btn-secondary btn-sm">↓ Export CSV</button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        {[["Rule-based Actions", govLog.filter(l=>l.tier==="Rule-based").length, C.green, C.greenBg],
          ["Manager Reviews",    govLog.filter(l=>l.tier==="Review").length,     C.amber, C.amberBg],
          ["Overrides",         govLog.filter(l=>l.outcome==="Override").length, C.amber, C.amberBg],
          ["Escalations",       govLog.filter(l=>l.tier==="Escalation").length,  C.red,   C.redBg],
        ].map(([label, val, color, bg]) => (
          <div key={label} className="card" style={{ flex: 1, minWidth: 140, borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{label}</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Reason Code</label>
          <select value={filterReason} onChange={e => setFilterReason(e.target.value)}>
            <option value="">All Reason Codes</option>
            {REASON_CODES.map(r => <option key={r} value={r}>{r} ({reasonCounts[r] || 0})</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Tier</label>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)}>
            <option value="">All Tiers</option>
            <option value="Rule-based">Rule-based</option>
            <option value="Review">Review</option>
            <option value="Escalation">Escalation</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 5 }}>Project</label>
          <select value={filterProj} onChange={e => setFilterProj(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFilterReason(""); setFilterTier(""); setFilterProj(""); }}>Clear</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "140px 90px 1fr 100px 100px 130px",
          padding: "9px 18px", fontSize: 11, color: C.muted, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: ".7px", background: C.faint,
          borderBottom: `1px solid ${C.border}`, borderRadius: "10px 10px 0 0" }}>
          <span>Timestamp</span><span>Project</span><span>Action</span><span>Tier</span><span>Outcome</span><span>Reason Code</span>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>No records match filters.</div>
        )}
        {filtered.map((m, i) => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "140px 90px 1fr 100px 100px 130px",
            padding: "12px 18px", alignItems: "center", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 13 }}>
            <span className="mono" style={{ fontSize: 10, color: C.muted }}>{m.ts}</span>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>{m.project}</span>
            <span style={{ lineHeight: 1.4, color: C.text }}>
              {m.action}
              {m.human && <span style={{ color: C.muted, marginLeft: 6, fontSize: 11 }}>— {m.human}</span>}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: tierColor[m.tier] || C.muted }}>{m.tier}</span>
            <span style={{ display: "inline-flex" }}>
              <span className="badge" style={{ background: outcomeBg[m.outcome] || C.faint, color: outcomeColor[m.outcome] || C.muted, fontSize: 10 }}>
                {m.outcome}
              </span>
            </span>
            {m.reason
              ? <span style={{ fontSize: 11, color: C.purple, background: C.purpleBg, borderRadius: 4, padding: "2px 8px", border: "1px solid #e9d5ff", display: "inline-flex" }}>{m.reason}</span>
              : <span style={{ color: C.border }}>—</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsView({ profiles, setProfiles }) {
  const [activePro, setActivePro] = useState("default");
  const [weights, setWeights]     = useState({ ...DEFAULT_PROFILES.default });
  const [newName, setNewName]     = useState("");

  useEffect(() => { setWeights({ ...profiles[activePro] }); }, [activePro]);

  const sum = +(weights.fri + weights.dri + weights.cii + weights.gsi).toFixed(2);
  const valid = Math.abs(sum - 1.0) < 0.01;

  const save = () => {
    if (!valid) return;
    setProfiles(prev => ({ ...prev, [activePro]: { ...prev[activePro], ...weights } }));
    alert(`Profile "${profiles[activePro].label}" saved.`);
  };

  const create = () => {
    if (!newName.trim()) return;
    const key = newName.toLowerCase().replace(/\s+/g, "_");
    setProfiles(prev => ({ ...prev, [key]: { label: newName, fri: .25, dri: .25, cii: .25, gsi: .25 } }));
    setActivePro(key); setNewName("");
  };

  return (
    <div className="fade-in" style={{ padding: "28px 28px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 22 }}>Settings</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Weight profiles */}
        <div className="card" style={{ gridColumn: "1/-1" }}>
          <div className="sec-title">Domain Weight Profiles</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, background: C.faint, padding: 6, borderRadius: 8, border: `1px solid ${C.border}` }}>
            {Object.entries(profiles).map(([key, p]) => (
              <button key={key} className={`tab${activePro === key ? " active" : ""}`} onClick={() => setActivePro(key)}>{p.label}</button>
            ))}
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New profile..." style={{ width: 150, fontSize: 12 }} />
              <button className="btn btn-secondary btn-sm" onClick={create} disabled={!newName.trim()}>+ Create</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20 }}>
            {[["fri", "Financial Risk (FRI)", C.red], ["dri", "Delivery Risk (DRI)", C.amber], ["cii", "Change Impact (CII)", C.purple], ["gsi", "Governance Stability (GSI)", C.accent]].map(([k, label, color]) => (
              <div key={k}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: C.text }}>{label}</label>
                  <span className="mono" style={{ fontWeight: 700, color }}>{(weights[k] * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.05} value={weights[k]}
                  onChange={e => setWeights(prev => ({ ...prev, [k]: +e.target.value }))}
                  style={{ accentColor: color, width: "100%" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, color: valid ? C.green : C.red }}>
              {valid ? "✓ Weights sum to 100%" : `⚠ Weights sum to ${(sum * 100).toFixed(0)}% — must equal 100%`}
            </div>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={!valid}>Save Profile</button>
          </div>
        </div>

        {/* Integrations */}
        <div className="card">
          <div className="sec-title">System Integrations</div>
          {[["SAP S/4HANA",           "https://s4hana.example.com",   "Connected",    C.green],
            ["SAP Cloud ALM",          "https://alm.example.com",      "Connected",    C.green],
            ["SAP Signavio",           "https://signavio.example.com", "Connected",    C.green],
            ["ServiceNow GRC",         "https://example.service-now.com", "Connected", C.green],
            ["SAP Analytics Cloud",    "https://sac.example.com",      "Connected",    C.green],
            ["SAP BTP",                "https://btp.example.com",      "Pending",      C.amber],
            ["Azure Monitor",          "https://portal.azure.com",     "Disconnected", C.red],
          ].map(([name, url, status, color]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                <div className="mono" style={{ fontSize: 10, color: C.muted }}>{url}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  {status}
                </span>
                {status === "Connected" && <a href={url} target="_blank" rel="noreferrer" className="ext-link">↗</a>}
              </div>
            </div>
          ))}
        </div>

        {/* Thresholds */}
        <div className="card">
          <div className="sec-title">Risk Threshold Configuration</div>
          {[["On Track ceiling (RIx ≤)", 34, C.green], ["At Risk floor (RIx ≥)", 35, C.amber], ["Critical floor (RIx ≥)", 65, C.red]].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13 }}>{label}</div>
              <span className="mono" style={{ fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div className="sec-title">Governance Escalation Rules</div>
            {["Compliance flags > 4 → Auto-escalate", "Budget overrun > 95% → Mandatory review", "Schedule slippage > 20d → Owner notification", "Change requests > 15 → PMO sign-off required"].map((rule, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.green }}>✓</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]       = useState("overview");
  const [selected, setSelected] = useState(null);
  const [govLog, setLog]      = useState(INIT_LOG);
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const projects = INIT_PROJECTS;

  const [histories] = useState(() => {
    const h = {};
    INIT_PROJECTS.forEach(p => { h[p.id] = genHistory(computeRIx(p, DEFAULT_PROFILES)); });
    return h;
  });

  const views = {
    overview:  <OverviewView  projects={projects} profiles={profiles} govLog={govLog} />,
    portfolio: <PortfolioView projects={projects} profiles={profiles} setSelected={setSelected} histories={histories} />,
    risk:      <RiskView      projects={projects} profiles={profiles} histories={histories} />,
    simulator: <SimulatorView projects={projects} profiles={profiles} />,
    log:       <LogView       govLog={govLog} />,
    settings:  <SettingsView  profiles={profiles} setProfiles={setProfiles} />,
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar active={view} setActive={setView} />
        <main style={{ flex: 1, overflow: "auto", maxHeight: "100vh", background: C.bg }}>
          {views[view]}
        </main>
      </div>
      {selected && (
        <ProjectDetail
          project={selected}
          onClose={() => setSelected(null)}
          profiles={profiles}
          histories={histories}
          setLog={setLog}
        />
      )}
    </>
  );
}
