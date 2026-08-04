import { useEffect, useRef, useState } from "react";
import { getContent } from "../lib/api";
import type { SiteContent } from "../lib/types";
import Header from "./Header";
import Hero from "./Hero";
import BookingBar from "./BookingBar";
import MobileBookingButton from "./MobileBookingButton";
import About from "./About";
import Highlights from "./Highlights";
import Rooms from "./Rooms";
import Experiences from "./Experiences";
import Packages from "./Packages";
import Promotions from "./Promotions";
import Location from "./Location";
import Promo from "./Promo";
import BlogTeaser from "./BlogTeaser";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import ThemeStyle from "./ThemeStyle";
import VirtualTour from "./VirtualTour";

export default function SitePage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const bookingWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getContent()
      .then(setContent)
      .catch((e) => setError(e.message));
  }, []);

  // Pulsa a barra ao clicar em qualquer link "#reservar"
  useEffect(() => {
    function pulse() {
      const el = bookingCardRef.current;
      if (!el) return;
      el.classList.remove("booking-highlight-active");
      void el.offsetWidth;
      el.classList.add("booking-highlight-active");
    }
    function onClick(e: MouseEvent) {
      if ((e.target as HTMLElement | null)?.closest('a[href$="#reservar"]'))
        window.setTimeout(pulse, 60);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Após o conteúdo carregar, rola até a âncora do hash (ex.: /#acomodacoes)
  useEffect(() => {
    if (!content) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    // Pequeno delay para garantir que o DOM das seções já foi pintado
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [content]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-light px-6 text-center">
        <div>
          <h1 className="section-title mb-2 text-2xl">Não foi possível carregar o site</h1>
          <p className="text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Verifique se o banco D1 foi migrado e populado (veja o README).
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-light">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const { settings, rooms, highlights, amenities, testimonials, experiences, packages, promotions, posts } =
    content;

  return (
    <div>
      <ThemeStyle theme={settings.theme} />
      <Header general={settings.general} contact={settings.contact} />
      <Hero hero={settings.hero} />

      {settings.hero.showBooking && (
        <>
          {/* Desktop: barra sticky abaixo do header. Mobile: posição normal (não sticky). */}
          <div
            id="reservar"
            ref={bookingWrapperRef}
            className="booking-anchor md:sticky top-20 z-30 flex justify-center px-4 bg-white"
          >
            <div
              ref={bookingCardRef}
              className="booking-card w-full max-w-5xl rounded-md bg-white shadow-xl"
              onAnimationEnd={(e) => e.currentTarget.classList.remove("booking-highlight-active")}
            >
              <BookingBar />
            </div>
          </div>

          {/* Mobile: botão fixo que aparece quando a barra sai do viewport */}
          <MobileBookingButton anchorRef={bookingWrapperRef} />
        </>
      )}

      <About about={settings.about} />
      <Highlights
        highlights={highlights}
        amenities={amenities}
        highlightsSection={settings.highlightsSection}
        amenitiesSection={settings.amenitiesSection}
      />
      <Rooms rooms={rooms} section={settings.roomsSection} />
      <VirtualTour tour={settings.tour} />
      <Experiences experiences={experiences} section={settings.experiencesSection} />
      <Packages packages={packages} section={settings.packagesSection} />
      <Promotions promotions={promotions} section={settings.promotionsSection} />
      <Location location={settings.location} />
      <Promo promo={settings.promo} />
      <BlogTeaser posts={posts} section={settings.blogSection} />
      <Testimonials testimonials={testimonials} section={settings.testimonialsSection} />
      <Footer general={settings.general} contact={settings.contact} />
    </div>
  );
}
