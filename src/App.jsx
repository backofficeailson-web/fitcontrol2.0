import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { API } from "./config";
import "./App.css";

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/alunos", label: "Alunos", icon: "◎" },
  { to: "/avaliacoes", label: "Avaliação Física", icon: "◆" },
  { to: "/treinos", label: "Treinos", icon: "▣" },
  { to: "/protocolos", label: "Protocolos", icon: "◈" },
  { to: "/evolucao", label: "Evolução", icon: "↗" },
  { to: "/relatorios", label: "Relatórios", icon: "◫" },
  { to: "/configuracoes", label: "Configurações", icon: "⚙" },
];

const emptyAlunoForm = {
  nome: "",
  idade: "",
  peso: "",
  altura: "",
  objetivo: "",
  telefone: "",
  observacoes: "",
  gordura: "",
  cintura: "",
  quadril: "",
  torax: "",
  braco: "",
  coxa: "",
  patologias: "",
  restricoes: "",
  nivel_atividade: "",
  historico_lesoes: "",
  modalidade: "",
  biotipo: "",
  experiencia_anos: "",
  foco_competitivo: "",
  metodologia_preferida: "",
  frequencia_semanal: "",
  disponibilidade_tempo: "",
  objetivo_principal: "",
  objetivo_secundario: "",
  observacoes_tecnicas: "",
  status_liberacao: "",
};

const emptyTreinoForm = { nome: "", divisao: "", observacoes: "" };
const emptyExercicioForm = { nome: "", series: "", repeticoes: "", carga: "", descanso: "", observacoes: "" };
const emptyAvaliacaoForm = { peso: "", altura: "", gordura: "", cintura: "", quadril: "", torax: "", braco: "", coxa: "", observacoes: "" };

function calcIMC(peso, altura) {
  const p = Number(peso);
  const a = Number(altura);
  if (!p || !a || p <= 0 || a <= 0) return null;
  return p / (a * a);
}

function classIMC(imc) {
  if (!imc) return "Sem dados";
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidade";
}

function cleanPhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeAlunoPayload(form) {
  const numeric = new Set([
    "idade",
    "peso",
    "altura",
    "gordura",
    "cintura",
    "quadril",
    "torax",
    "braco",
    "coxa",
    "experiencia_anos",
    "frequencia_semanal",
  ]);

  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      numeric.has(key) ? toNumberOrNull(value) : value === "" ? null : value,
    ])
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return value;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.errors?.join(", ") || "Não foi possível autenticar.");
      localStorage.setItem("fitcontrol_token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">FC</div>
        <p className="eyebrow">FitControl Pro</p>
        <h1>{mode === "login" ? "Acesse seu painel" : "Crie sua conta"}</h1>
        <p className="muted">Sistema profissional de gestão, avaliação física e prescrição de treinos.</p>

        <form onSubmit={handleSubmit} className="stack-lg">
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" required />
          </label>
          <label className="field">
            <span>Senha</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </label>

          {error && <div className="alert alert-danger">{error}</div>}

          <button className="btn btn-primary full" disabled={loading} type="submit">
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button className="link-button" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Não tenho conta — criar agora" : "Já tenho conta — fazer login"}
        </button>
      </section>
    </main>
  );
}

