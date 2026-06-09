"use client";

import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";

const SESSION_KEY = "subliexpresate_unlocked";

export function PinGate({ children }: { children: React.ReactNode }) {
  const expectedPin = process.env.NEXT_PUBLIC_ACCESS_PIN;
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(!expectedPin);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!expectedPin) return;
    setUnlocked(window.sessionStorage.getItem(SESSION_KEY) === "true");
  }, [expectedPin]);

  if (unlocked) return children;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
      <section className="rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-blue text-white">
          <LockKeyhole size={24} />
        </div>
        <h1 className="text-2xl font-black text-brand-ink">Acceso</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresá el PIN para gestionar pedidos de Subliexpresate.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (pin === expectedPin) {
              window.sessionStorage.setItem(SESSION_KEY, "true");
              setUnlocked(true);
              return;
            }
            setError("El PIN no es correcto.");
          }}
        >
          <input
            className="h-14 w-full rounded-lg border border-slate-300 px-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15"
            inputMode="numeric"
            maxLength={8}
            type="password"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value);
              setError("");
            }}
          />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button className="h-14 w-full rounded-lg bg-brand-ink text-base font-bold text-white">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
