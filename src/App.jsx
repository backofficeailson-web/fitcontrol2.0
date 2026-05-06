import { useState, useEffect, useCallback } from "react";
import { API } from "./config";

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function calcIMC(peso, altura) {
  if (!peso || !altura || altura <= 0 || peso <= 0) return null;
  return peso / (altura * altura);
}
function classIMC(imc) {
  if (!imc) return "—";
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidade";
}
function corIMC(imc) {
  if (!imc) return "#B0B0B0";
  if (imc < 18.5) return "#00E5FF";
  if (imc < 25) return "#25d366";
  if (imc < 30) return "#ffc800";
  return "#FF5722";
}
function limparTel(tel) { return tel.replace(/\D/g, ""); }

// ============================================
// ESTILOS
// ============================================
const s = {
  body: { margin: 0, minHeight: "100vh", background: "#0B0C10", color: "#FFFFFF", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  app: { maxWidth: 1200, margin: "0 auto", padding: "16px 20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(0,229,255,0.1)", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  logo: { fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #00E5FF, #FF5722)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  logoSub: { fontSize: 11, color: "#B0B0B0", letterSpacing: 3, textTransform: "uppercase" },
  btnPrimary: { background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,229,255,0.25)" },
  btnDanger: { background: "rgba(255,87,34,0.15)", color: "#FF5722", border: "1px solid rgba(255,87,34,0.3)", padding: "8px 14px", borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer" },
  btnSmall: { background: "rgba(0,229,255,0.08)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)", padding: "8px 14px", borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer" },
  btnWhats: { background: "rgba(37,211,102,0.15)", color: "#25d366", border: "1px solid rgba(37,211,102,0.3)", padding: "8px 14px", borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer" },
  btnGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  dashGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 },
  dashCard: { background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))", border: "1px solid rgba(0,229,255,0.12)", borderRadius: 18, padding: 18 },
  dashValue: { fontSize: 30, fontWeight: 800, margin: "4px 0", background: "linear-gradient(135deg, #00E5FF, #FF5722)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  dashLabel: { fontSize: 11, color: "#B0B0B0", textTransform: "uppercase", letterSpacing: 1 },
  formCard: { background: "linear-gradient(145deg, rgba(18,24,32,0.9), rgba(11,12,16,0.95))", border: "1px solid rgba(0,229,255,0.12)", borderRadius: 20, padding: 22, marginBottom: 22 },
  formTitle: { fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#FFFFFF" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 14 },
  input: { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(0,229,255,0.15)", background: "rgba(11,12,16,0.8)", color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(0,229,255,0.15)", background: "rgba(11,12,16,0.8)", color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" },
  card: { background: "rgba(18,24,32,0.8)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: 18, marginBottom: 14 },
  tab: { background: "rgba(0,229,255,0.05)", color: "#B0B0B0", border: "1px solid rgba(0,229,255,0.15)", padding: "10px 18px", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
  tabActive: { background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 },
  empty: { textAlign: "center", padding: 40, color: "#B0B0B0" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 10 },
  infoLabel: { fontSize: 11, color: "#B0B0B0" },
  infoValue: { fontSize: 14, fontWeight: 600 },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("fitcontrol_token") || "");
  const [pagina, setPagina] = useState("dashboard");
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auth
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Form aluno
  const [editAluno, setEditAluno] = useState(null);
  const [formAluno, setFormAluno] = useState({
    nome:"", idade:"", peso:"", altura:"", objetivo:"", telefone:"", observacoes:"",
    gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"",
    patologias:"", restricoes:"", nivel_atividade:"", historico_lesoes:"",
    modalidade:"", biotipo:"", experiencia_anos:"", foco_competitivo:"",
    metodologia_preferida:"", frequencia_semanal:"", disponibilidade_tempo:"",
    objetivo_principal:"", objetivo_secundario:"", observacoes_tecnicas:"", status_liberacao:""
  });

  // Treinos
  const [treinos, setTreinos] = useState([]);
  const [exercicios, setExercicios] = useState({});
  const [showTreinoForm, setShowTreinoForm] = useState(false);
  const [editTreino, setEditTreino] = useState(null);
  const [formTreino, setFormTreino] = useState({ nome:"", divisao:"", observacoes:"" });
  const [showExForm, setShowExForm] = useState(null);
  const [editEx, setEditEx] = useState(null);
  const [formEx, setFormEx] = useState({ nome:"", series:"", repeticoes:"", carga:"", descanso:"", observacoes:"" });

  // Avaliações
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [showAvForm, setShowAvForm] = useState(false);
  const [formAv, setFormAv] = useState({
    peso:"", altura:"", gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"", observacoes:""
  });

  // Fotos
  const [fotos, setFotos] = useState([]);

  // ============ FETCH HELPER ============
  async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("fitcontrol_token");
    const headers = { ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.body && typeof options.body === "object") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem("fitcontrol_token");
      setToken("");
      throw new Error("Sessão expirada");
    }
    return res;
  }

  // ============ LOADERS ============
  const loadAlunos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await apiFetch(`${API}/api/alunos`); if (r.ok) setAlunos(await r.json()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  const loadTreinos = async (alunoId) => {
    try { const r = await apiFetch(`${API}/api/alunos/${alunoId}/treinos`); if (r.ok) setTreinos(await r.json()); }
    catch (e) {}
  };

  const loadAvs = async (alunoId) => {
    try { const r = await apiFetch(`${API}/api/alunos/${alunoId}/avaliacoes`); if (r.ok) setAvaliacoes(await r.json()); }
    catch (e) {}
  };

  const loadExs = async (treinoId) => {
    try { const r = await apiFetch(`${API}/api/treinos/${treinoId}/exercicios`); if (r.ok) setExercicios(prev => ({ ...prev, [treinoId]: await r.json() })); }
    catch (e) {}
  };

  const loadFotos = async (alunoId) => {
    try { const r = await apiFetch(`${API}/api/alunos/${alunoId}/fotos-posturais`); if (r.ok) setFotos(await r.json()); }
    catch (e) {}
  };

  useEffect(() => { loadAlunos(); }, [loadAlunos]);

  // ============ AUTH ============
  const handleAuth = async (e) => {
    e.preventDefault(); setAuthError("");
    try {
      const ep = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const r = await fetch(`${API}${ep}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(authForm)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro");
      setToken(d.token);
      localStorage.setItem("fitcontrol_token", d.token);
    } catch (er) { setAuthError(er.message); }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("fitcontrol_token");
    setAlunos([]);
    setSelectedAluno(null);
  };

  // ============ ALUNOS ============
  const resetFormAluno = () => setFormAluno({
    nome:"", idade:"", peso:"", altura:"", objetivo:"", telefone:"", observacoes:"",
    gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"",
    patologias:"", restricoes:"", nivel_atividade:"", historico_lesoes:"",
    modalidade:"", biotipo:"", experiencia_anos:"", foco_competitivo:"",
    metodologia_preferida:"", frequencia_semanal:"", disponibilidade_tempo:"",
    objetivo_principal:"", objetivo_secundario:"", observacoes_tecnicas:"", status_liberacao:""
  });

  const handleSalvarAluno = async (e) => {
    e.preventDefault();
    if (!formAluno.nome.trim()) return setError("Nome obrigatório");
    setError(""); setSuccess("");
    const body = Object.fromEntries(
      Object.entries(formAluno).map(([k, v]) => [
        k,
        v === "" ? null : (["idade","peso","altura","gordura","cintura","quadril","torax","braco","coxa","experiencia_anos","frequencia_semanal"].includes(k) ? Number(v) : v)
      ])
    );
    try {
      if (editAluno) {
        await apiFetch(`${API}/api/alunos/${editAluno.id}`, { method: "PUT", body });
        setSuccess("Aluno atualizado!");
      } else {
        await apiFetch(`${API}/api/alunos`, { method: "POST", body });
        setSuccess("Aluno cadastrado!");
      }
      setEditAluno(null); resetFormAluno(); loadAlunos();
    } catch (er) { setError(er.message); }
  };

  const handleEditarAluno = (a) => {
    setEditAluno(a);
    setFormAluno({
      nome: a.nome || "", idade: a.idade || "", peso: a.peso || "", altura: a.altura || "",
      objetivo: a.objetivo || "", telefone: a.telefone || "", observacoes: a.observacoes || "",
      gordura: a.gordura || "", cintura: a.cintura || "", quadril: a.quadril || "",
      torax: a.torax || "", braco: a.braco || "", coxa: a.coxa || "",
      patologias: a.patologias || "", restricoes: a.restricoes || "",
      nivel_atividade: a.nivel_atividade || "", historico_lesoes: a.historico_lesoes || "",
      modalidade: a.modalidade || "", biotipo: a.biotipo || "",
      experiencia_anos: a.experiencia_anos || "", foco_competitivo: a.foco_competitivo || "",
      metodologia_preferida: a.metodologia_preferida || "",
      frequencia_semanal: a.frequencia_semanal || "", disponibilidade_tempo: a.disponibilidade_tempo || "",
      objetivo_principal: a.objetivo_principal || "", objetivo_secundario: a.objetivo_secundario || "",
      observacoes_tecnicas: a.observacoes_tecnicas || "", status_liberacao: a.status_liberacao || ""
    });
  };

  const handleExcluirAluno = async (id) => {
    if (!confirm("Excluir aluno?")) return;
    await apiFetch(`${API}/api/alunos/${id}`, { method: "DELETE" });
    if (selectedAluno?.id === id) setSelectedAluno(null);
    loadAlunos();
  };

  // ============ TREINOS ============
  const handleSalvarTreino = async (e) => {
    e.preventDefault();
    if (!formTreino.nome.trim()) return setError("Nome do treino obrigatório");
    setError(""); setSuccess("");
    try {
      if (editTreino) {
        await apiFetch(`${API}/api/treinos/${editTreino.id}`, { method: "PUT", body: formTreino });
        setSuccess("Treino atualizado!");
      } else {
        await apiFetch(`${API}/api/alunos/${selectedAluno.id}/treinos`, { method: "POST", body: formTreino });
        setSuccess("Treino criado!");
      }
      setShowTreinoForm(false); setEditTreino(null); setFormTreino({ nome:"", divisao:"", observacoes:"" });
      loadTreinos(selectedAluno.id);
    } catch (er) { setError(er.message); }
  };

  const handleEditarTreino = (t) => {
    setEditTreino(t);
    setFormTreino({ nome: t.nome, divisao: t.divisao || "", observacoes: t.observacoes || "" });
    setShowTreinoForm(true);
  };

  const handleExcluirTreino = async (id) => {
    if (!confirm("Excluir treino?")) return;
    await apiFetch(`${API}/api/treinos/${id}`, { method: "DELETE" });
    loadTreinos(selectedAluno.id);
  };

  // ============ EXERCICIOS ============
  const handleSalvarEx = async (e) => {
    e.preventDefault();
    if (!formEx.nome.trim()) return setError("Nome do exercício obrigatório");
    setError(""); setSuccess("");
    try {
      if (editEx) {
        await apiFetch(`${API}/api/exercicios/${editEx.id}`, { method: "PUT", body: formEx });
        setSuccess("Exercício atualizado!");
      } else {
        await apiFetch(`${API}/api/treinos/${showExForm}/exercicios`, { method: "POST", body: formEx });
        setSuccess("Exercício adicionado!");
      }
      setShowExForm(null); setEditEx(null); setFormEx({ nome:"", series:"", repeticoes:"", carga:"", descanso:"", observacoes:"" });
      loadExs(editEx ? editEx.treino_id : showExForm);
    } catch (er) { setError(er.message); }
  };

  const handleEditarEx = (ex) => {
    setEditEx(ex);
    setFormEx({ nome: ex.nome || "", series: ex.series || "", repeticoes: ex.repeticoes || "", carga: ex.carga || "", descanso: ex.descanso || "", observacoes: ex.observacoes || "" });
    setShowExForm(ex.treino_id);
  };

  const handleExcluirEx = async (id, treinoId) => {
    if (!confirm("Excluir exercício?")) return;
    await apiFetch(`${API}/api/exercicios/${id}`, { method: "DELETE" });
    loadExs(treinoId);
  };

  // ============ AVALIAÇÕES ============
  const handleSalvarAv = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const body = Object.fromEntries(
      Object.entries(formAv).map(([k, v]) => [k, v === "" ? null : (k !== "observacoes" ? Number(v) : v)])
    );
    try {
      await apiFetch(`${API}/api/alunos/${selectedAluno.id}/avaliacoes`, { method: "POST", body });
      setSuccess("Avaliação salva!");
      setShowAvForm(false);
      setFormAv({ peso:"", altura:"", gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"", observacoes:"" });
      loadAvs(selectedAluno.id);
      loadAlunos();
    } catch (er) { setError(er.message); }
  };

  const handleExcluirAv = async (id) => {
    if (!confirm("Excluir avaliação?")) return;
    await apiFetch(`${API}/api/avaliacoes/${id}`, { method: "DELETE" });
    loadAvs(selectedAluno.id);
  };

  // ============ FOTOS ============
  const handleUploadFoto = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await apiFetch(`${API}/api/alunos/${selectedAluno.id}/fotos-posturais`, {
          method: "POST",
          body: { tipo, data_url: reader.result }
        });
        loadFotos(selectedAluno.id);
      } catch (er) { setError(er.message); }
    };
    reader.readAsDataURL(file);
  };

  const handleExcluirFoto = async (id) => {
    if (!confirm("Excluir foto?")) return;
    await apiFetch(`${API}/api/fotos-posturais/${id}`, { method: "DELETE" });
    loadFotos(selectedAluno.id);
  };

  // ============ MÉTRICAS ============
  const totAlunos = alunos.length;
  const imcs = alunos.map(a => calcIMC(a.peso, a.altura)).filter(v => v);
  const imcMedio = imcs.length ? (imcs.reduce((a, b) => a + b, 0) / imcs.length).toFixed(1) : "0";
  const pesoMedio = alunos.filter(a => a.peso).length ? (alunos.filter(a => a.peso).reduce((a, b) => a + b.peso, 0) / alunos.filter(a => a.peso).length).toFixed(1) : "0";
  const emagrec = alunos.filter(a => a.objetivo_principal?.toLowerCase().includes("emagrec")).length;
  const hip = alunos.filter(a => a.objetivo_principal?.toLowerCase().includes("hiper")).length;

  // ============ LOGIN SCREEN ============
  if (!token) {
    return (
      <div style={s.body}>
        <div style={{ ...s.app, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <div style={{ ...s.formCard, width: "100%", maxWidth: 400 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={s.logo}>fitcontrol</div>
              <div style={s.logoSub}>Professional Fitness</div>
            </div>
            <form onSubmit={handleAuth}>
              <input style={{ ...s.input, marginBottom: 12 }} type="email" placeholder="Email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
              <input style={{ ...s.input, marginBottom: 18 }} type="password" placeholder="Senha" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
              {authError && <p style={{ color: "#FF5722", fontSize: 13, marginBottom: 14 }}>{authError}</p>}
              <button type="submit" style={{ ...s.btnPrimary, width: "100%", padding: "14px" }}>{authMode === "login" ? "ENTRAR" : "CRIAR CONTA"}</button>
            </form>
            <p style={{ textAlign: "center", marginTop: 18, color: "#B0B0B0", fontSize: 13 }}>
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

  // ============ APP PRINCIPAL ============
  return (
    <div style={s.body}>
      <div style={s.app}>
        <header style={s.header}>
          <div>
            <div style={s.logo}>fitcontrol</div>
            <div style={s.logoSub}>Painel Profissional</div>
          </div>
          <div style={s.btnGroup}>
            <button style={pagina === "dashboard" ? s.tabActive : s.tab} onClick={() => { setSelectedAluno(null); setPagina("dashboard"); }}>Dashboard</button>
            <button style={pagina === "alunos" ? s.tabActive : s.tab} onClick={() => { setSelectedAluno(null); setPagina("alunos"); }}>Alunos</button>
            {selectedAluno && (
              <>
                <button style={pagina === "treinos" ? s.tabActive : s.tab} onClick={() => setPagina("treinos")}>Treinos</button>
                <button style={pagina === "avaliacoes" ? s.tabActive : s.tab} onClick={() => setPagina("avaliacoes")}>Avaliações</button>
                <button style={pagina === "fotos" ? s.tabActive : s.tab} onClick={() => setPagina("fotos")}>Fotos</button>
              </>
            )}
            <button style={s.btnDanger} onClick={logout}>Sair</button>
          </div>
        </header>

        {error && <div style={{ background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.3)", padding: 12, borderRadius: 12, marginBottom: 18, color: "#FF5722", fontSize: 13 }}>{error} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setError("")}>✕</span></div>}
        {success && <div style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", padding: 12, borderRadius: 12, marginBottom: 18, color: "#00E5FF", fontSize: 13 }}>{success} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setSuccess("")}>✕</span></div>}

        {/* ============ DASHBOARD ============ */}
        {pagina === "dashboard" && (
          <>
            <div style={s.dashGrid}>
              <div style={s.dashCard}><div style={s.dashLabel}>Total Alunos</div><div style={s.dashValue}>{totAlunos}</div></div>
              <div style={s.dashCard}><div style={s.dashLabel}>Peso Médio</div><div style={s.dashValue}>{pesoMedio} kg</div></div>
              <div style={s.dashCard}><div style={s.dashLabel}>IMC Médio</div><div style={s.dashValue}>{imcMedio}</div></div>
              <div style={s.dashCard}><div style={s.dashLabel}>Emagrecimento</div><div style={s.dashValue}>{emagrec}</div></div>
              <div style={s.dashCard}><div style={s.dashLabel}>Hipertrofia</div><div style={s.dashValue}>{hip}</div></div>
            </div>
            <div style={s.formCard}>
              <h3 style={s.formTitle}>Últimos Alunos</h3>
              {alunos.slice(0, 5).map(a => {
                const imc = calcIMC(a.peso, a.altura);
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <strong>{a.nome}</strong>
                      {a.objetivo_principal && <span style={{ ...s.badge, background: "rgba(0,229,255,0.1)", color: "#00E5FF", marginLeft: 8 }}>{a.objetivo_principal}</span>}
                    </div>
                    <div style={s.btnGroup}>
                      {imc && <span style={{ ...s.badge, background: corIMC(imc) + "20", color: corIMC(imc) }}>IMC {imc.toFixed(1)}</span>}
                      <button style={s.btnSmall} onClick={() => { setSelectedAluno(a); loadTreinos(a.id); loadAvs(a.id); loadFotos(a.id); setPagina("treinos"); }}>Abrir</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============ ALUNOS ============ */}
        {pagina === "alunos" && (
          <>
            <div style={s.formCard}>
              <h3 style={s.formTitle}>{editAluno ? "Editar Aluno" : "Cadastrar Aluno"}</h3>
              <form onSubmit={handleSalvarAluno}>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Nome *" value={formAluno.nome} onChange={e => setFormAluno({ ...formAluno, nome: e.target.value })} />
                  <input style={s.input} type="number" placeholder="Idade" value={formAluno.idade} onChange={e => setFormAluno({ ...formAluno, idade: e.target.value })} />
                  <input style={s.input} type="number" step="0.1" placeholder="Peso (kg)" value={formAluno.peso} onChange={e => setFormAluno({ ...formAluno, peso: e.target.value })} />
                  <input style={s.input} type="number" step="0.01" placeholder="Altura (m) ex: 1.75" value={formAluno.altura} onChange={e => setFormAluno({ ...formAluno, altura: e.target.value })} />
                  <select style={s.select} value={formAluno.objetivo_principal} onChange={e => setFormAluno({ ...formAluno, objetivo_principal: e.target.value })}>
                    <option value="">Objetivo</option>
                    <option>Emagrecimento</option><option>Hipertrofia</option><option>Força</option><option>Resistência</option><option>Condicionamento</option>
                  </select>
                  <input style={s.input} placeholder="Telefone" value={formAluno.telefone} onChange={e => setFormAluno({ ...formAluno, telefone: e.target.value })} />
                </div>
                <h4 style={{ fontSize: 13, color: "#00E5FF", margin: "12px 0 8px" }}>Perfil Técnico</h4>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Modalidade" value={formAluno.modalidade} onChange={e => setFormAluno({ ...formAluno, modalidade: e.target.value })} />
                  <input style={s.input} placeholder="Biotipo" value={formAluno.biotipo} onChange={e => setFormAluno({ ...formAluno, biotipo: e.target.value })} />
                  <input style={s.input} type="number" placeholder="Experiência (anos)" value={formAluno.experiencia_anos} onChange={e => setFormAluno({ ...formAluno, experiencia_anos: e.target.value })} />
                  <input style={s.input} placeholder="Foco competitivo" value={formAluno.foco_competitivo} onChange={e => setFormAluno({ ...formAluno, foco_competitivo: e.target.value })} />
                  <input style={s.input} placeholder="Metodologia preferida" value={formAluno.metodologia_preferida} onChange={e => setFormAluno({ ...formAluno, metodologia_preferida: e.target.value })} />
                  <input style={s.input} type="number" placeholder="Frequência semanal" value={formAluno.frequencia_semanal} onChange={e => setFormAluno({ ...formAluno, frequencia_semanal: e.target.value })} />
                  <input style={s.input} placeholder="Disponibilidade de tempo" value={formAluno.disponibilidade_tempo} onChange={e => setFormAluno({ ...formAluno, disponibilidade_tempo: e.target.value })} />
                  <input style={s.input} placeholder="Status liberação" value={formAluno.status_liberacao} onChange={e => setFormAluno({ ...formAluno, status_liberacao: e.target.value })} />
                </div>
                <h4 style={{ fontSize: 13, color: "#00E5FF", margin: "12px 0 8px" }}>Saúde & Patologias</h4>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Patologias" value={formAluno.patologias} onChange={e => setFormAluno({ ...formAluno, patologias: e.target.value })} />
                  <input style={s.input} placeholder="Restrições" value={formAluno.restricoes} onChange={e => setFormAluno({ ...formAluno, restricoes: e.target.value })} />
                  <input style={s.input} placeholder="Nível de atividade" value={formAluno.nivel_atividade} onChange={e => setFormAluno({ ...formAluno, nivel_atividade: e.target.value })} />
                  <input style={s.input} placeholder="Histórico de lesões" value={formAluno.historico_lesoes} onChange={e => setFormAluno({ ...formAluno, historico_lesoes: e.target.value })} />
                </div>
                <h4 style={{ fontSize: 13, color: "#00E5FF", margin: "12px 0 8px" }}>Medidas</h4>
                <div style={s.formGrid}>
                  <input style={s.input} type="number" step="0.1" placeholder="% Gordura" value={formAluno.gordura} onChange={e => setFormAluno({ ...formAluno, gordura: e.target.value })} />
                  <input style={s.input} type="number" step="0.1" placeholder="Cintura (cm)" value={formAluno.cintura} onChange={e => setFormAluno({ ...formAluno, cintura: e.target.value })} />
                  <input style={s.input} type="number" step="0.1" placeholder="Quadril (cm)" value={formAluno.quadril} onChange={e => setFormAluno({ ...formAluno, quadril: e.target.value })} />
                  <input style={s.input} type="number" step="0.1" placeholder="Tórax (cm)" value={formAluno.torax} onChange={e => setFormAluno({ ...formAluno, torax: e.target.value })} />
                  <input style={s.input} type="number" step="0.1" placeholder="Braço (cm)" value={formAluno.braco} onChange={e => setFormAluno({ ...formAluno, braco: e.target.value })} />
                  <input style={s.input} type="number" step="0.1" placeholder="Coxa (cm)" value={formAluno.coxa} onChange={e => setFormAluno({ ...formAluno, coxa: e.target.value })} />
                </div>
                <textarea style={{ ...s.input, minHeight: 60, marginBottom: 14 }} placeholder="Observações" value={formAluno.observacoes} onChange={e => setFormAluno({ ...formAluno, observacoes: e.target.value })} />
                <div style={s.btnGroup}>
                  <button type="submit" style={s.btnPrimary}>{editAluno ? "Salvar" : "Cadastrar"}</button>
                  {editAluno && <button type="button" style={s.btnSmall} onClick={() => { setEditAluno(null); resetFormAluno(); }}>Cancelar</button>}
                </div>
              </form>
            </div>

            <div style={s.formCard}>
              <h3 style={s.formTitle}>Alunos ({totAlunos})</h3>
              {loading && <div style={s.empty}>Carregando...</div>}
              {alunos.map(a => {
                const imc = calcIMC(a.peso, a.altura);
                return (
                  <div key={a.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: 16 }}>{a.nome}</strong>
                        {a.objetivo_principal && <span style={{ ...s.badge, background: "rgba(0,229,255,0.1)", color: "#00E5FF", marginLeft: 8 }}>{a.objetivo_principal}</span>}
                      </div>
                      {imc && <span style={{ ...s.badge, background: corIMC(imc) + "20", color: corIMC(imc) }}>IMC {imc.toFixed(1)} — {classIMC(imc)}</span>}
                    </div>
                    <div style={s.btnGroup} style={{ marginTop: 8 }}>
                      <button style={s.btnSmall} onClick={() => { setSelectedAluno(a); loadTreinos(a.id); loadAvs(a.id); loadFotos(a.id); setPagina("treinos"); }}>Abrir</button>
                      <button style={s.btnSmall} onClick={() => handleEditarAluno(a)}>Editar</button>
                      {a.telefone && <button style={s.btnWhats} onClick={() => window.open(`https://wa.me/55${limparTel(a.telefone)}`, "_blank")}>WhatsApp</button>}
                      <button style={s.btnDanger} onClick={() => handleExcluirAluno(a.id)}>Excluir</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============ TREINOS ============ */}
        {pagina === "treinos" && selectedAluno && (
          <>
            <div style={{ ...s.card, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedAluno.nome}</h3>
                  <p style={{ color: "#B0B0B0", margin: "4px 0" }}>
                    {selectedAluno.objetivo_principal || "Sem objetivo"} • {selectedAluno.modalidade || "Sem modalidade"}
                  </p>
                </div>
                <div style={s.btnGroup}>
                  <button style={s.btnSmall} onClick={() => { setShowTreinoForm(true); setEditTreino(null); setFormTreino({ nome:"", divisao:"", observacoes:"" }); }}>+ Treino</button>
                  <button style={s.btnSmall} onClick={async () => {
                    const res = await apiFetch(`${API}/api/alunos/${selectedAluno.id}/gerar-treino-modelo`, { method: "POST" });
                    if (res.ok) { loadTreinos(selectedAluno.id); setSuccess("Treino modelo gerado!"); }
                    else setError("Erro ao gerar treino");
                  }}>Gerar Treino Modelo</button>
                  <button style={{ ...s.btnSmall, color: "#B0B0B0" }} onClick={() => setPagina("dashboard")}>← Voltar</button>
                </div>
              </div>
            </div>

            {showTreinoForm && (
              <div style={s.formCard}>
                <h4 style={s.formTitle}>{editTreino ? "Editar Treino" : "Novo Treino"}</h4>
                <form onSubmit={handleSalvarTreino}>
                  <div style={s.formGrid}>
                    <input style={s.input} placeholder="Nome *" value={formTreino.nome} onChange={e => setFormTreino({ ...formTreino, nome: e.target.value })} />
                    <select style={s.select} value={formTreino.divisao} onChange={e => setFormTreino({ ...formTreino, divisao: e.target.value })}>
                      <option value="">Divisão</option>
                      <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                    </select>
                  </div>
                  <textarea style={{ ...s.input, minHeight: 50, marginBottom: 14 }} placeholder="Observações" value={formTreino.observacoes} onChange={e => setFormTreino({ ...formTreino, observacoes: e.target.value })} />
                  <div style={s.btnGroup}>
                    <button type="submit" style={s.btnPrimary}>{editTreino ? "Salvar" : "Criar"}</button>
                    <button type="button" style={s.btnSmall} onClick={() => { setShowTreinoForm(false); setEditTreino(null); }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {showExForm && (
              <div style={s.formCard}>
                <h4 style={s.formTitle}>{editEx ? "Editar Exercício" : "Novo Exercício"}</h4>
                <form onSubmit={handleSalvarEx}>
                  <div style={s.formGrid}>
                    <input style={s.input} placeholder="Nome *" value={formEx.nome} onChange={e => setFormEx({ ...formEx, nome: e.target.value })} />
                    <input style={s.input} placeholder="Séries" value={formEx.series} onChange={e => setFormEx({ ...formEx, series: e.target.value })} />
                    <input style={s.input} placeholder="Repetições" value={formEx.repeticoes} onChange={e => setFormEx({ ...formEx, repeticoes: e.target.value })} />
                    <input style={s.input} placeholder="Carga" value={formEx.carga} onChange={e => setFormEx({ ...formEx, carga: e.target.value })} />
                    <input style={s.input} placeholder="Descanso" value={formEx.descanso} onChange={e => setFormEx({ ...formEx, descanso: e.target.value })} />
                  </div>
                  <textarea style={{ ...s.input, minHeight: 50, marginBottom: 14 }} placeholder="Observações" value={formEx.observacoes} onChange={e => setFormEx({ ...formEx, observacoes: e.target.value })} />
                  <div style={s.btnGroup}>
                    <button type="submit" style={s.btnPrimary}>{editEx ? "Salvar" : "Adicionar"}</button>
                    <button type="button" style={s.btnSmall} onClick={() => { setShowExForm(null); setEditEx(null); }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div style={s.formCard}>
              <h4 style={s.formTitle}>Treinos ({treinos.length})</h4>
              {treinos.map(t => {
                const exs = exercicios[t.id] || [];
                return (
                  <div key={t.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <strong>{t.nome}</strong>
                        {t.divisao && <span style={{ ...s.badge, background: "rgba(0,229,255,0.1)", color: "#00E5FF", marginLeft: 8 }}>Div. {t.divisao}</span>}
                      </div>
                      <div style={s.btnGroup}>
                        <button style={s.btnSmall} onClick={() => { loadExs(t.id); setShowExForm(t.id); setEditEx(null); setFormEx({ nome:"", series:"", repeticoes:"", carga:"", descanso:"", observacoes:"" }); }}>+ Exercício</button>
                        <button style={s.btnSmall} onClick={() => handleEditarTreino(t)}>Editar</button>
                        <button style={s.btnDanger} onClick={() => handleExcluirTreino(t.id)}>Excluir</button>
                      </div>
                    </div>
                    {t.observacoes && <p style={{ color: "#B0B0B0", fontSize: 13, margin: "6px 0" }}>{t.observacoes}</p>}
                    {exs.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        {exs.map(ex => (
                          <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", flexWrap: "wrap", gap: 4 }}>
                            <div>
                              <strong>{ex.nome}</strong>
                              <span style={{ color: "#B0B0B0", fontSize: 12, marginLeft: 8 }}>
                                {[ex.series, ex.repeticoes, ex.carga, ex.descanso].filter(Boolean).join(" • ")}
                              </span>
                            </div>
                            <div style={s.btnGroup}>
                              <button style={{ ...s.btnSmall, fontSize: 10, padding: "4px 8px" }} onClick={() => handleEditarEx(ex)}>Editar</button>
                              <button style={{ ...s.btnDanger, fontSize: 10, padding: "4px 8px" }} onClick={() => handleExcluirEx(ex.id, t.id)}>Excluir</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============ AVALIAÇÕES ============ */}
        {pagina === "avaliacoes" && selectedAluno && (
          <>
            <div style={{ ...s.card, marginBottom: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{selectedAluno.nome} — Histórico</h3>
              <div style={s.btnGroup}>
                <button style={s.btnSmall} onClick={() => { setShowAvForm(true); setFormAv({ peso:"", altura:"", gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"", observacoes:"" }); }}>+ Avaliação</button>
                <button style={{ ...s.btnSmall, color: "#B0B0B0" }} onClick={() => setPagina("treinos")}>← Voltar</button>
              </div>
            </div>
            {showAvForm && (
              <div style={s.formCard}>
                <h4 style={s.formTitle}>Nova Avaliação</h4>
                <form onSubmit={handleSalvarAv}>
                  <div style={s.formGrid}>
                    <input style={s.input} type="number" step="0.1" placeholder="Peso (kg)" value={formAv.peso} onChange={e => setFormAv({ ...formAv, peso: e.target.value })} />
                    <input style={s.input} type="number" step="0.01" placeholder="Altura (m)" value={formAv.altura} onChange={e => setFormAv({ ...formAv, altura: e.target.value })} />
                    <input style={s.input} type="number" step="0.1" placeholder="% Gordura" value={formAv.gordura} onChange={e => setFormAv({ ...formAv, gordura: e.target.value })} />
                    <input style={s.input} type="number" step="0.1" placeholder="Cintura (cm)" value={formAv.cintura} onChange={e => setFormAv({ ...formAv, cintura: e.target.value })} />
                    <input style={s.input} type="number" step="0.1" placeholder="Quadril (cm)" value={formAv.quadril} onChange={e => setFormAv({ ...formAv, quadril: e.target.value })} />
                    <input style={s.input} type="number" step="0.1" placeholder="Tórax (cm)" value={formAv.torax} onChange={e => setFormAv({ ...formAv, torax: e.target.value })} />
                    <input style={s.input} type="number" step="0.1" placeholder="Braço (cm)" value={formAv.braco} onChange={e => setFormAv({ ...formAv, braco: e.target.value })} />
                    <input style={s.input} type="number" step="0.1" placeholder="Coxa (cm)" value={formAv.coxa} onChange={e => setFormAv({ ...formAv, coxa: e.target.value })} />
                  </div>
                  <textarea style={{ ...s.input, minHeight: 50, marginBottom: 14 }} placeholder="Observações" value={formAv.observacoes} onChange={e => setFormAv({ ...formAv, observacoes: e.target.value })} />
                  <div style={s.btnGroup}>
                    <button type="submit" style={s.btnPrimary}>Salvar</button>
                    <button type="button" style={s.btnSmall} onClick={() => setShowAvForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
            <div style={s.formCard}>
              {avaliacoes.map(av => (
                <div key={av.id} style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <strong>{av.created_at || "—"}</strong>
                    <button style={s.btnDanger} onClick={() => handleExcluirAv(av.id)}>Excluir</button>
                  </div>
                  <div style={s.infoGrid}>
                    <div><div style={s.infoLabel}>Peso</div><div style={s.infoValue}>{av.peso ? av.peso + " kg" : "—"}</div></div>
                    <div><div style={s.infoLabel}>IMC</div><div style={s.infoValue}>{av.imc ?? "—"}</div></div>
                    <div><div style={s.infoLabel}>Gordura</div><div style={s.infoValue}>{av.gordura ?? "—"}%</div></div>
                    <div><div style={s.infoLabel}>Cintura</div><div style={s.infoValue}>{av.cintura ?? "—"} cm</div></div>
                    <div><div style={s.infoLabel}>Quadril</div><div style={s.infoValue}>{av.quadril ?? "—"} cm</div></div>
                  </div>
                </div>
              ))}
              {avaliacoes.length === 0 && <div style={s.empty}>Nenhuma avaliação cadastrada</div>}
            </div>
          </>
        )}

        {/* ============ FOTOS ============ */}
        {pagina === "fotos" && selectedAluno && (
          <>
            <div style={{ ...s.card, marginBottom: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{selectedAluno.nome} — Fotos Posturais</h3>
              <button style={{ ...s.btnSmall, color: "#B0B0B0" }} onClick={() => setPagina("treinos")}>← Voltar</button>
            </div>
            <div style={s.formCard}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <label style={s.btnSmall}>
                  Frontal
                  <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleUploadFoto(e, "frontal")} />
                </label>
                <label style={s.btnSmall}>
                  Lateral
                  <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleUploadFoto(e, "lateral")} />
                </label>
                <label style={s.btnSmall}>
                  Posterior
                  <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleUploadFoto(e, "posterior")} />
                </label>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {fotos.map(f => (
                  <div key={f.id} style={{ position: "relative", width: 150, height: 200, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,229,255,0.2)" }}>
                    <img src={f.data_url} alt={f.tipo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", padding: "2px 8px", borderRadius: 8, fontSize: 11 }}>{f.tipo}</div>
                    <div style={{ position: "absolute", top: 8, right: 8, cursor: "pointer" }} onClick={() => handleExcluirFoto(f.id)}>🗑️</div>
                  </div>
                ))}
                {fotos.length === 0 && <div style={s.empty}>Nenhuma foto postural</div>}
              </div>
              <p style={{ color: "#B0B0B0", fontSize: 12, marginTop: 20 }}>⚠️ A análise postural visual (IA) será integrada em uma versão futura.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}