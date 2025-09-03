# Assinador Digital Web

Aplicação web para **assinatura digital de textos**, com autenticação de usuários, registro de logs e verificação de assinaturas.  
Arquitetura modular com serviços (`userService`, `messageService`, `signatureService`, `logService`) e interface em Next.js.

## Requisitos

- Node.js >= 18  
- Docker e Docker Compose (para banco de dados)  
- Prisma CLI  


## Instalação

Clone o repositório e instale as dependências:

```bash
git clone [https://github.com/seu-usuario/seu-repo.git](https://github.com/StefanoDeSa/Assinador-Digital-Web.git)
cd Assinador-Digital-Web
npm install
```

## Banco de Dados

O projeto usa **PostgreSQL** via Docker Compose.
Para subir o banco localmente:

```bash
docker compose up -d
```

A URL do banco deve estar definida em .env:

```bash
.env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/appdb?schema=public"
```

## Prisma

Gere os clientes e rode as migrações:

```bash
npx prisma generate
npx prisma migrate dev
```
## Scripts

Rodar em desenvolvimento:

```bash
npm run dev
```

## Estrutura

`services/logService.ts` → grava auditorias no banco
`services/messageService.ts` → CRUD de mensagens e assinatura
`services/signatureService.ts` → assinar/verificar texto com chaves RSA
`services/userService.ts` → autenticação e gerenciamento de usuários

## Fluxo Web

A aplicação possui as seguintes rotas:

- **/register** → cadastro de usuários  
- **/login** → autenticação de usuários  
- **/sign** → formulário para assinar textos digitalmente  
- **/verify** → página de verificação de assinaturas  

### Registro (`/register`)

- Nome (opcional), email e senha  
- Validação com Zod e react-hook-form  
- Indicador de força da senha  
- Redireciona para `/login` após sucesso  

### Login (`/login`)

- Email e senha  
- Feedback visual com `sonner`  
- Redireciona para `/sign` em caso de sucesso  

### Assinar (`/sign`)

- Campo para texto livre  
- Gera hash SHA-256 e assinatura digital  
- Exibe ID da assinatura, hash, assinatura e timestamp  
- Mantém histórico das últimas 5 assinaturas na sessão  

### Verificar (`/verify`)

- Verificação por **ID da assinatura** ou **texto + assinatura**  
- Mostra status **VÁLIDA/INVÁLIDA**, algoritmo, signatário e data/hora  

---

## Fluxo de Assinatura Interno

1. O usuário cria uma mensagem  
2. O serviço gera a assinatura digital com a chave privada do usuário  
3. Mensagem e assinatura ficam persistidas no banco  
4. A verificação é feita com a chave pública do usuário  
