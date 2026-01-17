type SquareValue = "X" | "O" | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const getEmptySquares = (squares: SquareValue[]) => {
  return squares
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null) as number[];
};

const calculateWinner = (squares: SquareValue[]) => {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export const getEasyMove = (squares: SquareValue[]) => {
  const empty = getEmptySquares(squares);
  if (empty.length === 0) return -1;
  return empty[Math.floor(Math.random() * empty.length)];
};

export const getMediumMove = (squares: SquareValue[], botSymbol: "X" | "O") => {
  const opponentSymbol = botSymbol === "X" ? "O" : "X";
  const empty = getEmptySquares(squares);

  for (let idx of empty) {
    const temp = [...squares];
    temp[idx] = botSymbol;
    if (calculateWinner(temp) === botSymbol) return idx;
  }

  for (let idx of empty) {
    const temp = [...squares];
    temp[idx] = opponentSymbol;
    if (calculateWinner(temp) === opponentSymbol) return idx;
  }

  return getEasyMove(squares);
};

const scores = {
  win: 10,
  lose: -10,
  tie: 0,
};

const minimax = (
  squares: SquareValue[],
  depth: number,
  isMaximizing: boolean,
  botSymbol: "X" | "O"
): number => {
  const opponentSymbol = botSymbol === "X" ? "O" : "X";
  const winner = calculateWinner(squares);

  if (winner === botSymbol) return scores.win - depth;
  if (winner === opponentSymbol) return scores.lose + depth;
  if (getEmptySquares(squares).length === 0) return scores.tie;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let idx of getEmptySquares(squares)) {
      squares[idx] = botSymbol;
      const score = minimax(squares, depth + 1, false, botSymbol);
      squares[idx] = null;
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let idx of getEmptySquares(squares)) {
      squares[idx] = opponentSymbol;
      const score = minimax(squares, depth + 1, true, botSymbol);
      squares[idx] = null;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
};

export const getHardMove = (squares: SquareValue[], botSymbol: "X" | "O") => {
  let bestScore = -Infinity;
  let move = -1;
  const empty = getEmptySquares(squares);

  if (empty.length === 9) return 4;
  if (empty.length === 8 && squares[4] === null) return 4;

  for (let idx of empty) {
    squares[idx] = botSymbol;
    const score = minimax(squares, 0, false, botSymbol);
    squares[idx] = null;
    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }
  return move;
};
