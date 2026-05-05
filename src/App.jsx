import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar, Legend
} from "recharts";

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

// ============================================
// NOVAS FUNÇÕES DE COR (PALETA CIANO/LARANJA)
// ============================================
function corIMC(imc) {
  if (!imc) return "#94a3b8";
  if (imc < 18.5) return "#00E5FF";
  if (imc < 25) return "#00B8D4";
  if (imc < 30) return "#FF8A50";
  if (imc < 35) return "#FF7043";
  if (imc < 40) return "#FF5722";
  return "#E64A19";
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
    if (pct < 6) return "Muito baixo"; if (pct < 14) return "Atlético";
    if (pct < 18) return "Bom"; if (pct < 25) return "Acima"; return "Muito alto";
  }
  if (pct < 14) return "Muito baixo"; if (pct < 21) return "Atlético";
  if (pct < 25) return "Bom"; if (pct < 32) return "Acima"; return "Muito alto";
}

function corGordura(pct) {
  if (!pct) return "#94a3b8";
  if (pct < 6) return "#00E5FF";
  if (pct < 14) return "#00B8D4";
  if (pct < 18) return "#00ACC1";
  if (pct < 25) return "#FF8A50";
  return "#FF5722";
}

function calcularSomatotipo(av) {
  const gordura = gorduraPollock3(av);
  const peso = n(av.peso); const altura = n(av.altura);
  return {
    endomorfia: gordura ? (gordura / 5).toFixed(1) : "0.0",
    mesomorfia: peso && altura ? ((peso / altura) * 10).toFixed(1) : "0.0",
    ectomorfia: peso && altura ? ((altura / peso) * 2).toFixed(1) : "0.0",
  };
}

// ============================================
// ANÁLISE DE PERFIL + TENDÊNCIA (INALTERADOS)
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
    SOBREPESO: { foco: "RECOMPOSIÇÃO", volume: "MODERADO_ALTO", intensidade: "MODERADA", metodos: ["AGONISTA_ANTAGONISTA"] },
    NORMAL: { foco: "HIPERTROFIA", volume: "MODERADO", intensidade: "ALTA", metodos: ["PIRÂMIDE", "REST_PAUSE"] },
    DEFINIDO: { foco: "FORÇA", volume: "BAIXO", intensidade: "MUITO_ALTA", metodos: ["CLUSTER_SETS", "EXCÊNTRICO"] },
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
  return { perfilMetabolico, estrategia: estrategias[perfilMetabolico], contraindicacoes };
}

function calcularTendencia(avaliacoes) {
  if (avaliacoes.length < 2) return { status: "Primeira avaliação", cor: "#B0B0B0", icone: "🆕" };
  const ultima = avaliacoes[avaliacoes.length - 1];
  const anterior = avaliacoes[avaliacoes.length - 2];
  const imcAtual = n(ultima?.resultado?.imc);
  const imcAnt = n(anterior?.resultado?.imc);
  const gordAtual = n(ultima?.resultado?.gordura3);
  const gordAnt = n(anterior?.resultado?.gordura3);
  const diffIMC = imcAtual - imcAnt;
  const diffGord = gordAtual - gordAnt;
  if (diffIMC < -0.3 || diffGord < -1) return { status: "Melhorando", cor: "#00E5FF", icone: "📈" };
  if (diffIMC > 0.3 || diffGord > 1) return { status: "Atenção", cor: "#FF5722", icone: "⚠️" };
  return { status: "Estável", cor: "#FF8A50", icone: "📊" };
}

