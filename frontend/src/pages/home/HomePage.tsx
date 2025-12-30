import { GameCard } from "@/components/games/GameCard";
import { useNavigate } from "react-router-dom";
import { useGameSound } from "@/hooks/useGameSound";

const MY_GAMES = [
  {
    id: 1,
    title: "Cờ Caro",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQg0kolxc1eNTMrXMntAkN5E7KW6O2xQAEA&s",
    variant: "primary" as const,
    url: "/caro",
  },
  {
    id: 2,
    title: "TIC TAC TOE",
    image:
      "https://img.freepik.com/premium-vector/tic-tac-toe-game-illustration-tic-tac-toe-game-with-hearts-cross-valentines-day-background_411588-2024.jpg?semt=ais_hybrid&w=740&q=80",
    variant: "accent" as const,
    url: "/tic-tac-toe",
  },
  {
    id: 3,
    title: "Rắn Săn Mồi",
    image:
      "https://s3-api.fpt.vn/fptvn-storage/2025-12-01/1764574515_tro-ran-san-moi-tren-google-11.jpg",
    variant: "danger" as const,
    url: "/snake",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const { playSound } = useGameSound(true);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 p-8">
      {MY_GAMES.map((game) => (
        <GameCard
          key={game.id}
          title={game.title}
          image={game.image}
          variant={game.variant}
          onClick={() => {
            navigate(`${game.url}`);
            playSound("button2");
          }}
        />
      ))}
    </div>
  );
}
