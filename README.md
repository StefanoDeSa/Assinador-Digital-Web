# Assinador Digital Web

Serviço de mensagens com registro de logs e assinaturas digitais.
Arquitetura modular com serviços (`userService`, `messageService`, `signatureService`, `logService`).


## Requisitos

- Node.js >= 18
- Docker e Docker Compose (para banco de dados)
- Prisma CLI


## Instalação

Clone o repositório e instale as dependências:


git clone [https://github.com/seu-usuario/seu-repo.git](https://github.com/StefanoDeSa/Assinador-Digital-Web.git)
cd Assinador-Digital-Web.git
npm install



## Banco de Dados

O projeto usa **PostgreSQL** via Docker Compose.
Para subir o banco localmente:


docker compose up -d


A URL do banco deve estar definida em .env:

.env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/appdb?schema=public"^

## Prisma

Gere os clientes e rode as migrações:^


npx prisma generate
npx prisma migrate dev

## Scripts

Rodar em desenvolvimento:^

npm run dev^

## Estrutura

`services/logService.ts` → grava auditorias no banco
`services/messageService.ts` → CRUD de mensagens e assinatura
`services/signatureService.ts` → assinar/verificar texto com chaves RSA
`services/userService.ts` → autenticação e gerenciamento de usuários


## Fluxo de Assinatura

1. O usuário cria mensagem.
2. O serviço gera assinatura digital com a chave privada do usuário.
3. Mensagem e assinatura ficam persistidas.
4. É possível verificar a assinatura a qualquer momento com a chave pública.