// ============================================
// GERADOR DE TREINO INTELIGENTE NÍVEL PRO (INALTERADO)
// ============================================
function gerarTreinoInteligente({ aluno, avaliacao, modalidade, objetivo, nivel, dias, rm }) {
  const perfil = analisarPerfil(aluno, avaliacao);
  const imc = avaliacao ? n(avaliacao.resultado?.imc) : 0;
  const gordura = avaliacao ? n(avaliacao.resultado?.gordura3) : 0;

  if (objetivo === "Emagrecimento") perfil.estrategia = { foco: "EMAGRECIMENTO", volume: "ALTO", intensidade: "MODERADA", metodos: ["CIRCUITO", "DROPSET"] };
  if (objetivo === "Força") perfil.estrategia = { foco: "FORÇA", volume: "BAIXO", intensidade: "MUITO_ALTA", metodos: ["CLUSTER_SETS", "EXCÊNTRICO"] };
  if (objetivo === "Resistência") perfil.estrategia = { foco: "RESISTÊNCIA", volume: "ALTO", intensidade: "BAIXA", metodos: ["BISET", "TRI_SET"] };

  const volumes = {
    Iniciante: { series: 3, reps: "10-12", descanso: "60s" },
    Intermediário: { series: 4, reps: "8-10", descanso: "75s" },
    Avançado: { series: 5, reps: "4-8", descanso: "90-180s" },
  };
  const v = volumes[nivel] || volumes.Intermediário;
  const fatorVolume = perfil.estrategia.volume === "ALTO" ? 1.5 : perfil.estrategia.volume === "BAIXO" ? 0.7 : 1;
  const seriesAjustadas = Math.round(v.series * fatorVolume);

  const biblioteca = {
    powerlifting: {
      nome: "Powerlifting — Periodização Sheiko Pro",
      descricao: "Ciclo de 4 semanas com ondas de intensidade progressiva",
      semanas: [
        { semana: 1, fase: "Preparatória", agachamento: { pct: 0.65, series: 5, reps: 5 }, supino: { pct: 0.60, series: 5, reps: 5 }, terra: { pct: 0.65, series: 4, reps: 5 } },
        { semana: 2, fase: "Carga", agachamento: { pct: 0.72, series: 5, reps: 4 }, supino: { pct: 0.67, series: 5, reps: 4 }, terra: { pct: 0.72, series: 4, reps: 4 } },
        { semana: 3, fase: "Choque", agachamento: { pct: 0.80, series: 4, reps: 3 }, supino: { pct: 0.75, series: 4, reps: 3 }, terra: { pct: 0.80, series: 3, reps: 3 } },
        { semana: 4, fase: "Pico Técnico", agachamento: { pct: 0.87, series: 3, reps: 2 }, supino: { pct: 0.82, series: 3, reps: 2 }, terra: { pct: 0.87, series: 2, reps: 2 } },
      ],
      exercicios: ["Agachamento livre", "Supino reto", "Levantamento terra", "Agachamento com pausa", "Supino fechado", "Remada curvada"],
      lifts: ["agachamento", "supino", "terra"],
    },
    musculacao: {
      nome: "Musculação — Hipertrofia Inteligente",
      descricao: "Periodização ondulatória com foco em volume e densidade",
      semanas: [
        { semana: 1, fase: "Acúmulo", pct: 0.65, series: 4, reps: "10-12", volume: "4x10-12" },
        { semana: 2, fase: "Intensificação", pct: 0.72, series: 4, reps: "8-10", volume: "4x8-10" },
        { semana: 3, fase: "Choque", pct: 0.78, series: 3, reps: "6-8", volume: "3x6-8" },
        { semana: 4, fase: "Supercompensação", pct: 0.60, series: 3, reps: "12-15", volume: "3x12-15" },
      ],
      exercicios: ["Supino inclinado", "Agachamento", "Remada baixa", "Desenvolvimento", "Stiff", "Rosca direta", "Tríceps corda"],
      lifts: ["principal"],
    },
    bodybuilding: {
      nome: "Bodybuilder — Volume & Métodos Avançados",
      descricao: "Alta densidade com drop-set, rest-pause e FST-7",
      semanas: [
        { semana: 1, fase: "Volume", pct: 0.68, series: 4, reps: "10", volume: "4x10" },
        { semana: 2, fase: "Drop Set", pct: 0.70, series: 3, reps: "8 + drop", volume: "3x8+d" },
        { semana: 3, fase: "Rest-Pause", pct: 0.75, series: 3, reps: "6+RP", volume: "3x6+r" },
        { semana: 4, fase: "FST-7", pct: 0.60, series: 7, reps: "10-12", volume: "7x10-12" },
      ],
      exercicios: ["Supino máquina", "Crossover", "Hack squat", "Cadeira extensora", "Mesa flexora", "Elevação lateral", "Pulldown"],
      lifts: ["principal"],
    },
    beachTennis: {
      nome: "Beach Tennis — Potência & Lateralidade",
      descricao: "Foco em agilidade lateral, core e potência de membros inferiores",
      semanas: [
        { semana: 1, fase: "Base Coord.", pct: 0.55, series: 3, reps: "12", volume: "3x12" },
        { semana: 2, fase: "Potência", pct: 0.65, series: 4, reps: "6", volume: "4x6" },
        { semana: 3, fase: "Reação", pct: 0.70, series: 4, reps: "4", volume: "4x4" },
        { semana: 4, fase: "Transferência", pct: 0.60, series: 3, reps: "8 rápido", volume: "3x8" },
      ],
      exercicios: ["Deslocamento lateral", "Core anti-rotação", "Salto lateral", "Lunge rotacional", "Sprint curto", "Remada elástica"],
      lifts: ["principal"],
    },
    futebol: {
      nome: "Futebol — Força, Potência & Prevenção",
      descricao: "Periodização tática com ênfase em posterior de coxa e sprints",
      semanas: [
        { semana: 1, fase: "Base Aeróbia", pct: 0.60, series: 3, reps: "10", volume: "3x10" },
        { semana: 2, fase: "Força Explosiva", pct: 0.75, series: 4, reps: "5", volume: "4x5" },
        { semana: 3, fase: "Velocidade", pct: 0.80, series: 3, reps: "3", volume: "3x3" },
        { semana: 4, fase: "Transferência", pct: 0.65, series: 3, reps: "6 rápido", volume: "3x6" },
      ],
      exercicios: ["Agachamento", "Stiff", "Posterior nórdico", "Sprint 20m", "Mudança de direção", "Pliometria caixa"],
      lifts: ["principal"],
    },
    gestante: {
      nome: "Gestantes — Segurança & Mobilidade",
      descricao: "Fortalecimento leve com foco em mobilidade pélvica e core",
      semanas: [
        { semana: 1, fase: "Adaptação", pct: 0.40, series: 2, reps: "15", volume: "2x15" },
        { semana: 2, fase: "Fortalecimento", pct: 0.45, series: 3, reps: "12", volume: "3x12" },
        { semana: 3, fase: "Manutenção", pct: 0.50, series: 3, reps: "10", volume: "3x10" },
        { semana: 4, fase: "Recuperação", pct: 0.40, series: 2, reps: "12", volume: "2x12" },
      ],
      exercicios: ["Mobilidade pélvica", "Agachamento sumô leve", "Remada elástica", "Elevação pélvica", "Respiração diafragmática", "Caminhada leve"],
      lifts: ["principal"],
    },
  };

  const plano = biblioteca[modalidade] || biblioteca.musculacao;

  let exerciciosFiltrados = plano.exercicios;
  if (perfil.contraindicacoes?.length > 0) {
    exerciciosFiltrados = plano.exercicios.filter(ex => {
      const nome = ex.toLowerCase();
      if (perfil.contraindicacoes.includes("EVITAR_AGACHAMENTO_PROFUNDO") && nome.includes("agachamento")) return false;
      if (perfil.contraindicacoes.includes("EVITAR_TERRA_PESADO") && (nome.includes("terra") || nome.includes("stiff"))) return false;
      if (perfil.contraindicacoes.includes("EVITAR_SUPINO_PESADO") && nome.includes("supino")) return false;
      if (perfil.contraindicacoes.includes("EVITAR_BOM_DIA") && nome.includes("bom dia")) return false;
      return true;
    });
  }
  if (exerciciosFiltrados.length === 0) exerciciosFiltrados = ["Caminhada leve", "Mobilidade articular", "Alongamento ativo"];

  const tonelagemSemanal = plano.semanas.map(s => {
    const totalSeries = modalidade === "powerlifting"
      ? (s.agachamento?.series || 0) + (s.supino?.series || 0) + (s.terra?.series || 0)
      : s.series || 4;
    const repsMedio = modalidade === "powerlifting"
      ? Math.round(((s.agachamento?.reps || 5) + (s.supino?.reps || 5) + (s.terra?.reps || 5)) / 3)
      : parseInt(String(s.reps).split("-")[0]) || 8;
    const cargaEstimada = Math.round(n(rm) * (modalidade === "powerlifting"
      ? ((s.agachamento?.pct || 0.65) + (s.supino?.pct || 0.60) + (s.terra?.pct || 0.65)) / 3
      : s.pct || 0.65));
    return Math.round(totalSeries * repsMedio * cargaEstimada * (modalidade === "powerlifting" ? 3 : exerciciosFiltrados.length));
  });

  const observacoes = [];
  if (imc >= 30) observacoes.push("⚠️ IMC elevado: circuito + cardio moderado. Reduzir impacto articular.");
  if (gordura >= 25) observacoes.push("⚠️ Gordura elevada: priorizar densidade metabólica (drop-set, circuito).");
  if (aluno?.lesao) observacoes.push(`🩺 Lesão: ${aluno.lesao}. Exercícios adaptados automaticamente.`);
  if (perfil.estrategia.metodos.length > 0) observacoes.push(`💡 Métodos: ${perfil.estrategia.metodos.join(", ")}`);
  observacoes.push(`🎯 Objetivo: ${objetivo} | Perfil: ${perfil.perfilMetabolico}`);
  if (modalidade === "powerlifting") {
    observacoes.push("🏋️ Equipamentos: barra olímpica, anilhas, gaiola, banco de supino, monolift.");
    observacoes.push(`📊 Tonelagem total estimada do ciclo: ${tonelagemSemanal.reduce((a, b) => a + b, 0).toLocaleString("pt-BR")} kg`);
  }

  const semanas = plano.semanas.map((s, i) => ({
    ...s,
    tonelagem: tonelagemSemanal[i] || 0,
    carga: modalidade === "gestante" ? "Leve / RPE 5-6" : `${Math.round(n(rm) * (s.pct || s.agachamento?.pct || 0.65))} kg`,
    detalhes: modalidade === "powerlifting" ? {
      agachamento: `${Math.round(n(rm) * (s.agachamento?.pct || 0.65))} kg ${s.agachamento?.series}x${s.agachamento?.reps}`,
      supino: `${Math.round(n(rm) * (s.supino?.pct || 0.60) * 0.85)} kg ${s.supino?.series}x${s.supino?.reps}`,
      terra: `${Math.round(n(rm) * (s.terra?.pct || 0.65) * 0.9)} kg ${s.terra?.series}x${s.terra?.reps}`,
    } : null,
  }));

  const diasSemana = Array.from({ length: Number(dias) || 3 }, (_, i) => ({
    dia: `Dia ${i + 1}`,
    foco: ["Empurrar", "Puxar", "Pernas", "Potência", "Condicionamento"][i % 5],
    exercicios: exerciciosFiltrados.slice(0, 5).map((ex) => ({ nome: ex, series: seriesAjustadas, reps: v.reps, descanso: v.descanso })),
  }));

  const progressao = {
    tipo: objetivo === "Força" ? "Carga linear" : objetivo === "Emagrecimento" ? "Densidade progressiva" : "Ondulatória",
    incrementoSemanal: objetivo === "Força" ? "+2.5% a 5% por semana" : "+1-2 reps ou -5s descanso",
    deload: "Semana 4 (regenerativa)",
  };

  return {
    id: Date.now(),
    alunoId: aluno?.id,
    alunoNome: aluno?.nome || "Sem aluno",
    modalidade,
    objetivo,
    nivel,
    data: new Date().toLocaleDateString("pt-BR"),
    nome: plano.nome,
    descricao: plano.descricao || "",
    semanas,
    diasSemana,
    tonelagemSemanal,
    progressao,
    observacoes,
    perfil: { metabolico: perfil.perfilMetabolico, estrategia: perfil.estrategia.foco },
  };
}

