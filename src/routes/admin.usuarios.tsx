import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { Loader2, Shield, ShieldOff, UserPlus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type RoleRow = { id: string; user_id: string; role: "admin" | "user"; created_at: string };

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles").select("*").eq("role", "admin").order("created_at");
    if (error) toast.error(error.message);
    else setAdmins((data ?? []) as RoleRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      // Check if user exists by trying to find their role
      const { data: existing } = await supabase
        .from("user_roles").select("user_id").limit(1);
      // We can't query auth.users from client, so we ask the invitee to register first.
      // We store the email-to-promote in a pending mechanism by signing up with a magic link is server-side.
      // For client-only flow: ask them to register, then admin pastes their user id.
      toast.info("Pídele al nuevo admin que se registre en /auth con su correo. Luego pégale su email aquí y lo promoveremos.");
      // Look up by email via RPC is not available; we'll approach differently below.
      void existing;

      // Try promoting: find user_id by email through user_roles join is not possible; we need an RPC.
      // Inform user to use the secure helper:
      throw new Error("Para promover a admin: el invitado debe primero crear cuenta en /auth, luego usa el botón 'Promover por email' (requiere función backend).");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInviting(false);
    }
  };

  const promoteByEmail = async (email: string) => {
    setInviting(true);
    try {
      const { data, error } = await supabase.rpc("promote_user_to_admin", { _email: email });
      if (error) throw error;
      if (!data) throw new Error("No existe un usuario con ese correo. Pídele que se registre primero en /auth.");
      toast.success("Usuario promovido a admin");
      setInviteEmail("");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInviting(false);
    }
  };

  const revokeAdmin = async (row: RoleRow) => {
    if (row.user_id === user?.id) return toast.error("No puedes quitarte tu propio rol");
    if (!confirm("¿Quitar permisos de admin a este usuario?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else { toast.success("Rol revocado"); await load(); }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-navy-deep">Usuarios y roles</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Gestiona quién puede acceder al panel.</p>
      </div>

      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card mb-6">
        <h2 className="font-bold text-navy-deep mb-3 flex items-center gap-2"><UserPlus className="w-5 h-5 text-ocean" /> Invitar admin por correo</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Paso 1: pídele al invitado que cree su cuenta en <code className="bg-foam px-1 rounded">/auth</code>.<br />
          Paso 2: ingresa su correo aquí para promoverlo a administrador.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (inviteEmail) promoteByEmail(inviteEmail); }} className="flex flex-col sm:flex-row gap-2">
          <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="correo@ejemplo.com" className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-ocean focus:outline-none text-sm" />
          <button disabled={inviting} type="submit" className="px-4 py-2 rounded-lg gradient-wave text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Promover
          </button>
        </form>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Shield className="w-5 h-5 text-ocean" />
          <h2 className="font-bold text-navy-deep">Administradores actuales</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ocean" /></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[420px]">
            <thead className="bg-foam">
              <tr>
                <th className="text-left p-3">User ID</th>
                <th className="text-left p-3">Desde</th>
                <th className="text-right p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{a.user_id}{a.user_id === user?.id && <span className="ml-2 px-2 py-0.5 rounded bg-ocean/10 text-ocean text-xs">tú</span>}</td>
                  <td className="p-3 text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button disabled={a.user_id === user?.id} onClick={() => revokeAdmin(a)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed">
                      <ShieldOff className="w-3.5 h-3.5" /> Revocar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}