import { useRef, useEffect } from "react";

import pop from "@/assets/sounds/pop.mp3";
import win from "@/assets/sounds/win.mp3";
import lose from "@/assets/sounds/lose.mp3";
import button from "@/assets/sounds/button.mp3";
import button1 from "@/assets/sounds/button1.mp3";
import draw from "@/assets/sounds/draw.mp3";

type SoundType = "pop" | "win" | "lose" | "draw" | "button" | "button1";

export const useGameSound = (enabled: boolean = true) => {
  const sounds = useRef<Record<SoundType, HTMLAudioElement>>({
    pop: new Audio(pop),
    win: new Audio(win),
    lose: new Audio(lose),
    button: new Audio(button),
    button1: new Audio(button1),
    draw: new Audio(draw),
  });

  const playSound = (type: SoundType) => {
    if (!enabled) return;

    const audio = sounds.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
    }
  };

  // Tùy chọn: Chỉnh volume mặc định
  useEffect(() => {
    sounds.current.pop.volume = 0.5;
    sounds.current.win.volume = 0.5;
    sounds.current.lose.volume = 0.5;
    sounds.current.draw.volume = 0.5;
  }, []);

  return { playSound };
};
