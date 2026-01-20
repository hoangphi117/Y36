import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoundButton } from "@/components/ui/round-button";
import { HelpCircle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type GameType = "snake" | "caro" | "tictactoe";

interface GameInstructionsProps {
  gameType: GameType;
  trigger?: React.ReactNode;
}

export function GameInstructions({
  gameType,
  trigger,
}: GameInstructionsProps) {
  const content = GAME_INSTRUCTIONS[gameType];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <RoundButton
            size="small"
            variant="neutral"
            title="Hướng dẫn"
            className="shrink-0"
          >
            <HelpCircle className="w-5 h-5" />
          </RoundButton>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="w-5 h-5 text-primary" />
            Hướng dẫn chơi {content.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm sm:text-base">
            <section>
              <h4 className="font-semibold text-primary mb-2">Mục tiêu</h4>
              <p className="text-muted-foreground">{content.goal}</p>
            </section>

            <section>
              <h4 className="font-semibold text-primary mb-2">Cách chơi</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {content.controls.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="font-semibold text-primary mb-2">Luật chơi</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {content.rules.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {content.tips && (
              <section className="bg-muted/50 p-3 rounded-lg border">
                <h4 className="font-semibold text-primary mb-1 text-sm">
                  Mẹo nhỏ
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                  {content.tips.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

const GAME_INSTRUCTIONS = {
  snake: {
    title: "Rắn Săn Mồi",
    goal: "Điều khiển rắn ăn mồi để dài ra và đạt điểm cao nhất mà không bị đâm vào tường hoặc chính mình.",
    controls: [
      "Sử dụng các phím mũi tên (↑, ↓, ←, →) để điều khiển hướng đi của rắn.",
      "Nhấn phím SPACE hoặc nút Pause trên màn hình để tạm dừng.",
    ],
    rules: [
      "Mỗi lần ăn mồi, rắn sẽ dài ra và điểm số sẽ tăng lên.",
      "Tốc độ game sẽ tăng dần khi bạn đạt được các mốc điểm nhất định.",
      "Trò chơi kết thúc nếu đầu rắn chạm vào tường hoặc chạm vào thân rắn.",
    ],
    tips: [
      "Cố gắng tận dụng không gian bằng cách di chuyển theo hình zic-zac.",
      "Đừng ham ăn mồi khi rắn đã quá dài, hãy ưu tiên sự an toàn.",
    ],
  },
  caro: {
    title: "Cờ Caro (Gomoku)",
    goal: "Là người đầu tiên tạo được một hàng liên tiếp gồm 5 quân cờ của mình theo chiều ngang, dọc hoặc chéo.",
    controls: ["Nhấp chuột vào các ô trống trên bàn cờ để đặt quân cờ."],
    rules: [
      "Mỗi người chơi sử dụng một loại quân (X hoặc O).",
      "Hai bên lần lượt đi các nước cờ vào các ô còn trống.",
      "Người thắng cuộc là người tạo được hàng 5 đầu tiên (Caro 5 hàng) hoặc 4 hàng đầu tiên (Caro 4 hàng).",
      "Luật chặn 2 đầu: Nếu hàng 5 bị chặn ở cả 2 đầu bởi quân đối phương thì không được tính thắng (tùy cài đặt).",
    ],
    tips: [
      "Tấn công là cách phòng thủ tốt nhất.",
      "Luôn để ý các nước cờ đôi (tạo ra 2 hàng nguy hiểm cùng lúc).",
    ],
  },
  tictactoe: {
    title: "Tic Tac Toe",
    goal: "Là người đầu tiên tạo được một hàng liên tiếp gồm 3 quân cờ của mình theo chiều ngang, dọc hoặc chéo.",
    controls: ["Nhấp chuột vào một trong 9 ô trên bàn cờ để đánh dấu."],
    rules: [
      "Trò chơi diễn ra trên bàn cờ 3x3.",
      "Hai bên thay phiên nhau đánh dấu X hoặc O.",
      "Người đầu tiên có 3 quân thẳng hàng sẽ thắng.",
      "Nếu hết ô mà chưa có ai thắng thì ván cờ hòa.",
    ],
    tips: [
      "Chiếm ô trung tâm là một lợi thế lớn.",
      "Nếu đối thủ đánh vào góc, hãy cẩn thận bẫy.",
    ],
  },
};