function AppShell({ children, onLogout, alunos }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">FC</div>
          <div>
            <strong>FitControl</strong>
            <span>PRO 2.0</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="mini-card">
            <span className="muted">Alunos cadastrados</span>
            <strong>{alunos.length}</strong>
          </div>
          <button className="btn btn-ghost full" onClick={onLogout}>Sair</button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel profissional</p>
            <h2>FitControl Pro</h2>
          </div>
          <div className="topbar-actions">
            <NavLink className="btn btn-soft" to="/alunos/novo">+ Novo aluno</NavLink>
            <NavLink className="btn btn-primary" to="/avaliacoes">Nova avaliação</NavLink>
          </div>
        </header>
        <main className="content">{children}</main>
      </section>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function StatCard({ label, value, hint, tone = "blue" }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

function StatusBadge({ value }) {
  const text = value || "Avaliação pendente";
  const type = /libera|ativo/i.test(text) ? "success" : /risco|médica|card|atenção|pendente/i.test(text) ? "warning" : "neutral";
  return <span className={`badge ${type}`}>{text}</span>;
}

function EmptyState({ title, description, action }) {
  return (
    <section className="empty-state">
      <div className="empty-icon">◇</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </section>
  );
}

function DashboardPage({ alunos }) {
  const navigate = useNavigate();
  const stats = useMemo(() => {
    const imcs = alunos.map((a) => calcIMC(a.peso, a.altura)).filter(Boolean);
    const pesos = alunos.map((a) => Number(a.peso)).filter(Boolean);
    return {
      total: alunos.length,
      ativos: alunos.filter((a) => /ativo|liberado/i.test(a.status_liberacao || "")).length,
      risco: alunos.filter((a) => /card|hipert|diabet|gest|liped|dor|press/i.test(`${a.patologias || ""} ${a.restricoes || ""} ${a.status_liberacao || ""}`)).length,
      avaliacoesPendentes: alunos.filter((a) => !a.peso && !a.altura && !a.gordura).length,
      imcMedio: imcs.length ? (imcs.reduce((sum, v) => sum + v, 0) / imcs.length).toFixed(1) : "0",
      pesoMedio: pesos.length ? (pesos.reduce((sum, v) => sum + v, 0) / pesos.length).toFixed(1) : "0",
    };
  }, [alunos]);

  const modalities = alunos.reduce((acc, aluno) => {
    const key = aluno.modalidade || "Sem modalidade";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Etapa 1 concluída"
        title="Dashboard profissional"
        description="Visão geral da operação com atalhos para gestão, avaliação, treinos e relatórios."
        actions={<button className="btn btn-primary" onClick={() => navigate("/alunos/novo")}>Cadastrar aluno</button>}
      />

      <section className="stats-grid">
        <StatCard label="Total de alunos" value={stats.total} hint="base cadastrada" />
        <StatCard label="Alunos ativos/liberados" value={stats.ativos} hint="status positivo" tone="green" />
        <StatCard label="Avaliações pendentes" value={stats.avaliacoesPendentes} hint="sem dados físicos" tone="purple" />
        <StatCard label="Alertas clínicos" value={stats.risco} hint="patologias/restrições" tone="red" />
        <StatCard label="Peso médio" value={`${stats.pesoMedio} kg`} hint="alunos com peso" />
        <StatCard label="IMC médio" value={stats.imcMedio} hint="alunos com peso/altura" tone="green" />
      </section>

      <section className="grid-2">
        <article className="panel">
          <div className="panel-title">
            <h3>Últimos alunos</h3>
            <NavLink to="/alunos">Ver todos</NavLink>
          </div>
          {alunos.length === 0 ? (
            <EmptyState title="Nenhum aluno ainda" description="Cadastre o primeiro aluno para alimentar o dashboard." />
          ) : (
            <div className="student-list compact">
              {alunos.slice(0, 6).map((aluno) => {
                const imc = calcIMC(aluno.peso, aluno.altura);
                return (
                  <button key={aluno.id} className="student-row" onClick={() => navigate(`/alunos/${aluno.id}`)}>
                    <div>
                      <strong>{aluno.nome}</strong>
                      <span>{aluno.objetivo_principal || aluno.objetivo || "Objetivo não informado"}</span>
                    </div>
                    <div className="row-actions">
                      {imc && <span className="badge neutral">IMC {imc.toFixed(1)}</span>}
                      <StatusBadge value={aluno.status_liberacao} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-title">
            <h3>Alunos por modalidade</h3>
          </div>
          <div className="modality-list">
            {Object.entries(modalities).length === 0 ? <p className="muted">Sem modalidades cadastradas.</p> : Object.entries(modalities).map(([label, value]) => (
              <div className="progress-row" key={label}>
                <div>
                  <strong>{label}</strong>
                  <span>{value} aluno(s)</span>
                </div>
                <div className="progress-track"><span style={{ width: `${Math.max(8, (value / alunos.length) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="quick-grid">
        <button className="quick-card" onClick={() => navigate("/avaliacoes")}>Nova avaliação <span>→</span></button>
        <button className="quick-card" onClick={() => navigate("/treinos")}>Montar treino <span>→</span></button>
        <button className="quick-card" onClick={() => navigate("/relatorios")}>Gerar relatório <span>→</span></button>
        <button className="quick-card" onClick={() => navigate("/protocolos")}>Ver protocolos <span>→</span></button>
      </section>
    </>
  );
}

function AlunoForm({ initialData, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => ({ ...emptyAlunoForm, ...(initialData || {}) }));

  useEffect(() => {
    setForm({ ...emptyAlunoForm, ...(initialData || {}) });
  }, [initialData]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form className="panel form-panel" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="form-section-title">Dados principais</div>
      <div className="form-grid">
        <label className="field span-2"><span>Nome *</span><input value={form.nome || ""} onChange={(e) => update("nome", e.target.value)} required /></label>
        <label className="field"><span>Idade</span><input type="number" value={form.idade || ""} onChange={(e) => update("idade", e.target.value)} /></label>
        <label className="field"><span>Telefone</span><input value={form.telefone || ""} onChange={(e) => update("telefone", e.target.value)} /></label>
        <label className="field"><span>Modalidade</span><select value={form.modalidade || ""} onChange={(e) => update("modalidade", e.target.value)}><option value="">Selecione</option><option>Musculação geral</option><option>Hipertrofia</option><option>Bodybuilding masculino</option><option>Bodybuilding feminino</option><option>Powerlifting</option><option>Bench press / supino competitivo</option><option>CrossFit</option><option>Futebol</option><option>Saúde e qualidade de vida</option></select></label>
        <label className="field"><span>Nível</span><select value={form.nivel_atividade || ""} onChange={(e) => update("nivel_atividade", e.target.value)}><option value="">Selecione</option><option>Iniciante</option><option>Intermediário</option><option>Avançado</option><option>Atleta</option></select></label>
        <label className="field"><span>Objetivo principal</span><input value={form.objetivo_principal || ""} onChange={(e) => update("objetivo_principal", e.target.value)} /></label>
        <label className="field"><span>Objetivo secundário</span><input value={form.objetivo_secundario || ""} onChange={(e) => update("objetivo_secundario", e.target.value)} /></label>
      </div>

      <div className="form-section-title">Medidas rápidas</div>
      <div className="form-grid">
        <label className="field"><span>Peso (kg)</span><input type="number" step="0.1" value={form.peso || ""} onChange={(e) => update("peso", e.target.value)} /></label>
        <label className="field"><span>Altura (m)</span><input type="number" step="0.01" value={form.altura || ""} onChange={(e) => update("altura", e.target.value)} /></label>
        <label className="field"><span>Gordura (%)</span><input type="number" step="0.1" value={form.gordura || ""} onChange={(e) => update("gordura", e.target.value)} /></label>
        <label className="field"><span>Cintura (cm)</span><input type="number" step="0.1" value={form.cintura || ""} onChange={(e) => update("cintura", e.target.value)} /></label>
        <label className="field"><span>Quadril (cm)</span><input type="number" step="0.1" value={form.quadril || ""} onChange={(e) => update("quadril", e.target.value)} /></label>
        <label className="field"><span>Tórax (cm)</span><input type="number" step="0.1" value={form.torax || ""} onChange={(e) => update("torax", e.target.value)} /></label>
        <label className="field"><span>Braço (cm)</span><input type="number" step="0.1" value={form.braco || ""} onChange={(e) => update("braco", e.target.value)} /></label>
        <label className="field"><span>Coxa (cm)</span><input type="number" step="0.1" value={form.coxa || ""} onChange={(e) => update("coxa", e.target.value)} /></label>
      </div>

      <div className="form-section-title">Triagem e observações</div>
      <div className="form-grid">
        <label className="field"><span>Frequência semanal</span><input type="number" value={form.frequencia_semanal || ""} onChange={(e) => update("frequencia_semanal", e.target.value)} /></label>
        <label className="field"><span>Tempo disponível</span><input value={form.disponibilidade_tempo || ""} onChange={(e) => update("disponibilidade_tempo", e.target.value)} placeholder="Ex.: 60 min" /></label>
        <label className="field"><span>Status</span><select value={form.status_liberacao || ""} onChange={(e) => update("status_liberacao", e.target.value)}><option value="">Avaliação pendente</option><option>Ativo / liberado</option><option>Aguardando liberação médica</option><option>Inativo</option></select></label>
        <label className="field span-2"><span>Patologias</span><input value={form.patologias || ""} onChange={(e) => update("patologias", e.target.value)} placeholder="Diabetes, cardiopatia, lipedema..." /></label>
        <label className="field span-2"><span>Restrições</span><input value={form.restricoes || ""} onChange={(e) => update("restricoes", e.target.value)} /></label>
        <label className="field span-2"><span>Histórico de lesões</span><textarea value={form.historico_lesoes || ""} onChange={(e) => update("historico_lesoes", e.target.value)} /></label>
        <label className="field span-2"><span>Observações técnicas</span><textarea value={form.observacoes_tecnicas || form.observacoes || ""} onChange={(e) => { update("observacoes_tecnicas", e.target.value); update("observacoes", e.target.value); }} /></label>
      </div>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-soft" onClick={onCancel}>Cancelar</button>}
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? "Salvando..." : "Salvar aluno"}</button>
      </div>
    </form>
  );
}

function AlunosPage({ alunos, loading, onDelete }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const filtered = alunos.filter((a) => `${a.nome} ${a.telefone} ${a.modalidade} ${a.objetivo_principal}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="Gestão de alunos"
        title="Alunos"
        description="Lista, busca e acesso rápido ao perfil dos alunos."
        actions={<button className="btn btn-primary" onClick={() => navigate("/alunos/novo")}>+ Novo aluno</button>}
      />

      <section className="panel">
        <div className="toolbar">
          <label className="field search-field"><span>Buscar</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, telefone, modalidade..." /></label>
          <span className="badge neutral">{filtered.length} resultado(s)</span>
        </div>

        {loading ? <div className="empty-state">Carregando alunos...</div> : filtered.length === 0 ? (
          <EmptyState title="Nenhum aluno encontrado" description="Cadastre um aluno ou ajuste a busca." action={<button className="btn btn-primary" onClick={() => navigate("/alunos/novo")}>Cadastrar aluno</button>} />
        ) : (
          <div className="student-list">
            {filtered.map((aluno) => {
              const imc = calcIMC(aluno.peso, aluno.altura);
              return (
                <article className="student-card" key={aluno.id}>
                  <div className="avatar">{aluno.nome?.slice(0, 2).toUpperCase()}</div>
                  <div className="student-card-main">
                    <div className="student-card-head">
                      <div>
                        <h3>{aluno.nome}</h3>
                        <p>{aluno.modalidade || "Modalidade não informada"} • {aluno.objetivo_principal || aluno.objetivo || "Sem objetivo"}</p>
                      </div>
                      <StatusBadge value={aluno.status_liberacao} />
                    </div>
                    <div className="metric-row">
                      <span>Peso <strong>{aluno.peso ? `${aluno.peso} kg` : "—"}</strong></span>
                      <span>Altura <strong>{aluno.altura ? `${aluno.altura} m` : "—"}</strong></span>
                      <span>IMC <strong>{imc ? `${imc.toFixed(1)} (${classIMC(imc)})` : "—"}</strong></span>
                      <span>Gordura <strong>{aluno.gordura ? `${aluno.gordura}%` : "—"}</strong></span>
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-soft" onClick={() => navigate(`/alunos/${aluno.id}`)}>Abrir perfil</button>
                      <button className="btn btn-ghost" onClick={() => navigate(`/alunos/${aluno.id}/editar`)}>Editar</button>
                      {aluno.telefone && <button className="btn btn-ghost" onClick={() => window.open(`https://wa.me/55${cleanPhone(aluno.telefone)}`, "_blank")}>WhatsApp</button>}
                      <button className="btn btn-danger" onClick={() => onDelete(aluno.id)}>Excluir</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function NovoAlunoPage({ onSave, saving }) {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader eyebrow="Cadastro" title="Novo aluno" description="Cadastro profissional com dados físicos, objetivos e triagem inicial." />
      <AlunoForm saving={saving} onSubmit={async (form) => { const saved = await onSave(form); if (saved) navigate("/alunos"); }} onCancel={() => navigate("/alunos")} />
    </>
  );
}

function EditarAlunoPage({ alunos, onSave, saving }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const aluno = alunos.find((item) => String(item.id) === String(id));

  if (!aluno) {
    return <EmptyState title="Aluno não encontrado" description="Volte para a lista e selecione um aluno válido." action={<button className="btn btn-primary" onClick={() => navigate("/alunos")}>Voltar</button>} />;
  }

  return (
    <>
      <PageHeader eyebrow="Edição" title={`Editar ${aluno.nome}`} description="Atualize os dados sem perder o histórico existente." />
      <AlunoForm initialData={aluno} saving={saving} onSubmit={async (form) => { const ok = await onSave(form, aluno.id); if (ok) navigate(`/alunos/${aluno.id}`); }} onCancel={() => navigate(`/alunos/${aluno.id}`)} />
    </>
  );
}

function AlunoPerfilPage({ alunos, apiFetch, reloadAlunos }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const aluno = alunos.find((item) => String(item.id) === String(id));
  const [treinos, setTreinos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [treinoForm, setTreinoForm] = useState(emptyTreinoForm);
  const [avaliacaoForm, setAvaliacaoForm] = useState(emptyAvaliacaoForm);
  const [feedback, setFeedback] = useState("");

  const loadPerfil = useCallback(async () => {
    if (!aluno) return;
    const [treinoRes, avaliacaoRes] = await Promise.all([
      apiFetch(`${API}/api/alunos/${aluno.id}/treinos`),
      apiFetch(`${API}/api/alunos/${aluno.id}/avaliacoes`),
    ]);
    if (treinoRes.ok) setTreinos(await treinoRes.json());
    if (avaliacaoRes.ok) setAvaliacoes(await avaliacaoRes.json());
  }, [aluno, apiFetch]);

  useEffect(() => { loadPerfil(); }, [loadPerfil]);

  if (!aluno) {
    return <EmptyState title="Aluno não encontrado" description="Volte para a lista e selecione um aluno válido." action={<button className="btn btn-primary" onClick={() => navigate("/alunos")}>Voltar</button>} />;
  }

  const imc = calcIMC(aluno.peso, aluno.altura);

  async function salvarTreino(e) {
    e.preventDefault();
    if (!treinoForm.nome.trim()) return;
    const res = await apiFetch(`${API}/api/alunos/${aluno.id}/treinos`, { method: "POST", body: treinoForm });
    if (res.ok) {
      setTreinoForm(emptyTreinoForm);
      setFeedback("Treino criado com sucesso.");
      loadPerfil();
    }
  }

  async function salvarAvaliacao(e) {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(avaliacaoForm).map(([k, v]) => [k, k === "observacoes" ? (v || null) : toNumberOrNull(v)]));
    const res = await apiFetch(`${API}/api/alunos/${aluno.id}/avaliacoes`, { method: "POST", body });
    if (res.ok) {
      setAvaliacaoForm(emptyAvaliacaoForm);
      setFeedback("Avaliação rápida salva com sucesso.");
      reloadAlunos();
      loadPerfil();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Perfil do aluno"
        title={aluno.nome}
        description={`${aluno.modalidade || "Sem modalidade"} • ${aluno.objetivo_principal || aluno.objetivo || "Sem objetivo"}`}
        actions={<><button className="btn btn-soft" onClick={() => navigate(`/alunos/${aluno.id}/editar`)}>Editar</button><button className="btn btn-primary" onClick={() => navigate("/alunos")}>Voltar</button></>}
      />
      {feedback && <div className="alert alert-success">{feedback}<button onClick={() => setFeedback("")}>×</button></div>}

      <section className="stats-grid">
        <StatCard label="Peso" value={aluno.peso ? `${aluno.peso} kg` : "—"} />
        <StatCard label="IMC" value={imc ? imc.toFixed(1) : "—"} hint={classIMC(imc)} tone="green" />
        <StatCard label="Gordura" value={aluno.gordura ? `${aluno.gordura}%` : "—"} tone="purple" />
        <StatCard label="Status" value={aluno.status_liberacao || "Pendente"} tone="red" />
      </section>

      <section className="grid-2">
        <article className="panel">
          <div className="panel-title"><h3>Resumo clínico e técnico</h3></div>
          <div className="detail-grid">
            <div><span>Patologias</span><strong>{aluno.patologias || "—"}</strong></div>
            <div><span>Restrições</span><strong>{aluno.restricoes || "—"}</strong></div>
            <div><span>Nível</span><strong>{aluno.nivel_atividade || "—"}</strong></div>
            <div><span>Frequência</span><strong>{aluno.frequencia_semanal ? `${aluno.frequencia_semanal}x/semana` : "—"}</strong></div>
          </div>
          <p className="notes">{aluno.observacoes_tecnicas || aluno.observacoes || "Nenhuma observação técnica cadastrada."}</p>
        </article>

        <article className="panel">
          <div className="panel-title"><h3>Avaliações rápidas</h3></div>
          <form className="inline-form" onSubmit={salvarAvaliacao}>
            <input placeholder="Peso" value={avaliacaoForm.peso} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, peso: e.target.value })} />
            <input placeholder="Altura" value={avaliacaoForm.altura} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, altura: e.target.value })} />
            <input placeholder="Gordura %" value={avaliacaoForm.gordura} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, gordura: e.target.value })} />
            <button className="btn btn-primary">Salvar</button>
          </form>
          <div className="timeline">
            {avaliacoes.slice(0, 5).map((av) => <div key={av.id}><strong>{formatDate(av.created_at)}</strong><span>{av.peso || "—"} kg • {av.gordura || "—"}% gordura</span></div>)}
            {avaliacoes.length === 0 && <p className="muted">Nenhuma avaliação rápida cadastrada.</p>}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title"><h3>Treinos</h3></div>
        <form className="inline-form" onSubmit={salvarTreino}>
          <input placeholder="Nome do treino" value={treinoForm.nome} onChange={(e) => setTreinoForm({ ...treinoForm, nome: e.target.value })} />
          <input placeholder="Divisão" value={treinoForm.divisao} onChange={(e) => setTreinoForm({ ...treinoForm, divisao: e.target.value })} />
          <input placeholder="Observações" value={treinoForm.observacoes} onChange={(e) => setTreinoForm({ ...treinoForm, observacoes: e.target.value })} />
          <button className="btn btn-primary">Criar treino</button>
        </form>
        <div className="cards-grid">
          {treinos.map((treino) => <article className="mini-card" key={treino.id}><strong>{treino.nome}</strong><span>{treino.divisao || "Sem divisão"}</span><p>{treino.observacoes || "Sem observações"}</p></article>)}
          {treinos.length === 0 && <p className="muted">Nenhum treino cadastrado para este aluno.</p>}
        </div>
      </section>
    </>
  );
}

function PlaceholderPage({ type }) {
  const data = {
    avaliacoes: {
      eyebrow: "Módulo preparado",
      title: "Avaliação Física",
      description: "A estrutura visual e a rota já estão prontas. Na Etapa 3 entram as subabas completas: anamnese, PAR-Q, antropometria, dobras, somatótipo, testes e relatório.",
      items: ["Anamnese", "PAR-Q", "Antropometria", "Dobras", "Somatótipo", "Relatório final"],
    },
    treinos: {
      eyebrow: "Módulo preparado",
      title: "Treinos",
      description: "Base pronta para receber montagem manual, automática, RPE/RIR, progressões e histórico de carga na Etapa 5.",
      items: ["Montagem manual", "Exercícios", "Séries", "Cargas", "RPE/RIR", "Deload"],
    },
    protocolos: {
      eyebrow: "Módulo preparado",
      title: "Protocolos",
      description: "Espaço reservado para powerlifting, bench press, bodybuilding, CrossFit, futebol e saúde/patologias.",
      items: ["Powerlifting", "Bench press", "Bodybuilding masculino", "Bodybuilding feminino", "CrossFit", "Futebol"],
    },
    evolucao: {
      eyebrow: "Módulo preparado",
      title: "Evolução",
      description: "Na Etapa 6 entram comparativos, gráficos e histórico entre avaliações.",
      items: ["Peso", "IMC", "% gordura", "Massa magra", "1RM", "VO2"],
    },
    relatorios: {
      eyebrow: "Módulo preparado",
      title: "Relatórios",
      description: "Preparado para relatórios técnicos, relatórios para aluno e exportação PDF.",
      items: ["Completo", "Composição corporal", "Postural", "Evolução", "Treino", "PDF"],
    },
    configuracoes: {
      eyebrow: "Sistema",
      title: "Configurações",
      description: "Área para parâmetros do sistema, identidade visual, preferências e dados do avaliador.",
      items: ["Perfil", "Clínica", "Avaliador", "Tema", "Backup", "Preferências"],
    },
  }[type];

  return (
    <>
      <PageHeader eyebrow={data.eyebrow} title={data.title} description={data.description} />
      <section className="cards-grid">
        {data.items.map((item) => <article className="module-card" key={item}><span>◇</span><strong>{item}</strong><p>Será conectado nas próximas etapas sem quebrar a base atual.</p></article>)}
      </section>
    </>
  );
}

function FitControlApp() {
  const [token, setToken] = useState(() => localStorage.getItem("fitcontrol_token") || "");
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("fitcontrol_token");
    setToken("");
    setAlunos([]);
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };
    const authToken = localStorage.getItem("fitcontrol_token");
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    let body = options.body;
    if (body && typeof body === "object" && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }
    const res = await fetch(url, { ...options, headers, body });
    if (res.status === 401) {
      logout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    return res;
  }, [logout]);

  const loadAlunos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setGlobalError("");
    try {
      const res = await apiFetch(`${API}/api/alunos`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.errors?.join(", ") || "Erro ao carregar alunos.");
      setAlunos(Array.isArray(data) ? data : []);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, token]);

  useEffect(() => { loadAlunos(); }, [loadAlunos]);

  async function saveAluno(form, id) {
    if (!form.nome?.trim()) {
      setGlobalError("Nome obrigatório.");
      return false;
    }
    setSaving(true);
    setGlobalError("");
    setGlobalSuccess("");
    try {
      const res = await apiFetch(id ? `${API}/api/alunos/${id}` : `${API}/api/alunos`, {
        method: id ? "PUT" : "POST",
        body: normalizeAlunoPayload(form),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.errors?.join(", ") || "Erro ao salvar aluno.");
      setGlobalSuccess(id ? "Aluno atualizado com sucesso." : "Aluno cadastrado com sucesso.");
      await loadAlunos();
      return true;
    } catch (err) {
      setGlobalError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteAluno(id) {
    if (!window.confirm("Deseja excluir este aluno?")) return;
    setGlobalError("");
    try {
      const res = await apiFetch(`${API}/api/alunos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || "Erro ao excluir aluno.");
      }
      setGlobalSuccess("Aluno excluído.");
      loadAlunos();
    } catch (err) {
      setGlobalError(err.message);
    }
  }

  if (!token) return <LoginScreen onLogin={setToken} />;

  return (
    <BrowserRouter>
      <AppShell onLogout={logout} alunos={alunos}>
        {globalError && <div className="alert alert-danger">{globalError}<button onClick={() => setGlobalError("")}>×</button></div>}
        {globalSuccess && <div className="alert alert-success">{globalSuccess}<button onClick={() => setGlobalSuccess("")}>×</button></div>}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage alunos={alunos} />} />
          <Route path="/alunos" element={<AlunosPage alunos={alunos} loading={loading} onDelete={deleteAluno} />} />
          <Route path="/alunos/novo" element={<NovoAlunoPage onSave={saveAluno} saving={saving} />} />
          <Route path="/alunos/:id" element={<AlunoPerfilPage alunos={alunos} apiFetch={apiFetch} reloadAlunos={loadAlunos} />} />
          <Route path="/alunos/:id/editar" element={<EditarAlunoPage alunos={alunos} onSave={saveAluno} saving={saving} />} />
          <Route path="/avaliacoes" element={<PlaceholderPage type="avaliacoes" />} />
          <Route path="/avaliacoes/nova" element={<PlaceholderPage type="avaliacoes" />} />
          <Route path="/avaliacoes/:id" element={<PlaceholderPage type="avaliacoes" />} />
          <Route path="/treinos" element={<PlaceholderPage type="treinos" />} />
          <Route path="/treinos/novo" element={<PlaceholderPage type="treinos" />} />
          <Route path="/treinos/:id" element={<PlaceholderPage type="treinos" />} />
          <Route path="/protocolos" element={<PlaceholderPage type="protocolos" />} />
          <Route path="/evolucao" element={<PlaceholderPage type="evolucao" />} />
          <Route path="/relatorios" element={<PlaceholderPage type="relatorios" />} />
          <Route path="/configuracoes" element={<PlaceholderPage type="configuracoes" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default FitControlApp;
