import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
// import type { Game } from "@/types/game";
import { gameApi } from "@/services/gameApi";
import { GameCarousel } from "@/components/games/GameCarousel";
import { GameControlPanel } from "@/components/games/GameControlPanel";
import { GamePlayer } from "@/components/games/GamePlayer";
import { GameHelpDialog } from "@/components/games/GameHelpDialog";
import { useGameSound } from "@/hooks/useGameSound";
import { RoundButton } from "@/components/ui/round-button";

const GAME_ASSETS = [
  {
    id: 1,
    title: "Cờ caro 5 hàng",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQg0kolxc1eNTMrXMntAkN5E7KW6O2xQAEA&s",
    variant: "primary" as const,
    url: "/games/caro-5",
    help_content: "Mục tiêu: Tạo thành một hàng ngang, dọc hoặc chéo gồm đúng 5 quân cờ của bạn. Cách điều khiển: Sử dụng các phím mũi tên (Trái/Phải/Lên/Xuống) để di chuyển vùng chọn trên bàn cờ, nhấn ENTER để đặt quân. Nhấn BACK để quay lại menu chính. Nhấn HINT để xem gợi ý nước đi tối ưu nhất.",
  },
  {
    id: 2,
    title: "Cờ Caro 4 hàng",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQg0kolxc1eNTMrXMntAkN5E7KW6O2xQAEA&s",
    variant: "primary" as const,
    url: "/games/caro-4",
    help_content: "Mục tiêu: Đạt được 4 quân cờ liên tiếp theo bất kỳ hướng nào trước đối thủ. Luật chơi: Tương tự caro truyền thống nhưng yêu cầu tốc độ và chiến thuật nhanh hơn do bàn cờ nhỏ. Điều khiển: Di chuyển bằng phím Trái/Phải, nhấn ENTER để xác nhận vị trí đặt cờ. Nhấn BACK để thoát hoặc HINT nếu bạn cần trợ giúp chiến thuật.",
  },
  {
    id: 3,
    title: "Rắn Săn Mồi",
    image: "https://s3-api.fpt.vn/fptvn-storage/2025-12-01/1764574515_tro-ran-san-moi-tren-google-11.jpg",
    variant: "danger" as const,
    url: "/games/snake",
    help_content: "Mục tiêu: Điều khiển rắn ăn mồi để tăng chiều dài mà không đâm vào tường hoặc chính mình. Điều khiển: Sử dụng phím Trái/Phải để xoay hướng di chuyển. ENTER để bắt đầu hoặc tạm dừng. BACK để thoát ra ngoài. HINT sẽ hiển thị vị trí thức ăn tiếp theo hoặc đường đi an toàn nhất trong thời gian ngắn.",
  },
  {
    id: 4,
    title: "TIC TAC TOE",
    image: "https://img.freepik.com/premium-vector/tic-tac-toe-game-illustration-tic-tac-toe-game-with-hearts-cross-valentines-day-background_411588-2024.jpg?semt=ais_hybrid&w=740&q=80",
    variant: "accent" as const,
    url: "/games/tic-tac-toe",
    help_content: "Mục tiêu: Xếp 3 ký hiệu (X hoặc O) thẳng hàng trên bàn cờ 3x3. Cách chơi: Người chơi luân phiên đặt quân. Trò chơi kết thúc khi có người thắng hoặc bàn cờ đầy (hòa). Điều khiển: Phím Trái/Phải để chuyển ô, ENTER để đánh dấu. Nhấn BACK để thoát game, HINT để xem nước đi ngăn chặn đối thủ.",
  },
  {
    id: 5,
    title: "Kẹo Ngọt",
    image: "https://play-lh.googleusercontent.com/xx5tqp1jQ2NhaRRoa4vpyI4SbdQn2TcSFRju5VBdi2GO38SI-FqwKKuUg0qtetnNnkdU",
    variant: "primary" as const,
    url: "/match-3",
    help_content: "Mục tiêu: Hoán đổi vị trí các viên kẹo để tạo thành hàng 3 hoặc nhiều hơn cùng loại nhằm ghi điểm. Điều khiển: Di chuyển con trỏ bằng phím Trái/Phải, nhấn ENTER để chọn kẹo và ENTER lần nữa tại ô lân cận để hoán đổi. BACK để quay về menu. HINT sẽ làm nổi bật một cặp kẹo có thể tạo ra combo.",
  },
  {
    id: 6,
    title: "Cờ trí nhớ",
    image: "https://cdn-icons-png.flaticon.com/512/6168/6168860.png",
    variant: "accent" as const,
    url: "/memory",
    help_content: "Mục tiêu: Lật các thẻ bài và ghi nhớ vị trí để tìm ra các cặp hình giống nhau. Điều khiển: Phím Trái/Phải để chọn thẻ, ENTER để lật thẻ. Nhấn BACK để kết thúc phiên chơi. Nhấn HINT để xem nhanh vị trí của tất cả các thẻ trong vòng 1 giây.",
  },
  {
    id: 7,
    title: "Vẽ tranh",
    image: "https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/83de99e3e72db597f408c2f3c66afc3c/drawing.png",
    variant: "danger" as const,
    url: "/drawing",
    help_content: "Mục tiêu: Tự do sáng tạo các tác phẩm nghệ thuật bằng bảng màu có sẵn. Điều khiển: Phím Trái/Phải để chọn màu sắc hoặc công cụ vẽ, ENTER để bắt đầu vẽ tại điểm chọn. BACK để xóa hoặc quay lại. HINT sẽ hiển thị các mẫu tranh gợi ý để bạn vẽ theo.",
  },
];

