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

const globalSounds: Partial<Record<SoundType, Howl>> = {};

const getSound = (type: SoundType, src: string, options: { volume?: number } = {}): Howl => {
  if (!globalSounds[type]) {
    globalSounds[type] = new Howl({
      src: [src],
      volume: options.volume ?? 0.5,
      preload: true,
    });
  }
  return globalSounds[type]!;
};

export const useGameSound = (enabled: boolean = true) => {
  const playSound = (type: SoundType) => {
    if (!enabled) return;

    let sound: Howl | undefined;
    
    switch (type) {
      case "pop": sound = getSound("pop", pop); break;
      case "win": sound = getSound("win", win); break;
      case "lose": sound = getSound("lose", lose); break;
      case "button": sound = getSound("button", button, { volume: 1.0 }); break;
      case "button1": sound = getSound("button1", button1, { volume: 1.0 }); break;
      case "button2": sound = getSound("button2", button2, { volume: 0.4 }); break;
      case "draw": sound = getSound("draw", draw); break;
      case "steam": sound = getSound("steam", steam); break;
    }

    if (sound) {
      sound.play();
    }
  };

  return { playSound };
};
