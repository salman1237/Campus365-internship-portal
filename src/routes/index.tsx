import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus365 — Internship Program" },
      { name: "description", content: "Apply for the Campus365 internship program. Join Skoder Technologies and grow your career." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [content, setContent] = useState({
    badgeText: "Accepting Applications — Batch 2025",
    headingPart1: "Grow Your Career",
    headingPart2: "with Campus365",
    subtitleWords: "Build real-world products at Skoder Technologies., Work with IBM Microsoft & Google-backed teams., Earn an internship certificate upon completion.",
  });

  useEffect(() => {
    supabase.storage.from("logos").download("landing-config.json").then(({ data }) => {
      if (data) {
        data.text().then(text => {
          try {
            setContent(JSON.parse(text));
          } catch(e) {}
        });
      }
    });
  }, []);

  const subtitles = content.subtitleWords.split(",").map(s => s.trim()).filter(Boolean);
  const cycleCount = subtitles.length;

  const generateKeyframes = () => {
    if (cycleCount === 0) return "";
    let kf = "@keyframes dynamicCycle { ";
    const step = 100 / cycleCount;
    for (let i = 0; i < cycleCount; i++) {
      const startPause = i * step;
      const endPause = startPause + (step * 0.85);
      kf += `${startPause.toFixed(2)}% { transform: translateY(-${i * 2}rem); } `;
      kf += `${endPause.toFixed(2)}% { transform: translateY(-${i * 2}rem); } `;
    }
    kf += `100% { transform: translateY(-${cycleCount * 2}rem); } `;
    kf += "}";
    return kf;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a12] flex flex-col items-center justify-center text-white">
      {/* Animated gradient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #6b2fa8, transparent 70%)",
            animation: "float1 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #c0392b, transparent 70%)",
            animation: "float2 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #1e8449, transparent 70%)",
            animation: "float3 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-3xl">
        {/* Logo */}
        <div
          className="mb-8"
          style={{ animation: "fadeDown 0.7s ease both" }}
        >
          <img
            src="https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/campus365-logo.png"
            alt="Campus365"
            className="h-20 w-auto mx-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70 backdrop-blur"
          style={{ animation: "fadeDown 0.8s ease both" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          {content.badgeText}
        </div>

        {/* Heading */}
        <h1
          className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl"
          style={{ animation: "fadeDown 0.9s ease both" }}
        >
          {content.headingPart1}{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #9b59b6, #6b2fa8, #c0392b)",
            }}
          >
            {content.headingPart2}
          </span>
        </h1>

        {/* Animated cycling subtitle */}
        <div
          className="mt-6 h-8 overflow-hidden"
          style={{ animation: "fadeDown 1s ease both" }}
        >
          <div style={{ animation: cycleCount > 0 ? `dynamicCycle ${cycleCount * 3}s linear infinite` : "none" }}>
            {subtitles.map((sub, i) => (
              <p key={i} className="h-8 text-lg text-white/60 leading-8">{sub}</p>
            ))}
            {subtitles.length > 0 && (
              <p className="h-8 text-lg text-white/60 leading-8">{subtitles[0]}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p
          className="mt-4 max-w-xl text-base text-white/50 leading-relaxed"
          style={{ animation: "fadeDown 1.05s ease both" }}
        >
          Campus365 is a Skoder Technologies product powering digital transformation for universities across Bangladesh. Join our internship program and contribute to something that matters.
        </p>

        {/* CTA Button */}
        <div
          className="mt-10"
          style={{ animation: "fadeDown 1.15s ease both" }}
        >
          <Link
            to="/apply"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-900/40"
            style={{
              background: "linear-gradient(135deg, #6b2fa8, #9b59b6)",
              boxShadow: "0 0 40px rgba(107, 47, 168, 0.4)",
            }}
          >
            <span>Apply Now</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {/* Shine effect */}
            <span
              className="absolute inset-0 -translate-x-full opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              }}
            />
          </Link>
        </div>

        {/* Partner logos row */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-40"
          style={{ animation: "fadeDown 1.3s ease both" }}
        >
          {[
            { url: "https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/ibm.png", alt: "IBM" },
            { url: "https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/ms-startups.png", alt: "Microsoft for Startups" },
            { url: "https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/google-startups.png", alt: "Google for Startups" },
            { url: "https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/idea.png", alt: "IDEA" },
            { url: "https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/accelerating-bangladesh.png", alt: "Accelerating Bangladesh" },
          ].map((logo) => (
            <img
              key={logo.alt}
              src={logo.url}
              alt={logo.alt}
              className="h-7 w-auto object-contain invert"
            />
          ))}
        </div>

        <p className="mt-6 text-xs text-white/25">Backed by the world's leading tech programs</p>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ${generateKeyframes()}
      `}</style>
    </div>
  );
}
