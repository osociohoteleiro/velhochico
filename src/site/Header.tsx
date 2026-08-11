import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { GeneralSettings, ContactSettings } from "../lib/types";
import { PinIcon, FacebookIcon, InstagramIcon, WhatsappIcon } from "./icons";

// `to` => rota (react-router); `href` => âncora na home.
const NAV: { label: string; href?: string; to?: string }[] = [
  { label: "HOTEL", href: "#sobre" },
  { label: "ACOMODAÇÕES", href: "#acomodacoes" },
  { label: "EXPERIÊNCIAS", href: "#experiencias" },
  { label: "CONTATO", href: "#contato" },
];

export default function Header({
  general,
  contact,
}: {
  general: GeneralSettings;
  contact: ContactSettings;
}) {
  const [open, setOpen] = useState(false);
  // Links de âncora (#sobre, #acomodacoes...) só existem na home. Fora dela,
  // prefixamos com "/" para voltar à home e então rolar até a seção.
  const onHome = useLocation().pathname === "/";
  const anchor = (href: string) => (onHome ? href : `/${href}`);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt={general.siteName}
              className="h-14 w-auto shrink-0 md:h-16"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium tracking-wide text-ink lg:flex">
            {NAV.map((n) =>
              n.to ? (
                <Link key={n.label} to={n.to} className="transition hover:text-brand">
                  {n.label}
                </Link>
              ) : (
                <a key={n.label} href={anchor(n.href!)} className="transition hover:text-brand">
                  {n.label}
                </a>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="flex items-center gap-1 text-xs text-ink">
              <PinIcon className="h-4 w-4" /> {general.location}
            </span>
            <a
              href={anchor("#reservar")}
              className="btn-brand rounded-full px-5 py-3 text-sm font-medium tracking-wider"
            >
              FAÇA UMA RESERVA
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            aria-label="Menu"
          >
            <span className="h-0.5 w-6 bg-ink" />
            <span className="h-0.5 w-6 bg-ink" />
            <span className="h-0.5 w-6 bg-ink" />
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 bg-white px-5 pb-4 lg:hidden">
            {NAV.map((n) =>
              n.to ? (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-gray-100 py-2 text-sm tracking-wide text-ink"
                >
                  {n.label}
                </Link>
              ) : (
                <a
                  key={n.label}
                  href={anchor(n.href!)}
                  onClick={() => setOpen(false)}
                  className="border-b border-gray-100 py-2 text-sm tracking-wide text-ink"
                >
                  {n.label}
                </a>
              ),
            )}
            <a href={anchor("#reservar")} className="btn-brand mt-3 rounded-full px-5 py-3 text-center text-sm">
              FAÇA UMA RESERVA
            </a>
          </nav>
        )}
      </header>

      {/* Barra social fixa lateral */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        <SocialIcon href={contact.facebook} label="Facebook">
          <FacebookIcon className="h-5 w-5" />
        </SocialIcon>
        <SocialIcon href={contact.instagram} label="Instagram">
          <InstagramIcon className="h-5 w-5" />
        </SocialIcon>
        <SocialIcon href={`https://wa.me/${contact.whatsapp}`} label="WhatsApp">
          <WhatsappIcon className="h-5 w-5" />
        </SocialIcon>
      </div>
    </>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-brand/70 text-white shadow-md ring-1 ring-white/30 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-brand"
    >
      {children}
    </a>
  );
}
