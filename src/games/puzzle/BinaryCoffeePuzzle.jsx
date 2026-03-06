import { useState, useEffect, useCallback, useRef } from "react";

const GRID = 3;
const TOTAL = GRID * GRID;

// Niveles de descuento por tiempo (en segundos)
const DISCOUNT_TIERS = [
  { maxTime: 6,   discount: 15, label: "⚡ VELOZ",       color: "#e91e8c", bg: "rgba(233,30,140,0.15)",  code: "MUJER15", desc: "¡Increíble velocidad!" },
  { maxTime: 12,  discount: 12, label: "🔥 RÁPIDA",      color: "#9b59b6", bg: "rgba(155,89,182,0.15)", code: "MUJER12", desc: "¡Muy bien jugado!" },
  { maxTime: 18,  discount: 10, label: "✨ LISTA",        color: "#C8860A", bg: "rgba(200,134,10,0.15)", code: "MUJER10", desc: "¡Buen trabajo!" },
  { maxTime: Infinity, discount: 5, label: "💜 JUGADORA", color: "#4a9eff", bg: "rgba(74,158,255,0.15)", code: "MUJER05", desc: "¡Lo lograste!" },
];

const COUNTDOWN_START = 18;

const PIECE_CONTENT = [
  { icon: "☕", label: "Café" },
  { icon: "🌸", label: "Flor" },
  { icon: "💻", label: "Binary" },
  { icon: "✨", label: "Magia" },
  { icon: "B&C", label: "Logo", isCenter: true },
  { icon: "💜", label: "Amor" },
  { icon: "🫶", label: "Unión" },
  { icon: "🌺", label: "Rosa" },
  { icon: "⭐", label: "Estrella" },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === i)) return shuffleArray(arr);
  return a;
}

function getDiscountTier(seconds) {
  return DISCOUNT_TIERS.find((t) => seconds <= t.maxTime) || DISCOUNT_TIERS[DISCOUNT_TIERS.length - 1];
}

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ["#C8860A", "#9b59b6", "#e91e8c", "#f5f0e8", "#4a9eff"][Math.floor(Math.random() * 5)],
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: "-20px",
          width: p.size, height: p.size,
          borderRadius: p.shape === "circle" ? "50%" : "2px",
          backgroundColor: p.color,
          animation: `fall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
      <style>{`@keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}

