"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Could not sign in.");
                setLoading(false);
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("Could not reach the server.");
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
                Studio access
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-wide text-cream">
                ADMIN SIGN IN
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        Email
                    </span>
                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        Password
                    </span>
                    <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                    />
                </label>

                {error && (
                    <p className="rounded-sm border border-orange/40 bg-orange-soft px-3 py-2 font-mono text-xs text-orange">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-sm bg-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </div>
    );
}