function imprimirTreinoPDF(treino, aluno, avaliacao) {
  const w = window.open("", "_blank", "width=800,height=600");
  w.document.write("<html><head><meta charset='UTF-8'><style>");
  w.document.write("body{font-family:Arial;background:#fff;color:#1e293b;padding:30px}");
  w.document.write("h1{color:#0f172a}h2{color:#334155;margin-top:20px}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #cbd5e1;padding:10px}th{background:#f1f5f9}");
  w.document.write(".ton{background:#e0f2fe;padding:8px;border-radius:8px;margin:10px 0}");
  w.document.write("</style></head><body>");
  w.document.write(`<h1>fitcontrol — Ficha de Treino</h1>`);
  w.document.write(`<p><strong>Aluno:</strong> ${aluno?.nome||"N/A"}</p>`);
  w.document.write(`<p>${treino?.modalidade} | ${treino?.objetivo} | ${treino?.nivel} | ${treino?.data}</p>`);
  if (treino?.tonelagemSemanal) w.document.write(`<div class="ton">📊 Tonelagem total: ${treino.tonelagemSemanal.reduce((a,b)=>a+b,0).toLocaleString("pt-BR")} kg</div>`);
  treino?.semanas?.forEach(s => w.document.write(`<div>Sem.${s.semana}: ${s.fase} - ${s.volume||s.carga} (${s.tonelagem?.toLocaleString("pt-BR")||0} kg)</div>`));
  treino?.diasSemana?.forEach(d => {
    w.document.write(`<h3>${d.dia} — ${d.foco}</h3><table><tr><th>Exercício</th><th>Séries</th><th>Reps</th><th>Descanso</th></tr>`);
    d.exercicios.forEach(e => w.document.write(`<tr><td>${e.nome}</td><td>${e.series}</td><td>${e.reps}</td><td>${e.descanso}</td></tr>`));
    w.document.write("</table>");
  });
  if (avaliacao) w.document.write(`<p>IMC: ${avaliacao.resultado?.imc?.toFixed(2)} | %G: ${avaliacao.resultado?.gordura3?.toFixed(1)} | RCQ: ${avaliacao.resultado?.rcq?.toFixed(2)}</p>`);
  w.document.write("<script>window.print()</script></body></html>");
  w.document.close();
}

// ============================================
// COMPONENTES VISUAIS (ATUALIZADOS COM NOVA PALETA)
// ============================================
function AppButton({ children, onClick, variant = "primary", style = {} }) {
  const base = variant === "danger" ? styles.dangerBtn : variant === "small" ? styles.smallBtn : styles.primaryBtn;
  return <button style={{ ...base, ...style }} onClick={onClick} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0) scale(1)"}>{children}</button>;
}

function Card({ title, value, cor, icone }) {
  return (
    <div style={{ ...styles.card, borderLeft: cor ? `4px solid ${cor}` : "1px solid rgba(0,229,255,0.15)" }}>
      <p style={styles.muted}>{icone ? `${icone} ${title}` : title}</p>
      <h2 style={cor ? { color: cor } : {}}>{value}</h2>
    </div>
  );
}

function FileInput({ label, onChange }) {
  return <div style={styles.card}><p>{label}</p><input type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0])} /></div>;
}

