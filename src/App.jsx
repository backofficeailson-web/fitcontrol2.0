Reescreva completamente meu projeto FitControl Pro sem quebrar funcionalidades existentes, adicionando backend funcional, integração real frontend/backend e visual premium nível SaaS pago.

==================================================
STACK
==================================================

Frontend:
- React
- Vite
- Fetch API
- CSS inline premium
- Responsivo

Backend:
- Node.js
- Express
- SQLite
- better-sqlite3
- JWT
- bcryptjs

Hospedagem:
- Frontend: Vercel
- Backend: Render

==================================================
LINKS
==================================================

Frontend:
https://fitcontrol-ailson.vercel.app

Backend:
https://fitcontrol-backend-wo77.onrender.com

==================================================
OBJETIVO
==================================================

Criar sistema fitness profissional com:

- dashboard premium
- cadastro de alunos
- listagem de alunos
- excluir aluno
- editar aluno
- integração real API
- responsivo mobile
- visual nível app pago

==================================================
BACKEND
==================================================

Reescrever backend/server.js completo.

Usar:

- express
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- better-sqlite3

Obrigatório:

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

Criar rota:

GET /
retornando:
"FitControl Backend online"

==================================================
ROTAS API
==================================================

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
- id INTEGER PRIMARY KEY AUTOINCREMENT
- email TEXT UNIQUE
- password TEXT

Tabela alunos:
- id INTEGER PRIMARY KEY AUTOINCREMENT
- nome TEXT
- idade INTEGER
- peso REAL

==================================================
GITIGNORE
==================================================

backend/.gitignore:

node_modules
.env
database.db

==================================================
CONFIG FRONTEND
==================================================

Criar:
src/config.js

Com:

export const API = "https://fitcontrol-backend-wo77.onrender.com";

==================================================
FRONTEND PREMIUM
==================================================

Reescrever src/App.jsx COMPLETO.

==================================================
FUNCIONALIDADES
==================================================

Implementar:

- carregar alunos automaticamente
- cadastrar aluno
- excluir aluno
- editar aluno
- atualização automática da lista
- loading state
- feedback visual
- hover animations
- dashboard premium
- contador de alunos
- cards modernos

==================================================
API
==================================================

Usar:

GET:
${API}/api/alunos

POST:
${API}/api/alunos

PUT:
${API}/api/alunos/${id}

DELETE:
${API}/api/alunos/${id}

==================================================
EDITAR ALUNO
==================================================

Adicionar botão:
"Editar"

Ao clicar:
- preencher formulário automaticamente
- permitir atualização dos dados
- salvar com PUT

==================================================
EXCLUIR ALUNO
==================================================

Adicionar botão:
"Excluir"

Com:
confirm("Deseja excluir este aluno?")

==================================================
DESIGN PREMIUM
==================================================

Visual inspirado em:
- Stripe
- Linear
- Vercel
- Supabase
- Notion

Características:
- dark mode
- glassmorphism
- gradientes neon cyan + orange
- sombras suaves
- cards premium
- bordas arredondadas
- UX moderna
- responsivo
- aparência SaaS

==================================================
RESPONSIVIDADE
==================================================

Precisa funcionar:
- celular
- tablet
- desktop

==================================================
NÃO USAR
==================================================

- localhost
- firebase
- supabase
- dependências desnecessárias

==================================================
USAR APENAS
==================================================

- React puro
- Fetch API
- CSS inline ou modular simples

==================================================
ENTREGAR ARQUIVOS COMPLETOS
==================================================

backend/server.js
backend/database.js
backend/package.json
backend/.gitignore

src/config.js
src/App.jsx

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
RESULTADO FINAL
==================================================

- sistema online funcionando
- frontend conectado ao backend
- backend online Render
- frontend online Vercel
- cadastro de alunos funcionando
- editar funcionando
- excluir funcionando
- visual premium
- responsivo
- aparência profissional
- pronto para virar SaaS fitness