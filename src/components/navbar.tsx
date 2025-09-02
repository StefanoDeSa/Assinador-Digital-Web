import Link from "next/link";
import { getCurrentUser } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { clearAuthCookie } from "@/utils/cookies";
import { redirect } from "next/navigation";

async function logoutAction() {
    "use server";
    await clearAuthCookie();
    redirect("/login");
}

export default async function Navbar() {
    const user = await getCurrentUser();

    return (
        <nav className="w-full border-b bg-background">
            <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
                <Link href="/" className="text-lg font-semibold">
                    Assinador Digital
                </Link>

                <div className="flex items-center gap-4">
                    {!user ? (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Registrar
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Assinar
                            </Link>
                            <Link
                                href="/verify"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Verificações
                            </Link>

                            <form action={logoutAction}>
                                <Button variant="outline" size="sm" type="submit">
                                    Sair
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