function CountdownBar({ timeLeft, totalTime, gameStarted }) {
  const pct = Math.max(0, (timeLeft / totalTime) * 100);
  const urgency = timeLeft <= 10 && gameStarted;
  const barColor = timeLeft > 20 ? "#e91e8c" : timeLeft > 10 ? "#C8860A" : "#ff4444";

  return (
    <div style={{ width: "100%", maxWidth: "380px", zIndex: 1, marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ fontSize: "0.58rem", color: "rgba(232,220,200,0.45)", letterSpacing: "1px", textTransform: "uppercase" }}>
          ⏱ Tiempo restante para máx. descuento
        </div>
        <div style={{
          fontSize: urgency ? "1.1rem" : "0.9rem", fontWeight: "900", fontFamily: "monospace",
          color: barColor,
          animation: urgency ? "pulse 0.5s ease-in-out infinite alternate" : "none",
          transition: "all 0.3s",
        }}>
          {timeLeft}s
        </div>
      </div>

      <div style={{ width: "100%", height: "7px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "10px" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: "10px",
          background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
          transition: "width 1s linear, background 0.5s",
          boxShadow: `0 0 8px ${barColor}77`,
        }} />
      </div>

      {/* Niveles de premio */}
      <div style={{ display: "flex", gap: "5px" }}>
        {DISCOUNT_TIERS.map((t, i) => {
          const currentTier = getDiscountTier(timeLeft);
          const isActive = t === currentTier;
          const isExpired = DISCOUNT_TIERS.indexOf(currentTier) > i;
          return (
            <div key={i} style={{
              flex: 1, textAlign: "center", padding: "7px 3px",
              borderRadius: "8px",
              background: isActive ? t.bg : "rgba(255,255,255,0.03)",
              border: `1px solid ${isActive ? t.color + "88" : "rgba(255,255,255,0.06)"}`,
              transition: "all 0.4s",
              opacity: isExpired ? 0.35 : 1,
            }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "900", fontFamily: "monospace", color: isActive ? t.color : "rgba(232,220,200,0.35)" }}>
                {t.discount}%
              </div>
              <div style={{ fontSize: "0.42rem", letterSpacing: "0.5px", color: isActive ? t.color + "cc" : "rgba(232,220,200,0.25)", textTransform: "uppercase" }}>
                {i === 0 ? `≤${t.maxTime}s` : i === DISCOUNT_TIERS.length - 1 ? "siempre" : `≤${t.maxTime}s`}
              </div>
              {isExpired && <div style={{ fontSize: "0.55rem", color: "rgba(255,100,100,0.5)" }}>✗</div>}
              {isActive && <div style={{ fontSize: "0.55rem", color: t.color }}>★</div>}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0% { transform: scale(1); } 100% { transform: scale(1.18); } }`}</style>
    </div>
  );
}

function SolutionGuide({ currentPieces }) {
  return (
    <div style={{ width: "100%", maxWidth: "380px", zIndex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,134,10,0.18)", borderRadius: "14px", padding: "10px 12px", marginBottom: "10px" }}>
      <div style={{ fontSize: "0.55rem", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(200,134,10,0.5)", textAlign: "center", marginBottom: "7px", fontFamily: "monospace" }}>
        🗺️ Guía — orden correcto
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
        {PIECE_CONTENT.map((piece, i) => {
          const isInPlace = currentPieces[i] === i;
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "5px 3px", borderRadius: "7px",
              background: isInPlace ? "rgba(200,134,10,0.18)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${isInPlace ? "rgba(200,134,10,0.45)" : "rgba(255,255,255,0.05)"}`,
              transition: "all 0.3s", position: "relative",
            }}>
              {isInPlace && <div style={{ position: "absolute", top: "2px", right: "3px", fontSize: "0.45rem", color: "#C8860A" }}>✓</div>}
              <div style={{ fontSize: piece.isCenter ? "0.65rem" : "0.95rem", fontWeight: piece.isCenter ? "900" : "normal", color: isInPlace ? "#C8860A" : "#e8dcc8", lineHeight: 1, marginBottom: "1px" }}>
                {piece.icon}
              </div>
              <div style={{ fontSize: "0.38rem", letterSpacing: "1px", textTransform: "uppercase", color: isInPlace ? "rgba(200,134,10,0.65)" : "rgba(232,220,200,0.3)", fontFamily: "monospace" }}>
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PuzzlePiece({ index, pieceIndex, isSelected, isSolved, onSelect, disabled }) {
  const content = PIECE_CONTENT[pieceIndex];
  const isCorrect = pieceIndex === index;
  let bg, borderColor, shadow, scale;

  if (isSolved) {
    bg = "linear-gradient(135deg, #1a2a7a 0%, #0d1a4a 100%)";
    borderColor = "#C8860A"; shadow = "0 4px 20px rgba(200,134,10,0.5)"; scale = 1;
  } else if (isSelected) {
    bg = "linear-gradient(135deg, #9b59b6 0%, #6c3483 100%)";
    borderColor = "#e91e8c"; shadow = "0 8px 30px rgba(155,89,182,0.7)"; scale = 1.08;
  } else if (isCorrect) {
    bg = "linear-gradient(135deg, rgba(200,134,10,0.2) 0%, rgba(10,15,46,0.95) 100%)";
    borderColor = "rgba(200,134,10,0.5)"; shadow = "0 4px 15px rgba(200,134,10,0.2)"; scale = 1;
  } else {
    bg = "linear-gradient(135deg, rgba(26,42,122,0.85) 0%, rgba(10,15,46,0.95) 100%)";
    borderColor = "rgba(200,134,10,0.3)"; shadow = "0 4px 15px rgba(0,0,0,0.4)"; scale = 1;
  }

  return (
    <div onClick={() => !disabled && onSelect(index)} style={{
      width: "100%", aspectRatio: "1", borderRadius: "14px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: disabled ? "default" : "pointer",
      transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      fontFamily: "'Georgia', serif", userSelect: "none",
      position: "relative", overflow: "hidden",
      border: `2px solid ${borderColor}`, background: bg, boxShadow: shadow, transform: `scale(${scale})`,
    }}>
      {isSelected && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(233,30,140,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />}
      <div style={{ fontSize: content.isCenter ? "1rem" : "1.6rem", fontWeight: content.isCenter ? "900" : "normal", color: isSelected ? "#fff" : isCorrect ? "#C8860A" : "#e8dcc8", transition: "all 0.25s", lineHeight: 1, marginBottom: "3px" }}>
        {content.icon}
      </div>
      <div style={{ fontSize: "0.5rem", color: isCorrect ? "rgba(200,134,10,0.8)" : "rgba(232,220,200,0.5)", letterSpacing: "2px", textTransform: "uppercase" }}>
        {content.label}
      </div>
      {isCorrect && !isSolved && <div style={{ position: "absolute", top: "4px", left: "5px", fontSize: "0.48rem", color: "#C8860A" }}>✓</div>}
      <div style={{ position: "absolute", top: "4px", right: "6px", fontSize: "0.42rem", color: "rgba(200,134,10,0.3)", fontFamily: "monospace" }}>{index + 1}</div>
    </div>
  );
}

function CouponModal({ onClose, moves, elapsed, tier }) {
  const [copied, setCopied] = useState(false);
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,8,25,0.93)", backdropFilter: "blur(10px)", padding: "20px" }}>
      <div style={{
        background: "linear-gradient(145deg, #0a0f2e 0%, #1a0a2e 50%, #0a1a2e 100%)",
        border: `1px solid ${tier.color}55`, borderRadius: "28px", padding: "44px 26px 28px",
        maxWidth: "340px", width: "100%", textAlign: "center", position: "relative",
        boxShadow: `0 30px 80px rgba(0,0,0,0.85), 0 0 50px ${tier.color}18`,
        animation: "modalPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%) translateY(-50%)",
          width: "66px", height: "66px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${tier.color}, ${tier.color}99)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", boxShadow: `0 8px 28px ${tier.color}55`,
        }}>
          {elapsed <= 6 ? "⚡" : elapsed <= 12 ? "🔥" : elapsed <= 18 ? "✨" : "💜"}
        </div>

        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: "50px", background: tier.bg, border: `1px solid ${tier.color}55`, fontSize: "0.62rem", letterSpacing: "3px", color: tier.color, textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px" }}>
          {tier.label}
        </div>

        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "1.4rem", color: "#f5f0e8", margin: "0 0 6px", lineHeight: 1.2 }}>
          {tier.desc}<br /><span style={{ color: tier.color }}>¡Lo resolviste!</span>
        </h2>

        <div style={{ display: "flex", gap: "8px", margin: "12px 0", justifyContent: "center" }}>
          {[{ icon: "🔄", val: moves, label: "movs" }, { icon: "⏱", val: formatTime(elapsed), label: "tiempo" }].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "8px" }}>
              <div style={{ fontSize: "0.9rem" }}>{s.icon}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: tier.color, fontFamily: "monospace" }}>{s.val}</div>
              <div style={{ fontSize: "0.48rem", color: "rgba(232,220,200,0.35)", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{ color: "rgba(232,220,200,0.6)", fontSize: "0.82rem", margin: "0 0 16px", lineHeight: 1.5 }}>
          Por el <strong style={{ color: "#e91e8c" }}>Día Internacional de la Mujer</strong>,<br />Binary & Coffee te regala:
        </p>

        {/* Cupón dinámico */}
        <div style={{ background: `linear-gradient(135deg, ${tier.bg}, rgba(0,0,0,0.05))`, border: `2px dashed ${tier.color}77`, borderRadius: "16px", padding: "18px 14px", marginBottom: "14px" }}>
          {/* Bloque principal: % + bebidas juntos y grandes */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "2px" }}>
              <span style={{ fontSize: "4rem", fontWeight: "900", fontFamily: "monospace", color: tier.color, lineHeight: 1, textShadow: `0 0 30px ${tier.color}66` }}>
                {tier.discount}%
              </span>
            </div>
            <div style={{
              fontSize: "1rem", fontWeight: "700", color: "#f5f0e8",
              letterSpacing: "1px", lineHeight: 1.2,
            }}>
              ☕ de descuento en bebidas
            </div>
            <div style={{ fontSize: "0.7rem", color: `${tier.color}cc`, marginTop: "3px" }}>
              en cualquier bebida del menú
            </div>
          </div>

          {/* Separador */}
          <div style={{ borderTop: `1px dashed ${tier.color}44`, margin: "10px 0" }} />

          {/* Código */}
          <div style={{ fontSize: "0.52rem", color: `${tier.color}88`, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "5px" }}>tu código de descuento</div>
          <div style={{ fontFamily: "monospace", fontSize: "1.6rem", fontWeight: "900", color: tier.color, letterSpacing: "6px", textShadow: `0 0 15px ${tier.color}44` }}>
            {tier.code}
          </div>
        </div>

        <button onClick={() => { navigator.clipboard?.writeText(tier.code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
          width: "100%", padding: "13px",
          background: copied ? "linear-gradient(135deg, #27ae60, #1e8449)" : `linear-gradient(135deg, ${tier.color}, ${tier.color}bb)`,
          color: "#fff", border: "none", borderRadius: "12px",
          fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", letterSpacing: "1px", marginBottom: "8px", transition: "all 0.3s",
        }}>
          {copied ? "✓ ¡Copiado!" : "📋 Copiar código"}
        </button>

        <button onClick={onClose} style={{ width: "100%", padding: "11px", background: "transparent", color: "rgba(232,220,200,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px" }}>
          Jugar de nuevo
        </button>
      </div>
      <style>{`@keyframes modalPop { 0% { transform: scale(0.6) translateY(40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

export default function BinaryCoffeePuzzle() {
  const [pieces, setPieces] = useState(() => shuffleArray([...Array(TOTAL).keys()]));
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_START);
  const [gameStarted, setGameStarted] = useState(false);
  const [timesUp, setTimesUp] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [wonTier, setWonTier] = useState(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!gameStarted || solved || timesUp) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); setTimesUp(true); return 0; }
        return prev - 1;
      });
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [gameStarted, solved, timesUp]);

  const checkSolved = useCallback((arr) => arr.every((v, i) => v === i), []);

  const handleSelect = (index) => {
    if (solved) return;
    if (!gameStarted) { setGameStarted(true); startTimeRef.current = Date.now(); }
    if (selected === null) { setSelected(index); }
    else if (selected === index) { setSelected(null); }
    else {
      const newPieces = [...pieces];
      [newPieces[selected], newPieces[index]] = [newPieces[index], newPieces[selected]];
      setPieces(newPieces); setSelected(null); setMoves((m) => m + 1);
      if (checkSolved(newPieces)) {
        const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const tier = getDiscountTier(finalElapsed);
        setWonTier(tier); setSolved(true); setShowConfetti(true);
        setTimeout(() => { setShowCoupon(true); setShowConfetti(false); }, 2200);
      }
    }
  };

  const handleReset = () => {
    setPieces(shuffleArray([...Array(TOTAL).keys()]));
    setSelected(null); setSolved(false); setShowCoupon(false); setMoves(0);
    setGameStarted(false); setElapsed(0); setTimeLeft(COUNTDOWN_START);
    setTimesUp(false); setWonTier(null); startTimeRef.current = null;
  };

  const correctCount = pieces.filter((v, i) => v === i).length;
  const currentTier = getDiscountTier(timeLeft);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #050818 0%, #0a0f2e 40%, #1a0a2e 70%, #0a1020 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "18px 14px 36px", fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden" }}>

      {/* Orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(155,89,182,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,134,10,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: "14px", width: "100%", maxWidth: "400px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(200,134,10,0.1)", border: "1px solid rgba(200,134,10,0.3)", borderRadius: "50px", padding: "5px 14px", marginBottom: "8px" }}>
          <span>☕</span>
          <span style={{ fontSize: "0.62rem", color: "#C8860A", letterSpacing: "3px", textTransform: "uppercase" }}>Binary & Coffee</span>
        </div>
        <h1 style={{ margin: "0 0 2px", fontSize: "clamp(1.3rem, 5vw, 1.9rem)", fontWeight: "900", lineHeight: 1.1, color: "#f5f0e8" }}>Puzzle del</h1>
        <h1 style={{ margin: "0 0 5px", fontSize: "clamp(1.3rem, 5vw, 1.9rem)", fontWeight: "900", lineHeight: 1.1, background: "linear-gradient(90deg, #e91e8c, #9b59b6, #C8860A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Día de la Mujer 🌸
        </h1>
        <p style={{ color: "rgba(232,220,200,0.5)", fontSize: "0.72rem", margin: 0 }}>
          ¡Más rápido resuelves, <strong style={{ color: "#e91e8c" }}>mayor descuento</strong> ganas!
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", zIndex: 1, width: "100%", maxWidth: "400px" }}>
        {[
          { label: "Movs", value: moves, icon: "🔄" },
          { label: "Progreso", value: `${correctCount}/${TOTAL}`, icon: "✅" },
          { label: "Descuento actual", value: `${currentTier.discount}%`, icon: "🏷️", color: currentTier.color },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,134,10,0.1)", borderRadius: "10px", padding: "7px 5px" }}>
            <div style={{ fontSize: "0.85rem", marginBottom: "1px" }}>{s.icon}</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: s.color || "#C8860A", fontFamily: "monospace" }}>{s.value}</div>
            <div style={{ fontSize: "0.46rem", color: "rgba(232,220,200,0.3)", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Countdown */}
      <div style={{ zIndex: 1, width: "100%", maxWidth: "380px" }}>
        <CountdownBar timeLeft={timeLeft} totalTime={COUNTDOWN_START} gameStarted={gameStarted} />
      </div>

      {/* Tiempo agotado */}
      {timesUp && !solved && (
        <div style={{ zIndex: 1, width: "100%", maxWidth: "380px", marginBottom: "10px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
          <div style={{ color: "#ff7777", fontSize: "0.82rem", fontWeight: "700", marginBottom: "4px" }}>⏰ ¡Se acabó el tiempo!</div>
          <div style={{ color: "rgba(232,220,200,0.45)", fontSize: "0.7rem", marginBottom: "8px" }}>
            Puedes seguir jugando y ganar el descuento básico de 5%
          </div>
          <button onClick={handleReset} style={{ padding: "7px 18px", background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.35)", borderRadius: "8px", color: "#ff9999", cursor: "pointer", fontSize: "0.7rem", letterSpacing: "1px" }}>
            🔀 Intentar de nuevo
          </button>
        </div>
      )}

      {/* Toggle guía */}
      <div style={{ zIndex: 1, width: "100%", maxWidth: "380px", marginBottom: "7px" }}>
        <button onClick={() => setShowGuide(!showGuide)} style={{
          width: "100%", padding: "7px",
          background: showGuide ? "rgba(200,134,10,0.1)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${showGuide ? "rgba(200,134,10,0.3)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: "9px", cursor: "pointer",
          color: showGuide ? "#C8860A" : "rgba(232,220,200,0.35)",
          fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase",
          transition: "all 0.3s", fontFamily: "'Georgia', serif",
        }}>
          {showGuide ? "👁️ Ocultar guía" : "🗺️ Mostrar guía"}
        </button>
      </div>

      {showGuide && <SolutionGuide currentPieces={pieces} />}

      {/* Puzzle */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${GRID}, 1fr)`,
        gap: "7px", width: "100%", maxWidth: "380px", padding: "12px",
        background: "rgba(255,255,255,0.03)", borderRadius: "18px",
        border: "1px solid rgba(200,134,10,0.1)", zIndex: 1,
        boxShadow: solved ? "0 0 60px rgba(200,134,10,0.2)" : "0 20px 60px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.8s",
      }}>
        {pieces.map((pieceIndex, gridIndex) => (
          <PuzzlePiece key={gridIndex} index={gridIndex} pieceIndex={pieceIndex}
            isSelected={selected === gridIndex} isSolved={solved}
            onSelect={handleSelect} disabled={solved} />
        ))}
      </div>

      <div style={{ marginTop: "12px", zIndex: 1, maxWidth: "380px", width: "100%", textAlign: "center" }}>
        <p style={{ color: "rgba(232,220,200,0.3)", fontSize: "0.6rem", margin: "0 0 10px", lineHeight: 1.6 }}>
          👆 Toca una pieza → toca otra para intercambiar
          <br /><span style={{ color: "rgba(200,134,10,0.4)" }}>✓ dorado = pieza en su lugar correcto</span>
        </p>
        <button onClick={handleReset} style={{ padding: "9px 26px", background: "transparent", color: "rgba(200,134,10,0.6)", border: "1px solid rgba(200,134,10,0.22)", borderRadius: "50px", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.3s", fontFamily: "'Georgia', serif" }}
          onMouseEnter={(e) => e.target.style.background = "rgba(200,134,10,0.1)"}
          onMouseLeave={(e) => e.target.style.background = "transparent"}>
          🔀 Nuevo juego
        </button>
      </div>

      {/* Flores */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {["🌸", "🌺", "💜", "✨", "🌷"].map((flower, i) => (
          <div key={i} style={{ position: "absolute", left: `${10 + i * 20}%`, top: "-40px", fontSize: "1rem", opacity: 0.1, animation: `floatDown ${8 + i * 2}s ${i * 1.5}s linear infinite` }}>{flower}</div>
        ))}
      </div>

      {showConfetti && <Confetti />}
      {showCoupon && wonTier && <CouponModal onClose={handleReset} moves={moves} elapsed={elapsed} tier={wonTier} />}

      <style>{`
        @keyframes floatDown { 0% { transform: translateY(0) rotate(0deg); opacity: 0.1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}