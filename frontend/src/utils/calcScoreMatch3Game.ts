export default function calcTargetScore(mode: "time" | "rounds" | "endless", boardSize: number, numCandyTypes: number, limitValue: number) {
    const BASE_POINT_PER_ACTION = 30;

    const sizeFactor = boardSize === 6 ? 0.7 : boardSize === 8 ? 1.3 : 1.0;
    const candyFactor = 1.6 - (numCandyTypes - 4) * 0.22; // 4 loại: 1.6x, 8 loại: 0.7x
    
    const difficultyMultiplier = sizeFactor * candyFactor;

    // 3. Tính toán dựa trên giới hạn (Time hoặc Moves)
    let finalTarget = 0;

    if (mode === "time") {
        // Giả sử trung bình 2 giây người chơi thực hiện 1 lần ghép thành công
        const estimatedMatches = limitValue / 2;
        finalTarget = estimatedMatches * BASE_POINT_PER_ACTION * difficultyMultiplier;
    } 
    else if (mode === "rounds") {
        // Dựa trực tiếp trên số lượt đi người chơi có
        finalTarget = limitValue * BASE_POINT_PER_ACTION * difficultyMultiplier;
    } 
    else {
        return 0; // Chế độ vô hạn không có mục tiêu thắng
    }

    // Làm tròn đến hàng chục và đảm bảo tối thiểu là 100 điểm
    return Math.max(Math.round(finalTarget / 10) * 10, 100);
}
