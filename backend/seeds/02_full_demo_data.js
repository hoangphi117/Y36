/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log(
    "(👉ﾟヮﾟ)👉 Đang seeding dữ liệu siêu to khổng lồ... 👈(ﾟヮﾟ👈)"
  );

  // =========================
  // Helpers
  // =========================
  const now = Date.now();
  // Giới hạn max 90 ngày cho logic seeding
  const MAX_DAYS = 90; 
  
  const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);
  const minsAgo = (m) => new Date(now - m * 60 * 1000);
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];
  const chance = (p) => Math.random() < p;

  // Ma trận 2D
  const matrix2D = (rows, cols, fill = 0) =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => fill)
    );

  const applyMovesToBoard = (board, moves) => {
    for (const mv of moves) {
      if (board[mv.y] && board[mv.y][mv.x] !== undefined)
        board[mv.y][mv.x] = mv.p;
    }
    return board;
  };

  // ===== board_state generators (GIỮ NGUYÊN LOGIC CŨ) =====

  // Caro / TicTacToe
  const mkCaroOrTTTState = ({ rows, cols, current_turn, moves }) => {
    const board = matrix2D(rows, cols, 0);
    applyMovesToBoard(board, moves);
    return {
      matrix: board,
      current_turn,
      history: moves.map((m, idx) => ({
        move: idx + 1,
        x: m.x,
        y: m.y,
        player: m.p,
        at: minsAgo(randInt(1, 120)),
      })),
    };
  };

  // Snake
  const mkSnakeState = ({
    rows,
    cols,
    len = 4,
    direction = "UP",
    current_speed = 180,
  }) => {
    const headX = randInt(3, cols - 4);
    const headY = randInt(3, rows - 4);
    const body = [];
    for (let i = 0; i < len; i++) body.push({ x: headX, y: headY + i });
    const food = { x: randInt(0, cols - 1), y: randInt(0, rows - 1) };
    return {
      snake_body: body,
      food_position: food,
      direction,
      current_speed,
    };
  };

  // Match3
  const mkMatch3State = ({ rows, cols, candy_types, moves_limit }) => {
    const mat = matrix2D(rows, cols, 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) mat[r][c] = randInt(1, candy_types);
    }
    return {
      matrix: mat,
      moves_remaining: randInt(0, moves_limit),
      current_combo: randInt(0, 6),
    };
  };

  // Memory
  const mkMemoryState = ({ rows, cols, theme = "animals" }) => {
    const total = rows * cols;
    const valuesByTheme = {
      animals: ["cat","dog","bird","fox","lion","tiger","panda","koala","owl","fish"],
      fruits: ["apple","banana","grape","orange","cherry","kiwi","lemon","mango","pear"],
      icons: ["star","heart","moon","sun","cloud","bolt","crown","gem","leaf"],
    };
    const pool = valuesByTheme[theme] || valuesByTheme.animals;
    const pairs = total / 2;
    const picked = Array.from({ length: pairs }, (_, i) => pool[i % pool.length]);

    const deck = [];
    let id = 1;
    for (const v of picked) {
      deck.push({ id: id++, value: v, status: "hidden" });
      deck.push({ id: id++, value: v, status: "hidden" });
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    // Simulate playing state
    const matchedPairs = randInt(0, Math.min(6, pairs));
    const flippedCount = randInt(0, 2);
    
    const byValue = new Map();
    for (const c of deck) {
      if (!byValue.has(c.value)) byValue.set(c.value, []);
      byValue.get(c.value).push(c);
    }
    let madePairs = 0;
    for (const cards of byValue.values()) {
      if (madePairs >= matchedPairs) break;
      cards[0].status = "matched";
      cards[1].status = "matched";
      madePairs += 1;
    }
    const hidden = deck.filter((c) => c.status === "hidden");
    for (let i = 0; i < Math.min(flippedCount, hidden.length); i++)
      hidden[i].status = "flipped";

    return { cards: deck };
  };

  // Drawing
  const mkDrawingState = () => {
    const colors = ["#FF3B30", "#34C759", "#007AFF", "#AF52DE", "#FF9500", "#000000"];
    const mkStroke = (pointCount) => {
      let x = randInt(20, 780);
      let y = randInt(20, 580);
      const points = [];
      for (let i = 0; i < pointCount; i++) {
        x += randInt(-18, 18);
        y += randInt(-18, 18);
        x = Math.max(0, Math.min(800, x));
        y = Math.max(0, Math.min(600, y));
        points.push({ x, y });
      }
      return { color: pick(colors), size: pick([2, 3, 4, 5, 6, 8]), points };
    };
    const paths = [];
    const strokes = randInt(1, 5);
    for (let i = 0; i < strokes; i++) paths.push(mkStroke(randInt(8, 22)));
    return { paths };
  };

  // =========================
  // 1) Xóa dữ liệu cũ
  // =========================
  await knex("comments").del(); // Xóa bảng comments
  await knex("achievements").del();
  await knex("messages").del();
  await knex("friendships").del();
  await knex("game_sessions").del();
  await knex("games").del();
  await knex("users").del();
  console.log("Đã xoá dữ liệu cũ (●'◡'●)");

  // =========================
  // 2) Users
  // =========================
  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  const passwordPlain = "123456";
  const passwordHash = await bcrypt.hash(passwordPlain, salt);

  const usersData = [
    { email: "admin@game.com", password_hash: passwordHash, username: "admin_vip", role: "admin", avatar_url: "https://i.pravatar.cc/150?u=admin_vip", dark_mode: true },
    { email: "nam.nguyen@test.com", password_hash: passwordHash, username: "nam_player", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=nam_player", dark_mode: true },
    { email: "lan.tran@test.com", password_hash: passwordHash, username: "lan_snake_pro", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=lan_snake_pro", dark_mode: false },
    { email: "huy.le@test.com", password_hash: passwordHash, username: "huy_newbie", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=huy_newbie", dark_mode: false },
    { email: "minh.pham@test.com", password_hash: passwordHash, username: "minh_combo", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=minh_combo", dark_mode: true },
    { email: "thao.vo@test.com", password_hash: passwordHash, username: "thao_artist", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=thao_artist", dark_mode: true },
    { email: "khoa.do@test.com", password_hash: passwordHash, username: "khoa_ttt", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=khoa_ttt", dark_mode: false },
    { email: "vy.ngo@test.com", password_hash: passwordHash, username: "vy_flip", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=vy_flip", dark_mode: false },
    { email: "son.bui@test.com", password_hash: passwordHash, username: "son_caro", role: "customer", avatar_url: "https://i.pravatar.cc/150?u=son_caro", dark_mode: true },
  ];

  const insertedUsers = await knex("users").insert(usersData).returning("*");
  const uAdmin = insertedUsers.find((u) => u.role === "admin");
  const customers = insertedUsers.filter((u) => u.role === "customer");
  console.log(`Đã add ${insertedUsers.length} Users ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 3) Games:
  // =========================
  const gamesData = [
    { code: "caro", name: "Cờ Caro 5 Ô (Gomoku)", description: "Đánh 5 quân liên tiếp để thắng.", is_active: true, default_config: { rows: 15, cols: 15, win_condition: 5, time_limit: 600, turn_time: 30 } },
    { code: "caro-4", name: "Cờ Caro 4 Ô", description: "Phiên bản nhanh: nối 4 quân.", is_active: true, default_config: { rows: 12, cols: 12, win_condition: 4, time_limit: 480, turn_time: 25 } },
    { code: "snake", name: "Rắn Săn Mồi", description: "Ăn mồi để tăng điểm.", is_active: true, default_config: { rows: 20, cols: 20, initial_speed: 200, speed_increment: 10 } },
    { code: "tic-tac-toe", name: "Tic Tac Toe", description: "Cờ 3x3 kinh điển.", is_active: true, default_config: { rows: 3, cols: 3, win_condition: 3, time_limit: 60, turn_time: 10 } },
    { code: "match3", name: "Kẹo Ngọt (Match-3)", description: "Đổi chỗ kẹo để ăn combo.", is_active: true, default_config: { rows: 8, cols: 8, candy_types: 5, target_score: 1200, moves_limit: 20, time_limit: 0 } },
    { code: "memory", name: "Lật Hình Trí Nhớ", description: "Lật thẻ tìm cặp giống nhau.", is_active: true, default_config: { rows: 4, cols: 4, theme: "animals", time_limit: 180 } },
    { code: "drawing", name: "Bảng Vẽ Tự Do", description: "Vẽ doodle nhanh.", is_active: true, default_config: { canvas_width: 800, canvas_height: 600, background_color: "#ffffff" } },
  ];

  const insertedGames = await knex("games").insert(gamesData).returning("*");
  const G = Object.fromEntries(insertedGames.map((g) => [g.code, g]));
  console.log(`Đã add ${insertedGames.length} Games ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 4) Friendships
  // =========================
  const friendships = [];
  const friendPairs = new Set();
  const mkPairKey = (idA, idB) => (String(idA).localeCompare(String(idB)) < 0 ? `${idA}|${idB}` : `${idB}|${idA}`);

  while (friendPairs.size < randInt(15, 25)) {
    const a = pick(customers);
    const b = pick(customers);
    if (a.id === b.id) continue;
    friendPairs.add(mkPairKey(a.id, b.id));
  }

  for (const key of friendPairs) {
    const [aId, bId] = key.split("|");
    friendships.push({
      user_id_1: aId,
      user_id_2: bId,
      status: chance(0.75) ? "accepted" : "pending",
      created_at: daysAgo(randInt(2, MAX_DAYS)), // Limit 90 days
    });
  }

  await knex("friendships").insert(friendships);
  console.log(`Đã add ${friendships.length} Friendships ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 5) Game sessions
  // =========================
  const sessions = [];
  const pickSessionStatus = () => pick(["completed", "completed", "completed", "playing", "saved"]);
  
  const mkSessionConfig = (gameCode) => ({
    mode: "vs_ai",
    ai_level: pick(["easy", "normal", "hard"]),
    seed_version: "v3_heavy",
    default_config: G[gameCode].default_config,
  });

  const mkSessionCommon = ({ user, game, status, score, playTimeSeconds, startedAt, updatedAt, board_state, session_config }) => ({
    user_id: user.id,
    game_id: game.id,
    score,
    play_time_seconds: playTimeSeconds,
    board_state,
    session_config,
    status,
    started_at: startedAt,
    updated_at: updatedAt,
  });

  const mkMovesUnique = ({ rows, cols, movesCount }) => {
    const used = new Set();
    const moves = [];
    for (let m = 0; m < movesCount; m++) {
      let x, y, k;
      do {
        x = randInt(0, cols - 1);
        y = randInt(0, rows - 1);
        k = `${x}-${y}`;
      } while (used.has(k));
      used.add(k);
      moves.push({ x, y, p: (m % 2) + 1 });
    }
    return moves;
  };

  // --- Caro 5 ô ---
  for (let i = 0; i < 80; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    // Giới hạn max 90 ngày
    const startedAt = daysAgo(randInt(1, MAX_DAYS - 1));
    const updatedAt = status === "completed" ? new Date(startedAt.getTime() + randInt(2, 30) * 60 * 1000) : hoursAgo(randInt(0, 24));
    
    const movesCount = status === "playing" ? randInt(8, 40) : randInt(18, 90);
    const moves = mkMovesUnique({ rows: 15, cols: 15, movesCount });
    const board_state = mkCaroOrTTTState({ rows: 15, cols: 15, current_turn: (movesCount % 2) + 1, moves });

    sessions.push(mkSessionCommon({
      user, game: G["caro"], status, score: status === "completed" ? randInt(80, 420) : randInt(10, 150),
      playTimeSeconds: status === "completed" ? randInt(180, 1600) : randInt(20, 900),
      startedAt, updatedAt, board_state, session_config: mkSessionConfig("caro"),
    }));
  }

  // --- Caro 4 ô ---
  for (let i = 0; i < 60; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    const startedAt = daysAgo(randInt(1, MAX_DAYS - 1));
    const updatedAt = status === "completed" ? new Date(startedAt.getTime() + randInt(1, 18) * 60 * 1000) : hoursAgo(randInt(0, 12));
    
    const movesCount = randInt(6, 40);
    const moves = mkMovesUnique({ rows: 12, cols: 12, movesCount });
    const board_state = mkCaroOrTTTState({ rows: 12, cols: 12, current_turn: (movesCount % 2) + 1, moves });

    sessions.push(mkSessionCommon({
      user, game: G["caro-4"], status, score: randInt(50, 300),
      playTimeSeconds: randInt(60, 900), startedAt, updatedAt, board_state, session_config: mkSessionConfig("caro-4"),
    }));
  }

  // --- TicTacToe ---
  for (let i = 0; i < 60; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    const startedAt = daysAgo(randInt(1, Math.min(30, MAX_DAYS))); // TTT chơi nhanh hơn
    const updatedAt = new Date(startedAt.getTime() + randInt(1, 5) * 60 * 1000);

    const movesCount = randInt(3, 9);
    const moves = mkMovesUnique({ rows: 3, cols: 3, movesCount });
    const board_state = mkCaroOrTTTState({ rows: 3, cols: 3, current_turn: (movesCount % 2) + 1, moves });

    sessions.push(mkSessionCommon({
      user, game: G["tic-tac-toe"], status, score: randInt(5, 50),
      playTimeSeconds: randInt(10, 180), startedAt, updatedAt, board_state, session_config: mkSessionConfig("tic-tac-toe"),
    }));
  }

  // --- Snake ---
  for (let i = 0; i < 100; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    const startedAt = daysAgo(randInt(1, MAX_DAYS - 1));
    const updatedAt = new Date(startedAt.getTime() + randInt(2, 20) * 60 * 1000);
    
    const board_state = mkSnakeState({ rows: 20, cols: 20, len: randInt(4, 15), direction: pick(["UP", "DOWN", "LEFT", "RIGHT"]), current_speed: randInt(100, 200) });

    sessions.push(mkSessionCommon({
      user, game: G["snake"], status, score: randInt(50, 1500),
      playTimeSeconds: randInt(30, 900), startedAt, updatedAt, board_state, session_config: mkSessionConfig("snake"),
    }));
  }

  // --- Match3 ---
  for (let i = 0; i < 80; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    const startedAt = daysAgo(randInt(1, MAX_DAYS - 1));
    const updatedAt = new Date(startedAt.getTime() + randInt(5, 25) * 60 * 1000);
    
    const board_state = mkMatch3State({ rows: 8, cols: 8, candy_types: 5, moves_limit: 20 });
    sessions.push(mkSessionCommon({
      user, game: G["match3"], status, score: randInt(200, 3000),
      playTimeSeconds: randInt(60, 1200), startedAt, updatedAt, board_state, session_config: mkSessionConfig("match3"),
    }));
  }

  // --- Memory ---
  for (let i = 0; i < 60; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    const startedAt = daysAgo(randInt(1, MAX_DAYS - 1));
    const updatedAt = new Date(startedAt.getTime() + randInt(3, 15) * 60 * 1000);
    
    const board_state = mkMemoryState({ rows: 4, cols: 4, theme: pick(["animals", "fruits", "icons"]) });
    sessions.push(mkSessionCommon({
      user, game: G["memory"], status, score: randInt(50, 400),
      playTimeSeconds: randInt(40, 600), startedAt, updatedAt, board_state, session_config: mkSessionConfig("memory"),
    }));
  }

  // --- Drawing ---
  for (let i = 0; i < 40; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();
    const startedAt = daysAgo(randInt(1, MAX_DAYS - 1));
    const updatedAt = new Date(startedAt.getTime() + randInt(5, 30) * 60 * 1000);

    const board_state = mkDrawingState();
    sessions.push(mkSessionCommon({
      user, game: G["drawing"], status, score: randInt(0, 50),
      playTimeSeconds: randInt(60, 1800), startedAt, updatedAt, board_state, session_config: mkSessionConfig("drawing"),
    }));
  }

  // Chia nhỏ để insert tránh lỗi buffer nếu quá lớn
  const chunkSize = 100;
  for (let i = 0; i < sessions.length; i += chunkSize) {
    await knex("game_sessions").insert(sessions.slice(i, i + chunkSize));
  }
  console.log(`Đã add ${sessions.length} Game sessions ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 6) Comments
  // =========================
  const comments = [];
  
  // Từ điển comment theo loại game cho "real"
  const commentTemplates = {
    'caro': [
      "Game này AI đánh rát quá!", "Có ai muốn solo kèo 50k không?", "Lỗi hiển thị nước đi rồi ad ơi.",
      "Chơi cái này nhớ hồi đi học ghê.", "Caro 5 ô khó hơn 4 ô nhiều.", "Thua hoài cay cú vãi >.<"
    ],
    'caro-4': [
      "Đánh nhanh thắng nhanh, đã!", "Luật 4 ô dễ bị lừa quá.", "Mới vào đã bị chặn 2 đầu, toang.",
      "Game giải trí tốt giờ nghỉ trưa."
    ],
    'snake': [
      "Con rắn chạy nhanh quá chóng cả mặt.", "Lag quá, đang quẹo thì đâm tường.", "Được 1000 điểm rồi anh em ơi!",
      "Nhạc nền game này cute xỉu.", "Điều khiển trên mobile hơi khó nha."
    ],
    'tic-tac-toe': [
      "Map bé tẹo chơi chán òm.", "Hòa hoài chán quá.", "Cần mode 10x10 mới đã.", "AI easy quá, chỉnh Hard đi."
    ],
    'match3': [
      "Hiệu ứng nổ kẹo đã mắt ghê.", "Màn này khó quá, hết move rồi.", "Cần thêm item hỗ trợ đi ad.",
      "Combo x5 nhìn phê lòi.", "Game giết thời gian đỉnh cao."
    ],
    'memory': [
      "Theme animals dễ nhớ nhất.", "Lật sai hoài quạu ghê.", "Rèn luyện trí nhớ tốt cho người già :v",
      "Hình ảnh sắc nét, 10 điểm."
    ],
    'drawing': [
      "Vẽ xấu đừng chê nha mấy ba.", "Công cụ vẽ còn thiếu nhiều quá.", "Làm sao để lưu tranh về máy vậy?",
      "Vẽ bậy bị ban nick không ad? :))"
    ]
  };

  const genericComments = [
    "Game hay, 5 sao!", "Admin fix lỗi dùm cái.", "Giao diện tối nhìn dịu mắt.", 
    "Kết bạn giao lưu nào mọi người.", "Server dạo này mượt hơn rồi đó."
  ];

  // Duyệt qua từng game, random số lượng comment
  for (const gameCode of Object.keys(G)) {
    const gameId = G[gameCode].id;
    const specificTpl = commentTemplates[gameCode] || [];
    const pool = [...specificTpl, ...genericComments];
    
    // Mỗi game có khoảng 5 - 15 comments
    const quantity = randInt(5, 15);
    
    for(let k=0; k<quantity; k++) {
        const user = pick(customers);
        comments.push({
            user_id: user.id,
            game_id: gameId,
            content: pick(pool),
            created_at: daysAgo(randInt(0, MAX_DAYS)), // Comment rải rác 90 ngày
            updated_at: knex.fn.now()
        });
    }
  }

  // Shuffle comments để ngày tháng lộn xộn tự nhiên khi insert (mặc dù DB sort theo time)
  comments.sort(() => Math.random() - 0.5);

  await knex("comments").insert(comments);
  console.log(`Đã add ${comments.length} Comments ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 7) Messages
  // =========================
  const systemMsgs = [
    "Chúc bạn chơi vui vẻ! 🎮", "Tip Caro: ưu tiên tạo thế 2 đầu.", "Snake: Đừng ôm tường quá lâu.",
    "Match-3: Tạo kẹo đặc biệt để ăn combo!", "Memory: Lật theo cụm 2x2 sẽ dễ nhớ hơn."
  ];
  const chat = [];
  
  // System messages
  for (const u of customers) {
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      chat.push({
        sender_id: uAdmin.id, receiver_id: u.id,
        content: pick(systemMsgs),
        created_at: daysAgo(randInt(0, MAX_DAYS)),
      });
    }
  }
  // User messages
  const quickChats = [
    "Ê vào làm ván Caro không 😄", "Lag quá ông ơi.", "Snake hôm nay lag nhẹ.", "Match3 ăn combo đã tay ghê!",
    "Ông vẽ con mèo nhìn giống con gấu 😭", "Mai chơi tiếp nhé, vợ gank rồi."
  ];
  for (let i = 0; i < 40; i++) { // Tăng số lượng chat
    const a = pick(customers);
    const b = pick(customers);
    if (a.id === b.id) continue;
    chat.push({
      sender_id: a.id, receiver_id: b.id,
      content: pick(quickChats),
      created_at: daysAgo(randInt(0, MAX_DAYS)),
    });
  }

  await knex("messages").insert(chat);
  console.log(`Đã add ${chat.length} Messages ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 8) Achievements
  // =========================
  const achievements = [];
  const badges = {
    caro: [
      { code: "caro_first_win", name: "First Blood", description: "Thắng ván Caro đầu tiên" },
      { code: "caro_streak_3", name: "Chuỗi thắng", description: "Thắng 3 ván liên tục" },
    ],
    "caro-4": [
      { code: "caro4_quick_win", name: "Quick Four", description: "Thắng dưới 2 phút" },
    ],
    "tic-tac-toe": [
      { code: "ttt_quick_win", name: "Quick Win", description: "Thắng dưới 30 giây" },
    ],
    snake: [
      { code: "snake_hungry", name: "Hungry Snake", description: "Ăn 10 mồi 1 ván" },
    ],
    match3: [
      { code: "m3_combo_3", name: "Combo Starter", description: "Tạo combo x3" },
    ],
    memory: [
      { code: "mem_good", name: "Good Memory", description: "Match 6 cặp không sai" },
    ],
    drawing: [
      { code: "draw_5", name: "Doodle Master", description: "Lưu 5 bản vẽ" },
    ],
  };

  const gameCodes = Object.keys(badges);
  for (const u of customers) {
    const want = randInt(3, 8);
    const used = new Set();
    let safety = 0;
    while (used.size < want && safety++ < 50) {
      const code = pick(gameCodes);
      if(!badges[code]) continue;
      const badge = pick(badges[code]);
      const game = G[code];
      const key = `${game.id}|${badge.code}`;
      if (used.has(key)) continue;
      used.add(key);

      achievements.push({
        user_id: u.id, game_id: game.id,
        code: badge.code, name: badge.name, description: badge.description,
        unlocked_at: daysAgo(randInt(1, MAX_DAYS)),
      });
    }
  }

  await knex("achievements").insert(achievements);
  console.log(`Đã add ${achievements.length} Achievements ༼ つ ◕_◕ ༽つ`);

  console.log("Seeding hoàn tất! Dữ liệu được random 90 ngày gần nhất! ☆*: .｡. o(≧▽≦)o .｡.:*☆");
};