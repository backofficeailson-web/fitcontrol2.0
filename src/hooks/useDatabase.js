import { Card } from "../components/ui";

export default function Dashboard({ alunos, avaliacoes }) {
  return (
    <>
      <h1 style={{ color: "#fff" }}>Dashboard</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }}>
        <Card>
          <h3>Alunos</h3>
          <p>{alunos.length}</p>
        </Card>

        <Card>
          <h3>Avaliações</h3>
          <p>{avaliacoes.length}</p>
        </Card>

        <Card>
          <h3>Treinos</h3>
          <p>Ativos</p>
        </Card>
      </div>
    </>
  );
}