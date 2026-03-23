 import { NextResponse } from "next/server";
 import { supabaseAdmin } from "@/lib/supabase-admin";
 
 async function setRole(userId: string, role: string) {
   const { error } = await supabaseAdmin.from("profiles").update({ rank: role }).eq("id", userId);
   if (error) throw new Error(error.message);
   return `Ustawiono rolę ${role} dla ${userId}`;
 }
 
 async function setLevel(userId: string, levelStr: string) {
   const level = parseInt(levelStr, 10);
   if (!Number.isFinite(level)) throw new Error("Nieprawidłowy poziom");
   const { error } = await supabaseAdmin.from("profiles").update({ level }).eq("id", userId);
   if (error) throw new Error(error.message);
   return `Ustawiono level ${level} dla ${userId}`;
 }
 
 async function addXp(userId: string, amtStr: string) {
   const amount = parseInt(amtStr, 10);
   if (!Number.isFinite(amount)) throw new Error("Nieprawidłowa ilość XP");
   const { data, error: selErr } = await supabaseAdmin.from("profiles").select("xp").eq("id", userId).single();
   if (selErr) throw new Error(selErr.message);
   const next = (data?.xp || 0) + amount;
   const { error } = await supabaseAdmin.from("profiles").update({ xp: next }).eq("id", userId);
   if (error) throw new Error(error.message);
   return `Dodano ${amount} XP (${next}) dla ${userId}`;
 }
 
 export async function POST(req: Request) {
   try {
     const body = await req.json();
     const password = (body?.password as string) || "";
    const name = (body?.name as string) || "";
     const command = (body?.command as string) || "";
     const secret = process.env.ADMIN_CONSOLE_PASSWORD || "";
    const allowedUser = (process.env.ADMIN_CONSOLE_USER || "TwoStepsStudioAdmin").trim().toLowerCase();
     if (!secret) {
       return NextResponse.json({ error: "Brak konfiguracji hasła" }, { status: 500 });
     }
    if (name.trim().toLowerCase() !== allowedUser) {
      return NextResponse.json({ error: "Nieprawidłowa nazwa" }, { status: 401 });
    }
     if (!password || password !== secret) {
       return NextResponse.json({ error: "Hasło nieprawidłowe" }, { status: 401 });
     }
     if (!command) {
       return NextResponse.json({ error: "Brak komendy" }, { status: 400 });
     }
     const parts = command.split(" ").filter(Boolean);
     const cmd = parts[0];
     let result = "";
     if (cmd === "set-role" && parts.length >= 3) {
       result = await setRole(parts[1], parts.slice(2).join(" "));
     } else if (cmd === "set-level" && parts.length >= 3) {
       result = await setLevel(parts[1], parts[2]);
     } else if (cmd === "add-xp" && parts.length >= 3) {
       result = await addXp(parts[1], parts[2]);
     } else {
       return NextResponse.json({ error: "Nieznana komenda" }, { status: 400 });
     }
     return NextResponse.json({ ok: true, result });
   } catch {
     return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
   }
 }
