import { NextResponse } from 'next/server';
import { verifyMessageSignature } from '@/services/messageService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, message: 'ID obrigatório.' }, { status: 400 });
  }
  try {
    const result = await verifyMessageSignature(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 404 });
  }
}
