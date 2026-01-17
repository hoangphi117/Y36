export const checkWin = (
  board: (string | null)[],
  index: number,
  winCondition: number,
  size: number
) => {
  const player = board[index];
  if (!player) return null;

  const row = Math.floor(index / size);
  const col = index % size;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let winningCells = [index];

    for (let i = 1; i < winCondition; i++) {
      const r = row + i * dx;
      const c = col + i * dy;
      const idx = r * size + c;
      if (r < 0 || r >= size || c < 0 || c >= size || board[idx] !== player)
        break;
      count++;
      winningCells.push(idx);
    }

    for (let i = 1; i < winCondition; i++) {
      const r = row - i * dx;
      const c = col - i * dy;
      const idx = r * size + c;
      if (r < 0 || r >= size || c < 0 || c >= size || board[idx] !== player)
        break;
      count++;
      winningCells.push(idx);
    }

    if (count >= winCondition) return winningCells;
  }
  return null;
};

const getNeighborEmptyCells = (board: (string | null)[], size: number) => {
  const neighbors = new Set<number>();
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) {
      const r = Math.floor(i / size);
      const c = i % size;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nr = r + dx;
          const nc = c + dy;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const idx = nr * size + nc;
            if (board[idx] === null) neighbors.add(idx);
          }
        }
      }
    }
  }
  return Array.from(neighbors);
};

export const getEasyMove = (board: (string | null)[], size: number) => {
  const candidates = getNeighborEmptyCells(board, size);
  if (candidates.length === 0) return Math.floor((size * size) / 2);
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const getMediumMove = (
  board: (string | null)[],
  winCondition: number,
  botPiece: string,
  playerPiece: string,
  size: number
) => {
  const candidates = getNeighborEmptyCells(board, size);
  if (candidates.length === 0) return Math.floor((size * size) / 2);

  for (const idx of candidates) {
    board[idx] = botPiece;
    if (checkWin(board, idx, winCondition, size)) {
      board[idx] = null;
      return idx;
    }
    board[idx] = null;
  }
  for (const idx of candidates) {
    board[idx] = playerPiece;
    if (checkWin(board, idx, winCondition, size)) {
      board[idx] = null;
      return idx;
    }
    board[idx] = null;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const getHardMove = (
  board: (string | null)[],
  winCondition: number,
  botPiece: string,
  playerPiece: string,
  size: number
) => {
  if (board.every((cell) => cell === null))
    return Math.floor((size * size) / 2);
  const candidates = getNeighborEmptyCells(board, size);
  if (candidates.length === 0) return Math.floor((size * size) / 2);

  let bestScore = -Infinity;
  let move = -1;

  for (const i of candidates) {
    let score = 0;
    const r = Math.floor(i / size);
    const c = i % size;

    board[i] = botPiece;
    if (checkWin(board, i, winCondition, size)) score += 10000;
    else if (checkWin(board, i, winCondition - 1, size)) score += 100;
    board[i] = null;

    board[i] = playerPiece;
    if (checkWin(board, i, winCondition, size)) score += 5000;
    else if (checkWin(board, i, winCondition - 1, size)) score += 80;
    board[i] = null;

    score +=
      Math.random() * 5 - (Math.abs(r - size / 2) + Math.abs(c - size / 2));

    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
};
