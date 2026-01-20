export default function calcTargetScore(mode: "time" | "rounds" | "endless", boardSize: number, numCandyTypes: number, limitValue: number) {
    const BASE_POINT_PER_ACTION = 30;

    const sizeFactor = boardSize === 6 ? 0.7 : boardSize === 8 ? 1.3 : 1.0;
    const candyFactor = 1.6 - (numCandyTypes - 4) * 0.22; // 4 types: 1.6x, 8 types: 0.7x
    
    const difficultyMultiplier = sizeFactor * candyFactor;

    // Calculate based on limit (Time or Moves)
    let finalTarget = 0;

    if (mode === "time") {
        // Assume on average 2 seconds per successful match
        const estimatedMatches = limitValue / 2;
        finalTarget = estimatedMatches * BASE_POINT_PER_ACTION * difficultyMultiplier;
    } 
    else if (mode === "rounds") {
        // Based directly on the number of moves available
        finalTarget = limitValue * BASE_POINT_PER_ACTION * difficultyMultiplier;
    } 
    else {
        return 0; // Endless mode has no winning target
    }

    // Round to nearest ten and ensure minimum is 100 points
    return Math.max(Math.round(finalTarget / 10) * 10, 100);
}
