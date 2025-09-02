#!/bin/bash
# Teste da API de verificação de assinatura
# Requer: apenas curl

API_URL="http://localhost:3000/api"

# 1. Cria usuário
USER_EMAIL="test$(date +%s)@example.com"
USER_PASS="123456"
echo "[1] Registrando usuário..."
USER_JSON=$(curl -s -X POST "$API_URL/register" -H "Content-Type: application/json" -d '{"email":"'$USER_EMAIL'","password":"'$USER_PASS'"}')
USER_ID=$(echo $USER_JSON | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
echo "User ID: $USER_ID"

# 2. Assina texto
TEXTO="Mensagem para assinar"
echo "[2] Assinando texto..."
SIGN_JSON=$(curl -s -X POST "$API_URL/sign" -H "Content-Type: application/json" -d '{"userId":"'$USER_ID'","content":"'$TEXTO'"}')
ASSINATURA=$(echo $SIGN_JSON | sed -n 's/.*"assinature":"\([^"]*\)".*/\1/p')
ASSINATURA_ID=$(echo $SIGN_JSON | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
echo "Assinatura: $ASSINATURA"
echo "Assinatura ID: $ASSINATURA_ID"

# 3. Teste positivo: verificação válida
echo "[3] Teste positivo: verificação por texto + assinatura (deve ser VÁLIDA)"
curl -s -X POST "$API_URL/verify" -H "Content-Type: application/json" -d '{"text":"'$TEXTO'","signature":"'$ASSINATURA'"}'
echo

# 4. Teste negativo: assinatura alterada
ASSINATURA_FALSA="${ASSINATURA}x"
echo "[4] Teste negativo: assinatura alterada (deve ser INVÁLIDA)"
curl -s -X POST "$API_URL/verify" -H "Content-Type: application/json" -d '{"text":"'$TEXTO'","signature":"'$ASSINATURA_FALSA'"}'
echo
