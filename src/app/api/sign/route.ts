import { NextResponse } from 'next/server';
import { createAndSignMessage } from '@/services/messageService';

export async function POST(req: Request) {
  const { userId, content } = await req.json();
  if (!userId || !content) {
    return NextResponse.json({ ok: false, message: 'Dados obrigatórios.' }, { status: 400 });
  }
  try {
    const message = await createAndSignMessage(userId, content);
    return NextResponse.json({ ok: true, id: message.id, assinature: message.assinature, timestamp: message.timestamp });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
