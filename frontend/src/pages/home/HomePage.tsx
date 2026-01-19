import { GameCard } from "@/components/games/GameCard";
import { useNavigate } from "react-router-dom";
import { useGameSound } from "@/hooks/useGameSound";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const MY_GAMES = [
  {
    id: 1,
    title: "Cờ Caro 5 hàng",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQg0kolxc1eNTMrXMntAkN5E7KW6O2xQAEA&s",
    variant: "primary" as const,
    url: "/games/caro-5",
  },
  {
    id: 2,
    title: "Cờ Caro 4 hàng",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQg0kolxc1eNTMrXMntAkN5E7KW6O2xQAEA&s",
    variant: "primary" as const,
    url: "/games/caro-4",
  },
  {
    id: 3,
    title: "TIC TAC TOE",
    image:
      "https://img.freepik.com/premium-vector/tic-tac-toe-game-illustration-tic-tac-toe-game-with-hearts-cross-valentines-day-background_411588-2024.jpg?semt=ais_hybrid&w=740&q=80",
    variant: "accent" as const,
    url: "/games/tic-tac-toe",
  },
  {
    id: 4,
    title: "Rắn Săn Mồi",
    image:
      "https://s3-api.fpt.vn/fptvn-storage/2025-12-01/1764574515_tro-ran-san-moi-tren-google-11.jpg",
    variant: "danger" as const,
    url: "/games/snake",
  },
  {
    id: 5,
    title: "Ghép hàng 3",
    image:
      "https://play-lh.googleusercontent.com/xx5tqp1jQ2NhaRRoa4vpyI4SbdQn2TcSFRju5VBdi2GO38SI-FqwKKuUg0qtetnNnkdU",
    variant: "primary" as const,
    url: "/match-3",
  },
  {
    id: 6,
    title: "Cờ trí nhớ",
    image: "https://cdn-icons-png.flaticon.com/512/6168/6168860.png",
    variant: "accent" as const,
    url: "/memory",
  },
  {
    id: 7,
    title: "Vẽ tranh",
    image: "https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/83de99e3e72db597f408c2f3c66afc3c/drawing.png",
    variant: "danger" as const,
    url: "/drawing",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  useDocumentTitle("Trang chủ");

  const { playSound } = useGameSound();

  const handleGameClick = (url: string) => {
    playSound("button1");
    
    setTimeout(() => {
      navigate(url);
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 p-8">
      {MY_GAMES.map((game) => (
        <GameCard
          key={game.id}
          title={game.title}
          image={game.image}
          variant={game.variant}
          onClick={() => {
            handleGameClick(game.url);
          }}
        />
      ))}
    </div>
  );
}
