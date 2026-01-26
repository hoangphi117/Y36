# Y36 Project Documentation

Chào mừng đến với dự án Y36. Dưới đây là hướng dẫn cài đặt và chạy dự án.

## 1. Yêu cầu hệ thống
- Node.js

## 2. Cài đặt Dependencies

Trước khi chạy, hãy đảm bảo đã cài đặt các gói thư viện cho cả Backend và Frontend.

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 3. Khởi tạo Database (Migrate & Seed)

Để tạo bảng và dữ liệu mẫu, bạn có thể sử dụng file script có sẵn hoặc chạy lệnh thủ công.

Tại thư mục `backend`:
```bash
npx knex migrate:rollback
npx knex migrate:latest
npx knex seed:run
```

## 4. Hướng dẫn chạy Server (Backend)

Tại thư mục `backend`:
```bash
npm run start
```

## 5. Hướng dẫn chạy Client (Frontend)

Tại thư mục `frontend`:
```bash
npm run dev
```

## 6. Tài khoản Test

Dữ liệu mẫu (Seed) cung cấp các tài khoản sau để bạn kiểm tra các tính năng:

### Tài khoản Admin
- **Email:** `admin@game.com`
- **Password:** `123456`

### Tài khoản User (Người chơi)
- **Email:** `nam.nguyen@test.com`
- **Password:** `123456`

*(Mật khẩu mặc định cho tất cả user được seed là `123456`)*