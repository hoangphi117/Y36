# Y36 Frontend Documentation

Tài liệu này mô tả các **quy ước frontend**, component dùng chung và cách tích hợp **UI + Sound** trong dự án **Y36**. Đọc kỹ trước khi phát triển hoặc chỉnh sửa code.

---

## Table of Contents

* [Button](#1-button)
* [Sound](#2-sound)
* [GameCard](#3-gamecard)
* [Theme](#4-theme)

---

## 1. Button

Dự án sử dụng **Button 3D** dùng chung cho toàn bộ UI.

### 1.1. Các loại Button

* `<RoundButton>` – Button cạnh tròn
* `<BoxButton>` – Button hình hộp

**Đường dẫn:**

```text
@/components/ui/___
```

---

### 1.2. Thuộc tính chung

Áp dụng cho cả `<RoundButton>` và `<BoxButton>`.

#### a. Size

```ts
size: "small" | "medium" | "large" | "mobile"
```

* `mobile`: sẽ thiết kế sau
* Hiện tại ưu tiên Desktop
* Nếu có tuỳ chỉnh riêng, vui lòng thông báo với nhóm

#### b. Variant (màu sắc)

* `primary` – Xanh Y36
* `accent` – Vàng
* `danger` – Đỏ
* `neutral` – Trắng
* Có thể mở rộng thêm theo ý tưởng của designer

#### c. Thuộc tính khác

* `onClick`
* `disabled`
* Các props HTML button thông thường khác

#### d. Âm thanh

* Button có thể tích hợp sound
* Xem mục **Sound** để biết cách sử dụng

---

### 1.3. Cách sử dụng Button

```tsx
<RoundButton size={"medium"} variant="primary" onClick={handleClick}>
  {children}
</RoundButton>
```

---

## 2. Sound

Hệ thống âm thanh được dùng chung cho toàn bộ game/UI.

### 2.1. Vị trí lưu file âm thanh

```text
@/src/assets/sounds/___ .mp3
```

### 2.2. Hook xử lý âm thanh

```text
@/src/hooks/useGameSound
```

---

### 2.3. Cách thêm sound mới

1. Import file sound vào `useGameSound`
2. Thêm tên sound vào `SoundType`
3. Khởi tạo trong `useRef`

```ts
<tênSound>: new Audio(<fileSound>)
```

4. Tuỳ chỉnh `volume` ở cuối hook

---

### 2.4. Tích hợp sound vào Button

#### Bước 1: Import hook

```ts
import { useGameSound } from "@/hooks/useGameSound";
```

#### Bước 2: Khởi tạo hook

```ts
const { playSound } = useGameSound(true);
```

**Tuỳ chọn:** Bật/tắt sound bằng state

```ts
const [soundEnabled, setSoundEnabled] = useState(true);
const { playSound } = useGameSound(soundEnabled);
```

#### Bước 3: Gắn vào Button

```tsx
<RoundButton
  onClick={() => {
    playSound("<tên-sound>");
    handleOtherLogic();
  }}
>
  Button
</RoundButton>
```

---

## 3. GameCard

* Ở **HomePage**, sử dụng component **GameCard** dùng chung
* UI của GameCard sẽ được **thiết kế lại sau**
* Hiện tại chỉ dùng để hiển thị danh sách game

---

## 4. Theme

### 4.1. Cấu hình Theme

Theme được cấu hình trong:

```text
index.css
```

* Sử dụng `.root` và `.dark`
* Đã có comment hướng dẫn trong file hoặc có thể tham khảo code hiện tại

### 4.2. Quy ước

* **Không sử dụng `dark:` trong Tailwind**
* Tránh viết logic theme rườm rà
* Ưu tiên dùng biến CSS

---

## Notes

* Tài liệu này sẽ được cập nhật khi có thay đổi về UI/UX hoặc sound system
* Nếu có đề xuất cải tiến, vui lòng trao đổi trong nhóm trước khi triển khai

---

**Y36 Frontend Team**
