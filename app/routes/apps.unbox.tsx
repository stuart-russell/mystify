import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useEffect } from "react";

type RevealItem = {
  setId: number | null;
  variantId: string;
  itemName: string;
  color?: string;
};

type LoaderData = {
  boxPurchaseId: string | null;
  boxName: string;
  design: {
    animationStyle: string;
    boxImageUrl: string | null;
    openSoundUrl: string | null;
    backgroundColor: string | null;
    backgroundImageUrl: string | null;
  };
  isOpened: boolean;
  reveals: RevealItem[];
  error?: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const boxPurchaseId = url.searchParams.get("boxPurchaseId");

  if (!boxPurchaseId) {
    return Response.json({
      boxPurchaseId: null,
      boxName: "",
      design: { animationStyle: "default", boxImageUrl: null, openSoundUrl: null, backgroundColor: null, backgroundImageUrl: null },
      isOpened: false,
      reveals: [],
    });
  }

  const boxPurchase = await db.boxPurchase.findUnique({
    where: { id: boxPurchaseId },
    include: {
      mysteryBox: {
        include: { boxDesign: true },
      },
      reveals: { orderBy: { setId: "asc" } },
    },
  });

  if (!boxPurchase) {
    return Response.json({
      boxPurchaseId,
      boxName: "",
      design: { animationStyle: "default", boxImageUrl: null, openSoundUrl: null, backgroundColor: null, backgroundImageUrl: null },
      isOpened: false,
      reveals: [],
      error: "Mystery box not found.",
    });
  }

  const design = boxPurchase.mysteryBox.boxDesign;

  return Response.json({
    boxPurchaseId,
    boxName: boxPurchase.mysteryBox.productTitle,
    design: {
      animationStyle: design?.animationStyle ?? "default",
      boxImageUrl: design?.boxImageUrl ?? null,
      openSoundUrl: design?.openSoundUrl ?? null,
      backgroundColor: design?.backgroundColor ?? null,
      backgroundImageUrl: design?.backgroundImageUrl ?? null,
    },
    isOpened: boxPurchase.status === "opened",
    reveals: boxPurchase.reveals.map((r) => ({
      setId: r.setId ?? null,
      variantId: r.variantId,
      itemName: r.itemName,
    })),
  });
};

const ANIMATIONS: Record<string, string> = {
  default: "mystify-anim-default",
  slide: "mystify-anim-slide",
  fade: "mystify-anim-fade",
};

