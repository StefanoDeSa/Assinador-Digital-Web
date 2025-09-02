import crypto from 'crypto';
import { toBase64Url, fromBase64UrlToBuffer} from '@/utils/helpers';
import { PrismaClient } from '../generated/prisma';
import { registerLog } from './logService';

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

export type VerifySignatureParams = {
  id?: string;
  text?: string;
  signature?: string;
};

/**
 * Verificação pública: por id OU por texto + assinatura
 */
export async function verifySignaturePublic({ id, text, signature }: VerifySignatureParams): Promise<{
  status: 'VÁLIDA' | 'INVÁLIDA';
  signatario?: string;
  algoritmo: string;
  timestamp?: Date;
  error?: string;
}> {
  if (id) {
    // Busca por id da mensagem
    const message = await prisma.message.findUnique({
      where: { id },
      include: { signatory: true },
    });
    if (!message) return { status: 'INVÁLIDA', algoritmo: 'SHA-256', error: 'Mensagem não encontrada' };
    const valid = await verifyUserTextSignature(message.signatoryId, message.content, message.assinature);
    return {
      status: valid ? 'VÁLIDA' : 'INVÁLIDA',
      signatario: message.signatory.email,
      algoritmo: 'SHA-256',
      timestamp: message.timestamp,
    };
  } else if (text && signature) {
    // Busca por texto + assinatura
    // Precisa buscar o usuário que assinou (não é possível saber sem contexto extra)
    // Aqui retorna apenas se a assinatura é válida para algum usuário
    // (Exemplo: busca todas as chaves públicas e tenta verificar)
    const users = await prisma.user.findMany();
    for (const user of users) {
      if (!user.publicKey) continue;
      const valid = await verifyUserTextSignature(user.id, text, signature);
      if (valid) {
        return {
          status: 'VÁLIDA',
          signatario: user.email,
          algoritmo: 'SHA-256',
        };
      }
    }
    return { status: 'INVÁLIDA', algoritmo: 'SHA-256', error: 'Assinatura não corresponde a nenhum usuário' };
  }
  return { status: 'INVÁLIDA', algoritmo: 'SHA-256', error: 'Parâmetros insuficientes' };
}