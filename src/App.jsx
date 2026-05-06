// src/App.jsx — FitControl Pro com PWA Completo
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
const styles = {
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
  tabs: { display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" },
  tab: { background: "rgba(0,229,255,0.05)", color: "#B0B0B0", border: "1px solid rgba(0,229,255,0.15)", padding: "10px 18px", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
  tabActive: { background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
  bar: { height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, margin: "4px 0 8px" },
  barFill: { height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #00E5FF, #FF5722)" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 },
  empty: { textAlign: "center", padding: 40, color: "#B0B0B0" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 10 },
  infoLabel: { fontSize: 11, color: "#B0B0B0" },
  infoValue: { fontSize: 14, fontWeight: 600 }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("fc_token") || "");
  const [tab, setTab] = useState("dashboard");
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // PWA
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Auth
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Form aluno
  const [editAluno, setEditAluno] = useState(null);
  const [formAluno, setFormAluno] = useState({
    nome:"", idade:"", peso:"", altura:"", objetivo:"", telefone:"", observacoes:"",
    gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:""
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

  // ============ FETCH HELPERS ============
  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  const loadAlunos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await fetch(`${API}/api/alunos`, { headers: headers() }); if (r.ok) setAlunos(await r.json()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  const loadTreinos = async (alunoId) => {
    try { const r = await fetch(`${API}/api/alunos/${alunoId}/treinos`, { headers: headers() }); if (r.ok) setTreinos(await r.json()); }
    catch (e) {}
  };

  const loadAvs = async (alunoId) => {
    try { const r = await fetch(`${API}/api/alunos/${alunoId}/avaliacoes`, { headers: headers() }); if (r.ok) setAvaliacoes(await r.json()); }
    catch (e) {}
  };

  const loadExs = async (treinoId) => {
    try { const r = await fetch(`${API}/api/treinos/${treinoId}/exercicios`, { headers: headers() }); if (r.ok) setExercicios(prev => ({ ...prev, [treinoId]: await r.json() })); }
    catch (e) {}
  };

  // ============ PWA ============
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
      setSuccess('App instalado com sucesso!');
    }
    setInstallPrompt(null);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setError('Notificações não suportadas');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification('FitControl Pro', {
        body: 'Notificações ativadas!',
        icon: '/icons/icon-192.png'
      });
      setSuccess('Notificações ativadas!');
    } else {
      setError('Permissão negada');
    }
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
      setToken(d.token); localStorage.setItem("fc_token", d.token);
    } catch (er) { setAuthError(er.message); }
  };

  const logout = () => { setToken(""); localStorage.removeItem("fc_token"); setAlunos([]); setSelectedAluno(null); };

  // ============ ALUNOS ============
  const resetFormAluno = () => setFormAluno({ nome:"", idade:"", peso:"", altura:"", objetivo:"", telefone:"", observacoes:"", gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"" });

  const handleSalvarAluno = async (e) => {
    e.preventDefault();
    if (!formAluno.nome.trim()) return setError("Nome obrigatório");
    setError(""); setSuccess("");
    const body = Object.fromEntries(Object.entries(formAluno).map(([k, v]) => [k, v === "" ? null : (["idade","peso","altura","gordura","cintura","quadril","torax","braco","coxa"].includes(k) ? Number(v) : v)]));
    try {
      if (editAluno) {
        await fetch(`${API}/api/alunos/${editAluno.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
        setSuccess("Aluno atualizado!");
      } else {
        await fetch(`${API}/api/alunos`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
        setSuccess("Aluno cadastrado!");
      }
      setEditAluno(null); resetFormAluno(); loadAlunos();
    } catch (er) { setError(er.message); }
  };

  const handleEditarAluno = (a) => {
    setEditAluno(a);
    setFormAluno({
      nome: a.nome||"", idade: a.idade||"", peso: a.peso||"", altura: a.altura||"", objetivo: a.objetivo||"", telefone: a.telefone||"",
      observacoes: a.observacoes||"", gordura: a.gordura||"", cintura: a.cintura||"", quadril: a.quadril||"",
      torax: a.torax||"", braco: a.braco||"", coxa: a.coxa||""
    });
  };

  const handleExcluirAluno = async (id) => {
    if (!confirm("Excluir aluno?")) return;
    await fetch(`${API}/api/alunos/${id}`, { method: "DELETE", headers: headers() });
    if (selectedAluno?.id === id) setSelectedAluno(null);
    loadAlunos();
  };

  // ============ TREINOS ============
  const loadAllExs = (treinosList) => { treinosList.forEach(t => loadExs(t.id)); };

  const handleSalvarTreino = async (e) => {
    e.preventDefault();
    if (!formTreino.nome.trim()) return setError("Nome do treino obrigatório");
    setError(""); setSuccess("");
    try {
      if (editTreino) {
        await fetch(`${API}/api/treinos/${editTreino.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(formTreino) });
        setSuccess("Treino atualizado!");
      } else {
        await fetch(`${API}/api/alunos/${selectedAluno.id}/treinos`, { method: "POST", headers: headers(), body: JSON.stringify(formTreino) });
        setSuccess("Treino criado!");
      }
      setShowTreinoForm(false); setEditTreino(null); setFormTreino({ nome:"", divisao:"", observacoes:"" });
      loadTreinos(selectedAluno.id).then(() => loadAllExs(treinos));
    } catch (er) { setError(er.message); }
  };

  const handleEditarTreino = (t) => {
    setEditTreino(t);
    setFormTreino({ nome: t.nome, divisao: t.divisao||"", observacoes: t.observacoes||"" });
    setShowTreinoForm(true);
  };

  const handleExcluirTreino = async (id) => {
    if (!confirm("Excluir treino?")) return;
    await fetch(`${API}/api/treinos/${id}`, { method: "DELETE", headers: headers() });
    loadTreinos(selectedAluno.id);
  };

  // ============ EXERCICIOS ============
  const handleSalvarEx = async (e) => {
    e.preventDefault();
    if (!formEx.nome.trim()) return setError("Nome do exercício obrigatório");
    setError(""); setSuccess("");
    try {
      if (editEx) {
        await fetch(`${API}/api/exercicios/${editEx.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(formEx) });
        setSuccess("Exercício atualizado!");
      } else {
        await fetch(`${API}/api/treinos/${showExForm}/exercicios`, { method: "POST", headers: headers(), body: JSON.stringify(formEx) });
        setSuccess("Exercício adicionado!");
      }
      setShowExForm(null); setEditEx(null); setFormEx({ nome:"", series:"", repeticoes:"", carga:"", descanso:"", observacoes:"" });
      loadExs(editEx ? editEx.treino_id : showExForm);
    } catch (er) { setError(er.message); }
  };

  const handleEditarEx = (ex) => {
    setEditEx(ex);
    setFormEx({ nome: ex.nome||"", series: ex.series||"", repeticoes: ex.repeticoes||"", carga: ex.carga||"", descanso: ex.descanso||"", observacoes: ex.observacoes||"" });
    setShowExForm(ex.treino_id);
  };

  const handleExcluirEx = async (id, treinoId) => {
    if (!confirm("Excluir exercício?")) return;
    await fetch(`${API}/api/exercicios/${id}`, { method: "DELETE", headers: headers() });
    loadExs(treinoId);
  };

  // ============ AVALIAÇÕES ============
  const handleSalvarAv = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const body = Object.fromEntries(Object.entries(formAv).map(([k, v]) => [k, v === "" ? null : (k !== "observacoes" ? Number(v) : v)]));
    try {
      await fetch(`${API}/api/alunos/${selectedAluno.id}/avaliacoes`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
      setSuccess("Avaliação salva!");
      setShowAvForm(false); setFormAv({ peso:"", altura:"", gordura:"", cintura:"", quadril:"", torax:"", braco:"", coxa:"", observacoes:"" });
      loadAvs(selectedAluno.id); loadAlunos();
    } catch (er) { setError(er.message); }
  };

  const handleExcluirAv = async (id) => {
    if (!confirm("Excluir avaliação?")) return;
    await fetch(`${API}/api/avaliacoes/${id}`, { method: "DELETE", headers: headers() });
    loadAvs(selectedAluno.id);
  };

  // ============ METRICAS ============
  const totAlunos = alunos.length;
  const pesos = alunos.filter(a => a.peso).map(a => a.peso);
  const imcsList = alunos.map(a => calcIMC(a.peso, a.altura)).filter(v => v);
  const imcMedio = imcsList.length ? (imcsList.reduce((a, b) => a + b, 0) / imcsList.length).toFixed(1) : "0";
  const pesoMedio = pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : "0";
  const emagrec = alunos.filter(a => a.objetivo?.toLowerCase().includes("emagrec")).length;
  const hip = alunos.filter(a => a.objetivo?.toLowerCase().includes("hiper")).length;

  // ============ LOGIN SCREEN ============
  if (!token) {
    return (
      <div style={styles.body}>
        <div style={{ ...styles.app, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <div style={{ ...styles.formCard, width: "100%", maxWidth: 400 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={styles.logo}>fitcontrol</div>
              <div style={styles.logoSub}>Professional Fitness</div>
            </div>
            <form onSubmit={handleAuth}>
              <input style={{ ...styles.input, marginBottom: 12 }} type="email" placeholder="Email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
              <input style={{ ...styles.input, marginBottom: 18 }} type="password" placeholder="Senha" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
              {authError && <p style={{ color: "#FF5722", fontSize: 13, marginBottom: 14 }}>{authError}</p>}
              <button type="submit" style={{ ...styles.btnPrimary, width: "100%", padding: "14px" }}>{authMode === "login" ? "ENTRAR" : "CRIAR CONTA"}</button>
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
    <div style={styles.body}>
      <div style={styles.app}>
        <header style={styles.header}>
          <div>
            <div style={styles.logo}>fitcontrol</div>
            <div style={styles.logoSub}>Painel Profissional</div>
          </div>
          <div style={styles.btnGroup}>
            {installPrompt && !isInstalled && (
              <button style={styles.btnPrimary} onClick={handleInstall}>📲 Instalar App</button>
            )}
            {!notificationsEnabled && (
              <button style={styles.btnSmall} onClick={handleEnableNotifications}>🔔 Ativar Notificações</button>
            )}
            <button style={styles.btnSmall} onClick={() => { setSelectedAluno(null); setTab("dashboard"); }}>Dashboard</button>
            <button style={styles.btnSmall} onClick={() => { setSelectedAluno(null); setTab("alunos"); }}>Alunos</button>
            <button style={styles.btnDanger} onClick={logout}>Sair</button>
          </div>
        </header>

        {error && (
          <div style={{ background: "rgba(255,87,34,0.1)", border: "1px solid rgba(255,87,34,0.3)", padding: 12, borderRadius: 12, marginBottom: 18, color: "#FF5722", fontSize: 13 }}>
            {error} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setError("")}>✕</span>
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", padding: 12, borderRadius: 12, marginBottom: 18, color: "#00E5FF", fontSize: 13 }}>
            {success} <span style={{ float: "right", cursor: "pointer" }} onClick={() => setSuccess("")}>✕</span>
          </div>
        )}

        {/* ============ DASHBOARD ============ */}
        {tab === "dashboard" && (
          <>
            <div style={styles.dashGrid}>
              <div style={styles.dashCard}><div style={styles.dashLabel}>Total Alunos</div><div style={styles.dashValue}>{totAlunos}</div></div>
              <div style={styles.dashCard}><div style={styles.dashLabel}>Peso Médio</div><div style={styles.dashValue}>{pesoMedio} kg</div></div>
              <div style={styles.dashCard}><div style={styles.dashLabel}>IMC Médio</div><div style={styles.dashValue}>{imcMedio}</div></div>
              <div style={styles.dashCard}><div style={styles.dashLabel}>Emagrecimento</div><div style={styles.dashValue}>{emagrec}</div></div>
              <div style={styles.dashCard}><div style={styles.dashLabel}>Hipertrofia</div><div style={styles.dashValue}>{hip}</div></div>
            </div>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Últimos Alunos</h3>
              {alunos.slice(0, 5).map(a => {
                const imc = calcIMC(a.peso, a.altura);
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <strong>{a.nome}</strong>
                      {a.objetivo && <span style={{ ...styles.badge, background: "rgba(0,229,255,0.1)", color: "#00E5FF", marginLeft: 8 }}>{a.objetivo}</span>}
                    </div>
                    <div style={styles.btnGroup}>
                      {imc && <span style={{ ...styles.badge, background: `${corIMC(imc)}20`, color: corIMC(imc) }}>IMC {imc.toFixed(1)}</span>}
                      <button style={styles.btnSmall} onClick={() => { setSelectedAluno(a); loadTreinos(a.id); loadAvs(a.id); setTab("treinos"); }}>Abrir</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============ ALUNOS ============ */}
        {tab === "alunos" && (
          <>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>{editAluno ? "Editar Aluno" : "Cadastrar Novo Aluno"}</h3>
              <form onSubmit={handleSalvarAluno}>
                <div style={styles.formGrid}>
                  <input style={styles.input} placeholder="Nome *" value={formAluno.nome} onChange={e => setFormAluno({ ...formAluno, nome: e.target.value })} />
                  <input style={styles.input} type="number" placeholder="Idade" value={formAluno.idade} onChange={e => setFormAluno({ ...formAluno, idade: e.target.value })} />
                  <input style={styles.input} type="number" step="0.1" placeholder="Peso (kg)" value={formAluno.peso} onChange={e => setFormAluno({ ...formAluno, peso: e.target.value })} />
                  <input style={styles.input} type="number" step="0.01" placeholder="Altura (m) ex: 1.75" value={formAluno.altura} onChange={e => setFormAluno({ ...formAluno, altura: e.target.value })} />
                  <select style={styles.select} value={formAluno.objetivo} onChange={e => setFormAluno({ ...formAluno, objetivo: e.target.value })}>
                    <option value="">Objetivo</option>
                    <option>Emagrecimento</option><option>Hipertrofia</option><option>Força</option><option>Resistência</option><option>Condicionamento</option>
                  </select>
                  <input style={styles.input} placeholder="Telefone/WhatsApp" value={formAluno.telefone} onChange={e => setFormAluno({ ...formAluno, telefone: e.target.value })} />
                </div>
                <div style={styles.formGrid}>
                  <input style={styles.input} type="number" step="0.1" placeholder="% Gordura" value={formAluno.gordura} onChange={e => setFormAluno({ ...formAluno, gordura: e.target.value })} />
                  <input style={styles.input} type="number" step="0.1" placeholder="Cintura (cm)" value={formAluno.cintura} onChange={e => setFormAluno({ ...formAluno, cintura: e.target.value })} />
                  <input style={styles.input} type="number" step="0.1" placeholder="Quadril (cm)" value={formAluno.quadril} onChange={e => setFormAluno({ ...formAluno, quadril: e.target.value })} />
                  <input style={styles.input} type="number" step="0.1" placeholder="Tórax (cm)" value={formAluno.torax} onChange={e => setFormAluno({ ...formAluno, torax: e.target.value })} />
                  <input style={styles.input} type="number" step="0.1" placeholder="Braço (cm)" value={formAluno.braco} onChange={e => setFormAluno({ ...formAluno, braco: e.target.value })} />
                  <input style={styles.input} type="number" step="0.1" placeholder="Coxa (cm)" value={formAluno.coxa} onChange={e => setFormAluno({ ...formAluno, coxa: e.target.value })} />
                </div>
                <textarea style={{ ...styles.input, minHeight: 60, marginBottom: 14 }} placeholder="Observações" value={formAluno.observacoes} onChange={e => setFormAluno({ ...formAluno, observacoes: e.target.value })} />
                <div style={styles.btnGroup}>
                  <button type="submit" style={styles.btnPrimary}>{editAluno ? "Salvar Alterações" : "Cadastrar Aluno"}</button>
                  {editAluno && <button type="button" style={styles.btnSmall} onClick={() => { setEditAluno(null); resetFormAluno(); }}>Cancelar</button>}
                </div>
              </form>
            </div>

            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Alunos Cadastrados ({totAlunos})</h3>
              {loading && <div style={styles.empty}>Carregando...</div>}
              {!loading && alunos.length === 0 && <div style={styles.empty}>Nenhum aluno cadastrado</div>}
              {alunos.map(a => {
                const imc = calcIMC(a.peso, a.altura);
                return (
                  <div key={a.id} style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: 16 }}>{a.nome}</strong>
                        {a.objetivo && <span style={{ ...styles.badge, background: "rgba(0,229,255,0.1)", color: "#00E5FF", marginLeft: 8 }}>{a.objetivo}</span>}
                      </div>
                      {imc && <span style={{ ...styles.badge, background: `${corIMC(imc)}20`, color: corIMC(imc) }}>IMC {imc.toFixed(1)} — {classIMC(imc)}</span>}
                    </div>
                    <div style={styles.infoGrid}>
                      <div><div style={styles.infoLabel}>Idade</div><div style={styles.infoValue}>{a.idade || "—"}</div></div>
                      <div><div style={styles.infoLabel}>Peso</div><div style={styles.infoValue}>{a.peso ? `${a.peso} kg` : "—"}</div></div>
                      <div><div style={styles.infoLabel}>Altura</div><div style={styles.infoValue}>{a.altura ? `${a.altura} m` : "—"}</div></div>
                      {a.telefone && <div><div style={styles.infoLabel}>Tel</div><div style={styles.infoValue}>{a.telefone}</div></div>}
                    </div>
                    <div style={styles.btnGroup}>
                      <button style={styles.btnSmall} onClick={() => { setSelectedAluno(a); loadTreinos(a.id); loadAvs(a.id); setTab("treinos"); }}>Abrir</button>
                      <button style={styles.btnSmall} onClick={() => handleEditarAluno(a)}>Editar</button>
                      {a.telefone && <button style={styles.btnWhats} onClick={() => window.open(`https://wa.me/55${limparTel(a.telefone)}`, "_blank")}>WhatsApp</button>}
                      <button style={styles.btnDanger} onClick={() => handleExcluirAluno(a.id)}>Excluir</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============ TREINOS + AVALIAÇÕES ============ */}
        {tab === "treinos" && selectedAluno && (
          <>
            <div style={{ ...styles.card, marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{selectedAluno.nome}</h3>
              <p style={{ color: "#B0B0B0", margin: "4px 0" }}>
                {selectedAluno.objetivo || "Sem objetivo"} • IMC: {calcIMC(selectedAluno.peso, selectedAluno.altura)?.toFixed(1) || "—"}
              </p>
              <div style={styles.btnGroup}>
                <button style={styles.btnSmall} onClick={() => { setShowTreinoForm(true); setEditTreino(null); setFormTreino({ nome:"",divisao:"",observacoes:"" }); }}>+ Novo Treino</button>
                <button style={styles.btnSmall} onClick={() => { setShowAvForm(true); setFormAv({ peso:"",altura:"",gordura:"",cintura:"",quadril:"",torax:"",braco:"",coxa:"",observacoes:"" }); }}>+ Nova Avaliação</button>
                <button style={{ ...styles.btnSmall, color: "#B0B0B0" }} onClick={() => { setSelectedAluno(null); setTab("alunos"); }}>← Voltar</button>
              </div>
            </div>

            {/* FORM TREINO */}
            {showTreinoForm && (
              <div style={styles.formCard}>
                <h4 style={styles.formTitle}>{editTreino ? "Editar Treino" : "Novo Treino"}</h4>
                <form onSubmit={handleSalvarTreino}>
                  <div style={styles.formGrid}>
                    <input style={styles.input} placeholder="Nome *" value={formTreino.nome} onChange={e => setFormTreino({ ...formTreino, nome: e.target.value })} />
                    <select style={styles.select} value={formTreino.divisao} onChange={e => setFormTreino({ ...formTreino, divisao: e.target.value })}>
                      <option value="">Divisão</option>
                      <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                    </select>
                  </div>
                  <textarea style={{ ...styles.input, minHeight: 50, marginBottom: 14 }} placeholder="Observações" value={formTreino.observacoes} onChange={e => setFormTreino({ ...formTreino, observacoes: e.target.value })} />
                  <div style={styles.btnGroup}>
                    <button type="submit" style={styles.btnPrimary}>{editTreino ? "Salvar" : "Criar"}</button>
                    <button type="button" style={styles.btnSmall} onClick={() => { setShowTreinoForm(false); setEditTreino(null); }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* FORM AVALIAÇÃO */}
            {showAvForm && (
              <div style={styles.formCard}>
                <h4 style={styles.formTitle}>Nova Avaliação</h4>
                <form onSubmit={handleSalvarAv}>
                  <div style={styles.formGrid}>
                    <input style={styles.input} type="number" step="0.1" placeholder="Peso (kg)" value={formAv.peso} onChange={e => setFormAv({ ...formAv, peso: e.target.value })} />
                    <input style={styles.input} type="number" step="0.01" placeholder="Altura (m)" value={formAv.altura} onChange={e => setFormAv({ ...formAv, altura: e.target.value })} />
                    <input style={styles.input} type="number" step="0.1" placeholder="% Gordura" value={formAv.gordura} onChange={e => setFormAv({ ...formAv, gordura: e.target.value })} />
                    <input style={styles.input} type="number" step="0.1" placeholder="Cintura (cm)" value={formAv.cintura} onChange={e => setFormAv({ ...formAv, cintura: e.target.value })} />
                    <input style={styles.input} type="number" step="0.1" placeholder="Quadril (cm)" value={formAv.quadril} onChange={e => setFormAv({ ...formAv, quadril: e.target.value })} />
                    <input style={styles.input} type="number" step="0.1" placeholder="Tórax (cm)" value={formAv.torax} onChange={e => setFormAv({ ...formAv, torax: e.target.value })} />
                    <input style={styles.input} type="number" step="0.1" placeholder="Braço (cm)" value={formAv.braco} onChange={e => setFormAv({ ...formAv, braco: e.target.value })} />
                    <input style={styles.input} type="number" step="0.1" placeholder="Coxa (cm)" value={formAv.coxa} onChange={e => setFormAv({ ...formAv, coxa: e.target.value })} />
                  </div>
                  <textarea style={{ ...styles.input, minHeight: 50, marginBottom: 14 }} placeholder="Observações" value={formAv.observacoes} onChange={e => setFormAv({ ...formAv, observacoes: e.target.value })} />
                  <div style={styles.btnGroup}>
                    <button type="submit" style={styles.btnPrimary}>Salvar Avaliação</button>
                    <button type="button" style={styles.btnSmall} onClick={() => setShowAvForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* FORM EXERCICIO */}
            {showExForm && (
              <div style={styles.formCard}>
                <h4 style={styles.formTitle}>{editEx ? "Editar Exercício" : "Novo Exercício"}</h4>
                <form onSubmit={handleSalvarEx}>
                  <div style={styles.formGrid}>
                    <input style={styles.input} placeholder="Nome *" value={formEx.nome} onChange={e => setFormEx({ ...formEx, nome: e.target.value })} />
                    <input style={styles.input} placeholder="Séries" value={formEx.series} onChange={e => setFormEx({ ...formEx, series: e.target.value })} />
                    <input style={styles.input} placeholder="Repetições" value={formEx.repeticoes} onChange={e => setFormEx({ ...formEx, repeticoes: e.target.value })} />
                    <input style={styles.input} placeholder="Carga" value={formEx.carga} onChange={e => setFormEx({ ...formEx, carga: e.target.value })} />
                    <input style={styles.input} placeholder="Descanso" value={formEx.descanso} onChange={e => setFormEx({ ...formEx, descanso: e.target.value })} />
                  </div>
                  <textarea style={{ ...styles.input, minHeight: 50, marginBottom: 14 }} placeholder="Observações" value={formEx.observacoes} onChange={e => setFormEx({ ...formEx, observacoes: e.target.value })} />
                  <div style={styles.btnGroup}>
                    <button type="submit" style={styles.btnPrimary}>{editEx ? "Salvar" : "Adicionar"}</button>
                    <button type="button" style={styles.btnSmall} onClick={() => { setShowExForm(null); setEditEx(null); }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTA DE TREINOS */}
            <div style={styles.formCard}>
              <h4 style={styles.formTitle}>Treinos ({treinos.length})</h4>
              {treinos.length === 0 && <div style={styles.empty}>Nenhum treino cadastrado</div>}
              {treinos.map(t => {
                const exs = exercicios[t.id] || [];
                return (
                  <div key={t.id} style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <strong>{t.nome}</strong>
                        {t.divisao && <span style={{ ...styles.badge, background: "rgba(0,229,255,0.1)", color: "#00E5FF", marginLeft: 8 }}>Divisão {t.divisao}</span>}
                      </div>
                      <div style={styles.btnGroup}>
                        <button style={styles.btnSmall} onClick={() => { loadExs(t.id); setShowExForm(t.id); setEditEx(null); setFormEx({ nome:"",series:"",repeticoes:"",carga:"",descanso:"",observacoes:"" }); }}>+ Exercício</button>
                        <button style={styles.btnSmall} onClick={() => handleEditarTreino(t)}>Editar</button>
                        <button style={styles.btnDanger} onClick={() => handleExcluirTreino(t.id)}>Excluir</button>
                      </div>
                    </div>
                    {t.observacoes && <p style={{ color: "#B0B0B0", fontSize: 13, margin: "6px 0" }}>{t.observacoes}</p>}
                    {exs.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        {exs.map(ex => (
                          <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", flexWrap: "wrap", gap: 4 }}>
                            <div>
                              <strong style={{ fontSize: 14 }}>{ex.nome}</strong>
                              <span style={{ color: "#B0B0B0", fontSize: 12, marginLeft: 8 }}>
                                {[ex.series, ex.repeticoes, ex.carga, ex.descanso].filter(Boolean).join(" • ")}
                              </span>
                            </div>
                            <div style={styles.btnGroup}>
                              <button style={{ ...styles.btnSmall, fontSize: 10, padding: "4px 8px" }} onClick={() => handleEditarEx(ex)}>Editar</button>
                              <button style={{ ...styles.btnDanger, fontSize: 10, padding: "4px 8px" }} onClick={() => handleExcluirEx(ex.id, t.id)}>Excluir</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AVALIAÇÕES */}
            <div style={styles.formCard}>
              <h4 style={styles.formTitle}>Histórico de Avaliações ({avaliacoes.length})</h4>
              {avaliacoes.length === 0 && <div style={styles.empty}>Nenhuma avaliação</div>}
              {avaliacoes.map(av => (
                <div key={av.id} style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <strong>{av.created_at || "—"}</strong>
                    <button style={styles.btnDanger} onClick={() => handleExcluirAv(av.id)}>Excluir</button>
                  </div>
                  <div style={styles.infoGrid}>
                    <div><div style={styles.infoLabel}>Peso</div><div style={styles.infoValue}>{av.peso ? `${av.peso} kg` : "—"}</div></div>
                    <div><div style={styles.infoLabel}>IMC</div><div style={styles.infoValue}>{av.imc ? av.imc.toFixed(1) : "—"}</div></div>
                    <div><div style={styles.infoLabel}>Gordura</div><div style={styles.infoValue}>{av.gordura ? `${av.gordura}%` : "—"}</div></div>
                    <div><div style={styles.infoLabel}>Cintura</div><div style={styles.infoValue}>{av.cintura ? `${av.cintura} cm` : "—"}</div></div>
                    <div><div style={styles.infoLabel}>Quadril</div><div style={styles.infoValue}>{av.quadril ? `${av.quadril} cm` : "—"}</div></div>
                    <div><div style={styles.infoLabel}>Tórax</div><div style={styles.infoValue}>{av.torax ? `${av.torax} cm` : "—"}</div></div>
                  </div>
                  {av.observacoes && <p style={{ color: "#B0B0B0", fontSize: 13 }}>{av.observacoes}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}