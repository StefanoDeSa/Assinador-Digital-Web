"use server";

import { PrismaClient } from "@/generated/prisma";
import { getAuthCookie, setAuthCookie } from "@/utils/cookies";
import { generateKeyPairSync } from "node:crypto";

const prisma = new PrismaClient();

type CreateUserInput = {
    name?: string;
    email: string;
    password: string;
};


type LoginInput = {
    email: string;
    password: string;
};

export async function createUser({ name, email, password }: CreateUserInput) {

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name?.trim() || null;

    // Gera par de chaves RSA
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    try {
        const user = await prisma.user.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                password,
                publicKey: publicKey,
                privateKey: privateKey,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return { ok: true as const, user };
    } catch (err: any) {
        // P2002 = unique constraint (email)
        if (err?.code === "P2002") {
            return { ok: false as const, message: "E-mail já cadastrado." };
        }

        throw err;
    }
}

export async function loginUser({ email, password }: LoginInput) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
        },
    });

    if (!user) {
        return { ok: false as const, message: "Usuário não encontrado." };
    }

    if (user.password !== password) {
        return { ok: false as const, message: "Senha incorreta." };
    }

    await setAuthCookie(user.id);

    return {
        ok: true as const,
        user: { id: user.id, email: user.email, name: user.name ?? null },
    };
}

export async function getCurrentUser() {
  const userId = await getAuthCookie();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  return user;
}