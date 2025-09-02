import { PrismaClient } from '../generated/prisma';
import { signUserText, verifyUserTextSignature } from './signatureService.js';
import { registerLog } from './logService.js';

const prisma = new PrismaClient();

/**
 * Cria e assina uma mensagem do usuário.
 */
export async function createAndSignMessage(userId: string, content: string) {
  const signature = await signUserText(userId, content);
  const message = await prisma.message.create({
    data: {
      signatoryId: userId,
      content,
      assinature: signature,
    },
  });
  await registerLog(userId, 'MESSAGE_CREATE', `Mensagem criada e assinada`);
  return message;
}

/**
 * Verifica a assinatura de uma mensagem existente.
 */
export async function verifyMessageSignature(messageId: string): Promise<{ valid: boolean; signatory: string; timestamp: Date }> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { signatory: true },
  });
  if (!message) throw new Error('Mensagem não encontrada');
  const valid = await verifyUserTextSignature(message.signatoryId, message.content, message.assinature);
  await registerLog(message.signatoryId, 'MESSAGE_VERIFY', `Verificação: ${valid}`);
  return {
    valid,
    signatory: message.signatory.email,
    timestamp: message.timestamp,
  };
}