'use client';

import { useState } from 'react';
import { fetchWrapper } from '@/lib/fetchWrapper';

export default function TestApiPage() {
  const [userId, setUserId] = useState('');
  const [loginResult, setLoginResult] = useState('');
  const [assinaturaId, setAssinaturaId] = useState('');
  const [verificacao, setVerificacao] = useState('');
  const [loading, setLoading] = useState(false);

  // Dados de teste
  const [email, setEmail] = useState('test'+Math.floor(Math.random()*10000)+'@example.com');
  const [password, setPassword] = useState('123456');
  const [texto, setTexto] = useState('Mensagem para assinar');

  async function cadastrar() {
    setLoading(true);
    try {
      const res = await fetchWrapper('/api/register', {
        method: 'POST',
        body: { email, password },
      });
      setUserId(res.id || '');
    } catch (e: any) {
      setUserId('Erro: ' + e.message);
    }
    setLoading(false);
  }

  async function logar() {
    setLoading(true);
    try {
      const res = await fetchWrapper('/api/login', {
        method: 'POST',
        body: { email, password },
      });
      setLoginResult(res.ok ? 'Login OK' : 'Login Falhou');
      if (res.user?.id) setUserId(res.user.id);
    } catch (e: any) {
      setLoginResult('Erro: ' + e.message);
    }
    setLoading(false);
  }

  async function assinar() {
    setLoading(true);
    try {
      const res = await fetchWrapper('/api/sign', {
        method: 'POST',
        body: { userId, content: texto },
      });
      setAssinaturaId(res.id || '');
    } catch (e: any) {
      setAssinaturaId('Erro: ' + e.message);
    }
    setLoading(false);
  }

  async function verificar() {
    setLoading(true);
    try {
      const res = await fetchWrapper(`/api/verify?id=${assinaturaId}`);
      setVerificacao(res.ok ? 'VÁLIDA' : 'INVÁLIDA');
    } catch (e: any) {
      setVerificacao('Erro: ' + e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
      <h2>Teste das Rotas da API</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Email: </label>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '60%' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Senha: </label>
        <input value={password} onChange={e => setPassword(e.target.value)} style={{ width: '60%' }} type="password" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Texto para assinar: </label>
        <input value={texto} onChange={e => setTexto(e.target.value)} style={{ width: '60%' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={cadastrar} disabled={loading}>Cadastrar</button>
        <button onClick={logar} disabled={loading}>Login</button>
        <button onClick={assinar} disabled={loading || !userId}>Assinar</button>
        <button onClick={verificar} disabled={loading || !assinaturaId}>Verificar</button>
      </div>
      <div>
        <div><strong>UserId:</strong> {userId}</div>
        <div><strong>Login:</strong> {loginResult}</div>
        <div><strong>AssinaturaId:</strong> {assinaturaId}</div>
        <div><strong>Verificação:</strong> {verificacao}</div>
      </div>
    </div>
  );
}