import { Card, Input, Button } from "../components/ui";

export default function Alunos({ alunos, addAluno }) {
  let nome = "";

  return (
    <Card>
      <h2>Alunos</h2>

      <Input placeholder="Nome" onChange={(e)=> nome = e.target.value} />

      <Button onClick={() => addAluno(nome)}>Adicionar</Button>

      {alunos.map(a => (
        <div key={a.id} style={{ marginTop: 10 }}>
          {a.nome}
        </div>
      ))}
    </Card>
  );
}