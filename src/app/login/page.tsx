"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // If a session already exists (e.g. the person navigated back to /login,
  // or this loaded before the auth SDK finished restoring the session),
  // send them straight to the dashboard instead of showing the form again.
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) router.replace("/dashboard");
      else setCheckingSession(false);
    });
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Enter your email and password."); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err.code === "auth/invalid-credential" ? "Invalid email or password." : "Login failed. Try again.");
    } finally { setLoading(false); }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-ftm-black flex items-center justify-center">
        <div className="text-ftm-muted text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading...</div>
      </div>
    );
  }

  const inputCls = "w-full bg-transparent border border-ftm-line px-4 py-3 text-[12px] text-ftm-white placeholder:text-ftm-dim focus:border-ftm-offwhite outline-none transition-colors";

  return (
    <div className="min-h-screen bg-ftm-black flex items-center justify-center px-6 relative">
      <div className="absolute top-6 right-6"><ThemeToggle /></div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.png" alt="FocusTM" width={52} height={52} className="object-contain mb-5" />
          <h1 className="font-heading text-[20px] tracking-[0.3em] uppercase">FocusTM</h1>
          <p className="text-[9px] uppercase tracking-[0.28em] text-ftm-muted mt-1">Admin Panel</p>
        </div>

        <div className="border border-ftm-line p-8 flex flex-col gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-ftm-muted mb-2">Email</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@focustm.com" className={inputCls} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-ftm-muted mb-2">Password</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="mt-2 w-full py-4 bg-ftm-white text-ftm-black text-[10px] uppercase tracking-[0.22em] hover:bg-ftm-offwhite transition-colors disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-[10px] text-ftm-dim mt-6">FocusTM Collection — Excellence Is The Standard</p>
      </div>
    </div>
  );
}
