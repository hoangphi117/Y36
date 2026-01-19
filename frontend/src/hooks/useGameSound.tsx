import { useRef, useEffect } from "react";
import { Howl } from "howler"; // Import Howler

// Import file âm thanh (Vite sẽ xử lý đường dẫn này)
import pop from "@/assets/sounds/pop.mp3";
import win from "@/assets/sounds/win.mp3";
import lose from "@/assets/sounds/lose.mp3";
import button from "@/assets/sounds/button.mp3";
import button1 from "@/assets/sounds/button1.mp3";
import button2 from "@/assets/sounds/button2.mp3";
import draw from "@/assets/sounds/draw.mp3";

type SoundType =
  | "pop"
  | "win"
  | "lose"
  | "draw"
  | "button"
  | "button1"
  | "button2";

export const useGameSound = (enabled: boolean = true) => {
  // Sử dụng useRef để lưu trữ các instance của Howl
  // Không dùng HTMLAudioElement nữa mà dùng Howl
  const sounds = useRef<Record<SoundType, Howl | null>>({
    pop: null,
    win: null,
    lose: null,
    button: null,
    button1: null,
    button2: null,
    draw: null,
  });

  // Khởi tạo âm thanh MỘT LẦN DUY NHẤT khi component mount
  useEffect(() => {
    sounds.current = {
      pop: new Howl({ src: [pop], volume: 0.5, preload: true }),
      win: new Howl({ src: [win], volume: 0.5, preload: true }),
      lose: new Howl({ src: [lose], volume: 0.5, preload: true }),
      button: new Howl({ src: [button], volume: 1.0, preload: true }),
      button1: new Howl({ src: [button1], volume: 1.0, preload: true }),
      button2: new Howl({ src: [button2], volume: 0.4, preload: true }),
      draw: new Howl({ src: [draw], volume: 0.5, preload: true }),
    };

    // Cleanup: Giải phóng bộ nhớ khi unmount (quan trọng để tránh memory leak)
    return () => {
      Object.values(sounds.current).forEach((sound) => sound?.unload());
    };
  }, []);

  const playSound = (type: SoundType) => {
    if (!enabled) return;

    const sound = sounds.current[type];
    if (sound) {
      // Howler tự động xử lý việc phát chồng (overlap), không cần cloneNode
      sound.play();
    }
  };

  return { playSound };
};