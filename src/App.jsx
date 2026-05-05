import { useEffect, useState } from "react";

const API = "https://fitcontrol-backend-wo77.onrender.com";

export default function App() {
  const [alunos, setAlunos] = useState([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");

  async function carregarAlunos() {
    const res = await fetch(`${API}/api/alunos`);
    const data = await res.json();
    setAlunos(data);
  }

  async function cadastrarAluno(e) {
    e.preventDefault();

    await fetch(`${API}/api/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, idade: Number(idade), peso: Number(peso) }),
    });

    setNome("");
    setIdade("");
    setPeso("");
    carregarAlunos();
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.badge}>FITCONTROL PRO</p>
          <h1 style={styles.title}>Gestão fitness profissional</h1>
          <p style={styles.subtitle}>Alunos, evolução e controle em um só lugar.</p>
        </div>
        <div style={styles.stats}>
          <strong>{alunos.length}</strong>
          <span>alunos ativos</span>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Cadastrar aluno</h2>

        <form onSubmit={cadastrarAluno} style={styles.form}>
          <input style={styles.input} placeholder="Nome do aluno" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <input style={styles.input} placeholder="Idade" type="number" value={idade} onChange={(e) => setIdade(e.target.value)} required />
          <input style={styles.input} placeholder="Peso (kg)" type="number" value={peso} onChange={(e) => setPeso(e.target.value)} required />
          <button style={styles.button}>Cadastrar</button>
        </form>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Alunos cadastrados</h2>

        {alunos.length === 0 ? (
          <div style={styles.empty}>Nenhum aluno cadastrado ainda.</div>
        ) : (
          <div style={styles.grid}>
            {alunos.map((a) => (
              <div key={a.id} style={styles.studentCard}>
                <div style={styles.avatar}>{a.nome?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <strong>{a.nome}</strong>
                  <p>{a.idade} anos • {a.peso}kg</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1e293b, #020617 65%)",
    color: "#fff",
    padding: "28px",
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    maxWidth: "980px",
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
  },
  badge: {
    color: "#22d3ee",
    letterSpacing: "3px",
    fontWeight: "bold",
    fontSize: "12px",
  },
  title: {
    fontSize: "42px",
    margin: "8px 0",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: "18px",
  },
  stats: {
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.15)",
    borderRadius: "24px",
    padding: "24px",
    minWidth: "150px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,.35)",
  },
  card: {
    maxWidth: "980px",
    margin: "0 auto 22px",
    background: "rgba(15,23,42,.86)",
    border: "1px solid rgba(148,163,184,.18)",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 22px 70px rgba(0,0,0,.35)",
  },
  cardTitle: {
    marginTop: 0,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  input: {
    background: "#111827",
    color: "#fff",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "15px",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    border: 0,
    borderRadius: "16px",
    padding: "15px",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#fff",
    background: "linear-gradient(135deg, #22d3ee, #f97316)",
    cursor: "pointer",
  },
  empty: {
    color: "#94a3b8",
    padding: "22px",
    border: "1px dashed #334155",
    borderRadius: "18px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gap: "14px",
  },
  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: "18px",
    padding: "16px",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22d3ee, #f97316)",
    display: "grid",
    placeItems: "center",
    fontWeight: "bold",
  },
};