function TreinoView({ treino, onExcluir, onExportar, onCSV }) {
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h3>{treino.nome}</h3>
          <p style={styles.muted}>{treino.descricao}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AppButton variant="small" onClick={() => onExportar(treino)}>📄 PDF</AppButton>
          <AppButton variant="small" onClick={() => onCSV(treino)}>📊 CSV</AppButton>
          <AppButton variant="danger" onClick={() => onExcluir(treino.id)}>🗑️</AppButton>
        </div>
      </div>
      <p style={styles.muted}>{treino.data} • {treino.modalidade} • {treino.nivel} • {treino.objetivo}</p>
      {treino.tonelagemSemanal && (
        <div style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 12, padding: 12, margin: "10px 0" }}>
          <strong style={{ color: "#00E5FF" }}>📊 Tonelagem Total: {treino.tonelagemSemanal.reduce((a, b) => a + b, 0).toLocaleString("pt-BR")} kg</strong>
        </div>
      )}
      {treino.observacoes?.map((o, i) => <p key={i} style={{ color: "#FF8A50" }}>⚠️ {o}</p>)}
      {treino.progressao && (
        <p style={{ color: "#00E5FF", fontSize: 13 }}>📈 Progressão: {treino.progressao.tipo} — {treino.progressao.incrementoSemanal}</p>
      )}
      <h4>Periodização</h4>
      <div style={styles.grid4}>
        {treino.semanas.map((s) => (
          <div key={s.semana} style={styles.miniCard}>
            <strong>Sem. {s.semana}</strong>
            <small>{s.fase}</small>
            <small>{s.volume || `${Math.round(n(s.carga?.replace("kg","")))} kg`}</small>
            <small style={{ color: "#00E5FF" }}>{s.tonelagem?.toLocaleString("pt-BR")} kg</small>
            {s.detalhes && (
              <div style={{ fontSize: 10, color: "#B0B0B0", marginTop: 4 }}>
                {Object.entries(s.detalhes).map(([k, v]) => <div key={k}>{k}: {v}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>
      <h4>Dias de treino</h4>
      {treino.diasSemana.map((d) => (
        <div key={d.dia} style={styles.miniCard}>
          <strong>{d.dia} — {d.foco}</strong>
          {d.exercicios.map((e, i) => <small key={i}>{e.nome} — {e.series}x {e.reps} — {e.descanso}</small>)}
        </div>
      ))}
    </div>
  );
}

// ============================================
// GRÁFICOS INTERATIVOS (ATUALIZADOS COM NOVA PALETA)
// ============================================
function GraficoEvolucao({ dados, metrica, cor, titulo }) {
  if (!dados || dados.length < 2) return <p style={styles.muted}>Adicione mais avaliações para ver evolução.</p>;
  const chartData = dados.map(d => ({ data: d.data?.substring(0, 5) || "?", valor: n(d.resultado?.[metrica]) }));
  return (
    <div style={styles.chartCard}>
      <h3 style={{ marginTop: 0, color: "#FFFFFF" }}>{titulo || `📈 Evolução de ${metrica}`}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`grad${metrica}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={cor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
          <XAxis dataKey="data" stroke="#B0B0B0" tick={{ fontSize: 12 }} />
          <YAxis stroke="#B0B0B0" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "#121820", border: "1px solid #00E5FF", borderRadius: 12, color: "#FFFFFF" }} />
          <Area type="monotone" dataKey="valor" stroke={cor} strokeWidth={3} fill={`url(#grad${metrica})`} dot={{ r: 5, strokeWidth: 2, fill: cor }} activeDot={{ r: 8 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficoRadar({ avaliacao }) {
  if (!avaliacao) return null;
  const data = [
    { name: "IMC", valor: Math.min(n(avaliacao.resultado?.imc), 40), max: 40 },
    { name: "% Gord", valor: Math.min(n(avaliacao.resultado?.gordura3), 40), max: 40 },
    { name: "RCQx100", valor: Math.min(n(avaliacao.resultado?.rcq) * 100, 100), max: 100 },
    { name: "Endo", valor: Math.min(n(avaliacao.resultado?.somatotipo?.endomorfia) * 2, 30), max: 30 },
    { name: "Meso", valor: Math.min(n(avaliacao.resultado?.somatotipo?.mesomorfia) * 2, 30), max: 30 },
    { name: "Ecto", valor: Math.min(n(avaliacao.resultado?.somatotipo?.ectomorfia) * 3, 30), max: 30 },
  ];
  return (
    <div style={styles.chartCard}>
      <h3 style={{ marginTop: 0, color: "#FFFFFF" }}>🎯 Perfil do Aluno</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart outerRadius={120} data={data}>
          <PolarGrid stroke="rgba(0,229,255,0.15)" />
          <PolarAngleAxis dataKey="name" stroke="#B0B0B0" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis stroke="rgba(0,229,255,0.1)" tick={false} axisLine={false} />
          <Radar name="Aluno" dataKey="valor" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.3} strokeWidth={2} dot={{ r: 3 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficoComparacao({ avaliacoes }) {
  if (!avaliacoes || avaliacoes.length < 2) return null;
  const atuais = avaliacoes[avaliacoes.length - 1];
  const anteriores = avaliacoes[avaliacoes.length - 2];
  const dados = [
    { name: "IMC", Atual: n(atuais.resultado?.imc)?.toFixed(1) || 0, Anterior: n(anteriores.resultado?.imc)?.toFixed(1) || 0 },
    { name: "%Gord", Atual: n(atuais.resultado?.gordura3)?.toFixed(1) || 0, Anterior: n(anteriores.resultado?.gordura3)?.toFixed(1) || 0 },
    { name: "RCQ", Atual: n(atuais.resultado?.rcq)?.toFixed(2) || 0, Anterior: n(anteriores.resultado?.rcq)?.toFixed(2) || 0 },
  ];
  return (
    <div style={styles.chartCard}>
      <h3 style={{ marginTop: 0, color: "#FFFFFF" }}>📊 Comparativo Últimas Avaliações</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dados} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
          <XAxis dataKey="name" stroke="#B0B0B0" />
          <YAxis stroke="#B0B0B0" />
          <Tooltip contentStyle={{ background: "#121820", border: "1px solid #00E5FF", borderRadius: 12, color: "#FFFFFF" }} />
          <Legend />
          <Bar dataKey="Atual" fill="#00E5FF" radius={[10, 10, 0, 0]} />
          <Bar dataKey="Anterior" fill="#334155" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficoForca({ treinos }) {
  if (!treinos || treinos.length === 0) return null;
  const dados = treinos.slice(-6).map(t => ({
    data: t.data?.substring(0, 5) || "?",
    tonelagem: t.tonelagemSemanal ? t.tonelagemSemanal.reduce((a, b) => a + b, 0) / 1000 : 0,
  }));
  return (
    <div style={styles.chartCard}>
      <h3 style={{ marginTop: 0, color: "#FFFFFF" }}>💪 Evolução de Força (Tonelagem)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,87,34,0.1)" />
          <XAxis dataKey="data" stroke="#B0B0B0" />
          <YAxis stroke="#B0B0B0" />
          <Tooltip contentStyle={{ background: "#121820", border: "1px solid #FF5722", borderRadius: 12, color: "#FFFFFF" }} />
          <Bar dataKey="tonelagem" fill="#FF5722" radius={[8, 8, 0, 0]} name="Ton (x1000 kg)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// APP PRINCIPAL
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
  const [tabPerfil, setTabPerfil] = useState("dashboard");
  const [editandoAluno, setEditandoAluno] = useState(null);
  const [novoAluno, setNovoAluno] = useState({ nome: "", telefone: "", modalidadePrincipal: "musculacao", objetivo: "Hipertrofia", lesao: "" });
  const [avaliacao, setAvaliacao] = useState({
    alunoId: "", sexo: "Masculino", idade: "", peso: "", altura: "", cintura: "", quadril: "",
    triceps: "", subescapular: "", peitoral: "", abdominal: "", suprailiaca: "", coxa: "", axilar: "",
    fotoFrontal: "", fotoLateral: "", fotoPosterior: "",
  });
  const [configTreino, setConfigTreino] = useState({ alunoId: "", modalidade: "musculacao", objetivo: "Hipertrofia", nivel: "Intermediário", dias: 3, cargaTeste: "", repsTeste: "", rmManual: "" });

  useEffect(() => salvarLS(LS_KEYS.alunos, alunos), [alunos]);
  useEffect(() => salvarLS(LS_KEYS.avaliacoes, avaliacoes), [avaliacoes]);
  useEffect(() => salvarLS(LS_KEYS.treinos, treinos), [treinos]);

  const alunoSelecionado = alunos.find(a => String(a.id) === String(alunoSelecionadoId));
  const avaliacoesAluno = avaliacoes.filter(a => String(a.alunoId) === String(alunoSelecionadoId)).sort((a, b) => a.id - b.id);
  const ultimaAvaliacaoAluno = avaliacoesAluno[avaliacoesAluno.length - 1];
  const treinosAluno = treinos.filter(t => String(t.alunoId) === String(alunoSelecionadoId));
  const tendencia = calcularTendencia(avaliacoesAluno);

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
    if (!confirm("Apagar TODOS os dados?")) return;
    localStorage.removeItem(LS_KEYS.alunos); localStorage.removeItem(LS_KEYS.avaliacoes); localStorage.removeItem(LS_KEYS.treinos);
    setAlunos([]); setAvaliacoes([]); setTreinos([]); setAlunoSelecionadoId("");
  }

  function adicionarAluno() {
    if (!novoAluno.nome.trim()) return alert("Informe o nome.");
    const novo = { id: Date.now(), ...novoAluno, dataCadastro: new Date().toLocaleDateString("pt-BR") };
    setAlunos([...alunos, novo]);
    setNovoAluno({ nome: "", telefone: "", modalidadePrincipal: "musculacao", objetivo: "Hipertrofia", lesao: "" });
    setAlunoSelecionadoId(String(novo.id)); setPagina("perfil");
  }

  function iniciarEdicaoAluno(a) { setEditandoAluno({ ...a }); }
  function salvarEdicaoAluno() {
    if (!editandoAluno?.nome?.trim()) return alert("Nome obrigatório.");
    setAlunos(alunos.map(a => a.id === editandoAluno.id ? editandoAluno : a));
    setEditandoAluno(null);
  }

  function removerAluno(id) {
    if (!confirm("Excluir aluno e vínculos?")) return;
    setAlunos(alunos.filter(a => a.id !== id));
    setAvaliacoes(avaliacoes.filter(a => a.alunoId !== id));
    setTreinos(treinos.filter(t => t.alunoId !== id));
    setAlunoSelecionadoId("");
  }

  function excluirAvaliacao(id) { if (confirm("Excluir avaliação?")) setAvaliacoes(avaliacoes.filter(a => a.id !== id)); }
  function excluirTreino(id) { if (confirm("Excluir treino?")) setTreinos(treinos.filter(t => t.id !== id)); }

  function exportarTreinoCSV(treino) {
    const linhas = ["Dia;Foco;Exercício;Séries;Reps;Descanso"];
    treino.diasSemana.forEach(d => d.exercicios.forEach(e => linhas.push(`${d.dia};${d.foco};${e.nome};${e.series};${e.reps};${e.descanso}`)));
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `treino_${treino.alunoNome}.csv`; a.click();
  }

  function salvarFoto(campo, file) {
    if (!file) return;
    const r = new FileReader(); r.onload = () => setAvaliacao({ ...avaliacao, [campo]: r.result }); r.readAsDataURL(file);
  }

  function salvarAvaliacao() {
    if (!avaliacao.alunoId) return alert("Selecione aluno.");
    if (!avaliacao.peso || !avaliacao.altura) return alert("Preencha peso e altura.");
    const a = alunos.find(x => String(x.id) === String(avaliacao.alunoId));
    setAvaliacoes([...avaliacoes, { id: Date.now(), alunoId: Number(avaliacao.alunoId), alunoNome: a?.nome || "", data: new Date().toLocaleDateString("pt-BR"), ...avaliacao, resultado: resultadoAvaliacao }]);
    setAlunoSelecionadoId(String(avaliacao.alunoId));
    setConfigTreino({ ...configTreino, alunoId: String(avaliacao.alunoId), modalidade: a?.modalidadePrincipal || "musculacao", objetivo: a?.objetivo || "Hipertrofia" });
    setPagina("perfil");
  }

  function gerarTreino() {
    if (!configTreino.alunoId) return alert("Selecione aluno.");
    const a = alunos.find(x => String(x.id) === String(configTreino.alunoId));
    const ult = avaliacoes.filter(x => String(x.alunoId) === String(configTreino.alunoId)).slice(-1)[0];
    const rm = n(configTreino.rmManual) || calcular1RM(configTreino.cargaTeste, configTreino.repsTeste) || 100;
    const t = gerarTreinoInteligente({ aluno: a, avaliacao: ult, modalidade: configTreino.modalidade, objetivo: configTreino.objetivo, nivel: configTreino.nivel, dias: configTreino.dias, rm });
    setTreinos([...treinos, t]); setAlunoSelecionadoId(String(configTreino.alunoId)); setPagina("perfil"); setTabPerfil("treinos");
  }

  function exportarCSV() {
    const linhas = ["Aluno;Data;Tipo;Resumo", ...avaliacoes.map(a => `${a.alunoNome};${a.data};Avaliação;IMC ${a.resultado.imc.toFixed(2)}`), ...treinos.map(t => `${t.alunoNome};${t.data};Treino;${t.nome}`)];
    const b = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "fitcontrol.csv"; a.click();
  }

  // ============================================
  // TELA DE LOGIN (NOVA IDENTIDADE VISUAL)
  // ============================================
  if (!logado) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "2rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #00E5FF, #FF5722)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.25rem",
          }}>
            fitcontrol
          </div>
          <div style={styles.tagline}>FIND YOUR STRENGTH</div>

          <div style={{ marginBottom: "1.2rem", textAlign: "left" }}>
            <input
              style={{ ...styles.input, background: "#1C1E2A", border: "1px solid #334155", marginBottom: "1rem" }}
              placeholder="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "1.2rem", textAlign: "left" }}>
            <input
              style={{ ...styles.input, background: "#1C1E2A", border: "1px solid #334155", marginBottom: 0 }}
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>

          {erro && <p style={{ color: "#E64A19", fontWeight: 700, marginBottom: "0.5rem" }}>{erro}</p>}

          <button
            style={{
              width: "100%", padding: "0.9rem", marginTop: "1.8rem", marginBottom: "1rem",
              background: "#FF5722", border: "none", borderRadius: "0.75rem",
              fontWeight: 600, fontSize: "1.1rem", color: "#FFFFFF", cursor: "pointer",
              letterSpacing: "1px", transition: "background 0.2s",
            }}
            onClick={login}
            onMouseEnter={(e) => (e.target.style.background = "#E64A19")}
            onMouseLeave={(e) => (e.target.style.background = "#FF5722")}
          >
            ENTRAR
          </button>

          <p style={{ color: "#B0B0B0", fontSize: "0.9rem", margin: "1.2rem 0", lineHeight: 1.5 }}>
            Sistema profissional de treino, avaliação e evolução
          </p>
          <p style={{ color: "#B0B0B0", fontSize: "0.8rem", marginTop: "1.5rem", letterSpacing: "0.5px", opacity: 0.6 }}>
            Desde 2018 • Treinamento profissional
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // APP LOGADO
  // ============================================
  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          background: "linear-gradient(135deg, #00E5FF, #FF5722)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 6,
        }}>
          fitcontrol
        </div>
        <p style={styles.sidebarSub}>Pro Training System</p>
        {[["dashboard","📊 Dashboard"],["alunos","👥 Alunos"],["perfil","🧍 Perfil"],["avaliacao","📋 Avaliação"],["treino","🏋️ Treinos"],["relatorios","📁 Relatórios"]].map(([k,l]) => (
          <button key={k} onClick={() => setPagina(k)} style={pagina === k ? styles.navActive : styles.navBtn}>{l}</button>
        ))}
        <AppButton variant="danger" onClick={() => setLogado(false)} style={{ marginTop: "auto" }}>Sair</AppButton>
        <AppButton variant="small" onClick={limparDados}>🧹 Limpar</AppButton>
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              background: "linear-gradient(135deg, #00E5FF, #FF5722)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>fitcontrol</span>
            <span style={{ color: "#B0B0B0", fontSize: 14 }}>| Aluno: {alunoSelecionado?.nome || "Nenhum"}</span>
          </div>
          <AppButton onClick={() => setPagina("treino")}>+ Gerar treino</AppButton>
        </div>

        {pagina === "dashboard" && (
          <>
            <div style={styles.grid4}>
              <Card title="Alunos" value={alunos.length} />
              <Card title="Avaliações" value={avaliacoes.length} />
              <Card title="Treinos" value={treinos.length} />
              <Card title="Modalidades" value="6" />
            </div>
            <GraficoEvolucao dados={avaliacoes} metrica="imc" cor="#00E5FF" titulo="📈 Evolução de IMC (Geral)" />
            <GraficoEvolucao dados={avaliacoes.filter(a => a.resultado?.gordura3)} metrica="gordura3" cor="#FF5722" titulo="📈 Evolução de % Gordura (Geral)" />
          </>
        )}

        {pagina === "alunos" && (
          <>
            <section style={styles.panel}>
              <h2>Novo aluno</h2>
              <div style={styles.grid2}>
                <input style={styles.input} placeholder="Nome" value={novoAluno.nome} onChange={e => setNovoAluno({ ...novoAluno, nome: e.target.value })} />
                <input style={styles.input} placeholder="Telefone" value={novoAluno.telefone} onChange={e => setNovoAluno({ ...novoAluno, telefone: e.target.value })} />
                <select style={styles.input} value={novoAluno.modalidadePrincipal} onChange={e => setNovoAluno({ ...novoAluno, modalidadePrincipal: e.target.value })}>
                  <option value="musculacao">Musculação</option><option value="bodybuilding">Bodybuilder</option><option value="powerlifting">Powerlifting</option><option value="beachTennis">Beach Tennis</option><option value="futebol">Futebol</option><option value="gestante">Gestante</option>
                </select>
                <select style={styles.input} value={novoAluno.objetivo} onChange={e => setNovoAluno({ ...novoAluno, objetivo: e.target.value })}>
                  <option>Hipertrofia</option><option>Emagrecimento</option><option>Força</option><option>Resistência</option><option>Condicionamento</option><option>Performance</option>
                </select>
              </div>
              <input style={styles.input} placeholder="Lesões / restrições" value={novoAluno.lesao} onChange={e => setNovoAluno({ ...novoAluno, lesao: e.target.value })} />
              <AppButton onClick={adicionarAluno}>Adicionar</AppButton>
            </section>
            <section style={styles.panel}>
              <h2>Lista de alunos</h2>
              {alunos.length === 0 && <p style={styles.muted}>Nenhum aluno.</p>}
              {alunos.map(a => (
                <div key={a.id} style={styles.row}>
                  <div onClick={() => { setAlunoSelecionadoId(String(a.id)); setPagina("perfil"); }} style={{ cursor: "pointer" }}><strong>{a.nome}</strong><br /><small style={styles.muted}>{a.modalidadePrincipal} • {a.objetivo}</small></div>
                  <div style={{ display: "flex", gap: 8 }}><AppButton variant="small" onClick={() => iniciarEdicaoAluno(a)}>✏️</AppButton><AppButton variant="danger" onClick={() => removerAluno(a.id)}>Excluir</AppButton></div>
                </div>
              ))}
            </section>
          </>
        )}

        {editandoAluno && (
          <div style={styles.modalOverlay} onClick={() => setEditandoAluno(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2>Editar aluno</h2>
              <div style={styles.grid2}>
                <input style={styles.input} value={editandoAluno.nome} onChange={e => setEditandoAluno({ ...editandoAluno, nome: e.target.value })} />
                <input style={styles.input} value={editandoAluno.telefone} onChange={e => setEditandoAluno({ ...editandoAluno, telefone: e.target.value })} />
              </div>
              <input style={styles.input} value={editandoAluno.lesao} onChange={e => setEditandoAluno({ ...editandoAluno, lesao: e.target.value })} />
              <div style={{ display: "flex", gap: 10 }}><AppButton onClick={salvarEdicaoAluno}>Salvar</AppButton><AppButton variant="danger" onClick={() => setEditandoAluno(null)}>Cancelar</AppButton></div>
            </div>
          </div>
        )}

        {pagina === "perfil" && (
          <>
            {!alunoSelecionado && <p style={styles.muted}>Selecione um aluno na tela Alunos.</p>}
            {alunoSelecionado && (
              <>
                <section style={styles.heroCard}>
                  <div>
                    <h2>{alunoSelecionado.nome}</h2>
                    <p style={styles.muted}>{alunoSelecionado.telefone||"Sem telefone"} • {alunoSelecionado.modalidadePrincipal}</p>
                    <p>Objetivo: <strong>{alunoSelecionado.objetivo}</strong></p>
                    {alunoSelecionado.lesao && <p>Restrição: <strong>{alunoSelecionado.lesao}</strong></p>}
                    <p style={{ color: tendencia.cor, fontWeight: "bold" }}>{tendencia.icone} Tendência: {tendencia.status}</p>
                  </div>
                  <AppButton variant="small" onClick={() => iniciarEdicaoAluno(alunoSelecionado)}>✏️ Editar</AppButton>
                </section>

                {ultimaAvaliacaoAluno && (
                  <div style={styles.grid4} key="metricas">
                    <Card title="Último IMC" value={ultimaAvaliacaoAluno.resultado?.imc?.toFixed(2)} cor={corIMC(ultimaAvaliacaoAluno.resultado?.imc)} />
                    <Card title="Última Gordura" value={`${ultimaAvaliacaoAluno.resultado?.gordura3?.toFixed(1)}%`} cor={corGordura(ultimaAvaliacaoAluno.resultado?.gordura3)} />
                    <Card title="RCQ" value={ultimaAvaliacaoAluno.resultado?.rcq?.toFixed(2)} />
                    <Card title="Treinos" value={treinosAluno.length} icone="🏋️" />
                    <Card title="Avaliações" value={avaliacoesAluno.length} icone="📋" />
                  </div>
                )}

                <div style={styles.tabs}>
                  {["dashboard", "avaliacoes", "treinos", "fotos"].map(tab => (
                    <button key={tab} style={tabPerfil === tab ? styles.tabActive : styles.tab} onClick={() => setTabPerfil(tab)}>
                      {tab === "dashboard" ? "📊 Dashboard" : tab === "avaliacoes" ? "📋 Avaliações" : tab === "treinos" ? "🏋️ Treinos" : "📷 Fotos"}
                    </button>
                  ))}
                </div>

                {tabPerfil === "dashboard" && (
                  <>
                    {avaliacoesAluno.length >= 2 && (
                      <>
                        <GraficoEvolucao dados={avaliacoesAluno} metrica="imc" cor="#00E5FF" titulo="📈 Evolução de IMC" />
                        <GraficoEvolucao dados={avaliacoesAluno.filter(a => a.resultado?.gordura3)} metrica="gordura3" cor="#FF5722" titulo="📈 Evolução de % Gordura" />
                        <GraficoComparacao avaliacoes={avaliacoesAluno} />
                      </>
                    )}
                    {avaliacoesAluno.length < 2 && <p style={styles.muted}>Realize pelo menos 2 avaliações para ver gráficos de evolução.</p>}
                    {ultimaAvaliacaoAluno && <GraficoRadar avaliacao={ultimaAvaliacaoAluno} />}
                    {treinosAluno.length > 0 && <GraficoForca treinos={treinosAluno} />}
                  </>
                )}

                {tabPerfil === "avaliacoes" && (
                  <section style={styles.panel}>
                    <h2>Histórico de avaliações</h2>
                    {avaliacoesAluno.length === 0 && <p style={styles.muted}>Nenhuma.</p>}
                    {avaliacoesAluno.slice().reverse().map(a => (
                      <div key={a.id} style={styles.row}>
                        <div><strong>{a.data}</strong><br /><small style={{ color: corIMC(a.resultado?.imc) }}>IMC: {a.resultado?.imc?.toFixed(2)}</small> | <small style={{ color: corGordura(a.resultado?.gordura3) }}>Gord: {a.resultado?.gordura3?.toFixed(1)}%</small> | <small>RCQ: {a.resultado?.rcq?.toFixed(2)}</small></div>
                        <AppButton variant="danger" onClick={() => excluirAvaliacao(a.id)}>🗑️</AppButton>
                      </div>
                    ))}
                  </section>
                )}

                {tabPerfil === "treinos" && (
                  <section style={styles.panel}><h2>Treinos gerados</h2>{treinosAluno.length === 0 && <p style={styles.muted}>Nenhum.</p>}{treinosAluno.slice().reverse().map(t => <TreinoView key={t.id} treino={t} onExcluir={excluirTreino} onCSV={exportarTreinoCSV} onExportar={tr => imprimirTreinoPDF(tr, alunoSelecionado, ultimaAvaliacaoAluno)} />)}</section>
                )}

                {tabPerfil === "fotos" && (
                  <section style={styles.panel}><h2>Fotos posturais</h2>
                    {avaliacoesAluno.filter(a => a.fotoFrontal||a.fotoLateral||a.fotoPosterior).length === 0 && <p style={styles.muted}>Nenhuma.</p>}
                    {avaliacoesAluno.filter(a => a.fotoFrontal||a.fotoLateral||a.fotoPosterior).slice().reverse().map(a => (
                      <div key={a.id} style={{ marginBottom: 20 }}><p><strong>{a.data}</strong></p><div style={styles.photoGrid}>{a.fotoFrontal && <img src={a.fotoFrontal} style={styles.photo} />}{a.fotoLateral && <img src={a.fotoLateral} style={styles.photo} />}{a.fotoPosterior && <img src={a.fotoPosterior} style={styles.photo} />}</div></div>
                    ))}
                  </section>
                )}
              </>
            )}
          </>
        )}

        {pagina === "avaliacao" && (
          <section style={styles.panel}>
            <h2>Avaliação física completa</h2>
            <select style={styles.input} value={avaliacao.alunoId} onChange={e => setAvaliacao({ ...avaliacao, alunoId: e.target.value })}><option value="">Selecione aluno</option>{alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>
            <select style={styles.input} value={avaliacao.sexo} onChange={e => setAvaliacao({ ...avaliacao, sexo: e.target.value })}><option>Masculino</option><option>Feminino</option></select>
            <h3>Dados básicos</h3>
            <div style={styles.grid4}>{["idade","peso","altura","cintura","quadril"].map(c => <input key={c} style={styles.input} placeholder={c} value={avaliacao[c]} onChange={e => setAvaliacao({ ...avaliacao, [c]: e.target.value })} />)}</div>
            <h3>Dobras cutâneas</h3>
            <div style={styles.grid4}>{["triceps","subescapular","peitoral","abdominal","suprailiaca","coxa","axilar"].map(c => <input key={c} style={styles.input} placeholder={c} value={avaliacao[c]} onChange={e => setAvaliacao({ ...avaliacao, [c]: e.target.value })} />)}</div>
            <h3>Fotos</h3>
            <div style={styles.grid3}><FileInput label="Frontal" onChange={f => salvarFoto("fotoFrontal", f)} /><FileInput label="Lateral" onChange={f => salvarFoto("fotoLateral", f)} /><FileInput label="Posterior" onChange={f => salvarFoto("fotoPosterior", f)} /></div>
            <div style={styles.grid4}><Card title="IMC" value={resultadoAvaliacao.imc.toFixed(2)} cor={corIMC(resultadoAvaliacao.imc)} /><Card title="RCQ" value={resultadoAvaliacao.rcq.toFixed(2)} /><Card title="Pollock 3" value={`${resultadoAvaliacao.gordura3.toFixed(1)}%`} cor={corGordura(resultadoAvaliacao.gordura3)} /><Card title="Somatótipo" value={`${resultadoAvaliacao.somatotipo.endomorfia}-${resultadoAvaliacao.somatotipo.mesomorfia}-${resultadoAvaliacao.somatotipo.ectomorfia}`} /></div>
            <AppButton onClick={salvarAvaliacao}>Salvar</AppButton>
          </section>
        )}

        {pagina === "treino" && (
          <section style={styles.panel}>
            <h2>Gerador de treino inteligente — Nível Pro</h2>
            <select style={styles.input} value={configTreino.alunoId} onChange={e => setConfigTreino({ ...configTreino, alunoId: e.target.value })}><option value="">Selecione aluno</option>{alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>
            <div style={styles.grid4}>
              <select style={styles.input} value={configTreino.modalidade} onChange={e => setConfigTreino({ ...configTreino, modalidade: e.target.value })}>
                <option value="musculacao">Musculação</option><option value="bodybuilding">Bodybuilder</option><option value="powerlifting">Powerlifting</option><option value="beachTennis">Beach Tennis</option><option value="futebol">Futebol</option><option value="gestante">Gestante</option>
              </select>
              <select style={styles.input} value={configTreino.nivel} onChange={e => setConfigTreino({ ...configTreino, nivel: e.target.value })}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
              <select style={styles.input} value={configTreino.objetivo} onChange={e => setConfigTreino({ ...configTreino, objetivo: e.target.value })}><option>Hipertrofia</option><option>Emagrecimento</option><option>Força</option><option>Resistência</option><option>Condicionamento</option><option>Performance</option></select>
              <input style={styles.input} type="number" min="1" max="6" placeholder="Dias/semana" value={configTreino.dias} onChange={e => setConfigTreino({ ...configTreino, dias: e.target.value })} />
            </div>
            <h3>1RM</h3>
            <div style={styles.grid3}>
              <input style={styles.input} placeholder="Carga teste (kg)" value={configTreino.cargaTeste} onChange={e => setConfigTreino({ ...configTreino, cargaTeste: e.target.value })} />
              <input style={styles.input} placeholder="Repetições" value={configTreino.repsTeste} onChange={e => setConfigTreino({ ...configTreino, repsTeste: e.target.value })} />
              <input style={styles.input} placeholder="1RM manual" value={configTreino.rmManual} onChange={e => setConfigTreino({ ...configTreino, rmManual: e.target.value })} />
            </div>
            <p style={styles.muted}>1RM estimado: <strong>{(n(configTreino.rmManual) || calcular1RM(configTreino.cargaTeste, configTreino.repsTeste)).toFixed(1)} kg</strong></p>
            <AppButton onClick={gerarTreino}>Gerar treino Pro</AppButton>
          </section>
        )}

        {pagina === "relatorios" && (
          <section style={styles.panel}><h2>Relatórios</h2><AppButton onClick={exportarCSV}>Exportar CSV geral</AppButton></section>
        )}

        <button style={styles.floatingBtn} onClick={() => setPagina("alunos")}>+</button>
      </main>
    </div>
  );
}

// ============================================
// ESTILOS PREMIUM (NOVA PALETA CIANO/LARANJA)
// ============================================
const styles = {
  loginPage: { minHeight: "100vh", background: "#0B0C10", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  loginCard: { background: "#121820", padding: "3rem 2.5rem", borderRadius: "2rem", boxShadow: "0 0 40px rgba(0, 229, 255, 0.08)", maxWidth: 400, width: "100%", textAlign: "center", border: "1px solid rgba(0,229,255,0.15)" },
  tagline: { fontSize: "1.5rem", fontWeight: 300, color: "#FFFFFF", marginBottom: "2rem", letterSpacing: "4px", textTransform: "uppercase" },
  app: { minHeight: "100vh", display: "flex", background: "#0B0C10", color: "#FFFFFF", fontFamily: "Inter, Arial, sans-serif" },
  sidebar: { width: 270, background: "linear-gradient(180deg, #0B0C10, #121820)", padding: 24, borderRight: "1px solid rgba(0,229,255,0.1)", display: "flex", flexDirection: "column", gap: 12, boxShadow: "16px 0 60px rgba(0,0,0,.5)" },
  sidebarSub: { color: "#B0B0B0", marginTop: 0, marginBottom: 26, fontSize: 13 },
  navBtn: { background: "rgba(0,229,255,0.05)", color: "#B0B0B0", border: "1px solid rgba(0,229,255,0.1)", padding: "14px 15px", borderRadius: 18, textAlign: "left", cursor: "pointer", fontWeight: 600, transition: "all .2s ease" },
  navActive: { background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", border: "none", padding: "14px 15px", borderRadius: 18, textAlign: "left", fontWeight: 900, cursor: "pointer", boxShadow: "0 14px 35px rgba(0,229,255,.25)" },
  main: { flex: 1, padding: 34, overflow: "auto" },
  topBar: { background: "rgba(18,24,32,0.9)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: 28, padding: 24, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 24px 70px rgba(0,0,0,.4)" },
  panel: { background: "rgba(18,24,32,0.95)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: 28, padding: 26, marginBottom: 24, boxShadow: "0 24px 70px rgba(0,0,0,.4)", backdropFilter: "blur(12px)" },
  heroCard: { background: "linear-gradient(135deg, rgba(0,229,255,0.08), rgba(255,87,34,0.06)), rgba(18,24,32,0.96)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 34, padding: 30, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 30px 80px rgba(0,0,0,.5)" },
  card: { background: "rgba(18,24,32,0.96)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: 24, padding: 20, marginBottom: 14, boxShadow: "0 18px 45px rgba(0,0,0,.35)" },
  chartCard: { background: "rgba(18,24,32,0.96)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: "0 18px 45px rgba(0,0,0,.35)" },
  miniCard: { background: "rgba(12,16,20,0.95)", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 18, padding: 14, display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 12px 30px rgba(0,0,0,.3)" },
  row: { background: "rgba(18,24,32,0.85)", border: "1px solid rgba(0,229,255,0.08)", padding: 16, borderRadius: 20, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, boxShadow: "0 12px 30px rgba(0,0,0,.25)" },
  input: { width: "100%", padding: "14px 16px", borderRadius: 18, border: "1px solid rgba(0,229,255,0.15)", background: "rgba(12,16,20,.9)", color: "#FFFFFF", marginBottom: 14, boxSizing: "border-box", outline: "none", fontSize: 14 },
  primaryBtn: { background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", border: "none", padding: "14px 22px", borderRadius: 18, fontWeight: 900, cursor: "pointer", letterSpacing: ".2px", boxShadow: "0 18px 45px rgba(0,229,255,.25)", transition: "all .2s ease" },
  smallBtn: { background: "rgba(0,229,255,0.08)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)", padding: "9px 14px", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "all .2s ease" },
  dangerBtn: { background: "#FF5722", color: "#FFFFFF", border: "none", padding: "10px 14px", borderRadius: 14, cursor: "pointer", fontWeight: 800, boxShadow: "0 12px 28px rgba(255,87,34,.25)", transition: "all .2s ease" },
  tabs: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  tab: { background: "rgba(0,229,255,0.05)", color: "#B0B0B0", border: "1px solid rgba(0,229,255,0.1)", padding: "12px 16px", borderRadius: 16, cursor: "pointer", fontWeight: 700 },
  tabActive: { background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", border: "none", padding: "12px 16px", borderRadius: 16, cursor: "pointer", fontWeight: 900 },
  error: { color: "#E64A19", fontWeight: 700 },
  muted: { color: "#B0B0B0" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16 },
  photoGrid: { display: "flex", gap: 14, flexWrap: "wrap", marginTop: 18 },
  photo: { width: 150, height: 190, objectFit: "cover", borderRadius: 22, border: "1px solid rgba(0,229,255,0.2)", boxShadow: "0 18px 40px rgba(0,0,0,.45)" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)" },
  modalContent: { background: "linear-gradient(180deg,#121820,#0B0C10)", border: "1px solid rgba(0,229,255,0.18)", padding: 34, borderRadius: 28, minWidth: 420, maxWidth: 660, boxShadow: "0 30px 90px rgba(0,0,0,.7)" },
  floatingBtn: { position: "fixed", right: 30, bottom: 30, width: 62, height: 62, borderRadius: "50%", border: "none", background: "linear-gradient(135deg, #00E5FF, #FF5722)", color: "#0B0C10", fontSize: 32, fontWeight: 900, cursor: "pointer", boxShadow: "0 20px 55px rgba(0,229,255,.35)" },
};