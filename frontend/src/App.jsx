import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [findings, setFindings] = useState([]);
  const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0 });

  useEffect(() => {
    // Fetch data from your Python Backend
    axios
      .get("https://cloud-auditor.onrender.com/findings")
      .then((response) => {
        setFindings(response.data);

        // Calculate stats
        const critical = response.data.filter(
          (f) => f.Severity === "Critical"
        ).length;
        const high = response.data.filter((f) => f.Severity === "High").length;
        const medium = response.data.filter(
          (f) => f.Severity === "Medium"
        ).length;
        setStats({ critical, high, medium });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Prepare data for the graph
  const chartData = [
    { name: "Critical", count: stats.critical, fill: "#ef4444" },
    { name: "High", count: stats.high, fill: "#f97316" },
    { name: "Medium", count: stats.medium, fill: "#eab308" },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🛡️ AWS Cloud Security Dashboard</h1>

      {/* 1. Summary Cards */}
      <div style={styles.cardContainer}>
        <Card title="Critical Risks" count={stats.critical} color="#ef4444" />
        <Card title="High Risks" count={stats.high} color="#f97316" />
        <Card title="Medium Risks" count={stats.medium} color="#eab308" />
      </div>

      {/* 2. The Chart */}
      <div style={styles.chartSection}>
        <h3 style={styles.sectionTitle}>Security Posture Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            />
            <Legend />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Detailed Table */}
      <h3 style={styles.sectionTitle}>Detailed Findings Log</h3>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>SEVERITY</th>
              <th style={styles.th}>SERVICE</th>
              <th style={styles.th}>ISSUE DETECTED</th>
              <th style={styles.th}>RESOURCE ID</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f, index) => (
              <tr
                key={f.FindingID}
                style={{
                  ...styles.tableRow,
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb", // Alternating stripes
                }}
              >
                <td style={styles.td}>
                  <SeverityBadge severity={f.Severity} />
                </td>
                <td style={{ ...styles.td, fontWeight: "500" }}>{f.ResourceType}</td>
                <td style={styles.td}>{f.Issue}</td>
                <td style={{ ...styles.td, fontFamily: "monospace", color: "#6b7280" }}>
                  {f.ResourceName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Components ---

function Card({ title, count, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <h2 style={{ margin: 0, fontSize: "2.5rem", color: color }}>{count}</h2>
      <p style={{ margin: "5px 0 0", color: "#6b7280", fontWeight: "600" }}>{title}</p>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const colors = {
    Critical: { bg: "#fef2f2", text: "#ef4444", border: "#fecaca" },
    High: { bg: "#fff7ed", text: "#f97316", border: "#fed7aa" },
    Medium: { bg: "#fefce8", text: "#eab308", border: "#fde047" },
    Low: { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
  };

  const style = colors[severity] || colors.Low;

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: "4px 12px",
        borderRadius: "9999px", // Pill shape
        fontSize: "0.85rem",
        fontWeight: "700",
        display: "inline-block",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
      {severity}
    </span>
  );
}

// --- Styles Object (Keeps the JSX clean) ---
const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    maxWidth: "1100px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
    color: "#1e293b",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  card: {
    padding: "20px",
    background: "white",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    flex: 1,
    minWidth: "200px",
    textAlign: "center",
  },
  chartSection: {
    height: "400px",
    marginBottom: "40px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#334155",
    fontSize: "1.25rem",
  },
  tableContainer: {
    overflowX: "auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
    borderBottom: "2px solid #e2e8f0",
  },
  th: {
    padding: "16px 24px",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "16px 24px",
    color: "#334155",
    fontSize: "0.95rem",
  },
};

export default App;