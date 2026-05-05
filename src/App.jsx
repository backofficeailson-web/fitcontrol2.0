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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        idade: Number(idade),
        peso: Number(peso),
      }),
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
    <div
      style={{
        background: "#0f172a",
        color: "#fff",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>💪 FitControl Pro</h1>
      <p>Sistema de Gestão Fitness</p>

      <form onSubmit={cadastrarAluno} style={{ marginTop: 30 }}>
        <input
          placeholder="Nome do aluno"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          placeholder="Idade"
          type="number"
          value={idade}
          onChange={(e) => setIdade(e.target.value)}
          required
        />

        <input
          placeholder="Peso"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          required
        />

        <button type="submit">Cadastrar aluno</button>
      </form>

      <h2>Alunos:</h2>

      {alunos.length === 0 ? (
        <p>Nenhum aluno cadastrado</p>
      ) : (
        alunos.map((a) => (
          <div key={a.id} style={{ marginTop: 10 }}>
            {a.nome} - {a.idade} anos - {a.peso}kg
          </div>
        ))
      )}
    </div>
  );
}