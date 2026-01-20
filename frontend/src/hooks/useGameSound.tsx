import { useRef, useEffect } from "react";
import { Howl } from "howler";

import pop from "@/assets/sounds/pop.mp3";
import win from "@/assets/sounds/win.mp3";
import lose from "@/assets/sounds/lose.mp3";
import button from "@/assets/sounds/button.mp3";
import button1 from "@/assets/sounds/button1.mp3";
import button2 from "@/assets/sounds/button2.mp3";
import draw from "@/assets/sounds/draw.mp3";
import steam from "@/assets/sounds/achievement.mp3";

type SoundType =
  | "pop"
  | "win"
  | "lose"
  | "draw"
  | "button"
  | "button1"
  | "button2"
  | "steam";

export const useGameSound = (enabled: boolean = true) => {
  const sounds = useRef<Record<SoundType, Howl | null>>({
    pop: null,
    win: null,
    lose: null,
    button: null,
    button1: null,
    button2: null,
    draw: null,
    steam: null,
  });

  useEffect(() => {
    sounds.current = {
      pop: new Howl({ src: [pop], volume: 0.5, preload: true }),
      win: new Howl({ src: [win], volume: 0.5, preload: true }),
      lose: new Howl({ src: [lose], volume: 0.5, preload: true }),
      button: new Howl({ src: [button], volume: 1.0, preload: true }),
      button1: new Howl({ src: [button1], volume: 1.0, preload: true }),
      button2: new Howl({ src: [button2], volume: 0.4, preload: true }),
      draw: new Howl({ src: [draw], volume: 0.5, preload: true }),
      steam: new Howl({ src: [steam], volume: 0.5, preload: true }),
    };

    return () => {
      Object.values(sounds.current).forEach((sound) => sound?.unload());
    };
  }, []);

  const playSound = (type: SoundType) => {
    if (!enabled) return;

    const sound = sounds.current[type];
    if (sound) {
      sound.play();
    }
  };

  return { playSound };
};
