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

function limparTel(tel) {
  return tel.replace(/\D/g, "");
}

// ============================================
// ESTILOS (incompleto, mas suficiente)
// ============================================
const styles = {
  body: { margin: 0, minHeight: "100vh", background: "#0B0C10", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" },
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
  const [pagina, setPagina] = useState("dashboard"); // "dashboard" | "alunos" | "treinos" | "avaliacoes" | ...
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

  // ============ FETCH HELPERS ============
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

  const loadAlunos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await apiFetch(`${API}/api/alunos`); if (r.ok) setAlunos(await r.json()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadAlunos(); }, [loadAlunos]);

  // ... (aqui você deve incluir todas as funções de CRUD, seleção de aluno, carregamento de treinos, avaliações, fotos, etc.)

  return (
    <div style={styles.body}>
      <div style={styles.app}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <div style={styles.logo}>fitcontrol</div>
            <div style={styles.logoSub}>Painel Profissional</div>
          </div>
          <div style={styles.btnGroup}>
            <button style={styles.tabActive} onClick={() => { setPagina("dashboard"); setSelectedAluno(null); }}>Dashboard</button>
            <button style={styles.tabActive} onClick={() => { setPagina("alunos"); setSelectedAluno(null); }}>Alunos</button>
            <button style={styles.tabActive} onClick={() => { if (selectedAluno) setPagina("treinos"); else setError("Selecione um aluno primeiro"); }}>Treinos</button>
            <button style={styles.tabActive} onClick={() => { if (selectedAluno) setPagina("avaliacoes"); else setError("Selecione um aluno primeiro"); }}>Avaliações</button>
            <button style={styles.btnDanger} onClick={() => { setToken(""); localStorage.removeItem("fitcontrol_token"); }}>Sair</button>
          </div>
        </header>

        {/* Conteúdo por página */}
        {pagina === "dashboard" && (
          <div>
            {/* ... cards do dashboard, lista de últimos alunos, etc. */}
          </div>
        )}

        {pagina === "alunos" && (
          <div>
            {/* ... formulário de cadastro/edição e lista de alunos */}
          </div>
        )}

        {pagina === "treinos" && selectedAluno && (
          <div>
            {/* ... detalhes do aluno, lista de treinos, formulários de treino e exercício */}
          </div>
        )}

        {pagina === "avaliacoes" && selectedAluno && (
          <div>
            {/* ... lista de avaliações e formulário de nova avaliação */}
          </div>
        )}
      </div>
    </div>
  );
}