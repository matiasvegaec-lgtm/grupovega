const WHATSAPP_URL =
  "https://wa.me/593997738026?text=Hola%20GrupoVega%20%F0%9F%91%8B,%20tengo%20una%20consulta%20%E2%9D%93";

export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white flex items-center justify-center shadow-elegant hover:scale-110 transition-transform animate-float"
      aria-label="WhatsApp"
    >
      {/* Icono oficial estilo WhatsApp */}
      <svg
        viewBox="0 0 32 32"
        className="w-9 h-9 fill-white"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.314.13-.66.058-.99-.13-.546-1.06-.99-1.49-1.103a25.2 25.2 0 0 0-1.032-.616z" />
        <path d="M25.74 6.143A12.8 12.8 0 0 0 16.07 2.143c-7.084 0-12.84 5.756-12.84 12.84 0 2.262.59 4.467 1.717 6.413L3 29l7.768-2.04a12.793 12.793 0 0 0 6.13 1.566h.005c7.083 0 12.84-5.757 12.84-12.84 0-3.43-1.336-6.654-3.762-9.08l.005-.003zM16.04 26.2h-.004a10.65 10.65 0 0 1-5.426-1.486l-.39-.232-4.61 1.21 1.232-4.495-.254-.402a10.643 10.643 0 0 1-1.633-5.677c0-5.886 4.79-10.674 10.68-10.674 2.852 0 5.532 1.112 7.547 3.13a10.62 10.62 0 0 1 3.124 7.55c-.002 5.887-4.79 10.676-10.677 10.676z" />
      </svg>
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </a>
  );
}