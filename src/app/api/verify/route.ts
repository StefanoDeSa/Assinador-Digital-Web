import { NextResponse } from 'next/server';
import { verifySignaturePublic } from '@/services/signatureService';

export async function POST(req: Request) {
  const { id, text, signature } = await req.json();

  try {
    const result = await verifySignaturePublic({ id, text, signature });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ status: 'INVÁLIDA', error: err.message }, { status: 404 });
  }
}
