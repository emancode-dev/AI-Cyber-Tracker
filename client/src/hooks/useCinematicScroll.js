import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function useCinematicScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.classList.add("motion-reduced");
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.12,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.92,
      anchors: { offset: -76 }
    });

    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.fromTo("[data-hero-line]",
        { yPercent: 115, opacity: 0, rotateX: -16 },
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.08, stagger: 0.12, ease: "power4.out", delay: 0.18 }
      );
      gsap.fromTo(".v3-hero-support, .v3-hero-actions, .v3-trust-rail",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.7 }
      );
      gsap.fromTo(".v3-hero-core",
        { scale: 0.72, opacity: 0, rotate: -8 },
        { scale: 1, opacity: 1, rotate: 0, duration: 1.4, ease: "expo.out", delay: 0.42 }
      );

      gsap.to(".v3-hero-core", {
        yPercent: 18,
        scale: 1.08,
        rotate: 10,
        ease: "none",
        scrollTrigger: { trigger: ".v3-hero", start: "top top", end: "bottom top", scrub: 1.15 }
      });
      gsap.to(".v3-hero-copy", {
        yPercent: -13,
        opacity: 0.22,
        ease: "none",
        scrollTrigger: { trigger: ".v3-hero", start: "35% top", end: "bottom top", scrub: 1 }
      });

      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(el,
          { y: 42, opacity: 0, filter: "blur(8px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)", duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" }
          }
        );
      });

      gsap.utils.toArray("[data-stagger]").forEach((wrap) => {
        const children = wrap.querySelectorAll("[data-stagger-item]");
        gsap.fromTo(children,
          { y: 26, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.72, stagger: 0.09, ease: "power3.out",
            scrollTrigger: { trigger: wrap, start: "top 82%", toggleActions: "play none none reverse" }
          }
        );
      });

      const riskPins = gsap.utils.toArray(".v3-risk-pin");
      riskPins.forEach((pin, index) => {
        gsap.fromTo(pin,
          { scale: 0.65, opacity: 0, x: index % 2 ? 25 : -25 },
          {
            scale: 1, opacity: 1, x: 0, ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: ".v3-hidden-risk",
              start: `${23 + index * 10}% center`,
              end: `${38 + index * 10}% center`,
              scrub: 0.8
            }
          }
        );
      });
      gsap.to(".v3-browser-stage", {
        scale: 1.055,
        boxShadow: "0 0 90px rgba(139,92,246,.18)",
        ease: "none",
        scrollTrigger: { trigger: ".v3-hidden-risk", start: "top 60%", end: "bottom 30%", scrub: 1 }
      });

      const coreTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".v3-core-scroll",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1
        }
      });
      coreTl
        .to(".v3-core-orb", { scale: 1.12, rotate: 38, duration: 1 }, 0)
        .to(".v3-core-node.transport", { opacity: 1, scale: 1, duration: .6 }, .1)
        .to(".v3-core-node.headers", { opacity: 1, scale: 1, duration: .6 }, .45)
        .to(".v3-core-node.cookies", { opacity: 1, scale: 1, duration: .6 }, .75)
        .to(".v3-core-node.context", { opacity: 1, scale: 1, duration: .6 }, 1.05)
        .to(".v3-core-beam", { opacity: 1, scaleY: 1, duration: .8 }, .9)
        .to(".v3-normalized-pill", { opacity: 1, y: 0, scale: 1, duration: .8 }, 1.25)
        .to(".v3-core-orb", { scale: .86, filter: "brightness(1.25)", duration: .8 }, 1.35);

      gsap.utils.toArray(".v3-flow-dot").forEach((dot, index) => {
        gsap.to(dot, {
          xPercent: 700,
          opacity: 0,
          duration: 2.4 + index * .25,
          repeat: -1,
          delay: index * .45,
          ease: "none"
        });
      });

      const scoreTl = gsap.timeline({
        scrollTrigger: { trigger: ".v3-score", start: "top 68%", toggleActions: "play none none reverse" }
      });
      scoreTl
        .fromTo(".v3-score-input", { x: -24, opacity: 0 }, { x: 0, opacity: 1, stagger: .12, duration: .55 })
        .fromTo(".v3-rule-engine", { scale: .78, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: "back.out(1.4)" })
        .fromTo(".v3-score-gauge", { "--score-angle": "0deg" }, { "--score-angle": "280deg", duration: 1.2, ease: "power3.out" })
        .fromTo(".v3-category-fill", { scaleX: 0 }, { scaleX: 1, duration: .7, stagger: .06, transformOrigin: "left" }, "-=.55");

      const sensitive = gsap.utils.toArray(".v3-payload-field.sensitive");
      const aiTl = gsap.timeline({
        scrollTrigger: { trigger: ".v3-ai-story", start: "top 64%", end: "bottom 35%", scrub: 1 }
      });
      aiTl
        .to(sensitive, { opacity: .16, x: 18, textDecorationColor: "rgba(244,114,182,.85)", stagger: .08, duration: .6 })
        .to(".v3-payload-cut", { scaleX: 1, stagger: .08, duration: .5 }, .08)
        .to(".v3-min-payload", { opacity: 1, scale: 1, y: 0, duration: .7 }, .58)
        .to(".v3-ai-roadmap", { opacity: 1, y: 0, duration: .7 }, .92);

      gsap.fromTo(".v3-dashboard-frame",
        { y: 90, scale: .9, rotateX: 9, opacity: 0, filter: "blur(14px)" },
        {
          y: 0, scale: 1, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 1.25, ease: "power4.out",
          scrollTrigger: { trigger: ".v3-dashboard-showcase", start: "top 75%", toggleActions: "play none none reverse" }
        }
      );

      gsap.utils.toArray("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || "";
        const state = { value: 0 };
        gsap.to(state, {
          value: end, duration: 1.6, ease: "power2.out",
          onUpdate: () => { el.textContent = `${Math.round(state.value)}${suffix}`; },
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
      });

      gsap.to(".v3-retention-data", {
        xPercent: 240,
        opacity: 0,
        scale: .45,
        ease: "none",
        scrollTrigger: { trigger: ".v3-privacy", start: "top 70%", end: "bottom 36%", scrub: 1 }
      });

      gsap.to(".v3-final-glow", {
        scale: 1.18,
        opacity: .75,
        ease: "none",
        scrollTrigger: { trigger: ".v3-final-cta", start: "top bottom", end: "center center", scrub: 1 }
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, [rootRef]);
}
