import type { ContactSettings, TourSettings } from "../lib/types";

const BOOKING_URL = "https://pousada-velho-chico.artaxnet.com/";

export default function PostCTA({
  contact,
  tour,
}: {
  contact: ContactSettings;
  tour?: TourSettings;
}) {
  const whatsappUrl = `https://wa.me/${contact.whatsapp}`;

  const items = [
    {
      emoji: "🛏️",
      label: "Ver disponibilidade",
      href: BOOKING_URL,
      external: true,
    },
    ...(tour?.enabled && tour.url
      ? [{ emoji: "🌴", label: "Tour Virtual 360°", href: "/#tour", external: false }]
      : []),
    {
      emoji: "🏡",
      label: "Conheça nossas acomodações",
      href: "/#acomodacoes",
      external: false,
    },
    {
      emoji: "📲",
      label: "Fale com nossa equipe",
      href: whatsappUrl,
      external: true,
    },
    {
      emoji: "📍",
      label: "Como chegar",
      href: "/#localizacao",
      external: false,
    },
  ];

  return (
    <div className="mt-12 rounded-xl border border-brand/20 bg-brand-light px-6 py-7">
      <p className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-brand">
        Velho Chico — venha nos conhecer
      </p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="flex items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-ink transition hover:border-brand/30 hover:bg-white hover:text-brand"
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
