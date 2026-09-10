import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function useEmeraldMotion(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.classList.add("motion-reduced");
      return undefined;
    }

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9, anchors: { offset: -86 } });
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const splitRecords = [];
    const splitText = (element, unit) => {
      const original = element.innerHTML;
      const text = element.textContent || "";
      element.setAttribute("aria-label", text.trim());
      element.innerHTML = "";
      const segments = unit === "char" ? [...text] : text.split(/(\s+)/);
      segments.forEach((segment) => {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.className = unit === "char" ? "em-reveal-char" : "em-reveal-word";
        span.textContent = segment === " " ? "\u00a0" : segment;
        element.appendChild(span);
      });
      splitRecords.push({ element, original });
      return element.querySelectorAll(unit === "char" ? ".em-reveal-char" : ".em-reveal-word");
    };

    const context = gsap.context(() => {
      root.querySelectorAll(".em-hero h1, .em-section-heading h2, .em-final-cta h2").forEach((element, index) => {
        const words = splitText(element, "word");
        gsap.fromTo(words, { y: "0.75em", opacity: 0, rotateX: -70 }, { y: 0, opacity: 1, rotateX: 0, duration: .72, stagger: .06, ease: "power3.out", delay: index === 0 ? .18 : 0, scrollTrigger: index === 0 ? undefined : { trigger: element, start: "top 88%", once: true } });
      });
      root.querySelectorAll(".em-section-heading > p").forEach((element) => {
        const words = splitText(element, "word");
        gsap.fromTo(words, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .018, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 90%", once: true } });
      });
      gsap.fromTo("[data-em-hero]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out" });
      gsap.fromTo(".em-hero-visual", { scale: 0.86, opacity: 0, rotate: -4 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.25, ease: "expo.out", delay: 0.22 });
      gsap.utils.toArray("[data-em-reveal]").forEach((element) => {
        gsap.fromTo(element, { y: 36, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.78,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray("[data-em-stagger]").forEach((element) => {
        const children = element.querySelectorAll("[data-em-item]");
        gsap.fromTo(children, { y: 24, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 84%", once: true },
        });
      });
      gsap.to(".em-hero-visual", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".em-hero", start: "top top", end: "bottom top", scrub: 0.8 },
      });
    }, root);

    ScrollTrigger.refresh();
    return () => {
      context.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      splitRecords.forEach(({ element, original }) => { element.innerHTML = original; element.removeAttribute("aria-label"); });
    };
  }, [rootRef]);
}
