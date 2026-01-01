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
		{ name: "Critical", count: stats.critical, fill: "#ef4444" }, // Red
		{ name: "High", count: stats.high, fill: "#f97316" }, // Orange
		{ name: "Medium", count: stats.medium, fill: "#eab308" }, // Yellow
	];

	return (
		<div
			style={{
				padding: "40px",
				fontFamily: "Arial, sans-serif",
				maxWidth: "1000px",
				margin: "0 auto",
			}}
		>
			<h1>🛡️ AWS Cloud Security Dashboard</h1>

			{/* 1. Summary Cards */}
			<div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
				<Card title="Critical Risks" count={stats.critical} color="#ef4444" />
				<Card title="High Risks" count={stats.high} color="#f97316" />
				<Card title="Medium Risks" count={stats.medium} color="#eab308" />
			</div>

			{/* 2. The Chart */}
			<div
				style={{
					height: "350px",
					marginBottom: "40px",
					border: "1px solid #ddd",
					padding: "20px",
					borderRadius: "8px",
				}}
			>
				<h3>Security Posture Overview</h3>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Legend />
						<Bar dataKey="count" />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* 3. Detailed Table */}
			<h3>Detailed Findings Log</h3>
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					border: "1px solid #ddd",
				}}
			>
				<thead>
					<tr style={{ background: "#f3f4f6", textAlign: "left" }}>
						<th style={{ padding: "12px" }}>Severity</th>
						<th style={{ padding: "12px" }}>Service</th>
						<th style={{ padding: "12px" }}>Issue Detected</th>
						<th style={{ padding: "12px" }}>Resource ID</th>
					</tr>
				</thead>
				<tbody>
					{findings.map((f) => (
						<tr key={f.FindingID} style={{ borderBottom: "1px solid #eee" }}>
							<td
								style={{
									padding: "12px",
									color:
										f.Severity === "Critical"
											? "#ef4444"
											: f.Severity === "High"
											? "#f97316"
											: "#eab308",
									fontWeight: "bold",
								}}
							>
								{f.Severity}
							</td>
							<td style={{ padding: "12px" }}>{f.ResourceType}</td>
							<td style={{ padding: "12px" }}>{f.Issue}</td>
							<td style={{ padding: "12px", color: "#666", fontSize: "0.9em" }}>
								{f.ResourceName}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// Helper component for the summary cards
function Card({ title, count, color }) {
	return (
		<div
			style={{
				padding: "20px",
				borderTop: `4px solid ${color}`,
				background: "white",
				boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
				borderRadius: "4px",
				flex: 1,
				textAlign: "center",
			}}
		>
			<h2 style={{ margin: 0, fontSize: "2.5rem", color: color }}>{count}</h2>
			<p style={{ margin: "5px 0 0", color: "#666" }}>{title}</p>
		</div>
	);
}

export default App;
