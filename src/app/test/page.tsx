'use client';

import { useState } from 'react';

export default function TesteAssinatura() {
  const [texto, setTexto] = useState('');
  const [assinatura, setAssinatura] = useState('');
  const [resultado, setResultado] = useState('');
  const [mensagemId, setMensagemId] = useState('');
  const [mensagemCriada, setMensagemCriada] = useState(null);

  // Simula usuário logado (em produção, pegue do cookie/session)
  const userId = 'ID_DO_USUARIO_DE_TESTE';

  async function assinarTexto() {
    const res = await fetch('/api/assinatura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, texto }),
    });
    const data = await res.json();
    setAssinatura(data.assinatura);
    setResultado('');
  }

  async function verificarAssinatura() {
    const res = await fetch('/api/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, texto, assinatura }),
    });
    const data = await res.json();
    setResultado(data.valida ? 'Assinatura VÁLIDA' : 'Assinatura INVÁLIDA');
  }

  async function criarMensagem() {
    const res = await fetch('/api/mensagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, texto }),
    });
    const data = await res.json();
    setMensagemCriada(data.mensagem);
    setMensagemId(data.mensagem.id);
    setResultado('');
  }

  async function verificarMensagem() {
    const res = await fetch(`/api/mensagem/${mensagemId}/verificar`);
    const data = await res.json();
    setResultado(data.valida ? 'Mensagem VÁLIDA' : 'Mensagem INVÁLIDA');
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
      <h2>Teste de Assinatura Digital</h2>
      <textarea
        rows={4}
        style={{ width: '100%' }}
        placeholder="Digite o texto para assinar"
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />
      <div style={{ margin: '16px 0' }}>
        <button onClick={assinarTexto}>Assinar Texto</button>
        <button onClick={verificarAssinatura} disabled={!assinatura}>Verificar Assinatura</button>
        <button onClick={criarMensagem}>Criar Mensagem Assinada</button>
        <button onClick={verificarMensagem} disabled={!mensagemId}>Verificar Mensagem</button>
      </div>
      {assinatura && (
        <div>
          <strong>Assinatura:</strong>
          <pre style={{ wordBreak: 'break-all', background: '#eee', padding: 8 }}>{assinatura}</pre>
        </div>
      )}
      {mensagemCriada && (
        <div>
          <strong>Mensagem criada:</strong>
          <pre style={{ wordBreak: 'break-all', background: '#eee', padding: 8 }}>{JSON.stringify(mensagemCriada, null, 2)}</pre>
        </div>
      )}
      {resultado && (
        <div style={{ marginTop: 16, fontWeight: 'bold' }}>{resultado}</div>
      )}
    </div>
  );
}