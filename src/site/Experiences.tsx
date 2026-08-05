import { useRef } from "react";
import type { Experience, SectionTitle } from "../lib/types";
import { ChevronLeft, ChevronRight } from "./icons";

export default function Experiences({
  experiences,
  section,
}: {
  experiences: Experience[];
  section: SectionTitle;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (experiences.length === 0) return null;

  return (
    <section id="experiencias" className="py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">{section?.eyebrow}</p>
          <h2 className="section-title text-3xl md:text-4xl">{section?.title}</h2>
        </div>

        <div className="relative">
          <div
            ref={scroller}
            className="no-scrollbar flex snap-x gap-6 overflow-x-auto scroll-smooth pb-2"
          >
            {experiences.map((exp) => (
              <article
                key={exp.id}
                className="group w-[85%] flex-none snap-start overflow-hidden rounded-md bg-white/85 shadow-sm transition hover:shadow-lg sm:w-[46%] lg:w-[23%]"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={exp.image_url}
                    alt={exp.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl tracking-wide text-ink">{exp.title}</h3>
                  {exp.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{exp.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>

          <button
            onClick={() => scroll(-1)}
            className="absolute -left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-lg transition hover:bg-brand hover:text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute -right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-lg transition hover:bg-brand hover:text-white"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
