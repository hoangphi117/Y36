/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Bật extension để sinh UUID (gen_random_uuid)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // 1. BẢNG NGƯỜI DÙNG (USERS)
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); // PK, tự động sinh
    table.string("email").unique().notNullable(); // Dùng để đăng nhập
    table.string("password_hash").notNullable(); // Mật khẩu đã mã hóa
    table.string("username"); // Tên định danh ngắn gọn (optional)
    table.string("role").defaultTo("customer"); // 'admin' hoặc 'customer'
    table.text("avatar_url"); // Link ảnh đại diện
    table.boolean("dark_mode").defaultTo(false); // Cấu hình giao diện
    table.string("status").defaultTo("active"); // active, banned
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Ngày tham gia
  });

  // 2. BẢNG DANH SÁCH GAME (GAMES)
  await knex.schema.createTable("games", (table) => {
    table.increments("id").primary(); // ID Game (1, 2, 3...)
    table.string("code").unique().notNullable(); // Mã code (caro, snake...) - Unique
    table.string("name").notNullable(); // Tên hiển thị
    table.text("description"); // Mô tả luật chơi
    table.boolean("is_active").defaultTo(true); // Admin bật/tắt
    table.jsonb("default_config").notNullable(); // Cấu hình mặc định
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // 3. BẢNG PHIÊN CHƠI (GAME_SESSIONS)
  await knex.schema.createTable("game_sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); // Mã phiên chơi

    // Khóa ngoại (Foreign Keys)
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE"); // Người chơi
    table
      .integer("game_id")
      .references("id")
      .inTable("games")
      .onDelete("CASCADE"); // Chơi game gì

    table.integer("score").defaultTo(0); // Điểm số đạt được
    table.integer("play_time_seconds").defaultTo(0); // Thời gian đã chơi

    table.jsonb("board_state"); // QUAN TRỌNG: Lưu ma trận bàn cờ
    table.jsonb("session_config"); // Cấu hình lúc chơi (Snapshot)

    table.string("status").defaultTo("playing"); // playing, saved, completed
    table.timestamp("started_at").defaultTo(knex.fn.now()); // Bắt đầu lúc
    table.timestamp("updated_at").defaultTo(knex.fn.now()); // Lưu lần cuối lúc
  });

  // 4. BẢNG KẾT BẠN (FRIENDSHIPS)
  await knex.schema.createTable("friendships", (table) => {
    table
      .uuid("user_id_1")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Người gửi
    table
      .uuid("user_id_2")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Người nhận
    table.string("status").defaultTo("pending"); // pending, accepted, blocked
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Ngày tạo yêu cầu

    // Khóa chính phức hợp (Composite PK)
    table.primary(["user_id_1", "user_id_2"]);
  });

  // 5. BẢNG TIN NHẮN (MESSAGES)
  await knex.schema.createTable("messages", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("sender_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Người gửi
    table
      .uuid("receiver_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Người nhận
    table.text("content").notNullable(); // Nội dung
    table.boolean("is_read").defaultTo(false); // Đã xem chưa
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Thời gian gửi
  });

  // 6. BẢNG THÀNH TỰU (ACHIEVEMENTS)
  await knex.schema.createTable("achievements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE"); // Người đạt được
    table
      .integer("game_id")
      .references("id")
      .inTable("games")
      .onDelete("CASCADE")
      .nullable(); // Thuộc game nào (có thể NULL)

    table.string("code").notNullable(); // Mã thành tựu
    table.string("name").notNullable(); // Tên thành tựu
    table.text("description"); // Mô tả

    table.timestamp("unlocked_at").defaultTo(knex.fn.now()); // Thời gian đạt được

    // Ràng buộc: Mỗi User chỉ đạt 1 mã thành tựu cụ thể 1 lần duy nhất
    // (Tránh spam insert cùng 1 thành tựu cho 1 user)
    table.unique(["user_id", "game_id", "code"]);
  });

  // 7. BẢNG COMMENTS
  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
    
    table.text('content').notNullable();
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Xóa bảng theo thứ tự ngược lại để tránh lỗi khóa ngoại
  await knex.schema.dropTableIfExists("comments");
  await knex.schema.dropTableIfExists("achievements");
  await knex.schema.dropTableIfExists("messages");
  await knex.schema.dropTableIfExists("friendships");
  await knex.schema.dropTableIfExists("game_sessions");
  await knex.schema.dropTableIfExists("games");
  await knex.schema.dropTableIfExists("users");
};
