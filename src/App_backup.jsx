import { useEffect, useMemo, useState } from "react";

// ============================================
// PALETA PROFISSIONAL (TEMA)
// ============================================
const theme = {
  primary: "#22c55e",
  secondary: "#06b6d4",
  accent: "#c4b5fd",
  bg: "#020617",
  card: "linear-gradient(145deg, #0f172a, #020617)",
  cardSoft: "#111827",
  border: "#1e293b",
  text: "#e2e8f0",
  muted: "#94a3b8",
  danger: "#ef4444",
  warning: "#f97316",
  gradientBtn: "linear-gradient(135deg, #86efac, #67e8f9, #c4b5fd)",
};

// ============================================
// CONSTANTES E UTILITÁRIOS (INALTERADOS)
// ============================================
const LS_KEYS = {
  alunos: "fitcontrol_alunos",
  avaliacoes: "fitcontrol_avaliacoes",
  treinos: "fitcontrol_treinos",
};

function carregarLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

function salvarLS(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function n(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }

function calcularIMC(peso, alturaCm) {
  const h = n(alturaCm) / 100;
  return h > 0 ? n(peso) / (h * h) : 0;
}

function classificarIMC(imc) {
  if (!imc) return "Não calculado";
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade I";
  if (imc < 40) return "Obesidade II";
  return "Obesidade III";
}

function corIMC(imc) {
  if (!imc) return theme.muted;
  if (imc < 18.5) return "#facc15";
  if (imc < 25) return theme.primary;
  if (imc < 30) return "#facc15";
  if (imc < 35) return theme.warning;
  return theme.danger;
}

function calcularRCQ(cintura, quadril) { return n(quadril) > 0 ? n(cintura) / n(quadril) : 0; }

function calcular1RM(carga, reps) { return n(carga) > 0 && n(reps) > 0 ? n(carga) * (1 + n(reps) / 30) : 0; }

function gorduraPollock3(av) {
  const idade = n(av.idade);
  const sexo = av.sexo || "Masculino";
  const soma = sexo === "Masculino"
    ? n(av.peitoral) + n(av.abdominal) + n(av.coxa)
    : n(av.triceps) + n(av.suprailiaca) + n(av.coxa);
  if (!soma || !idade) return 0;
  const densidade = sexo === "Masculino"
    ? 1.10938 - 0.0008267 * soma + 0.0000016 * soma * soma - 0.0002574 * idade
    : 1.0994921 - 0.0009929 * soma + 0.0000023 * soma * soma - 0.0001392 * idade;
  return 495 / densidade - 450;
}

function gorduraPollock7(av) {
  const idade = n(av.idade);
  const soma = n(av.triceps) + n(av.subescapular) + n(av.peitoral) + n(av.abdominal) + n(av.suprailiaca) + n(av.coxa) + n(av.axilar);
  if (!soma || !idade) return 0;
  const densidade = av.sexo === "Masculino"
    ? 1.112 - 0.00043499 * soma + 0.00000055 * soma * soma - 0.00028826 * idade
    : 1.097 - 0.00046971 * soma + 0.00000056 * soma * soma - 0.00012828 * idade;
  return 495 / densidade - 450;
}

function faulkner(av) {
  const soma = n(av.triceps) + n(av.subescapular) + n(av.suprailiaca) + n(av.abdominal);
  return soma ? soma * 0.153 + 5.783 : 0;
}

function classificarGordura(sexo, pct) {
  if (!pct) return "Não calculado";
  if (sexo === "Masculino") {
    if (pct < 6) return "Muito baixo";
    if (pct < 14) return "Atlético";
    if (pct < 18) return "Bom";
    if (pct < 25) return "Acima";
    return "Muito alto";
  }
  if (pct < 14) return "Muito baixo";
  if (pct < 21) return "Atlético";
  if (pct < 25) return "Bom";
  if (pct < 32) return "Acima";
  return "Muito alto";
}

function corGordura(pct) {
  if (!pct) return theme.muted;
  if (pct < 14) return theme.primary;
  if (pct < 21) return "#facc15";
  if (pct < 25) return theme.warning;
  return theme.danger;
}

function calcularSomatotipo(av) {
  const gordura = gorduraPollock3(av);
  const peso = n(av.peso);
  const altura = n(av.altura);
  return {
    endomorfia: gordura ? (gordura / 5).toFixed(1) : "0.0",
    mesomorfia: peso && altura ? ((peso / altura) * 10).toFixed(1) : "0.0",
    ectomorfia: peso && altura ? ((altura / peso) * 2).toFixed(1) : "0.0",
  };
}

// ============================================
// ANÁLISE DE PERFIL INTELIGENTE (INALTERADA)
// ============================================
function analisarPerfil(aluno, avaliacao) {
  const imc = n(avaliacao?.resultado?.imc);
  const gordura = n(avaliacao?.resultado?.gordura3);
  const sexo = avaliacao?.sexo || "Masculino";
  const lesoes = aluno?.lesao || "";

  let perfilMetabolico = "NORMAL";
  if (imc >= 30 || gordura >= 30) perfilMetabolico = "OBESO";
  else if (imc >= 25 || gordura >= 25) perfilMetabolico = "SOBREPESO";
  else if (sexo === "Masculino" && gordura <= 10) perfilMetabolico = "DEFINIDO";
  else if (sexo === "Feminino" && gordura <= 18) perfilMetabolico = "DEFINIDO";

  const estrategias = {
    OBESO: { foco: "EMAGRECIMENTO", volume: "ALTO", intensidade: "MODERADA", metodos: ["CIRCUITO", "DROPSET"] },
    SOBREPESO: { foco: "RECOMPOSICAO", volume: "MODERADO_ALTO", intensidade: "MODERADA", metodos: ["AGONISTA_ANTAGONISTA"] },
    NORMAL: { foco: "HIPERTROFIA", volume: "MODERADO", intensidade: "ALTA", metodos: ["PIRAMIDE", "REST_PAUSE"] },
    DEFINIDO: { foco: "FORCA", volume: "BAIXO", intensidade: "MUITO_ALTA", metodos: ["CLUSTER_SETS", "EXCENTRICO"] },
  };

  const contraindicacoes = [];
  if (lesoes.toLowerCase().includes("joelho")) {
    contraindicacoes.push("EVITAR_AGACHAMENTO_PROFUNDO", "EVITAR_LEG_PRESS_PESADO");
  }
  if (lesoes.toLowerCase().includes("lombar") || lesoes.toLowerCase().includes("coluna")) {
    contraindicacoes.push("EVITAR_TERRA_PESADO", "EVITAR_BOM_DIA");
  }
  if (lesoes.toLowerCase().includes("ombro")) {
    contraindicacoes.push("EVITAR_SUPINO_PESADO", "EVITAR_DESENVOLVIMENTO");
  }

  return {
    perfilMetabolico,
    estrategia: estrategias[perfilMetabolico],
    contraindicacoes,
    fatorProgressao: perfilMetabolico === "OBESO" ? 1.5 : perfilMetabolico === "SOBREPESO" ? 2.0 : 2.5,
  };
}

// ============================================
// GERADOR DE TREINO INTELIGENTE (INALTERADO)
// ============================================
function gerarTreinoInteligente({ aluno, avaliacao, modalidade, objetivo, nivel, dias, rm }) {
  const perfil = analisarPerfil(aluno, avaliacao);
  const imc = avaliacao ? n(avaliacao.resultado?.imc) : 0;
  const gordura = avaliacao ? n(avaliacao.resultado?.gordura3) : 0;

  if (objetivo === "Emagrecimento") {
    perfil.estrategia = { foco: "EMAGRECIMENTO", volume: "ALTO", intensidade: "MODERADA", metodos: ["CIRCUITO", "DROPSET"] };
  } else if (objetivo === "Força") {
    perfil.estrategia = { foco: "FORCA", volume: "BAIXO", intensidade: "MUITO_ALTA", metodos: ["CLUSTER_SETS", "EXCENTRICO"] };
  } else if (objetivo === "Resistência") {
    perfil.estrategia = { foco: "RESISTENCIA", volume: "ALTO", intensidade: "BAIXA", metodos: ["BISET", "TRI_SET"] };
  }

  const volumes = {
    Iniciante: { series: 3, reps: "10-12", descanso: "60s" },
    Intermediário: { series: 4, reps: "8-10", descanso: "75s" },
    Avançado: { series: 5, reps: "4-8", descanso: "90-180s" },
  };

  const v = volumes[nivel] || volumes.Intermediário;
  const fatorVolume = perfil.estrategia.volume === "ALTO" ? 1.5 : 1;
  const seriesAjustadas = Math.round(v.series * fatorVolume);

  const biblioteca = {
    powerlifting: {
      nome: "Powerlifting — Progressão estilo Sheiko",
      semanas: [
        { semana: 1, fase: "Preparatória", pct: 0.65, volume: "5x5" },
        { semana: 2, fase: "Carga", pct: 0.72, volume: "5x4" },
        { semana: 3, fase: "Choque", pct: 0.8, volume: "4x3" },
        { semana: 4, fase: "Pico técnico", pct: 0.87, volume: "3x2" },
      ],
      exercicios: ["Agachamento livre", "Supino reto", "Levantamento terra", "Agachamento com pausa", "Supino fechado", "Remada curvada"],
    },
    musculacao: {
      nome: "Musculação — Hipertrofia / recomposição",
      semanas: [
        { semana: 1, fase: "Acúmulo", pct: 0.65, volume: "4x10-12" },
        { semana: 2, fase: "Intensificação", pct: 0.72, volume: "4x8-10" },
        { semana: 3, fase: "Choque", pct: 0.78, volume: "3x6-8" },
        { semana: 4, fase: "Supercompensação", pct: 0.6, volume: "3x12 leve" },
      ],
      exercicios: ["Supino inclinado", "Agachamento", "Remada baixa", "Desenvolvimento", "Stiff", "Rosca direta", "Tríceps corda"],
    },
    bodybuilding: {
      nome: "Bodybuilder — Volume e métodos avançados",
      semanas: [
        { semana: 1, fase: "Volume", pct: 0.68, volume: "4x10" },
        { semana: 2, fase: "Drop set", pct: 0.7, volume: "3x8 + drop" },
        { semana: 3, fase: "Rest-pause", pct: 0.75, volume: "3x6 + rest" },
        { semana: 4, fase: "FST-7", pct: 0.6, volume: "7x10-12" },
      ],
      exercicios: ["Supino máquina", "Crossover", "Hack squat", "Cadeira extensora", "Mesa flexora", "Elevação lateral", "Pulldown"],
    },
    beachTennis: {
      nome: "Beach Tennis — Potência, lateralidade e core",
      semanas: [
        { semana: 1, fase: "Base coordenativa", pct: 0.55, volume: "3x12" },
        { semana: 2, fase: "Potência", pct: 0.65, volume: "4x6" },
        { semana: 3, fase: "Reação", pct: 0.7, volume: "4x4" },
        { semana: 4, fase: "Transferência", pct: 0.6, volume: "3x8 rápido" },
      ],
      exercicios: ["Deslocamento lateral", "Core anti-rotação", "Salto lateral", "Lunge rotacional", "Sprint curto", "Remada elástica"],
    },
    futebol: {
      nome: "Futebol — Força, potência e prevenção",
      semanas: [
        { semana: 1, fase: "Base", pct: 0.6, volume: "3x10" },
        { semana: 2, fase: "Força explosiva", pct: 0.75, volume: "4x5" },
        { semana: 3, fase: "Velocidade", pct: 0.8, volume: "3x3" },
        { semana: 4, fase: "Transferência jogo", pct: 0.65, volume: "3x6 rápido" },
      ],
      exercicios: ["Agachamento", "Stiff", "Posterior nórdico", "Sprint 20m", "Mudança de direção", "Pliometria caixa"],
    },
    gestante: {
      nome: "Gestantes — Segurança, mobilidade e força leve",
      semanas: [
        { semana: 1, fase: "Adaptação", pct: 0.4, volume: "2x15" },
        { semana: 2, fase: "Fortalecimento", pct: 0.45, volume: "3x12" },
        { semana: 3, fase: "Manutenção", pct: 0.5, volume: "3x10" },
        { semana: 4, fase: "Recuperação", pct: 0.4, volume: "2x12" },
      ],
      exercicios: ["Mobilidade pélvica", "Agachamento sumô leve", "Remada elástica", "Elevação pélvica", "Respiração diafragmática", "Caminhada leve"],
    },
  };

  const plano = biblioteca[modalidade] || biblioteca.musculacao;

  let exerciciosFiltrados = plano.exercicios;
  if (perfil.contraindicacoes) {
    exerciciosFiltrados = plano.exercicios.filter(ex => {
      const nome = ex.toLowerCase();
      if (perfil.contraindicacoes.includes("EVITAR_AGACHAMENTO_PROFUNDO") && nome.includes("agachamento")) return false;
      if (perfil.contraindicacoes.includes("EVITAR_TERRA_PESADO") && (nome.includes("terra") || nome.includes("stiff"))) return false;
      if (perfil.contraindicacoes.includes("EVITAR_SUPINO_PESADO") && nome.includes("supino")) return false;
      if (perfil.contraindicacoes.includes("EVITAR_BOM_DIA") && nome.includes("bom dia")) return false;
      return true;
    });
  }
  if (exerciciosFiltrados.length === 0) {
    exerciciosFiltrados = ["Caminhada leve", "Mobilidade articular", "Alongamento ativo"];
  }

  const observacoes = [];
  if (imc >= 30) observacoes.push("IMC elevado: priorizar emagrecimento, circuitos e cardio moderado.");
  if (gordura >= 25) observacoes.push("Gordura elevada: usar métodos de alta densidade (drop-set, circuito).");
  if (aluno?.lesao) observacoes.push(`Atenção à lesão: ${aluno.lesao}. Exercícios adaptados automaticamente.`);
  if (perfil.estrategia.metodos.length > 0) observacoes.push(`Métodos sugeridos: ${perfil.estrategia.metodos.join(", ")}`);
  observacoes.push(`Objetivo: ${objetivo} | Perfil: ${perfil.perfilMetabolico}`);
  if (modalidade === "powerlifting") observacoes.push("Equipamentos: barra, anilhas, gaiola, banco de supino e monolift.");

  const semanas = plano.semanas.map((s) => ({
    ...s,
    carga: modalidade === "gestante" ? "Leve / RPE 5-6" : `${Math.round(n(rm) * s.pct)} kg`,
  }));

  const diasSemana = Array.from({ length: Number(dias) || 3 }, (_, i) => ({
    dia: `Dia ${i + 1}`,
    foco: ["Empurrar", "Puxar", "Pernas", "Potência", "Condicionamento"][i % 5],
    exercicios: exerciciosFiltrados.slice(0, 5).map((ex) => ({
      nome: ex,
      series: seriesAjustadas,
      reps: v.reps,
      descanso: v.descanso,
    })),
  }));

  return {
    id: Date.now(),
    alunoId: aluno?.id,
    alunoNome: aluno?.nome || "Sem aluno",
    modalidade,
    objetivo,
    nivel,
    data: new Date().toLocaleDateString("pt-BR"),
    nome: plano.nome,
    semanas,
    diasSemana,
    observacoes,
    perfil: {
      metabolico: perfil.perfilMetabolico,
      estrategia: perfil.estrategia.foco,
    },
  };
}

// ============================================
// COMPONENTES VISUAIS
// ============================================
function Card({ title, value, cor }) {
  return (
    <div style={{ ...styles.card, borderLeft: cor ? `4px solid ${cor}` : undefined }}>
      <p style={styles.muted}>{title}</p>
      <h2 style={cor ? { color: cor } : {}}>{value}</h2>
    </div>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div style={styles.card}>
      <p>{label}</p>
      <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} />
    </div>
  );
}

