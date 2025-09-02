"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE = "auth_user_id";

// Salva o ID do usuário no cookie
export async function setAuthCookie(userId: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, userId, {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

}

// Lê o ID salvo no cookie
export async function getAuthCookie() {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

// Remove o cookie (logout)
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
}
