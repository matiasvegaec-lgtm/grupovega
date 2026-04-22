import { useState, FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Mail, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const emailSchema = z.string().trim().email({ message: "Correo inválido" }).max(255);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PromoSubscribeDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: parsed.data.toLowerCase(),
      user_id: user?.id ?? null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.success("Ya estás suscrito a nuestras promociones");
      } else {
        toast.error("No se pudo completar la suscripción");
      }
    } else {
      toast.success("¡Listo! Recibirás nuestras promociones por correo");
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-card rounded-3xl p-7 shadow-elegant border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl gradient-wave flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-navy-deep">
                  Recibe nuestras promociones
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Ofertas y novedades en tu correo.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-1.5 rounded-full hover:bg-foam transition" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-full gradient-wave text-white font-semibold shadow-glow disabled:opacity-60"
            >
              {submitting ? "Suscribiendo..." : "Quiero recibir promociones"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Puedes cancelar la suscripción cuando quieras.
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}