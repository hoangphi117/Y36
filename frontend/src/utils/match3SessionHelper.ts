import type { Match3SessionSave } from '@/types/match3Game';
export const convertBoard = (board: string[], boardSize: number): number[][] => {
  const matrix: number[][] = [];

  for (let r = 0; r < boardSize; r++) {
    const row: number[] = [];
    for (let c = 0; c < boardSize; c++) {
      const index = r * boardSize + c;
      row.push(parseInt(board[index], 10));
    }
    matrix.push(row);
  }

  return matrix;
}

// Chuyển đổi matrix thành board array
export const restoreBoard = (matrix: number[][] | undefined): string[] => {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
    return [];
  }
  
  const board: string[] = [];
  
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      board.push(matrix[r][c].toString());
    }
  }
  
  return board;
}

export const createSessionSave = ({
    matrix,
    totalScore,
    current_combo,
    moves_remaining,
    time_remaining
}: {
    matrix: number[][],
    totalScore: number,
    current_combo: number,
    moves_remaining?: number,
    time_remaining?: number,
}): Match3SessionSave => {
    return {
        board_state: {
            matrix,
            moves_remaining,
            time_remaining,
            current_combo
        },
        score: totalScore,
    }
}