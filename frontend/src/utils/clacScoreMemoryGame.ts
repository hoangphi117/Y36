interface CalcLevelScoreProps {
    pairs: number;
    timeLeft: number;
    timeLimit: number;
    moves: number;
}

const calcLevelScore = ({ pairs, timeLeft, timeLimit, moves } : CalcLevelScoreProps): number => {
    const baseScore = pairs * 20;

    const timeBonus = Math.floor((timeLeft / timeLimit) * 100);

    const accuracyBonus = Math.max(0, (pairs - (moves - pairs)) * 10);

    const levelScore = baseScore + timeBonus + accuracyBonus;

    return levelScore;
}

export default calcLevelScore;