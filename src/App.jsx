import { useState, useEffect, useCallback } from "react";

const API = "https://fitcontrol-backend-wo77.onrender.com";

// ============================================
// ESTILOS
// ============================================
const s = {
  body: {
    margin: 0,
    minHeight: "100vh",
    background: "#0B0C10",
    color: "#FFFFFF",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  app: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 0",
    borderBottom: "1px solid rgba(0,229,255,0.1)",
    marginBottom: 40,
    flexWrap: "wrap",
    gap: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
    background: "linear-gradient(135deg, #00E5FF, #FF5722)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: 12,
    color: "#B0B0B0",
    fontWeight: 400,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginTop: 2,
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #00E5FF, #FF5722)",
    color: "#0B0C10",
    border: "none",
    padding: "12px 24px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 20px rgba(0,229,255,0.25)",
  },
  btnDanger: {
    background: "rgba(255,87,34,0.15)",
    color: "#FF5722",
    border: "1px solid rgba(255,87,34,0.3)",
    padding: "8px 16px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnSmall: {
    background: "rgba(0,229,255,0.08)",
    color: "#00E5FF",
    border: "1px solid rgba(0,229,255,0.2)",
    padding: "8px 16px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  dashGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },
  dashCard: {
    background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  dashValue: {
    fontSize: 42,
    fontWeight: 800,
    margin: "8px 0",
    background: "linear-gradient(135deg, #00E5FF, #FF5722)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  dashLabel: {
    fontSize: 13,
    color: "#B0B0B0",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formCard: {
    background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: 20,
    padding: 28,
    marginBottom: 30,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
    color: "#FFFFFF",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,229,255,0.15)",
    background: "rgba(11,12,16,0.8)",
    color: "#FFFFFF",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  tableCard: {
    background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 150px",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(0,229,255,0.1)",
    fontWeight: 700,
    fontSize: 12,
    color: "#00E5FF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 150px",
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    alignItems: "center",
    fontSize: 14,
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(0,229,255,0.1)",
    color: "#00E5FF",
  },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#B0B0B0",
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    padding: "40px 0",
    color: "#666",
    fontSize: 12,
    borderTop: "1px solid rgba(255,255,255,0.05)",
    marginTop: 40,
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("fitcontrol_token") || "");
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ nome: "", idade: "", peso: "" });

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

  // CARREGAR ALUNOS
  const carregarAlunos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/alunos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setAlunos(data);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  // AUTH
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setToken(data.token);
      localStorage.setItem("fitcontrol_token", data.token);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("fitcontrol_token");
    setAlunos([]);
  };

  // CADASTRAR / EDITAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return setError("Nome é obrigatório");
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        const res = await fetch(`${API}/api/alunos/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: form.nome,
            idade: form.idade ? Number(form.idade) : null,
            peso: form.peso ? Number(form.peso) : null,
          }),
        });
        if (!res.ok) throw new Error("Erro ao atualizar");
        setSuccess("Aluno atualizado!");
      } else {
        const res = await fetch(`${API}/api/alunos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: form.nome,
            idade: form.idade ? Number(form.idade) : null,
            peso: form.peso ? Number(form.peso) : null,
          }),
        });
        if (!res.ok) throw new Error("Erro ao cadastrar");
        setSuccess("Aluno cadastrado!");
      }

      setForm({ nome: "", idade: "", peso: "" });
      setEditingId(null);
      carregarAlunos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (aluno) => {
    setForm({
      nome: aluno.nome,
      idade: aluno.idade || "",
      peso: aluno.peso || "",
    });
    setEditingId(aluno.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este aluno?")) return;
    try {
      const res = await fetch(`${API}/api/alunos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      carregarAlunos();
      setSuccess("Aluno excluído!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ nome: "", idade: "", peso: "" });
  };

  // TELA DE LOGIN
  if (!token) {
    return (
      <div style={s.body}>
        <div style={{ ...s.app, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <div style={{ ...s.formCard, width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={s.logo}>fitcontrol</div>
              <div style={s.logoSub}>Professional Fitness System</div>
            </div>
            <form onSubmit={handleAuth}>
              <input style={{ ...s.input, marginBottom: 12 }} type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
              <input style={{ ...s.input, marginBottom: 20 }} type="password" placeholder="Senha" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
              {authError && <p style={{ color: "#FF5722", fontSize: 13, marginBottom: 16 }}>{authError}</p>}
              <button type="submit" style={{ ...s.btnPrimary, width: "100%", padding: "16px" }}>{authMode === "login" ? "ENTRAR" : "CRIAR CONTA"}</button>
            </form>
            <p style={{ textAlign: "center", marginTop: 20, color: "#B0B0B0", fontSize: 13 }}>
              {authMode === "login" ? "Não tem conta? " : "Já tem conta? "}
              <span style={{ color: "#00E5FF", cursor: "pointer", fontWeight: 600 }} onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>
                {authMode === "login" ? "Criar conta" : "Fazer login"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // APP PRINCIPAL
  return (
    <div style={s.body}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={s.app}>
        <header style={s.header}>
          <div>
            <div style={s.logo}>fitcontrol</div>
            <div style={s.logoSub}>Painel do Profissional</div>
          </div>
          <button style={s.btnDanger} onClick={logout}>Sair</button>
        </header>

        <div style={s.dashGrid}>
          <div style={s.dashCard}><div style={s.dashLabel}>Total de Alunos</div><div style={s.dashValue}>{alunos.length}</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>Média de Idade</div><div style={s.dashValue}>{alunos.length > 0 ? Math.round(alunos.reduce((acc, a) => acc + (a.idade || 0), 0) / alunos.length) : 0}</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>Peso Médio (kg)</div><div style={s.dashValue}>{alunos.length > 0 ? (alunos.reduce((acc, a) => acc + (a.peso || 0), 0) / alunos.length).toFixed(1) : "0"}</div></div>
        </div>

        {error && <div style={{ background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.3)", padding: 14, borderRadius: 12, marginBottom: 20, color: "#FF5722", fontSize: 14 }}>{error} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setError("")}>✕</span></div>}
        {success && <div style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", padding: 14, borderRadius: 12, marginBottom: 20, color: "#00E5FF", fontSize: 14 }}>{success} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setSuccess("")}>✕</span></div>}

        <div style={s.formCard}>
          <h2 style={s.formTitle}>{editingId ? "Editar Aluno" : "Cadastrar Novo Aluno"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input style={s.input} type="number" placeholder="Idade" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Peso (kg)" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={s.btnPrimary}>{editingId ? "Salvar Alterações" : "Cadastrar Aluno"}</button>
              {editingId && <button type="button" style={s.btnSmall} onClick={cancelEdit}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div style={s.tableCard}>
          <h2 style={s.formTitle}>Alunos Cadastrados</h2>

          {loading && <div style={{ textAlign: "center", padding: 40 }}><div style={{ width: 40, height: 40, border: "3px solid rgba(0,229,255,0.15)", borderTopColor: "#00E5FF", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }}></div></div>}

          {!loading && alunos.length === 0 && <div style={s.empty}><p style={{ fontSize: 40 }}>🏋️</p><p>Nenhum aluno cadastrado</p></div>}

          {!loading && alunos.length > 0 && (
            <>
              <div style={s.tableHeader}><span>Nome</span><span>Idade</span><span>Peso</span><span>Ações</span></div>
              {alunos.map((aluno) => (
                <div key={aluno.id} style={s.tableRow}>
                  <span style={{ fontWeight: 600 }}>{aluno.nome}</span>
                  <span style={s.badge}>{aluno.idade || "-"} anos</span>
                  <span style={{ color: "#00E5FF", fontWeight: 600 }}>{aluno.peso ? `${aluno.peso} kg` : "-"}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={s.btnSmall} onClick={() => handleEdit(aluno)}>Editar</button>
                    <button style={s.btnDanger} onClick={() => handleDelete(aluno.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <footer style={s.footer}>FitControl Pro © 2026</footer>
      </div>
    </div>
  );
}