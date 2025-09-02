"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createUser } from "@/services/userService";
import { useRouter } from "next/navigation";



// Validação
const RegisterSchema = z
    .object({
        name: z
            .string()
            .max(80, "No máximo 80 caracteres")
            .optional()
            .or(z.literal("").transform(() => undefined)),
        email: z.email("Informe um email válido"),
        password: z
            .string()
            .min(8, "A senha deve ter pelo menos 8 caracteres")
            .max(72, "Máximo de 72 caracteres"),
        confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
        message: "As senhas não coincidem",
        path: ["confirm"],
    });

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function Register() {
    const [showPass, setShowPass] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const form = useForm<RegisterValues>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirm: "",
        },
        mode: "onTouched",
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const router = useRouter();


    async function onSubmit(values: RegisterValues) {
        setIsSubmitting(true);
        try {
            const res = await createUser({
                name: values.name,
                email: values.email,
                password: values.password,
            });

            if (res.ok) {
                toast.success("Conta criada!", {
                    description: `Usuário ${res.user.email} cadastrado com sucesso.`,
                });
                form.reset();
                router.push("/login");

            } else {
                toast.error("Erro ao criar conta", {
                    description: res.message ?? "Falha desconhecida",
                });
            }
        } catch (e: any) {
            toast.error("Erro inesperado", {
                description: e?.message ?? "Tente novamente mais tarde",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Indicador simples de força de senha (UI apenas)
    const passwordStrength = React.useMemo(() => {
        const p = form.watch("password") || "";
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[a-z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score; // 0-5
    }, [form.watch("password")]);

    const strengthLabel =
        ["Muito fraca", "Fraca", "Ok", "Forte", "Muito forte"][Math.max(0, passwordStrength - 1)] ??
        "";

    return (
        <div className="min-h-[calc(100dvh-4rem)] w-full flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">Criar conta</CardTitle>
                    <CardDescription>
                        Preencha seus dados para registrar-se no Assinador Digital Web.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome (opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="voce@exemplo.com" autoComplete="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPass ? "text" : "password"}
                                                        placeholder="Mínimo 8 caracteres"
                                                        autoComplete="new-password"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPass((s) => !s)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                                                        aria-label={showPass ? "Esconder senha" : "Mostrar senha"}
                                                    >
                                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Força: {strengthLabel}</span>
                                                    <span>{form.watch("password")?.length ?? 0}/72</span>
                                                </div>
                                                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className={cn(
                                                            "h-1.5 rounded-full transition-all",
                                                            passwordStrength <= 1 && "w-1/5 bg-red-500",
                                                            passwordStrength === 2 && "w-2/5 bg-orange-500",
                                                            passwordStrength === 3 && "w-3/5 bg-yellow-500",
                                                            passwordStrength === 4 && "w-4/5 bg-lime-500",
                                                            passwordStrength >= 5 && "w-full bg-green-500"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar senha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirm ? "text" : "password"}
                                                        placeholder="Repita a senha"
                                                        autoComplete="new-password"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirm((s) => !s)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                                                        aria-label={showConfirm ? "Esconder confirmação" : "Mostrar confirmação"}
                                                    >
                                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    "Criar conta"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Já tem conta?</span>
                    <Link href="/login" className="text-primary hover:underline">
                        Entrar
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
