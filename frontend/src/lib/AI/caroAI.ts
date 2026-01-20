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

const evaluateMove = (
  board: (string | null)[],
  index: number,
  player: string,
  opponent: string,
  winCondition: number,
  size: number
) => {
  let score = 0;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  const row = Math.floor(index / size);
  const col = index % size;

  for (const [dx, dy] of directions) {
    let playerCount = 1;
    let opponentCount = 0;
    let playerOpenEnds = 0;
    let opponentOpenEnds = 0;

    // Check player potential at this spot
    // Forward
    for (let i = 1; i < winCondition; i++) {
      const r = row + i * dx;
      const c = col + i * dy;
      if (r < 0 || r >= size || c < 0 || c >= size) break;
      const cell = board[r * size + c];
      if (cell === player) playerCount++;
      else if (cell === null) {
        playerOpenEnds++;
        break;
      } else break;
    }
    // Backward
    for (let i = 1; i < winCondition; i++) {
      const r = row - i * dx;
      const c = col - i * dy;
      if (r < 0 || r >= size || c < 0 || c >= size) break;
      const cell = board[r * size + c];
      if (cell === player) playerCount++;
      else if (cell === null) {
        playerOpenEnds++;
        break;
      } else break;
    }

    // Check opponent threat at this spot
    let oCountForward = 0;
    let oOpenForward = false;
    for (let i = 1; i < winCondition; i++) {
      const r = row + i * dx;
      const c = col + i * dy;
      if (r < 0 || r >= size || c < 0 || c >= size) break;
      const cell = board[r * size + c];
      if (cell === opponent) oCountForward++;
      else if (cell === null) {
        oOpenForward = true;
        break;
      } else break;
    }
    let oCountBackward = 0;
    let oOpenBackward = false;
    for (let i = 1; i < winCondition; i++) {
      const r = row - i * dx;
      const c = col - i * dy;
      if (r < 0 || r >= size || c < 0 || c >= size) break;
      const cell = board[r * size + c];
      if (cell === opponent) oCountBackward++;
      else if (cell === null) {
        oOpenBackward = true;
        break;
      } else break;
    }
    opponentCount = oCountForward + oCountBackward;
    if (oOpenForward) opponentOpenEnds++;
    if (oOpenBackward) opponentOpenEnds++;

    // Scoring Player Patterns
    if (playerCount >= winCondition) score += 100000;
    else if (playerCount === winCondition - 1 && playerOpenEnds === 2)
      score += 10000;
    else if (playerCount === winCondition - 1 && playerOpenEnds === 1)
      score += 1000;
    else if (playerCount === winCondition - 2 && playerOpenEnds === 2)
      score += 500;
    else if (playerCount === winCondition - 2 && playerOpenEnds === 1)
      score += 100;

    // Scoring Opponent Patterns (Blocking)
    if (opponentCount >= winCondition - 1) score += 20000;
    else if (opponentCount === winCondition - 2 && opponentOpenEnds === 2)
      score += 5000;
    else if (opponentCount === winCondition - 2 && opponentOpenEnds === 1)
      score += 800;
    else if (opponentCount === winCondition - 3 && opponentOpenEnds === 2)
      score += 400;
  }

  // Slight preference for center
  const distToCenter = Math.abs(row - size / 2) + Math.abs(col - size / 2);
  score -= distToCenter;

  return score;
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

  let bestScore = -Infinity;
  let move = -1;

  for (const idx of candidates) {
    // Basic randomness for medium
    const score =
      evaluateMove(board, idx, botPiece, playerPiece, winCondition, size) +
      Math.random() * 20;
    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }

  return move !== -1 ? move : candidates[Math.floor(Math.random() * candidates.length)];
};

export const getHardMove = (
  board: (string | null)[],
  winCondition: number,
  botPiece: string,
  playerPiece: string,
  size: number
) => {
  const candidates = getNeighborEmptyCells(board, size);
  if (candidates.length === 0) return Math.floor((size * size) / 2);

  let bestScore = -Infinity;
  let move = -1;

  for (const idx of candidates) {
    // More precise evaluation for hard
    const score = evaluateMove(
      board,
      idx,
      botPiece,
      playerPiece,
      winCondition,
      size
    );
    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }
  return move !== -1 ? move : candidates[Math.floor(Math.random() * candidates.length)];
};

