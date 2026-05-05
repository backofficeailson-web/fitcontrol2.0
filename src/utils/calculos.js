import { theme } from "../styles/theme";

export default function Layout({ children, setPagina }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.colors.bg }}>
      
      <aside style={{
        width: 220,
        background: theme.colors.card,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}>
        <h2 style={{ color: "#fff" }}>💪 FitControl</h2>

        {["dashboard","alunos","avaliacao","treino"].map(p => (
          <button
            key={p}
            onClick={() => setPagina(p)}
            style={{
              background: theme.colors.border,
              color: "#fff",
              border: "none",
              padding: 10,
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  );
}