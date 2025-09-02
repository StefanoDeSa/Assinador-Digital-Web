"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchWrapper } from '@/lib/fetchWrapper';

const SignSchema = z.object({
    text: z.string().min(1, "Digite algum conteúdo para assinar."),
});
type SignValues = z.infer<typeof SignSchema>;

type SignResult = {
    id: string;
    hashHex: string;
    signature?: string;
    algo: string;
    createdAt: string;
};

// util: SHA-256 (Web Crypto)
async function sha256Hex(data: string): Promise<string> {
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(data));
    const bytes = new Uint8Array(digest);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export default function SignClient() {
    const form = useForm<SignValues>({
        resolver: zodResolver(SignSchema),
        defaultValues: { text: "" },
        mode: "onTouched",
    });

    const [isSigning, setIsSigning] = React.useState(false);
    const [result, setResult] = React.useState<SignResult | null>(null);
    const [recent, setRecent] = React.useState<SignResult[]>([]);

    async function onSubmit(values: SignValues) {
        setIsSigning(true);
        try {
            // Chama o backend para assinar o texto (envia apenas o conteúdo)
            const response = await fetchWrapper('/api/sign', {
                method: 'POST',
                body: { content: values.text },
            });
            if (!response.ok) throw new Error(response.message || 'Erro ao assinar');
            const hashHex = await sha256Hex(values.text);
            const id = response.id;
            const signature = response.assinature;
            const algo = "RSA/SHA-256";
            const createdAt = new Date(response.timestamp).toLocaleString();

            const res: SignResult = { id, hashHex, signature, algo, createdAt };
            setResult(res);
            setRecent((prev) => [res, ...prev].slice(0, 5));

            toast.success("Assinatura gerada!", {
                description: "Assinatura digital criada pelo backend.",
            });
        } catch (e: any) {
            toast.error("Falha ao assinar", {
                description: e?.message ?? "Erro inesperado ao processar o hash.",
            });
        } finally {
            setIsSigning(false);
        }
    }

    function handleClear() {
        form.reset({ text: "" });
        setResult(null);
    }

    async function copyToClipboard(value?: string, label?: string) {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        toast.success(`${label ?? "Valor"} copiado!`);
    }

    return (
        <div className="min-h-[calc(100dvh-4rem)] w-full flex justify-center p-6">
            <div className="w-full max-w-6xl space-y-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Assinar Texto</h1>
                    <p className="text-sm text-muted-foreground">
                        Insira o conteúdo abaixo para gerar um identificador único (hash). Esse valor será utilizado para criar a assinatura digital.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Coluna esquerda: formulário */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="shadow-sm rounded-2xl">
                            <CardHeader className="space-y-1">
                                <CardTitle>Conteúdo</CardTitle>
                                <CardDescription>Texto a ser assinado digitalmente.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                                        <FormField
                                            control={form.control}
                                            name="text"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Texto</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            rows={10}
                                                            className="resize-y"
                                                            placeholder="Cole ou digite seu texto aqui..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="secondary" className="rounded-md px-2 py-1">Algoritmo</Badge>
                                            <span className="text-sm text-muted-foreground">RSA/SHA-256</span>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Button type="submit" disabled={isSigning}>
                                                {isSigning ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Assinando...
                                                    </>
                                                ) : (
                                                    "Assinar"
                                                )}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={handleClear}>
                                                Limpar
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna direita: resultado + histórico */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm rounded-2xl">
                            <CardHeader className="space-y-1">
                                <CardTitle>Resultado</CardTitle>
                                <CardDescription>Hash e metadados (assinatura virá do backend).</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!result ? (
                                    <p className="text-sm text-muted-foreground">
                                        Assine um texto para ver os detalhes aqui.
                                    </p>
                                ) : (
                                    <>
                                        <div className="grid gap-1.5">
                                            <span className="text-xs text-muted-foreground">ID da assinatura</span>
                                            <div className="flex items-center gap-2">
                                                <Input value={result.id} readOnly className="font-mono text-xs" />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(result.id, "ID")}
                                                    aria-label="Copiar ID"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <span className="text-xs text-muted-foreground">Hash (SHA-256)</span>
                                            <div className="flex items-center gap-2">
                                                <Input value={result.hashHex} readOnly className="font-mono text-xs" />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(result.hashHex, "Hash")}
                                                    aria-label="Copiar hash"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <span className="text-xs text-muted-foreground">Assinatura (mock)</span>
                                            <Input
                                                value={result.signature ?? "— será preenchida pelo backend —"}
                                                readOnly
                                                className="font-mono text-xs"
                                            />
                                        </div>

                                        <Separator />

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-0.5">
                                                <span className="text-xs text-muted-foreground">Algoritmo</span>
                                                <div className="text-sm font-medium">{result.algo}</div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-xs text-muted-foreground">Data/Hora</span>
                                                <div className="text-sm font-medium">{result.createdAt}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm rounded-2xl">
                            <CardHeader className="space-y-1">
                                <CardTitle>Últimas assinaturas</CardTitle>
                                <CardDescription>Somente nesta sessão (mock, sem backend).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recent.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhuma assinatura ainda.</p>
                                ) : (
                                    <>
                                        <Separator className="mb-3" />
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Data/Hora</TableHead>
                                                    <TableHead>Algoritmo</TableHead>
                                                    <TableHead>Hash</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recent.map((s) => (
                                                    <TableRow key={s.id}>
                                                        <TableCell className="font-mono text-xs">{s.id}</TableCell>
                                                        <TableCell className="text-xs">{s.createdAt}</TableCell>
                                                        <TableCell className="text-xs">{s.algo}</TableCell>
                                                        <TableCell className="font-mono text-xs truncate max-w-[220px]">
                                                            {s.hashHex}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
