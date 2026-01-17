import { Smile } from "lucide-react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerButton = ({
  onEmojiSelect,
}: EmojiPickerButtonProps) => {
  const { theme } = useTheme(); // Lấy theme hiện tại (dark/light)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-primary"
          type="button" // Quan trọng: type button để không submit form
        >
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-full p-0 border-none bg-transparent shadow-none"
      >
        <EmojiPicker
          theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
          onEmojiClick={handleEmojiClick}
          lazyLoadEmojis={true}
          searchDisabled={false}
          width={300}
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
};
