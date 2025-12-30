"use client";

import { gsap } from "gsap";
import type React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Media } from "@/components/Media";
import type { Page } from "@/payload-types";

import { useAnimationStore } from "@/stores/animationStore";
import { cn } from "@/utilities/ui";
import styles from "./homeHero.module.css";

type HeroProps = Page["hero"];

export const HomeHero: React.FC<HeroProps> = ({ media }) => {
  const setHeroAnimationComplete = useAnimationStore(
    (s) => s.setHeroAnimationComplete
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const mediaMaskRef = useRef<HTMLDivElement>(null);
  const topMarqueeRef = useRef<HTMLDivElement>(null);
  const bottomMarqueeRef = useRef<HTMLDivElement>(null);

  const animationTriggeredRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // compute reduced motion in an effect to avoid SSR surprises
  const reducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      reducedMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Build GSAP timeline once
  useLayoutEffect(() => {
    if (reducedMotionRef.current) {
      setHeroAnimationComplete(true);
      animationTriggeredRef.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(mediaMaskRef.current, { clipPath: "inset(0 0 100% 0)" });
      gsap.set([topMarqueeRef.current, bottomMarqueeRef.current], {
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => setHeroAnimationComplete(true),
      });

      tl.to(mediaMaskRef.current, {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.2,
        ease: "power2.inOut",
      })
        .to(topMarqueeRef.current, { autoAlpha: 1, duration: 0.8 }, "-=0.3")
        .to(bottomMarqueeRef.current, { autoAlpha: 1, duration: 0.8 }, "-=0.5");

      tlRef.current = tl;
    }, containerRef);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
  }, [setHeroAnimationComplete]);

  // Trigger animation on page load, exactly once
  useEffect(() => {
    if (reducedMotionRef.current || animationTriggeredRef.current) return;

    const play = () => {
      if (animationTriggeredRef.current) return;
      animationTriggeredRef.current = true;
      // next frame to ensure DOM styles are applied
      requestAnimationFrame(() => tlRef.current?.play(0));
    };

    if (document.readyState === "complete") {
      play();
    } else {
      const onLoad = () => {
        window.removeEventListener("load", onLoad);
        play();
      };
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  const experienceText = [
    "Co-Founder",
    "Creative Director",
    "Web Designer",
    "Brand Designer",
    "Product Design",
    "Design Engineer",
  ];

  const skillsText = [
    "Brand Identity Development",
    "Visual Identity Design",
    "Web Design",
    "Web Development",
    "Product Strategy",
    "Product Design",
    "Design Engineer",
    "3D Modeling & Rendering",
  ];

  return (
    <div
      data-theme="light"
      ref={containerRef}
      className="bg-background relative flex h-[90vh] w-full flex-col items-center overflow-hidden md:h-screen"
    >
      {/* Top marquee */}
      <div
        ref={topMarqueeRef}
        className="absolute top-[40vh] z-0 w-full opacity-0"
      >
        <div
          className={cn(
            styles["marquee-top"],
            "flex flex-row gap-12 font-mono text-black"
          )}
        >
          {[...skillsText, ...skillsText].map((text, idx) => (
            <div
              key={idx}
              className={cn(styles.marqueeItem, "whitespace-nowrap")}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Media with mask animation */}
      <div className="relative z-10 flex h-[90vh] items-center justify-center md:h-screen">
        <div
          ref={mediaMaskRef}
          className="w-[30vh] overflow-hidden rounded-sm"
          style={{ clipPath: "inset(0 0 100% 0)" }}
        >
          {/* Key change: render media without a wrapper and pass classes to the media node */}
          <Media
            htmlElement={null}
            className="h-full w-full object-cover"
            resource={media}
          />
        </div>
      </div>

      {/* Bottom marquee */}
      <div
        ref={bottomMarqueeRef}
        className="absolute top-[50vh] z-20 w-full opacity-0"
      >
        <div
          className={cn(
            styles.marquee,
            "flex flex-row items-center gap-12 font-mono text-black"
          )}
        >
          {[...experienceText, ...experienceText].map((text, idx) => (
            <div
              key={idx}
              className={cn(styles.marqueeItem, "whitespace-nowrap text-black")}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
