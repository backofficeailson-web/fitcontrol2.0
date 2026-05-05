import { useEffect, useState } from "react";

export default function App() {
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    fetch("https://fitcontrol-backend-wo77.onrender.com/api/alunos")
      .then(res => res.json())
      .then(data => {
        console.log("ALUNOS:", data);
        setAlunos(data);
      });
  }, []);

  return (
    <div style={{
      background: "#0f172a",
      color: "#fff",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>💪 FitControl Pro</h1>
      <p>Sistema de Gestão Fitness</p>

      <h2>Alunos:</h2>

      {alunos.length === 0 ? (
        <p>Nenhum aluno cadastrado</p>
      ) : (
        alunos.map((a) => (
          <div key={a.id}>
            {a.nome} - {a.idade} anos - {a.peso}kg
          </div>
        ))
      )}
    </div>
  );
}