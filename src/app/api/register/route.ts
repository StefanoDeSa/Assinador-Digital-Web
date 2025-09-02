import { NextResponse } from 'next/server';
import { createUser } from '@/services/userService';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Dados obrigatórios.' }, { status: 400 });
  }
  const result = await createUser({ name, email, password });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
