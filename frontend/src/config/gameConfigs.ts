export interface TimeOption {
  value: number;
  label: string;
}

export interface BoardSizeOption {
  value: number;
  label: string;
}

export interface OptionItem {
  value: number;
  label: string;
}

export type SpeedOption = OptionItem;

export const GAME_CONFIGS: Record<
  number,
  {
    timeOptions: TimeOption[];
    boardSizeOptions?: BoardSizeOption[];
    speedOptions?: SpeedOption[];
    incrementOptions?: SpeedOption[];
  }
> = {
  4: {
    timeOptions: [
      { value: 0, label: "Không giới hạn" },
      { value: 30, label: "30 Giây (Siêu nhanh)" },
      { value: 60, label: "1 Phút (Tiêu chuẩn)" },
      { value: 180, label: "3 Phút" },
    ],
  },
  1: {
    timeOptions: [
      { value: 0, label: "Không giới hạn" },
      { value: 300, label: "5 Phút (Nhanh)" },
      { value: 600, label: "10 Phút (Tiêu chuẩn)" },
      { value: 900, label: "15 Phút" },
      { value: 1200, label: "20 Phút" },
    ],

    boardSizeOptions: [
      { value: 12, label: "12 x 12 (Nhỏ)" },
      { value: 15, label: "15 x 15 (Tiêu chuẩn)" },
      { value: 20, label: "20 x 20 (Lớn)" },
    ],
  },
  2: {
    timeOptions: [
      { value: 0, label: "Không giới hạn" },
      { value: 180, label: "3 Phút" },
      { value: 300, label: "5 Phút" },
      { value: 600, label: "10 Phút" },
    ],

    boardSizeOptions: [
      { value: 10, label: "10 x 10 (Nhỏ)" },
      { value: 12, label: "12 x 12 (Tiêu chuẩn)" },
      { value: 15, label: "15 x 15 (Lớn)" },
    ],
  },
  3: {
    timeOptions: [
      { value: 0, label: "Không giới hạn" },
      { value: 180, label: "3 Phút" },
      { value: 300, label: "5 Phút" },
    ],
    boardSizeOptions: [
      { value: 15, label: "15 x 15 (Nhỏ)" },
      { value: 20, label: "20 x 20 (Vừa)" },
      { value: 25, label: "25 x 25 (Lớn)" },
      { value: 30, label: "30 x 30 (Rất lớn)" },
    ],
    speedOptions: [
      { value: 300, label: "Chậm (300ms)" },
      { value: 200, label: "Vừa (200ms)" },
      { value: 150, label: "Nhanh (150ms)" },
      { value: 100, label: "Siêu tốc (100ms)" },
    ],
    incrementOptions: [
      { value: 0, label: "Không tăng" },
      { value: 5, label: "Tăng chậm (5ms)" },
      { value: 10, label: "Tăng vừa (10ms)" },
      { value: 20, label: "Tăng nhanh (20ms)" },
    ],
  },
};

export const getTimeOptions = (gameId: number): TimeOption[] => {
  return (
    GAME_CONFIGS[gameId]?.timeOptions || [
      { value: 0, label: "Không giới hạn" },
      { value: 60, label: "1 Phút" },
    ]
  );
};

export const getBoardSizeOptions = (gameId: number): BoardSizeOption[] => {
  return (
    GAME_CONFIGS[gameId]?.boardSizeOptions || [
      { value: 15, label: "15 x 15 (Mặc định)" },
    ]
  );
};

export const getSpeedOptions = (gameId: number): SpeedOption[] => {
  return GAME_CONFIGS[gameId]?.speedOptions || [];
};

export const getIncrementOptions = (gameId: number): SpeedOption[] => {
  return GAME_CONFIGS[gameId]?.incrementOptions || [];
};
