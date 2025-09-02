import { NextResponse } from 'next/server';
import { createAndSignMessage } from '@/services/messageService';
import { getCurrentUser } from '@/services/userService';

export async function POST(req: Request) {
  const { content } = await req.json();
  const user = await getCurrentUser();
  if (!user?.id || !content) {
    return NextResponse.json({ ok: false, message: 'Dados obrigatórios.' }, { status: 400 });
  }
  try {
    const message = await createAndSignMessage(user.id, content);
    return NextResponse.json({ ok: true, id: message.id, assinature: message.assinature, timestamp: message.timestamp });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