export const GameHub = () => {
  const [games, setGames] = useState<any[]>([]); // Use any[] to include variant
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { playSound } = useGameSound();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await gameApi.getAllGames();
        // Merge API data with local assets
        const mergedGames = data.map((game) => {
          const asset = GAME_ASSETS.find((a) => a.id === game.id);
          return {
            ...game,
            name: asset?.title || game.name,
            image_url: asset?.image || game.image_url,
            variant: asset?.variant || "primary",
            help_content: (asset as any)?.help_content || "", // Merge help content
          };
        });
        setGames(mergedGames);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleNext = () => {
    playSound("button1");
    setSelectedIndex((prev) => (prev + 1) % games.length);
  };

  const handlePrev = () => {
    playSound("button1");
    setSelectedIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  const handleEnter = () => {
    if (selectedGame && selectedGame.is_active) {
      playSound("button2");
      setIsPlaying(true);
    } else {
      playSound("button"); // Âm thanh lỗi/khoá
    }
  };

  const handleBack = () => {
    playSound("button2");
    setIsPlaying(false);
  };

  const handleHelp = () => {
    playSound("button");
    setShowHelp(true);
  };

  const selectedGame = games[selectedIndex];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] w-full relative">
      {isPlaying && selectedGame ? (
        // Mode CHƠI GAME
        <div className="w-full max-w-7xl animate-in zoom-in-95 duration-300 flex flex-col items-center">
            {/* GLOBAL BACK BUTTON */}
            {/* GLOBAL BACK BUTTON & TITLE */}
            <div className="w-full flex items-center justify-between mb-4 px-4 sm:px-0 relative">
              <div className="absolute left-4 sm:left-0 z-10">
                <RoundButton 
                  onClick={handleBack} 
                  variant="danger" 
                  size="small"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">QUAY LẠI</span>
                </RoundButton>
              </div>
              
              <div className="w-full flex justify-center pointer-events-none">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] truncate max-w-[70%]">
                  {selectedGame.name}
                </h1>
              </div>
              
              {/* Spacer to balance the layout if needed, or just let the absolute positioning handle left button */}
              <div className="w-10"></div> 
            </div>
            
            <GamePlayer game={selectedGame} onBack={handleBack} />
        </div>
      ) : (
        // Mode CAROUSEL
        <div className="w-full">
           <div className="mb-2 text-center space-y-1">
             <h1 className="text-3xl md:text-4xl font-black uppercase text-primary drop-shadow-md">
               Game Center
             </h1>
             <p className="text-sm text-muted-foreground font-medium">
               Chọn trò chơi và nhấn ENTER để bắt đầu
             </p>
           </div>
           
           <GameCarousel 
             games={games} 
             selectedIndex={selectedIndex} 
             onSelect={setSelectedIndex} 
           />
        </div>
      )}

      {/* Control Panel luôn hiển thị (nhưng thay đổi trạng thái) */}
      <GameControlPanel
        onNext={handleNext}
        onPrev={handlePrev}
        onEnter={handleEnter}
        onHelp={handleHelp}
        canEnter={!!selectedGame && selectedGame.is_active}
        isPlaying={isPlaying}
        gameLocked={selectedGame ? !selectedGame.is_active : true}
      />

      <GameHelpDialog
        game={selectedGame}
        open={showHelp}
        onOpenChange={setShowHelp}
      />
    </div>
  );
};
