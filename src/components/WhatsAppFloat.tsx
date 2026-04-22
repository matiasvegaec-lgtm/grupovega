import { MessageCircle } from "lucide-react";

const PHONE = "593997738026";
const MESSAGE = "Hola Grupo Vega, me gustaría más información.";

export function WhatsAppFloat() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(MESSAGE);
    // En móvil intenta abrir la app nativa; en desktop abre WhatsApp Web directo
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const url = isMobile
      ? `whatsapp://send?phone=${PHONE}&text=${text}`
      : `https://web.whatsapp.com/send?phone=${PHONE}&text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={`https://web.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(MESSAGE)}`}
      onClick={handleClick}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-elegant hover:scale-110 transition-transform animate-float"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </a>
  );
}