import { useState, useEffect, useCallback } from "react";

const API = "https://fitcontrol-backend-wo77.onrender.com";

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function calcularIMC(peso, altura) {
  if (!peso || !altura || altura <= 0 || peso <= 0) return null;
  return peso / (altura * altura);
}

function classificarIMC(imc) {
  if (!imc) return "—";
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidade";
}

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
    padding: "20px 0",
    borderBottom: "1px solid rgba(0,229,255,0.1)",
    marginBottom: 30,
    flexWrap: "wrap",
    gap: 12,
  },
  logo: {
    fontSize: 26,
    fontWeight: 800,
    background: "linear-gradient(135deg, #00E5FF, #FF5722)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  logoSub: {
    fontSize: 11,
    color: "#B0B0B0",
    letterSpacing: 3,
    textTransform: "uppercase",
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
    boxShadow: "0 4px 20px rgba(0,229,255,0.25)",
  },
  btnDanger: {
    background: "rgba(255,87,34,0.15)",
    color: "#FF5722",
    border: "1px solid rgba(255,87,34,0.3)",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  },
  btnSmall: {
    background: "rgba(0,229,255,0.08)",
    color: "#00E5FF",
    border: "1px solid rgba(0,229,255,0.2)",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  },
  btnWhats: {
    background: "rgba(37,211,102,0.15)",
    color: "#25d366",
    border: "1px solid rgba(37,211,102,0.3)",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  },
  dashGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 30,
  },
  dashCard: {
    background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: 20,
    padding: 20,
  },
  dashValue: {
    fontSize: 36,
    fontWeight: 800,
    margin: "6px 0",
    background: "linear-gradient(135deg, #00E5FF, #FF5722)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  dashLabel: {
    fontSize: 12,
    color: "#B0B0B0",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formCard: {
    background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
    color: "#FFFFFF",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 16,
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
  select: {
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
    padding: 24,
  },
  alunoCard: {
    background: "rgba(18,24,32,0.8)",
    border: "1px solid rgba(0,229,255,0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  alunoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  alunoNome: {
    fontSize: 18,
    fontWeight: 700,
  },
  alunoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  alunoInfo: {
    fontSize: 13,
    color: "#B0B0B0",
  },
  alunoInfoValor: {
    fontSize: 14,
    fontWeight: 600,
    color: "#FFFFFF",
  },
  badgeIMC: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
  },
  btnGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#B0B0B0",
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

  const [form, setForm] = useState({
    nome: "", idade: "", peso: "", altura: "", objetivo: "", telefone: "",
    gordura: "", cintura: "", quadril: "", torax: "", braco: "", coxa: "", observacoes: "",
  });

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

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

  useEffect(() => { carregarAlunos(); }, [carregarAlunos]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return setError("Nome é obrigatório");
    setError("");
    setSuccess("");

    const body = {
      nome: form.nome,
      idade: form.idade ? Number(form.idade) : null,
      peso: form.peso ? Number(form.peso) : null,
      altura: form.altura ? Number(form.altura) : null,
      objetivo: form.objetivo || null,
      telefone: form.telefone || null,
      observacoes: form.observacoes || null,
      gordura: form.gordura ? Number(form.gordura) : null,
      cintura: form.cintura ? Number(form.cintura) : null,
      quadril: form.quadril ? Number(form.quadril) : null,
      torax: form.torax ? Number(form.torax) : null,
      braco: form.braco ? Number(form.braco) : null,
      coxa: form.coxa ? Number(form.coxa) : null,
    };

    try {
      if (editingId) {
        const res = await fetch(`${API}/api/alunos/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Erro ao atualizar");
        setSuccess("Aluno atualizado!");
      } else {
        const res = await fetch(`${API}/api/alunos`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Erro ao cadastrar");
        setSuccess("Aluno cadastrado!");
      }

      setForm({ nome: "", idade: "", peso: "", altura: "", objetivo: "", telefone: "", gordura: "", cintura: "", quadril: "", torax: "", braco: "", coxa: "", observacoes: "" });
      setEditingId(null);
      carregarAlunos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (aluno) => {
    setForm({
      nome: aluno.nome || "",
      idade: aluno.idade || "",
      peso: aluno.peso || "",
      altura: aluno.altura || "",
      objetivo: aluno.objetivo || "",
      telefone: aluno.telefone || "",
      gordura: aluno.gordura || "",
      cintura: aluno.cintura || "",
      quadril: aluno.quadril || "",
      torax: aluno.torax || "",
      braco: aluno.braco || "",
      coxa: aluno.coxa || "",
      observacoes: aluno.observacoes || "",
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

  const handleWhatsApp = (telefone) => {
    const numero = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  };

  // MÉTRICAS DO DASHBOARD
  const totalAlunos = alunos.length;
  const pesoMedio = totalAlunos > 0 ? (alunos.reduce((acc, a) => acc + (a.peso || 0), 0) / totalAlunos).toFixed(1) : "0";
  const idadeMedia = totalAlunos > 0 ? Math.round(alunos.reduce((acc, a) => acc + (a.idade || 0), 0) / totalAlunos) : 0;
  const imcs = alunos.map(a => calcularIMC(a.peso, a.altura)).filter(v => v !== null);
  const imcMedio = imcs.length > 0 ? (imcs.reduce((a, b) => a + b, 0) / imcs.length).toFixed(1) : "0";
  const alunosEmagrecimento = alunos.filter(a => a.objetivo && a.objetivo.toLowerCase().includes("emagrec")).length;
  const alunosHipertrofia = alunos.filter(a => a.objetivo && a.objetivo.toLowerCase().includes("hiper")).length;

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
      <div style={s.app}>
        <header style={s.header}>
          <div>
            <div style={s.logo}>fitcontrol</div>
            <div style={s.logoSub}>Painel do Profissional</div>
          </div>
          <button style={s.btnDanger} onClick={logout}>Sair</button>
        </header>

        {/* DASHBOARD */}
        <div style={s.dashGrid}>
          <div style={s.dashCard}><div style={s.dashLabel}>Total Alunos</div><div style={s.dashValue}>{totalAlunos}</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>Peso Médio</div><div style={s.dashValue}>{pesoMedio} kg</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>Idade Média</div><div style={s.dashValue}>{idadeMedia}</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>IMC Médio</div><div style={s.dashValue}>{imcMedio}</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>Emagrecimento</div><div style={s.dashValue}>{alunosEmagrecimento}</div></div>
          <div style={s.dashCard}><div style={s.dashLabel}>Hipertrofia</div><div style={s.dashValue}>{alunosHipertrofia}</div></div>
        </div>

        {/* MENSAGENS */}
        {error && <div style={{ background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.3)", padding: 14, borderRadius: 12, marginBottom: 20, color: "#FF5722", fontSize: 14 }}>{error} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setError("")}>✕</span></div>}
        {success && <div style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", padding: 14, borderRadius: 12, marginBottom: 20, color: "#00E5FF", fontSize: 14 }}>{success} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setSuccess("")}>✕</span></div>}

        {/* FORMULÁRIO */}
        <div style={s.formCard}>
          <h2 style={s.formTitle}>{editingId ? "Editar Aluno" : "Cadastrar Novo Aluno"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input style={s.input} type="number" placeholder="Idade" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Peso (kg)" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
              <input style={s.input} type="number" step="0.01" placeholder="Altura (m) ex: 1.75" value={form.altura} onChange={(e) => setForm({ ...form, altura: e.target.value })} />
              <select style={s.select} value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })}>
                <option value="">Objetivo (opcional)</option>
                <option value="Emagrecimento">Emagrecimento</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Força">Força</option>
                <option value="Resistência">Resistência</option>
                <option value="Condicionamento">Condicionamento</option>
                <option value="Performance">Performance</option>
              </select>
              <input style={s.input} placeholder="Telefone/WhatsApp" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>

            <h3 style={{ fontSize: 14, color: "#00E5FF", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Avaliação Física</h3>
            <div style={s.formGrid}>
              <input style={s.input} type="number" step="0.1" placeholder="% Gordura" value={form.gordura} onChange={(e) => setForm({ ...form, gordura: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Cintura (cm)" value={form.cintura} onChange={(e) => setForm({ ...form, cintura: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Quadril (cm)" value={form.quadril} onChange={(e) => setForm({ ...form, quadril: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Tórax (cm)" value={form.torax} onChange={(e) => setForm({ ...form, torax: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Braço (cm)" value={form.braco} onChange={(e) => setForm({ ...form, braco: e.target.value })} />
              <input style={s.input} type="number" step="0.1" placeholder="Coxa (cm)" value={form.coxa} onChange={(e) => setForm({ ...form, coxa: e.target.value })} />
            </div>

            <textarea
              style={{ ...s.input, minHeight: 70, resize: "vertical", marginBottom: 16 }}
              placeholder="Observações"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={s.btnPrimary}>{editingId ? "Salvar Alterações" : "Cadastrar Aluno"}</button>
              {editingId && <button type="button" style={s.btnSmall} onClick={() => { setEditingId(null); setForm({ nome: "", idade: "", peso: "", altura: "", objetivo: "", telefone: "", gordura: "", cintura: "", quadril: "", torax: "", braco: "", coxa: "", observacoes: "" }); }}>Cancelar</button>}
            </div>
          </form>
        </div>

        {/* LISTA DE ALUNOS */}
        <div style={s.tableCard}>
          <h2 style={s.formTitle}>Alunos Cadastrados</h2>

          {loading && <div style={{ textAlign: "center", padding: 40 }}><div style={{ width: 40, height: 40, border: "3px solid rgba(0,229,255,0.15)", borderTopColor: "#00E5FF", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }}></div></div>}

          {!loading && alunos.length === 0 && <div style={s.empty}><p style={{ fontSize: 40 }}>🏋️</p><p>Nenhum aluno cadastrado</p></div>}

          {!loading && alunos.map((aluno) => {
            const imc = calcularIMC(aluno.peso, aluno.altura);
            return (
              <div key={aluno.id} style={s.alunoCard}>
                <div style={s.alunoHeader}>
                  <div>
                    <div style={s.alunoNome}>{aluno.nome}</div>
                    {aluno.objetivo && <span style={{ ...s.badgeIMC, background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}>{aluno.objetivo}</span>}
                  </div>
                  {imc && (
                    <span style={{ ...s.badgeIMC, background: imc < 18.5 ? "rgba(0,229,255,0.1)" : imc < 25 ? "rgba(37,211,102,0.1)" : imc < 30 ? "rgba(255,200,0,0.1)" : "rgba(255,87,34,0.1)", color: imc < 18.5 ? "#00E5FF" : imc < 25 ? "#25d366" : imc < 30 ? "#ffc800" : "#FF5722" }}>
                      IMC {imc.toFixed(1)} — {classificarIMC(imc)}
                    </span>
                  )}
                </div>

                <div style={s.alunoGrid}>
                  <div><div style={s.alunoInfo}>Idade</div><div style={s.alunoInfoValor}>{aluno.idade || "—"}</div></div>
                  <div><div style={s.alunoInfo}>Peso</div><div style={s.alunoInfoValor}>{aluno.peso ? `${aluno.peso} kg` : "—"}</div></div>
                  <div><div style={s.alunoInfo}>Altura</div><div style={s.alunoInfoValor}>{aluno.altura ? `${aluno.altura} m` : "—"}</div></div>
                  {aluno.gordura && <div><div style={s.alunoInfo}>% Gordura</div><div style={s.alunoInfoValor}>{aluno.gordura}%</div></div>}
                  {aluno.cintura && <div><div style={s.alunoInfo}>Cintura</div><div style={s.alunoInfoValor}>{aluno.cintura} cm</div></div>}
                  {aluno.quadril && <div><div style={s.alunoInfo}>Quadril</div><div style={s.alunoInfoValor}>{aluno.quadril} cm</div></div>}
                  {aluno.telefone && <div><div style={s.alunoInfo}>Telefone</div><div style={s.alunoInfoValor}>{aluno.telefone}</div></div>}
                  {aluno.observacoes && <div style={{ gridColumn: "1 / -1" }}><div style={s.alunoInfo}>Obs</div><div style={s.alunoInfoValor}>{aluno.observacoes}</div></div>}
                </div>

                <div style={s.btnGroup}>
                  <button style={s.btnSmall} onClick={() => handleEdit(aluno)}>Editar</button>
                  {aluno.telefone && <button style={s.btnWhats} onClick={() => handleWhatsApp(aluno.telefone)}>WhatsApp</button>}
                  <button style={s.btnDanger} onClick={() => handleDelete(aluno.id)}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}