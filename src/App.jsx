Reescreva completamente meu projeto FitControl Pro sem quebrar funcionalidades, corrigindo integração frontend/backend e entregando um visual premium nível app pago.

STACK:
- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: SQLite
- Frontend hospedado na Vercel
- Backend hospedado no Render

BACKEND ONLINE:
https://fitcontrol-backend-wo77.onrender.com

OBJETIVO:
Entregar um sistema funcional fullstack para gestão fitness:
- cadastro de alunos
- listagem de alunos
- exclusão de alunos
- visual premium dark moderno
- integração real com backend
- responsivo mobile
- pronto para expansão

==================================================
ESTRUTURA
==================================================

Frontend:
C:\Users\Cliente\Desktop\Fitcontrol 2.0

Backend:
C:\Users\Cliente\Desktop\Fitcontrol 2.0\backend

==================================================
BACKEND
==================================================

Reescreva backend/server.js completo.

Usar:
- express
- cors
- dotenv
- better-sqlite3
- bcryptjs
- jsonwebtoken

Configuração obrigatória:

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

Adicionar:
GET /
retornando:
"FitControl Backend online"

ROTAS:

POST /api/auth/register
POST /api/auth/login
GET /api/alunos
POST /api/alunos
PUT /api/alunos/:id
DELETE /api/alunos/:id

==================================================
DATABASE
==================================================

Criar backend/database.js:

Tabela users:
- id
- email
- password

Tabela alunos:
- id
- nome
- idade
- peso

==================================================
GITIGNORE
==================================================

backend/.gitignore:

node_modules
.env
database.db

==================================================
FRONTEND
==================================================

Criar src/config.js:

export const API = "https://fitcontrol-backend-wo77.onrender.com";

==================================================
APP PREMIUM
==================================================

Reescreva src/App.jsx COMPLETO.

REQUISITOS:
- dark mode premium
- glassmorphism
- gradientes modernos
- layout profissional SaaS
- responsivo mobile
- animações suaves
- cards modernos
- dashboard visual
- contador de alunos
- cadastro de alunos
- exclusão de alunos
- consumo real da API

USAR:

GET:
${API}/api/alunos

POST:
${API}/api/alunos

DELETE:
${API}/api/alunos/${id}

==================================================
FUNCIONALIDADES
==================================================

Implementar:
- carregar alunos automaticamente
- cadastrar aluno
- excluir aluno
- atualizar lista automaticamente
- loading states
- feedback visual
- botão premium hover
- cards premium

==================================================
DESIGN
==================================================

Visual estilo:
- app pago
- SaaS moderno
- dashboard fitness
- minimalista premium
- fundo escuro
- neon cyan + orange
- sombras suaves
- bordas arredondadas
- aparência semelhante:
Stripe
Linear
Notion
Vercel
Supabase

==================================================
RESPONSIVIDADE
==================================================

Precisa funcionar:
- celular
- tablet
- desktop

==================================================
IMPORTANTE
==================================================

NÃO usar:
- localhost
- firebase
- supabase
- tailwind obrigatório
- dependências desnecessárias

USAR APENAS:
- React puro
- CSS inline ou modular simples
- fetch API

==================================================
ENTREGA
==================================================

Entregar arquivos completos:

backend/server.js
backend/database.js
backend/package.json
backend/.gitignore

frontend/src/config.js
frontend/src/App.jsx

==================================================
COMANDOS FINAIS
==================================================

BACKEND:

cd "C:\Users\Cliente\Desktop\Fitcontrol 2.0\backend"

git add .
git commit -m "backend final premium"
git push

FRONTEND:

cd "C:\Users\Cliente\Desktop\Fitcontrol 2.0"

git add .
git commit -m "frontend premium final"
git push

==================================================
RESULTADO FINAL ESPERADO
==================================================

- sistema online funcionando
- backend online no Render
- frontend online na Vercel
- visual premium
- cadastro de alunos funcionando
- exclusão funcionando
- API funcionando
- responsivo
- aparência profissional
- pronto para virar SaaS fitness