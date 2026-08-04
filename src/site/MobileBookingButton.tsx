import { useEffect, useRef, useState } from "react";
import { buildBookingUrl, todayISO } from "./BookingBar";

/**
 * Botão fixo de reserva para mobile.
 * Aparece assim que a barra de reservas (passada via anchorRef) sai do viewport.
 */
export default function MobileBookingButton({
  anchorRef,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  const today = useRef(todayISO(0)).current;
  const tomorrow = useRef(todayISO(1)).current;

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [anchorRef]);

  if (!visible) return null;

  const href = buildBookingUrl({ checkin: today, checkout: tomorrow, adults: 2, childAges: [] });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 inset-x-4 z-50 md:hidden flex items-center justify-center rounded-lg bg-brand/80 backdrop-blur-sm py-4 text-sm font-semibold tracking-widest text-white shadow-lg transition active:scale-95"
    >
      RESERVAR
    </a>
  );
}