export default function UnboxPage() {
  const data = useLoaderData() as LoaderData;
  const { boxPurchaseId, boxName, design, isOpened, reveals: initialReveals, error } = data;

  const [reveals, setReveals] = useState<RevealItem[]>(initialReveals);
  const [currentIndex, setCurrentIndex] = useState(initialReveals.length);
  const [isOpening, setIsOpening] = useState(false);
  const [opened, setOpened] = useState(isOpened);
  const [mode, setMode] = useState<"one" | "all" | "auto">("one");

  const animClass = ANIMATIONS[design.animationStyle] ?? ANIMATIONS.default;

  const bgStyle: React.CSSProperties = {};
  if (design.backgroundColor) bgStyle.backgroundColor = design.backgroundColor;
  if (design.backgroundImageUrl) {
    bgStyle.backgroundImage = `url(${design.backgroundImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  const handleOpen = async (openMode: "one" | "all" | "auto") => {
    if (!boxPurchaseId || isOpening) return;
    setIsOpening(true);
    setMode(openMode);

    try {
      const resp = await fetch("/api/unbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boxPurchaseId }),
      });
      const result = await resp.json();
      if (!result.success) throw new Error(result.error);

      const items: RevealItem[] = result.items ?? [];

      if (design.openSoundUrl) {
        try { new Audio(design.openSoundUrl).play().catch(() => {}); } catch {}
      }

      if (openMode === "all") {
        setReveals(items);
        setCurrentIndex(items.length);
        setOpened(true);
        setIsOpening(false);
      } else if (openMode === "auto") {
        setReveals(items);
        setOpened(true);
        for (let i = 0; i <= items.length; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          setCurrentIndex(i);
        }
        setIsOpening(false);
      } else {
        setReveals(items);
        setOpened(true);
        // "one" mode: reveal first item immediately, rest on click
        setCurrentIndex(1);
        setIsOpening(false);
      }
    } catch {
      setIsOpening(false);
      alert("Failed to open mystery box. Please try again.");
    }
  };

  const revealNext = () => {
    if (currentIndex < reveals.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!boxPurchaseId) {
    return (
      <div style={{ padding: "3rem 1rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Mystify</h1>
        <p style={{ color: "#666" }}>No mystery box specified. Use the link from your order confirmation.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem 1rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Mystify</h1>
        <p style={{ color: "#c00" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "system-ui, sans-serif", ...bgStyle }}>
      <style>{`
        @keyframes mystify-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-8px) rotate(-3deg); }
          40% { transform: translateX(8px) rotate(3deg); }
          60% { transform: translateX(-6px) rotate(-2deg); }
          80% { transform: translateX(6px) rotate(2deg); }
        }
        @keyframes mystify-flip {
          0% { transform: perspective(600px) rotateY(0deg); }
          100% { transform: perspective(600px) rotateY(180deg); }
        }
        @keyframes mystify-reveal {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes mystify-slide-in {
          0% { opacity: 0; transform: translateX(60px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes mystify-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .mystify-anim-default .mystify-box {
          animation: mystify-shake 0.6s ease-in-out 2, mystify-flip 0.5s ease-in-out 1.2s forwards;
        }
        .mystify-anim-default .mystify-item {
          opacity: 0;
          animation: mystify-reveal 0.4s ease-out 1.7s forwards;
        }
        .mystify-anim-slide .mystify-box {
          opacity: 0;
          animation: mystify-fade-in 0.3s ease-out 0s forwards;
        }
        .mystify-anim-slide .mystify-item {
          opacity: 0;
          animation: mystify-slide-in 0.5s ease-out 0.3s forwards;
        }
        .mystify-anim-fade .mystify-box {
          opacity: 0;
          animation: mystify-fade-in 0.5s ease-out 0s forwards;
        }
        .mystify-anim-fade .mystify-item {
          opacity: 0;
          animation: mystify-fade-in 0.6s ease-out 0.5s forwards;
        }
      `}</style>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1rem" }}>
        {opened ? (
          <div>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>{boxName}</h2>

            {reveals.slice(0, currentIndex).map((item, idx) => (
              <div
                key={item.variantId}
                className={`${animClass} mystify-item`}
                style={{
                  textAlign: "center",
                  padding: "1.5rem",
                  marginBottom: "1rem",
                  borderRadius: "12px",
                  background: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  borderLeft: item.color ? `4px solid ${item.color}` : undefined,
                }}
              >
                {reveals.length > 1 && (
                  <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: "0.5rem" }}>
                    Set {item.setId ?? idx + 1}
                  </p>
                )}
                <p style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
                  {item.itemName}
                </p>
              </div>
            ))}

            {currentIndex < reveals.length && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  onClick={revealNext}
                  style={{
                    padding: "12px 32px",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#4f46e5",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Reveal Next Item
                </button>
              </div>
            )}

            {currentIndex >= reveals.length && (
              <p style={{ textAlign: "center", color: "#999", marginTop: "1.5rem" }}>
                All items revealed
              </p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>{boxName}</h2>
            <p style={{ color: "#666", marginBottom: "2rem" }}>Your mystery box is ready to open!</p>

            <div
              className={`${animClass} mystify-box`}
              style={{
                width: "200px",
                height: "200px",
                margin: "0 auto 2rem",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                background: design.boxImageUrl
                  ? `url(${design.boxImageUrl}) center/cover`
                  : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: design.boxImageUrl ? "transparent" : "#fff",
                boxShadow: "0 4px 24px rgba(79,70,229,0.3)",
              }}
            >
              {!design.boxImageUrl && "?"}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => handleOpen("one")}
                disabled={isOpening}
                style={{
                  padding: "12px 24px",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4f46e5",
                  color: "#fff",
                  cursor: isOpening ? "default" : "pointer",
                  fontWeight: 600,
                  opacity: isOpening ? 0.6 : 1,
                }}
              >
                {isOpening && mode === "one" ? "Opening..." : "Open One"}
              </button>
              <button
                onClick={() => handleOpen("all")}
                disabled={isOpening}
                style={{
                  padding: "12px 24px",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#059669",
                  color: "#fff",
                  cursor: isOpening ? "default" : "pointer",
                  fontWeight: 600,
                  opacity: isOpening ? 0.6 : 1,
                }}
              >
                Reveal All
              </button>
              <button
                onClick={() => handleOpen("auto")}
                disabled={isOpening}
                style={{
                  padding: "12px 24px",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#d97706",
                  color: "#fff",
                  cursor: isOpening ? "default" : "pointer",
                  fontWeight: 600,
                  opacity: isOpening ? 0.6 : 1,
                }}
              >
                Auto-play
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
