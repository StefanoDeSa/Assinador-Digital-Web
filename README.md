# Assinador Digital Web

Serviço de mensagens com registro de logs e assinaturas digitais.  ^
Arquitetura modular com serviços (`userService`, `messageService`, `signatureService`, `logService`).^

---^

## Requisitos^

- Node.js >= 18^
- Docker e Docker Compose (para banco de dados)^
- Prisma CLI^

---^

## Instalação^

Clone o repositório e instale as dependências:^

```bash^
git clone https://github.com/seu-usuario/seu-repo.git^
cd seu-repo^
npm install^
```^

---^

## Banco de Dados^

O projeto usa **PostgreSQL** via Docker Compose.  ^
Para subir o banco localmente:^

```bash^
docker compose up -d^
```^

A URL do banco deve estar definida em `.env`:^

```env^
DATABASE_URL="postgresql://usuario:senha@localhost:5432/appdb?schema=public"^
```^

---^

## Prisma^

Gere os clientes e rode as migrações:^

```bash^
npx prisma generate^
npx prisma migrate dev --name init^
```^

Para inspecionar o banco:^

```bash^
npx prisma studio^
```^

---^

## Scripts^

Rodar em desenvolvimento:^

```bash^
npm run dev^
```^

Build de produção:^

```bash^
npm run build^
npm start^
```^

---^

## Estrutura^

- `services/logService.ts` → grava auditorias no banco  ^
- `services/messageService.ts` → CRUD de mensagens e assinatura  ^
- `services/signatureService.ts` → assinar/verificar texto com chaves RSA  ^
- `services/userService.ts` → autenticação e gerenciamento de usuários  ^

---^

## Fluxo de Assinatura^

1. O usuário cria mensagem.  ^
2. O serviço gera assinatura digital com a chave privada do usuário.  ^
3. Mensagem e assinatura ficam persistidas.  ^
4. É possível verificar a assinatura a qualquer momento com a chave pública.^

---^

## Exemplos de Uso^

### Criar usuário^

```ts^
import { createUser } from "@/services/userService"^

await createUser("alice@example.com", "senha123", "Alice")^
```^

### Criar mensagem assinada^

```ts^
import { createMessage } from "@/services/messageService"^

await createMessage("UUID_DO_USUARIO", "Olá, mundo seguro!")^
```^

### Verificar assinatura^

```ts^
import { verifySignaturePublic } from "@/services/signatureService"^

const resultado = await verifySignaturePublic(^
  "mensagem original",^
  "assinaturaBase64",^
  "chavePublicaPEM"^
)^

console.log(resultado.verificado) // true ou false^
```^

---^

## Observações Importantes^

- **Segurança**: atualmente o código usa senha em texto puro e guarda chave privada no banco. Isso **não é seguro em produção**.  ^
  Recomenda-se:^
  - Usar bcrypt/argon2 para senhas.^
  - Armazenar chaves privadas de forma cifrada ou em um KMS.^
- **Prisma Client**: deve ser importado via singleton para evitar excesso de conexões em dev.^
- **Imports**: padronizar entre `@/generated/prisma` e caminhos relativos.^

---^

## Licença^

Defina aqui a licença do projeto (MIT, GPL, etc). > README.md

git add README.md
git commit -m "Adiciona README inicial"
