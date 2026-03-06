import React, { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Python'ın çalıştığından emin ol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            RecipeGen <span style={{ color: "#bfdbfe" }}>Lab</span>
          </h1>
          <p style={styles.subtitle}>Akıllı Yemek Planlayıcı Projesi</p>
        </header>

        <main style={styles.main}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>SENİN İSTEĞİN</label>
            <textarea
              style={styles.textarea}
              placeholder="Örn: 200 TL bütçem var, fıstığa alerjim var..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: loading ? "#94a3b8" : "#2563eb",
              }}
            >
              {loading ? "Hesaplanıyor..." : "Optimal Planı Hemen Oluştur"}
            </button>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {result && result.meals && (
            <div style={styles.results}>
              <h2 style={styles.sectionTitle}>Önerilen Optimal Menü</h2>
              <div style={styles.grid}>
                {result.meals.map((meal, index) => (
                  <div key={index} style={styles.mealCard}>
                    <div style={styles.mealHeader}>
                      <h3 style={styles.mealName}>{meal.name}</h3>
                      <span style={styles.priceTag}>{meal.cost} TL</span>
                    </div>
                    <p style={styles.mealStats}>
                      🔥 {meal.calories} kcal | 🥩 {meal.protein}g Protein
                    </p>
                  </div>
                ))}
              </div>

              <div style={styles.summaryPanel}>
                <div style={styles.statItem}>
                  <p style={styles.statLabel}>Maliyet</p>
                  <p style={styles.statValue}>{result.total_cost} TL</p>
                </div>
                <div style={styles.statItem}>
                  <p style={styles.statLabel}>Enerji</p>
                  <p style={styles.statValue}>{result.total_calories} kcal</p>
                </div>
                <div style={styles.statItem}>
                  <p style={styles.statLabel}>Protein</p>
                  <p style={{ ...styles.statValue, color: "#10b981" }}>
                    {result.total_protein}g
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// PROFESYONEL CSS-IN-JS STİLLERİ
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    fontFamily: '"Inter", sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: "1000px",
    backgroundColor: "white",
    borderRadius: "40px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)",
    padding: "60px 20px",
    textAlign: "center",
    color: "white",
  },
  title: {
    fontSize: "60px",
    fontWeight: "900",
    margin: "0 0 10px 0",
    letterSpacing: "-2px",
  },
  subtitle: { fontSize: "22px", opacity: "0.9", fontWeight: "500" },
  main: { padding: "60px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "20px" },
  label: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: "2px",
  },
  textarea: {
    width: "100%",
    minHeight: "180px",
    padding: "25px",
    borderRadius: "25px",
    border: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: "20px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    padding: "25px",
    borderRadius: "25px",
    border: "none",
    color: "white",
    fontSize: "22px",
    fontWeight: "900",
    cursor: "pointer",
    transition: "0.3s",
  },
  results: {
    marginTop: "50px",
    borderTop: "2px solid #f1f5f9",
    paddingTop: "50px",
  },
  sectionTitle: { fontSize: "32px", fontWeight: "900", marginBottom: "30px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  mealCard: {
    padding: "30px",
    border: "2px solid #f1f5f9",
    borderRadius: "30px",
    backgroundColor: "white",
  },
  mealHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  mealName: { fontSize: "24px", fontWeight: "900", margin: 0 },
  priceTag: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "8px 15px",
    borderRadius: "15px",
    fontWeight: "800",
  },
  mealStats: { fontSize: "18px", color: "#64748b", fontWeight: "600" },
  summaryPanel: {
    marginTop: "50px",
    backgroundColor: "#0f172a",
    borderRadius: "35px",
    padding: "50px",
    display: "flex",
    justifyContent: "space-around",
    color: "white",
  },
  statItem: { textAlign: "center" },
  statLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    tracking: "2px",
    color: "#64748b",
    marginBottom: "10px",
  },
  statValue: { fontSize: "45px", fontWeight: "900", margin: 0 },
  errorBox: {
    padding: "20px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    color: "#dc2626",
    borderRadius: "20px",
    textAlign: "center",
    fontWeight: "700",
  },
};

export default App;
