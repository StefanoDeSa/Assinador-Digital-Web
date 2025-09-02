"use client";
import { useState } from 'react';
import { fetchWrapper } from '@/lib/fetchWrapper';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function VerifyPage() {
  const [id, setId] = useState('');
  const [text, setText] = useState('');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetchWrapper('/api/verify', {
        method: 'POST',
        body: {
          id: id || undefined,
          text: text || undefined,
          signature: signature || undefined,
        },
      });
      setResult(res);
    } catch (e: any) {
      setResult({ status: 'INVÁLIDA', error: e.message });
    }
    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold">Verificação de Assinatura</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID da assinatura</label>
              <Input value={id} onChange={e => setId(e.target.value)} placeholder="ID da assinatura" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ou texto</label>
              <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Texto original" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assinatura (base64url)</label>
              <Input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Assinatura" />
            </div>
            <Button onClick={handleVerify} disabled={loading || (!id && !(text && signature))} className="w-full">
              {loading ? 'Verificando...' : 'Verificar'}
            </Button>
            {result && (
              <div className="mt-6 p-4 rounded-lg border bg-muted/60">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={result.status === 'VÁLIDA' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                  {result.signatario && (
                    <span className="text-sm">Signatário: <span className="font-semibold">{result.signatario}</span></span>
                  )}
                </div>
                <div className="text-sm mb-1">Algoritmo: <span className="font-semibold">{result.algoritmo}</span></div>
                {result.timestamp && (
                  <div className="text-sm mb-1">Data/Hora: <span className="font-semibold">{new Date(result.timestamp).toLocaleString()}</span></div>
                )}
                {result.error && (
                  <div className="text-sm text-destructive">Erro: {result.error}</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
