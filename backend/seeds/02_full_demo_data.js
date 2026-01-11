/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log(
    "(👉ﾟヮﾟ)👉 Đang seeding dữ liệu chờ xíu nha mấy em =)) 👈(ﾟヮﾟ👈)"
  );

  // =========================
  // Helpers
  // =========================
  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);
  const minsAgo = (m) => new Date(now - m * 60 * 1000);
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];
  const chance = (p) => Math.random() < p;

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

  // ===== board_state generators =====

  // Caro / TicTacToe: { matrix, current_turn, history? }
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

  // Snake: { snake_body, food_position, direction, current_speed }
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

  // Match3: { matrix, moves_remaining, current_combo }
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

  // Memory: { cards: [{id,value,status}] }
  const mkMemoryState = ({ rows, cols, theme = "animals" }) => {
    const total = rows * cols;
    const valuesByTheme = {
      animals: [
        "cat",
        "dog",
        "bird",
        "fox",
        "lion",
        "tiger",
        "panda",
        "koala",
        "owl",
        "fish",
      ],
      fruits: [
        "apple",
        "banana",
        "grape",
        "orange",
        "cherry",
        "kiwi",
        "lemon",
        "mango",
        "pear",
      ],
      icons: [
        "star",
        "heart",
        "moon",
        "sun",
        "cloud",
        "bolt",
        "crown",
        "gem",
        "leaf",
      ],
    };
    const pool = valuesByTheme[theme] || valuesByTheme.animals;

    const pairs = total / 2;
    const picked = Array.from(
      { length: pairs },
      (_, i) => pool[i % pool.length]
    );

    const deck = [];
    let id = 1;
    for (const v of picked) {
      deck.push({ id: id++, value: v, status: "hidden" });
      deck.push({ id: id++, value: v, status: "hidden" });
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

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

  // Drawing: { paths: [{color,size,points:[{x,y}]}] }
  const mkDrawingState = () => {
    const colors = [
      "#FF3B30",
      "#34C759",
      "#007AFF",
      "#AF52DE",
      "#FF9500",
      "#000000",
    ];
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
    {
      email: "admin@game.com",
      password_hash: passwordHash,
      username: "admin_vip",
      role: "admin",
      avatar_url: "https://i.pravatar.cc/150?u=admin_vip",
      dark_mode: true,
    },
    {
      email: "nam.nguyen@test.com",
      password_hash: passwordHash,
      username: "nam_player",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=nam_player",
      dark_mode: true,
    },
    {
      email: "lan.tran@test.com",
      password_hash: passwordHash,
      username: "lan_snake_pro",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=lan_snake_pro",
      dark_mode: false,
    },
    {
      email: "huy.le@test.com",
      password_hash: passwordHash,
      username: "huy_newbie",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=huy_newbie",
      dark_mode: false,
    },
    {
      email: "minh.pham@test.com",
      password_hash: passwordHash,
      username: "minh_combo",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=minh_combo",
      dark_mode: true,
    },
    {
      email: "thao.vo@test.com",
      password_hash: passwordHash,
      username: "thao_artist",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=thao_artist",
      dark_mode: true,
    },
    {
      email: "khoa.do@test.com",
      password_hash: passwordHash,
      username: "khoa_ttt",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=khoa_ttt",
      dark_mode: false,
    },
    {
      email: "vy.ngo@test.com",
      password_hash: passwordHash,
      username: "vy_flip",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=vy_flip",
      dark_mode: false,
    },
    {
      email: "son.bui@test.com",
      password_hash: passwordHash,
      username: "son_caro",
      role: "customer",
      avatar_url: "https://i.pravatar.cc/150?u=son_caro",
      dark_mode: true,
    },
  ];

  const insertedUsers = await knex("users").insert(usersData).returning("*");
  const uAdmin = insertedUsers.find((u) => u.role === "admin");
  const customers = insertedUsers.filter((u) => u.role === "customer");
  console.log(`Đã add ${insertedUsers.length} Users ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 3) Games:
  // =========================
  const gamesData = [
    // Caro 5 ô (Gomoku)
    {
      code: "caro",
      name: "Cờ Caro 5 Ô (Gomoku)",
      description: "Đánh 5 quân liên tiếp để thắng. Chế độ đấu với máy.",
      is_active: true,
      default_config: {
        rows: 15,
        cols: 15,
        win_condition: 5,
        time_limit: 600,
        turn_time: 30,
      },
    },
    // Caro 4 ô (nhanh hơn)
    {
      code: "caro-4",
      name: "Cờ Caro 4 Ô",
      description:
        "Phiên bản nhanh: nối 4 quân liên tiếp để thắng. Đấu với máy.",
      is_active: true,
      default_config: {
        rows: 12,
        cols: 12,
        win_condition: 4,
        time_limit: 480,
        turn_time: 25,
      },
    },

    // Snake
    {
      code: "snake",
      name: "Rắn Săn Mồi",
      description: "Ăn mồi để tăng điểm và tăng tốc. Đừng đâm tường!",
      is_active: true,
      default_config: {
        rows: 20,
        cols: 20,
        initial_speed: 200,
        speed_increment: 10,
      },
    },

    // TicTacToe
    {
      code: "tic-tac-toe",
      name: "Tic Tac Toe",
      description: "Cờ 3x3 kinh điển. Đấu với máy nhanh gọn.",
      is_active: true,
      default_config: {
        rows: 3,
        cols: 3,
        win_condition: 3,
        time_limit: 60,
        turn_time: 10,
      },
    },

    // Match3
    {
      code: "match3",
      name: "Kẹo Ngọt (Match-3)",
      description: "Đổi chỗ kẹo để tạo 3 kẹo liên tiếp, ăn combo ghi điểm.",
      is_active: true,
      default_config: {
        rows: 8,
        cols: 8,
        candy_types: 5,
        target_score: 1200,
        moves_limit: 20,
        time_limit: 0,
      },
    },

    // Memory
    {
      code: "memory",
      name: "Lật Hình Trí Nhớ",
      description: "Lật thẻ tìm cặp giống nhau. Chơi thư giãn.",
      is_active: true,
      default_config: {
        rows: 4,
        cols: 4,
        theme: "animals",
        time_limit: 180,
      },
    },

    // Drawing
    {
      code: "drawing",
      name: "Bảng Vẽ Tự Do",
      description: "Vẽ doodle nhanh, lưu lại để khoe bạn bè.",
      is_active: true,
      default_config: {
        canvas_width: 800,
        canvas_height: 600,
        background_color: "#ffffff",
      },
    },
  ];

  const insertedGames = await knex("games").insert(gamesData).returning("*");
  const G = Object.fromEntries(insertedGames.map((g) => [g.code, g]));
  console.log(`Đã add ${insertedGames.length} Games ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 4) Friendships
  // =========================
  const friendships = [];
  const pairs = new Set();

  const mkPairKey = (idA, idB) => {
    const a = String(idA);
    const b = String(idB);
    return a.localeCompare(b) < 0 ? `${a}|${b}` : `${b}|${a}`;
  };

  while (pairs.size < randInt(10, 14)) {
    const a = pick(customers);
    const b = pick(customers);
    if (a.id === b.id) continue;
    pairs.add(mkPairKey(a.id, b.id));
  }

  for (const key of pairs) {
    const [aId, bId] = key.split("|");
    const status = chance(0.75) ? "accepted" : "pending";
    friendships.push({
      user_id_1: aId,
      user_id_2: bId,
      status,
      created_at: daysAgo(randInt(2, 60)),
    });
  }

  await knex("friendships").insert(friendships);
  console.log(`Đã add ${friendships.length} Friendships ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 5) Game sessions
  // =========================
  const sessions = [];
  const pickSessionStatus = () =>
    pick(["completed", "completed", "completed", "playing", "saved"]);

  const mkSessionConfig = (gameCode) => ({
    mode: "vs_ai",
    ai_level: pick(["easy", "normal", "hard"]),
    seed_version: "demo_v2",
    default_config: G[gameCode].default_config,
  });

  const mkSessionCommon = ({
    user,
    game,
    status,
    score,
    playTimeSeconds,
    startedAt,
    updatedAt,
    board_state,
    session_config,
  }) => ({
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
  for (let i = 0; i < 16; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 45));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(2, 30) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 12) * 60 * 1000)
        : hoursAgo(randInt(0, 36));

    const movesCount = status === "playing" ? randInt(8, 40) : randInt(18, 90);
    const moves = mkMovesUnique({ rows: 15, cols: 15, movesCount });

    const board_state = mkCaroOrTTTState({
      rows: 15,
      cols: 15,
      current_turn: (movesCount % 2) + 1,
      moves,
    });

    sessions.push(
      mkSessionCommon({
        user,
        game: G["caro"],
        status,
        score: status === "completed" ? randInt(80, 420) : randInt(10, 150),
        playTimeSeconds:
          status === "completed" ? randInt(180, 1600) : randInt(20, 900),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("caro"),
      })
    );
  }

  // --- Caro 4 ô ---
  for (let i = 0; i < 14; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 45));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(1, 18) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 10) * 60 * 1000)
        : hoursAgo(randInt(0, 24));

    const movesCount = status === "playing" ? randInt(6, 28) : randInt(14, 60);
    const moves = mkMovesUnique({ rows: 12, cols: 12, movesCount });

    const board_state = mkCaroOrTTTState({
      rows: 12,
      cols: 12,
      current_turn: (movesCount % 2) + 1,
      moves,
    });

    sessions.push(
      mkSessionCommon({
        user,
        game: G["caro-4"],
        status,
        score: status === "completed" ? randInt(60, 320) : randInt(10, 120),
        playTimeSeconds:
          status === "completed" ? randInt(120, 1200) : randInt(20, 700),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("caro-4"),
      })
    );
  }

  // --- TicTacToe ---
  for (let i = 0; i < 16; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 30));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(1, 6) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 5) * 60 * 1000)
        : minsAgo(randInt(1, 90));

    const used = new Set();
    const movesCount = status === "playing" ? randInt(2, 6) : randInt(5, 9);
    const moves = [];
    for (let m = 0; m < movesCount; m++) {
      let x, y, k;
      do {
        x = randInt(0, 2);
        y = randInt(0, 2);
        k = `${x}-${y}`;
      } while (used.has(k));
      used.add(k);
      moves.push({ x, y, p: (m % 2) + 1 });
    }

    const board_state = mkCaroOrTTTState({
      rows: 3,
      cols: 3,
      current_turn: (movesCount % 2) + 1,
      moves,
    });

    sessions.push(
      mkSessionCommon({
        user,
        game: G["tic-tac-toe"],
        status,
        score: status === "completed" ? randInt(5, 40) : randInt(0, 20),
        playTimeSeconds:
          status === "completed" ? randInt(20, 180) : randInt(10, 120),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("tic-tac-toe"),
      })
    );
  }

  // --- Snake ---
  for (let i = 0; i < 22; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 40));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(2, 25) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 15) * 60 * 1000)
        : minsAgo(randInt(1, 120));

    const len = status === "completed" ? randInt(4, 18) : randInt(4, 10);
    const speed = Math.max(80, 200 - randInt(0, 12) * 10);

    const board_state = mkSnakeState({
      rows: 20,
      cols: 20,
      len,
      direction: pick(["UP", "DOWN", "LEFT", "RIGHT"]),
      current_speed: speed,
    });

    sessions.push(
      mkSessionCommon({
        user,
        game: G["snake"],
        status,
        score: status === "completed" ? randInt(80, 1200) : randInt(10, 350),
        playTimeSeconds:
          status === "completed" ? randInt(60, 1400) : randInt(15, 700),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("snake"),
      })
    );
  }

  // --- Match3 ---
  for (let i = 0; i < 20; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 35));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(3, 18) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 12) * 60 * 1000)
        : minsAgo(randInt(1, 90));

    const board_state = mkMatch3State({
      rows: 8,
      cols: 8,
      candy_types: 5,
      moves_limit: 20,
    });

    sessions.push(
      mkSessionCommon({
        user,
        game: G["match3"],
        status,
        score: status === "completed" ? randInt(400, 2400) : randInt(50, 1300),
        playTimeSeconds:
          status === "completed" ? randInt(120, 1100) : randInt(20, 600),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("match3"),
      })
    );
  }

  // --- Memory ---
  for (let i = 0; i < 14; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 25));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(2, 12) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 10) * 60 * 1000)
        : minsAgo(randInt(1, 70));

    const board_state = mkMemoryState({
      rows: 4,
      cols: 4,
      theme: pick(["animals", "fruits", "icons"]),
    });

    sessions.push(
      mkSessionCommon({
        user,
        game: G["memory"],
        status,
        score: status === "completed" ? randInt(60, 300) : randInt(0, 150),
        playTimeSeconds:
          status === "completed" ? randInt(40, 600) : randInt(15, 420),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("memory"),
      })
    );
  }

  // --- Drawing ---
  for (let i = 0; i < 10; i++) {
    const user = pick(customers);
    const status = pickSessionStatus();

    const startedAt = daysAgo(randInt(1, 20));
    const updatedAt =
      status === "completed"
        ? new Date(startedAt.getTime() + randInt(3, 20) * 60 * 1000)
        : status === "saved"
        ? new Date(startedAt.getTime() + randInt(1, 15) * 60 * 1000)
        : minsAgo(randInt(1, 60));

    const board_state = mkDrawingState();

    sessions.push(
      mkSessionCommon({
        user,
        game: G["drawing"],
        status,
        score: status === "completed" ? randInt(5, 80) : randInt(0, 25),
        playTimeSeconds:
          status === "completed" ? randInt(60, 1200) : randInt(20, 600),
        startedAt,
        updatedAt,
        board_state,
        session_config: mkSessionConfig("drawing"),
      })
    );
  }

  await knex("game_sessions").insert(sessions);
  console.log(`Đã add ${sessions.length} Game sessions ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 6) Messages
  // =========================
  const systemMsgs = [
    "Chúc bạn chơi vui vẻ! 🎮",
    "Tip Caro: ưu tiên tạo thế 2 đầu, tránh bị chặn.",
    "Caro 4 ô: chơi nhanh, chú ý fork sớm nhé!",
    "Snake: Đừng ôm tường quá lâu, dễ kẹt góc 😅",
    "Match-3: Tạo kẹo đặc biệt để ăn combo!",
    "Memory: Lật theo cụm 2x2 sẽ dễ nhớ hơn.",
    "Drawing: Dùng nét nhỏ để sketch, nét to để tô.",
  ];

  const chat = [];
  for (const u of customers) {
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      chat.push({
        sender_id: uAdmin.id,
        receiver_id: u.id,
        content: pick(systemMsgs),
        created_at: daysAgo(randInt(0, 20)),
      });
    }
  }

  const quickChats = [
    "Ê vào làm ván Caro không 😄",
    "Caro 4 ô nhanh vl, làm ván nữa!",
    "Snake hôm nay lag nhẹ hay do mình vậy?",
    "Match3 ăn combo đã tay ghê!",
    "Memory theme icons nhìn xịn đó.",
    "Ông vẽ con mèo nhìn giống con gấu 😭",
    "TicTacToe AI hơi khó chịu nha.",
  ];
  for (let i = 0; i < 16; i++) {
    const a = pick(customers);
    const b = pick(customers);
    if (a.id === b.id) continue;
    chat.push({
      sender_id: a.id,
      receiver_id: b.id,
      content: pick(quickChats),
      created_at: daysAgo(randInt(0, 25)),
    });
  }

  await knex("messages").insert(chat);
  console.log(`Đã add ${chat.length} Messages ༼ つ ◕_◕ ༽つ`);

  // =========================
  // 7) Achievements
  // =========================
  const achievements = [];

  const badges = {
    caro: [
      {
        code: "caro_first_win",
        name: "First Blood",
        description: "Thắng ván Caro đầu tiên",
      },
      {
        code: "caro_block_3",
        name: "Chặn thần sầu",
        description: "Chặn đối thủ 3 lần liên tiếp",
      },
      {
        code: "caro_streak_3",
        name: "Chuỗi thắng",
        description: "Thắng 3 ván liên tục",
      },
    ],
    "caro-4": [
      {
        code: "caro4_quick_win",
        name: "Quick Four",
        description: "Thắng Caro 4 ô trong dưới 2 phút",
      },
      {
        code: "caro4_fork",
        name: "Fork Master",
        description: "Tạo thế chẻ 2 hướng (fork) thành công",
      },
      {
        code: "caro4_streak_3",
        name: "Win Streak",
        description: "Thắng 3 ván Caro 4 ô liên tiếp",
      },
    ],
    "tic-tac-toe": [
      {
        code: "ttt_quick_win",
        name: "Quick Win",
        description: "Thắng trong dưới 30 giây",
      },
      {
        code: "ttt_no_lose",
        name: "Không thể thua",
        description: "Hòa 5 ván liên tiếp",
      },
    ],
    snake: [
      {
        code: "snake_hungry",
        name: "Hungry Snake",
        description: "Ăn 10 mồi trong 1 ván",
      },
      {
        code: "snake_speed",
        name: "Speed Demon",
        description: "Tốc độ đạt dưới 120ms",
      },
    ],
    match3: [
      {
        code: "m3_combo_3",
        name: "Combo Starter",
        description: "Tạo combo x3",
      },
      { code: "m3_1500", name: "Sweet Tooth", description: "Đạt 1500 điểm" },
    ],
    memory: [
      {
        code: "mem_good",
        name: "Good Memory",
        description: "Match 6 cặp không sai",
      },
      {
        code: "mem_fast",
        name: "Fast Flip",
        description: "Hoàn thành dưới 90 giây",
      },
    ],
    drawing: [
      { code: "draw_5", name: "Doodle Master", description: "Lưu 5 bản vẽ" },
      {
        code: "draw_lines",
        name: "Clean Lines",
        description: "Vẽ 10 nét liên tục",
      },
    ],
  };

  const gameCodes = Object.keys(badges);

  for (const u of customers) {
    const want = randInt(3, 8);
    const used = new Set();

    let safety = 0;
    while (used.size < want && safety++ < 50) {
      const code = pick(gameCodes);
      const badge = pick(badges[code]);
      const game = G[code];
      const key = `${game.id}|${badge.code}`;
      if (used.has(key)) continue;
      used.add(key);

      achievements.push({
        user_id: u.id,
        game_id: game.id,
        code: badge.code,
        name: badge.name,
        description: badge.description,
        unlocked_at: daysAgo(randInt(1, 60)),
      });
    }
  }

  await knex("achievements").insert(achievements);
  console.log(`Đã add ${achievements.length} Achievements ༼ つ ◕_◕ ༽つ`);

  console.log("Seeding hoàn tất rồi lo code đi! ☆*: .｡. o(≧▽≦)o .｡.:*☆");
};
