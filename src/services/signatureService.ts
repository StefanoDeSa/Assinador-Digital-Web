import crypto from 'crypto';
import { toBase64Url, fromBase64UrlToBuffer } from '../utils/helpers.js';
import { PrismaClient } from '../generated/prisma';
import { registerLog } from './logService.js';

const prisma = new PrismaClient();


export async function signUserText(userId: string, text: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.privateKey) throw new Error('Chave privada não encontrada');
  const signer = crypto.createSign('sha256');
  signer.update(text, 'utf8');
  signer.end();
  const signature = signer.sign(user.privateKey);
  await registerLog(userId, 'SIGN', `Texto assinado`);
  return toBase64Url(signature);
}


export async function verifyUserTextSignature(userId: string, text: string, signatureBase64Url: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.publicKey) throw new Error('Chave pública não encontrada');
  const verifier = crypto.createVerify('sha256');
  verifier.update(text, 'utf8');
  verifier.end();
  const signature = fromBase64UrlToBuffer(signatureBase64Url);
  const valid = verifier.verify(user.publicKey, signature);
  await registerLog(userId, 'VERIFY', `Assinatura verificada: ${valid}`);
  return valid;
}