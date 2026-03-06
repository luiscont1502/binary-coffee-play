import { useState } from 'react'
import BinaryCoffeePuzzle from "./games/puzzle/BinaryCoffeePuzzle";

const GAMES = [
  {
    id: "puzzle",
    title: "Puzzle",
    subtitle: "Día de la Mujer",
    icon: "🧩",
    color: "#9b59b6",
    component: BinaryCoffeePuzzle,
    available: true,
  },
  {
    id: "memory",
    title: "Memory",
    subtitle: "Próximamente",
    icon: "🃏",
    color: "#C8860A",
    component: null,
    available: false,
  },
  {
    id: "trivia",
    title: "Trivia Café",
    subtitle: "Próximamente",
    icon: "☕",
    color: "#1a2a7a",
    component: null,
    available: false,
  },
];


export default function App(){
  const [activeGame, setActiveGame] = useState(null);

  const ActiveComponent = activeGame
    ? GAMES.find((g) => g.id === activeGame)?.component
    : null;

  if (ActiveComponent) {
    return (
      <div>
        <button
          onClick={() => setActiveGame(null)}
          style={{
            position: "fixed", top: "16px", left: "16px", zIndex: 9999,
            background: "rgba(200,134,10,0.15)",
            border: "1px solid rgba(200,134,10,0.4)",
            color: "#C8860A", borderRadius: "50px",
            padding: "8px 16px", cursor: "pointer",
            fontSize: "0.8rem", letterSpacing: "1px",
            fontFamily: "Georgia, serif",
          }}
        >
          ← Menú
        </button>
        <ActiveComponent />
      </div>
    );
  }
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050818 0%, #0a0f2e 50%, #1a0a2e 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "Georgia, serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(200,134,10,0.1)",
          border: "1px solid rgba(200,134,10,0.3)",
          borderRadius: "50px", padding: "6px 20px", marginBottom: "16px",
        }}>
          <span>☕</span>
          <span style={{ fontSize: "0.7rem", color: "#C8860A", letterSpacing: "3px" }}>
            BINARY & COFFEE
          </span>
        </div>
        <h1 style={{
          margin: "0 0 8px", color: "#f5f0e8",
          fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: "900",
        }}>
          Zona de Juegos
        </h1>
        <p style={{ color: "rgba(232,220,200,0.5)", fontSize: "0.85rem", margin: 0 }}>
          Juega y gana descuentos en tu próxima bebida 🎁
        </p>
      </div>

      {/* Games Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "16px", width: "100%", maxWidth: "500px",
      }}>
        {GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => game.available && setActiveGame(game.id)}
            style={{
              background: game.available
                ? `linear-gradient(135deg, ${game.color}22, ${game.color}11)`
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${game.available ? game.color + "55" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "20px", padding: "28px 20px",
              textAlign: "center", cursor: game.available ? "pointer" : "default",
              opacity: game.available ? 1 : 0.5,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              if (game.available) e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{game.icon}</div>
            <div style={{
              fontSize: "1rem", fontWeight: "700",
              color: game.available ? "#f5f0e8" : "rgba(232,220,200,0.4)",
              marginBottom: "4px",
            }}>
              {game.title}
            </div>
            <div style={{
              fontSize: "0.65rem", letterSpacing: "1px",
              color: game.available ? game.color : "rgba(232,220,200,0.3)",
              textTransform: "uppercase",
            }}>
              {game.subtitle}
            </div>
          </div>
        ))}
      </div>

      <p style={{
        marginTop: "40px", color: "rgba(232,220,200,0.25)",
        fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase",
      }}>
        Tu espacio para conectar
      </p>
    </div>
  );
}