function TreinoView({ treino, onExcluir, onExportar }) {
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>{treino.nome}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.smallBtn} onClick={() => onExportar(treino)}>📄 PDF</button>
          <button style={styles.dangerBtn} onClick={() => onExcluir(treino.id)}>🗑️</button>
        </div>
      </div>
      <p style={styles.muted}>{treino.data} • {treino.modalidade} • {treino.nivel}</p>
      {treino.observacoes?.map((o, i) => <p key={i} style={{ color: "#facc15" }}>⚠️ {o}</p>)}
      <h4>Periodização</h4>
      <div style={styles.grid4}>
        {treino.semanas.map((s) => (
          <div key={s.semana} style={styles.miniCard}>
            <strong>Sem. {s.semana}</strong>
            <small>{s.fase}</small>
            <small>{s.volume}</small>
            <small>{s.carga}</small>
          </div>
        ))}
      </div>
      <h4>Dias de treino</h4>
      {treino.diasSemana.map((d) => (
        <div key={d.dia} style={styles.miniCard}>
          <strong>{d.dia} — {d.foco}</strong>
          {d.exercicios.map((e, i) => (
            <small key={i}>{e.nome} — {e.series}x {e.reps} — {e.descanso}</small>
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniChart({ data, label }) {
  const clean = data.filter((x) => x > 0);
  if (clean.length < 2) return <p style={styles.muted}>Adicione mais avaliações para gerar evolução.</p>;
  const max = Math.max(...clean);
  const min = Math.min(...clean);
  const span = max - min || 1;
  const points = clean.map((v, i) => {
    const x = (i / (clean.length - 1)) * 100;
    const y = 80 - ((v - min) / span) * 60;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div>
      <p style={styles.muted}>{label}</p>
      <svg viewBox="0 0 100 90" style={{ width: "100%", height: 220, background: "transparent", borderRadius: 12 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.primary} />
            <stop offset="100%" stopColor={theme.secondary} />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="url(#grad)" strokeWidth="3" points={points} />
        {clean.map((v, i) => {
          const x = (i / (clean.length - 1)) * 100;
          const y = 80 - ((v - min) / span) * 60;
          return <circle key={i} cx={x} cy={y} r="2.5" fill={theme.secondary} />;
        })}
      </svg>
    </div>
  );
}

// ============================================
// APP PRINCIPAL (MESMA LÓGICA, NOVA UI)
// ============================================
export default function App() {
  const [logado, setLogado] = useState(false);
  const [pagina, setPagina] = useState("dashboard");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const [alunos, setAlunos] = useState(() => carregarLS(LS_KEYS.alunos, []));
  const [avaliacoes, setAvaliacoes] = useState(() => carregarLS(LS_KEYS.avaliacoes, []));
  const [treinos, setTreinos] = useState(() => carregarLS(LS_KEYS.treinos, []));

  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");
  const [tabPerfil, setTabPerfil] = useState("avaliacoes");

  const [novoAluno, setNovoAluno] = useState({
    nome: "", telefone: "", modalidadePrincipal: "musculacao", objetivo: "Hipertrofia", lesao: ""
  });

  const [editandoAluno, setEditandoAluno] = useState(null);

  const [avaliacao, setAvaliacao] = useState({
    alunoId: "", sexo: "Masculino", idade: "", peso: "", altura: "", cintura: "", quadril: "",
    triceps: "", subescapular: "", peitoral: "", abdominal: "", suprailiaca: "", coxa: "", axilar: "",
    fotoFrontal: "", fotoLateral: "", fotoPosterior: "",
  });

  const [configTreino, setConfigTreino] = useState({
    alunoId: "", modalidade: "musculacao", objetivo: "Hipertrofia", nivel: "Intermediário",
    dias: 3, cargaTeste: "", repsTeste: "", rmManual: "",
  });

  useEffect(() => salvarLS(LS_KEYS.alunos, alunos), [alunos]);
  useEffect(() => salvarLS(LS_KEYS.avaliacoes, avaliacoes), [avaliacoes]);
  useEffect(() => salvarLS(LS_KEYS.treinos, treinos), [treinos]);

  const alunoSelecionado = alunos.find((a) => String(a.id) === String(alunoSelecionadoId));
  const avaliacoesAluno = avaliacoes.filter((a) => String(a.alunoId) === String(alunoSelecionadoId));
  const ultimaAvaliacaoAluno = avaliacoesAluno[avaliacoesAluno.length - 1];
  const treinosAluno = treinos.filter((t) => String(t.alunoId) === String(alunoSelecionadoId));

  const resultadoAvaliacao = useMemo(() => {
    const imc = calcularIMC(avaliacao.peso, avaliacao.altura);
    const rcq = calcularRCQ(avaliacao.cintura, avaliacao.quadril);
    const gordura3 = gorduraPollock3(avaliacao);
    const gordura7 = gorduraPollock7(avaliacao);
    const gorduraFaulkner = faulkner(avaliacao);
    const somatotipo = calcularSomatotipo(avaliacao);
    return { imc, classIMC: classificarIMC(imc), rcq, gordura3, gordura7, gorduraFaulkner, classGordura: classificarGordura(avaliacao.sexo, gordura3), somatotipo };
  }, [avaliacao]);

  function login() {
    if (usuario === "admin" && senha === "123") { setLogado(true); setErro(""); }
    else setErro("Usuário ou senha inválidos.");
  }

  function limparDados() {
    if (!confirm("Tem certeza? Isso apagará TODOS os dados do sistema permanentemente.")) return;
    localStorage.removeItem(LS_KEYS.alunos);
    localStorage.removeItem(LS_KEYS.avaliacoes);
    localStorage.removeItem(LS_KEYS.treinos);
    setAlunos([]);
    setAvaliacoes([]);
    setTreinos([]);
    setAlunoSelecionadoId("");
    alert("Todos os dados foram removidos.");
  }

  function adicionarAluno() {
    if (!novoAluno.nome.trim()) return alert("Informe o nome do aluno.");
    const novo = { id: Date.now(), ...novoAluno, dataCadastro: new Date().toLocaleDateString("pt-BR") };
    setAlunos([...alunos, novo]);
    setNovoAluno({ nome: "", telefone: "", modalidadePrincipal: "musculacao", objetivo: "Hipertrofia", lesao: "" });
    setAlunoSelecionadoId(String(novo.id));
    setPagina("perfil");
  }

  function iniciarEdicaoAluno(aluno) { setEditandoAluno({ ...aluno }); }

  function salvarEdicaoAluno() {
    if (!editandoAluno?.nome?.trim()) return alert("Nome obrigatório.");
    setAlunos(alunos.map(a => a.id === editandoAluno.id ? editandoAluno : a));
    setEditandoAluno(null);
  }

  function cancelarEdicaoAluno() { setEditandoAluno(null); }

  function removerAluno(id) {
    if (!confirm("Excluir aluno e seus vínculos locais?")) return;
    setAlunos(alunos.filter((a) => a.id !== id));
    setAvaliacoes(avaliacoes.filter((a) => a.alunoId !== id));
    setTreinos(treinos.filter((t) => t.alunoId !== id));
    setAlunoSelecionadoId("");
  }

  function excluirAvaliacao(id) {
    if (!confirm("Excluir esta avaliação?")) return;
    setAvaliacoes(avaliacoes.filter(a => a.id !== id));
  }

  function excluirTreino(id) {
    if (!confirm("Excluir este treino?")) return;
    setTreinos(treinos.filter(t => t.id !== id));
  }

  function salvarFoto(campo, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvaliacao({ ...avaliacao, [campo]: reader.result });
    reader.readAsDataURL(file);
  }

  function salvarAvaliacao() {
    if (!avaliacao.alunoId) return alert("Selecione um aluno.");
    if (!avaliacao.peso || !avaliacao.altura) return alert("Preencha peso e altura.");
    const aluno = alunos.find((a) => String(a.id) === String(avaliacao.alunoId));
    const nova = { id: Date.now(), alunoId: Number(avaliacao.alunoId), alunoNome: aluno?.nome || "", data: new Date().toLocaleDateString("pt-BR"), ...avaliacao, resultado: resultadoAvaliacao };
    setAvaliacoes([...avaliacoes, nova]);
    setAlunoSelecionadoId(String(avaliacao.alunoId));
    setConfigTreino({ ...configTreino, alunoId: String(avaliacao.alunoId), modalidade: aluno?.modalidadePrincipal || "musculacao", objetivo: aluno?.objetivo || "Hipertrofia" });
    setPagina("perfil");
  }

  function gerarTreino() {
    if (!configTreino.alunoId) return alert("Selecione um aluno.");
    const aluno = alunos.find((a) => String(a.id) === String(configTreino.alunoId));
    const ultAv = avaliacoes.filter((a) => String(a.alunoId) === String(configTreino.alunoId)).slice(-1)[0];
    const rmEstimado = n(configTreino.rmManual) || calcular1RM(configTreino.cargaTeste, configTreino.repsTeste) || 100;
    const treino = gerarTreinoInteligente({ aluno, avaliacao: ultAv, modalidade: configTreino.modalidade, objetivo: configTreino.objetivo, nivel: configTreino.nivel, dias: configTreino.dias, rm: rmEstimado });
    setTreinos([...treinos, treino]);
    setAlunoSelecionadoId(String(configTreino.alunoId));
    setPagina("perfil");
  }

  function exportarCSV() {
    const linhas = ["Aluno;Data;Tipo;Resumo", ...avaliacoes.map((a) => `${a.alunoNome};${a.data};Avaliação;IMC ${a.resultado.imc.toFixed(2)} - Gordura ${a.resultado.gordura3.toFixed(2)}%`), ...treinos.map((t) => `${t.alunoNome};${t.data};Treino;${t.nome}`)];
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "fitcontrol_export.csv"; link.click();
    URL.revokeObjectURL(url);
  }

  if (!logado) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.brandCircle}>🏋️</div>
          <h1 style={styles.loginTitle}>FitControl Pro</h1>
          <p style={styles.muted}>Sistema profissional de treino, avaliação e evolução</p>
          <input style={styles.input} placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          {erro && <p style={styles.error}>{erro}</p>}
          <button style={styles.primaryBtn} onClick={login} onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>Entrar</button>
          <p style={styles.hint}>Demo: admin / 123</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>💪 FitControl</h2>
        <p style={styles.sidebarSub}>Pro Training System</p>
        {[["dashboard","📊 Dashboard"],["alunos","👥 Alunos"],["perfil","🧍 Perfil"],["avaliacao","📋 Avaliação"],["treino","🏋️ Treinos"],["relatorios","📁 Relatórios"]].map(([key,label]) => (
          <button key={key} onClick={() => setPagina(key)} style={pagina === key ? styles.navActive : styles.navBtn}>{label}</button>
        ))}
        <button style={styles.logoutBtn} onClick={() => setLogado(false)}>Sair</button>
        <button style={{ ...styles.logoutBtn, background: theme.warning, marginTop: 5 }} onClick={limparDados}>🧹 Limpar dados</button>
      </aside>

      <main style={styles.main}>
        {/* CABEÇALHO CONTEXTUAL */}
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Aluno: {alunoSelecionado?.nome || "Nenhum selecionado"}</h2>
          <button style={styles.primaryBtn} onClick={() => setPagina("treino")}>+ Novo treino</button>
        </div>

        {/* DASHBOARD */}
        {pagina === "dashboard" && (
          <>
            <h1>Dashboard</h1>
            <div style={styles.grid4}>
              <Card title="Alunos" value={alunos.length} />
              <Card title="Avaliações" value={avaliacoes.length} />
              <Card title="Treinos" value={treinos.length} />
              <Card title="Modalidades" value="6" />
            </div>
            <section style={styles.panel}>
              <h2>Evolução geral</h2>
              <MiniChart data={avaliacoes.map((a) => n(a.resultado?.imc))} label="IMC" />
            </section>
            <section style={styles.panel}>
              <h2>Últimas avaliações</h2>
              {avaliacoes.slice(-5).reverse().map((a) => (
                <div key={a.id} style={styles.row}>
                  <strong>{a.alunoNome}</strong>
                  <span style={{ color: corIMC(a.resultado?.imc) }}>IMC {a.resultado?.imc?.toFixed(2)}</span>
                  <span>{a.data}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {/* ALUNOS */}
        {pagina === "alunos" && (
          <>
            <h1>Alunos</h1>
            <section style={styles.panel}>
              <h2>Novo aluno</h2>
              <div style={styles.grid2}>
                <input style={styles.input} placeholder="Nome" value={novoAluno.nome} onChange={(e) => setNovoAluno({ ...novoAluno, nome: e.target.value })} />
                <input style={styles.input} placeholder="Telefone" value={novoAluno.telefone} onChange={(e) => setNovoAluno({ ...novoAluno, telefone: e.target.value })} />
                <select style={styles.input} value={novoAluno.modalidadePrincipal} onChange={(e) => setNovoAluno({ ...novoAluno, modalidadePrincipal: e.target.value })}>
                  <option value="musculacao">Musculação</option>
                  <option value="bodybuilding">Bodybuilder</option>
                  <option value="powerlifting">Powerlifting</option>
                  <option value="beachTennis">Beach Tennis</option>
                  <option value="futebol">Futebol</option>
                  <option value="gestante">Gestante</option>
                </select>
                <select style={styles.input} value={novoAluno.objetivo} onChange={(e) => setNovoAluno({ ...novoAluno, objetivo: e.target.value })}>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Força">Força</option>
                  <option value="Resistência">Resistência</option>
                  <option value="Condicionamento">Condicionamento</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
              <input style={styles.input} placeholder="Lesões / restrições" value={novoAluno.lesao} onChange={(e) => setNovoAluno({ ...novoAluno, lesao: e.target.value })} />
              <button style={styles.primaryBtn} onClick={adicionarAluno}>Adicionar aluno</button>
            </section>
            <section style={styles.panel}>
              <h2>Lista de alunos</h2>
              {alunos.length === 0 && <p style={styles.muted}>Nenhum aluno cadastrado.</p>}
              {alunos.map((a) => (
                <div key={a.id} style={styles.row}>
                  <div onClick={() => { setAlunoSelecionadoId(String(a.id)); setPagina("perfil"); }} style={{ cursor: "pointer" }}>
                    <strong>{a.nome}</strong><br />
                    <small style={styles.muted}>{a.modalidadePrincipal} • {a.objetivo}</small>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={styles.smallBtn} onClick={() => iniciarEdicaoAluno(a)}>✏️</button>
                    <button style={styles.dangerBtn} onClick={() => removerAluno(a.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* EDITAR ALUNO MODAL */}
        {editandoAluno && (
          <div style={styles.modalOverlay} onClick={cancelarEdicaoAluno}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2>Editar Aluno: {editandoAluno.nome}</h2>
              <div style={styles.grid2}>
                <input style={styles.input} placeholder="Nome" value={editandoAluno.nome} onChange={(e) => setEditandoAluno({ ...editandoAluno, nome: e.target.value })} />
                <input style={styles.input} placeholder="Telefone" value={editandoAluno.telefone} onChange={(e) => setEditandoAluno({ ...editandoAluno, telefone: e.target.value })} />
                <select style={styles.input} value={editandoAluno.modalidadePrincipal} onChange={(e) => setEditandoAluno({ ...editandoAluno, modalidadePrincipal: e.target.value })}>
                  <option value="musculacao">Musculação</option>
                  <option value="bodybuilding">Bodybuilder</option>
                  <option value="powerlifting">Powerlifting</option>
                  <option value="beachTennis">Beach Tennis</option>
                  <option value="futebol">Futebol</option>
                  <option value="gestante">Gestante</option>
                </select>
                <select style={styles.input} value={editandoAluno.objetivo} onChange={(e) => setEditandoAluno({ ...editandoAluno, objetivo: e.target.value })}>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Força">Força</option>
                  <option value="Resistência">Resistência</option>
                  <option value="Condicionamento">Condicionamento</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
              <input style={styles.input} placeholder="Lesões / restrições" value={editandoAluno.lesao} onChange={(e) => setEditandoAluno({ ...editandoAluno, lesao: e.target.value })} />
              <div style={{ display: "flex", gap: 10 }}>
                <button style={styles.primaryBtn} onClick={salvarEdicaoAluno}>Salvar</button>
                <button style={styles.dangerBtn} onClick={cancelarEdicaoAluno}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* PERFIL */}
        {pagina === "perfil" && (
          <>
            <h1>Perfil do aluno</h1>
            {!alunoSelecionado && <p style={styles.muted}>Selecione um aluno na tela Alunos.</p>}
            {alunoSelecionado && (
              <>
                <section style={styles.panel}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2>{alunoSelecionado.nome}</h2>
                      <p style={styles.muted}>{alunoSelecionado.telefone || "Sem telefone"} • {alunoSelecionado.modalidadePrincipal}</p>
                      <p>Objetivo: <strong>{alunoSelecionado.objetivo}</strong></p>
                      {alunoSelecionado.lesao && <p>Restrição: <strong>{alunoSelecionado.lesao}</strong></p>}
                    </div>
                    <button style={styles.smallBtn} onClick={() => iniciarEdicaoAluno(alunoSelecionado)}>✏️ Editar</button>
                  </div>
                </section>

                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {["avaliacoes","treinos","fotos"].map((tab) => (
                    <button key={tab} style={tabPerfil === tab ? styles.navActive : styles.navBtn} onClick={() => setTabPerfil(tab)}>
                      {tab === "avaliacoes" ? "📋 Avaliações" : tab === "treinos" ? "🏋️ Treinos" : "📷 Fotos"}
                    </button>
                  ))}
                </div>

                {tabPerfil === "avaliacoes" && (
                  <section style={styles.panel}>
                    <h2>Histórico de avaliações</h2>
                    {avaliacoesAluno.length === 0 && <p style={styles.muted}>Nenhuma avaliação.</p>}
                    {avaliacoesAluno.slice().reverse().map((a) => (
                      <div key={a.id} style={styles.row}>
                        <div>
                          <strong>{a.data}</strong><br />
                          <small style={{ color: corIMC(a.resultado?.imc) }}>IMC: {a.resultado?.imc?.toFixed(2)}</small> | <small style={{ color: corGordura(a.resultado?.gordura3) }}>Gordura: {a.resultado?.gordura3?.toFixed(1)}%</small> | RCQ: {a.resultado?.rcq?.toFixed(2)}
                        </div>
                        <button style={styles.dangerBtn} onClick={() => excluirAvaliacao(a.id)}>🗑️</button>
                      </div>
                    ))}
                  </section>
                )}

                {tabPerfil === "treinos" && (
                  <section style={styles.panel}>
                    <h2>Treinos gerados</h2>
                    {treinosAluno.length === 0 && <p style={styles.muted}>Nenhum treino gerado.</p>}
                    {treinosAluno.slice().reverse().map((t) => (
                      <TreinoView key={t.id} treino={t} onExcluir={excluirTreino} onExportar={(treino) => {
                        const w = window.open("", "_blank");
                        w.document.write(`<html><body style="padding:20px;font-family:Arial"><h1>${treino.nome}</h1><p>Aluno: ${treino.alunoNome} | Data: ${treino.data}</p></body></html>`);
                      }} />
                    ))}
                  </section>
                )}

                {tabPerfil === "fotos" && (
                  <section style={styles.panel}>
                    <h2>Fotos posturais</h2>
                    {avaliacoesAluno.filter(a => a.fotoFrontal || a.fotoLateral || a.fotoPosterior).length === 0 && <p style={styles.muted}>Nenhuma foto registrada.</p>}
                    {avaliacoesAluno.filter(a => a.fotoFrontal || a.fotoLateral || a.fotoPosterior).slice().reverse().map((a) => (
                      <div key={a.id} style={{ marginBottom: 20 }}>
                        <p><strong>{a.data}</strong></p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {a.fotoFrontal && <img src={a.fotoFrontal} style={styles.photo} />}
                          {a.fotoLateral && <img src={a.fotoLateral} style={styles.photo} />}
                          {a.fotoPosterior && <img src={a.fotoPosterior} style={styles.photo} />}
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* AVALIAÇÃO */}
        {pagina === "avaliacao" && (
          <>
            <h1>Avaliação física completa</h1>
            <section style={styles.panel}>
              <select style={styles.input} value={avaliacao.alunoId} onChange={(e) => setAvaliacao({ ...avaliacao, alunoId: e.target.value })}>
                <option value="">Selecione um aluno</option>
                {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <select style={styles.input} value={avaliacao.sexo} onChange={(e) => setAvaliacao({ ...avaliacao, sexo: e.target.value })}>
                <option>Masculino</option><option>Feminino</option>
              </select>
              <h2>Dados básicos</h2>
              <div style={styles.grid4}>
                {["idade","peso","altura","cintura","quadril"].map((campo) => (
                  <input key={campo} style={styles.input} placeholder={campo} value={avaliacao[campo]} onChange={(e) => setAvaliacao({ ...avaliacao, [campo]: e.target.value })} />
                ))}
              </div>
              <h2>Dobras cutâneas (mm)</h2>
              <div style={styles.grid4}>
                {["triceps","subescapular","peitoral","abdominal","suprailiaca","coxa","axilar"].map((campo) => (
                  <input key={campo} style={styles.input} placeholder={campo} value={avaliacao[campo]} onChange={(e) => setAvaliacao({ ...avaliacao, [campo]: e.target.value })} />
                ))}
              </div>
              <h2>Fotos posturais</h2>
              <div style={styles.grid3}>
                <FileInput label="Frontal" onChange={(file) => salvarFoto("fotoFrontal", file)} />
                <FileInput label="Lateral" onChange={(file) => salvarFoto("fotoLateral", file)} />
                <FileInput label="Posterior" onChange={(file) => salvarFoto("fotoPosterior", file)} />
              </div>
              <div style={styles.grid4}>
                <Card title="IMC" value={resultadoAvaliacao.imc.toFixed(2)} cor={corIMC(resultadoAvaliacao.imc)} />
                <Card title="RCQ" value={resultadoAvaliacao.rcq.toFixed(2)} />
                <Card title="Pollock 3" value={`${resultadoAvaliacao.gordura3.toFixed(1)}%`} cor={corGordura(resultadoAvaliacao.gordura3)} />
                <Card title="Somatótipo" value={`${resultadoAvaliacao.somatotipo.endomorfia}-${resultadoAvaliacao.somatotipo.mesomorfia}-${resultadoAvaliacao.somatotipo.ectomorfia}`} />
              </div>
              <button style={styles.primaryBtn} onClick={salvarAvaliacao}>Salvar avaliação</button>
            </section>
          </>
        )}

        {/* TREINO */}
        {pagina === "treino" && (
          <>
            <h1>Gerador de treino inteligente</h1>
            <section style={styles.panel}>
              <select style={styles.input} value={configTreino.alunoId} onChange={(e) => setConfigTreino({ ...configTreino, alunoId: e.target.value })}>
                <option value="">Selecione um aluno</option>
                {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <div style={styles.grid4}>
                <select style={styles.input} value={configTreino.modalidade} onChange={(e) => setConfigTreino({ ...configTreino, modalidade: e.target.value })}>
                  <option value="musculacao">Musculação</option>
                  <option value="bodybuilding">Bodybuilder</option>
                  <option value="powerlifting">Powerlifting</option>
                  <option value="beachTennis">Beach Tennis</option>
                  <option value="futebol">Futebol</option>
                  <option value="gestante">Gestante</option>
                </select>
                <select style={styles.input} value={configTreino.nivel} onChange={(e) => setConfigTreino({ ...configTreino, nivel: e.target.value })}>
                  <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
                </select>
                <select style={styles.input} value={configTreino.objetivo} onChange={(e) => setConfigTreino({ ...configTreino, objetivo: e.target.value })}>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Força">Força</option>
                  <option value="Resistência">Resistência</option>
                  <option value="Condicionamento">Condicionamento</option>
                  <option value="Performance">Performance</option>
                </select>
                <input style={styles.input} type="number" min="1" max="6" placeholder="Dias/semana" value={configTreino.dias} onChange={(e) => setConfigTreino({ ...configTreino, dias: e.target.value })} />
              </div>
              <h2>1RM</h2>
              <div style={styles.grid3}>
                <input style={styles.input} placeholder="Carga teste (kg)" value={configTreino.cargaTeste} onChange={(e) => setConfigTreino({ ...configTreino, cargaTeste: e.target.value })} />
                <input style={styles.input} placeholder="Repetições" value={configTreino.repsTeste} onChange={(e) => setConfigTreino({ ...configTreino, repsTeste: e.target.value })} />
                <input style={styles.input} placeholder="1RM manual" value={configTreino.rmManual} onChange={(e) => setConfigTreino({ ...configTreino, rmManual: e.target.value })} />
              </div>
              <p style={styles.muted}>1RM estimado: <strong>{(n(configTreino.rmManual) || calcular1RM(configTreino.cargaTeste, configTreino.repsTeste)).toFixed(1)} kg</strong></p>
              <button style={styles.primaryBtn} onClick={gerarTreino}>Gerar treino</button>
            </section>
          </>
        )}

        {/* RELATÓRIOS */}
        {pagina === "relatorios" && (
          <>
            <h1>Relatórios</h1>
            <section style={styles.panel}>
              <button style={styles.primaryBtn} onClick={exportarCSV}>Exportar CSV geral</button>
            </section>
          </>
        )}
      </main>

      {/* BOTÃO FLUTUANTE */}
      <button
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #22c55e, #06b6d4)",
          border: "none",
          fontSize: 28,
          color: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          cursor: "pointer",
          zIndex: 999,
          transition: "transform .2s ease",
        }}
        onClick={() => setPagina("treino")}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      >
        +
      </button>
    </div>
  );
}

// ============================================
// ESTILOS PREMIUM (UPGRADE COMPLETO)
// ============================================
const styles = {
  loginPage: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top left, rgba(34,197,94,.25), transparent 30%), radial-gradient(circle at bottom right, rgba(6,182,212,.22), transparent 35%), #020617",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, Arial, sans-serif",
  },
  loginCard: {
    width: 410,
    background: "linear-gradient(180deg, rgba(15,23,42,.98), rgba(2,6,23,.98))",
    border: "1px solid rgba(148,163,184,.18)",
    padding: 38,
    borderRadius: 34,
    boxShadow: "0 35px 90px rgba(0,0,0,.65)",
  },
  brandCircle: {
    width: 72,
    height: 72,
    borderRadius: "24px",
    background: "linear-gradient(135deg,#86efac,#67e8f9,#c4b5fd)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    marginBottom: 22,
    boxShadow: "0 18px 45px rgba(34,197,94,.35)",
  },
  loginTitle: {
    margin: "0 0 8px",
    fontSize: 34,
    letterSpacing: "-1px",
  },
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "radial-gradient(circle at 20% 0%, rgba(34,197,94,.16), transparent 28%), radial-gradient(circle at 100% 20%, rgba(6,182,212,.14), transparent 30%), #020617",
    color: "#e2e8f0",
    fontFamily: "Inter, Arial, sans-serif",
  },
  sidebar: {
    width: 270,
    background: "linear-gradient(180deg, rgba(15,23,42,.96), rgba(2,6,23,.98))",
    padding: 24,
    borderRight: "1px solid rgba(148,163,184,.12)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "16px 0 60px rgba(0,0,0,.35)",
  },
  logo: { marginBottom: 0, fontSize: 24, letterSpacing: "-.5px" },
  sidebarSub: { color: "#94a3b8", marginTop: 0, marginBottom: 26, fontSize: 13 },
  navBtn: {
    background: "rgba(15,23,42,.65)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,.12)",
    padding: "14px 15px",
    borderRadius: 18,
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all .2s ease",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
  },
  navActive: {
    background: "linear-gradient(135deg,#86efac,#67e8f9,#c4b5fd)",
    color: "#020617",
    border: "none",
    padding: "14px 15px",
    borderRadius: 18,
    textAlign: "left",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 35px rgba(34,197,94,.25)",
  },
  logoutBtn: {
    marginTop: "auto",
    background: "linear-gradient(135deg,#ef4444,#f97316)",
    color: "#fff",
    border: "none",
    padding: 13,
    borderRadius: 18,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 14px 35px rgba(239,68,68,.25)",
  },
  main: { flex: 1, padding: 34, overflow: "auto" },
  panel: {
    background: "linear-gradient(180deg, rgba(15,23,42,.92), rgba(2,6,23,.92))",
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 28,
    padding: 26,
    marginBottom: 24,
    boxShadow: "0 24px 70px rgba(0,0,0,.35)",
    backdropFilter: "blur(12px)",
  },
  card: {
    background: "linear-gradient(145deg, rgba(17,24,39,.96), rgba(2,6,23,.96))",
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    boxShadow: "0 18px 45px rgba(0,0,0,.32)",
  },
  miniCard: {
    background: "linear-gradient(180deg, rgba(15,23,42,.9), rgba(2,6,23,.95))",
    border: "1px solid rgba(148,163,184,.12)",
    borderRadius: 18,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 12px 30px rgba(0,0,0,.25)",
  },
  row: {
    background: "rgba(17,24,39,.82)",
    border: "1px solid rgba(148,163,184,.12)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,.22)",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.86)",
    color: "#fff",
    marginBottom: 14,
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
  },
  primaryBtn: {
    background: "linear-gradient(135deg,#86efac,#67e8f9,#c4b5fd)",
    color: "#020617",
    border: "none",
    padding: "14px 22px",
    borderRadius: 18,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: ".2px",
    boxShadow: "0 18px 45px rgba(34,197,94,.28)",
    transition: "all .2s ease",
  },
  smallBtn: {
    background: "rgba(148,163,184,.16)",
    color: "#e2e8f0",
    border: "1px solid rgba(148,163,184,.14)",
    padding: "8px 13px",
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  dangerBtn: {
    background: "linear-gradient(135deg,#ef4444,#f97316)",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 12px 28px rgba(239,68,68,.22)",
  },
  error: { color: "#f87171", fontWeight: 700 },
  hint: { color: "#64748b", fontSize: 12, marginTop: 16 },
  muted: { color: "#94a3b8" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16 },
  photo: {
    width: 150, height: 190, objectFit: "cover", borderRadius: 22,
    border: "1px solid rgba(148,163,184,.25)", boxShadow: "0 18px 40px rgba(0,0,0,.4)",
  },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)",
  },
  modalContent: {
    background: "linear-gradient(180deg,#1e293b,#020617)", border: "1px solid rgba(148,163,184,.2)",
    padding: 34, borderRadius: 28, minWidth: 420, maxWidth: 660, boxShadow: "0 30px 90px rgba(0,0,0,.65)",
  },
};