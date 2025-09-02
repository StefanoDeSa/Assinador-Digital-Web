import { NextResponse } from 'next/server';
import { loginUser } from '@/services/userService';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Dados obrigatórios.' }, { status: 400 });
  }
  const result = await loginUser({ email, password });
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
