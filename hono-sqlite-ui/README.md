# hono-sqlite-ui

A lightweight, plug-and-play administration panel UI for SQLite database management, built specifically for Hono routers running on Bun or Node.js.

*Giao diện quản trị SQLite gọn nhẹ, cắm-là-chạy được thiết kế dành riêng cho các router Hono chạy trên môi trường Bun hoặc Node.js.*

---

## Design & Layout (Thiết kế & Bố cục)

### English
The user interface utilizes standard modern design practices:
- **Dark Theme**: High-contrast dark mode (`#0b0f19`) featuring subtle borders and glassmorphism.
- **Icons & Typography**: Uses Google Font *Inter* for readability and *Lucide Icons* for user interface control mapping.
- **Transitions**: Smooth micro-interactions for modal triggers and status notifications.

### Tiếng Việt
Giao diện người dùng sử dụng các nguyên lý thiết kế hiện đại:
- **Chủ đề tối (Dark Theme)**: Chế độ tối độ tương phản cao (`#0b0f19`) kết hợp đường viền mỏng và hiệu ứng mờ kính (glassmorphism).
- **Biểu tượng & Font chữ**: Sử dụng font chữ *Inter* để tối ưu khả năng đọc và *Lucide Icons* để mô tả điều hướng trực quan.
- **Hiệu ứng chuyển động**: Các tương tác nhỏ (micro-interactions) mượt mà cho các sự kiện mở modal và thông báo trạng thái.

---

## Features (Tính năng)

### English
- **Plug & Play**: Single line of code to mount the sub-router.
- **Data Browser**: Paginated table view with search filters on text columns.
- **Schema Inspector**: Structured view of columns, data types, primary keys, and foreign keys.
- **Full CRUD**: Complete row insert, update, and delete support with schema-aware input fields.
- **Raw SQL Console**: Text-area input for executing arbitrary raw SQL statements with elapsed time metrics.
- **Read-Only Mode**: Toggle option to restrict database modifications.
- **Self-contained SPA**: No asset build steps required by the parent server.

### Tiếng Việt
- **Tích hợp nhanh**: Chỉ cần một dòng code để gắn sub-router.
- **Duyệt dữ liệu**: Hiển thị bảng dạng phân trang kèm bộ lọc tìm kiếm trên các cột văn bản.
- **Kiểm tra cấu trúc**: Xem cấu trúc cột, kiểu dữ liệu, khóa chính và khóa ngoại.
- **Hỗ trợ CRUD**: Thao tác thêm, sửa, xóa các dòng dữ liệu thông qua các biểu mẫu tự động tương thích theo cấu trúc bảng.
- **Trình chạy SQL Raw**: Nhập và thực thi trực tiếp các câu lệnh SQL tự do có đo lường thời gian phản hồi.
- **Chế độ chỉ đọc (Read-Only)**: Cấu hình tùy chọn để chặn các thao tác ghi dữ liệu.
- **SPA tự đóng gói**: Không yêu cầu bước biên dịch tài nguyên tĩnh từ phía server chính.

---

## Installation (Cài đặt)

```bash
npm install hono-sqlite-ui
```

Make sure you have `hono` installed (which is a peer dependency).

---

## Usage (Cách dùng)

### 1. In Bun (with built-in `bun:sqlite`)

```typescript
import { Hono } from 'hono';
import { Database } from 'bun:sqlite';
import { sqliteUI } from 'hono-sqlite-ui';

const app = new Hono();
const db = new Database('./mydb.sqlite');

// Mount the dashboard UI at /admin
app.route('/admin', sqliteUI({ db }));

export default app;
```

### 2. In Node.js (with `better-sqlite3`)

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import Database from 'better-sqlite3';
import { sqliteUI } from 'hono-sqlite-ui';

const app = new Hono();
const db = new Database('./mydb.sqlite');

// Mount the dashboard UI at /admin
app.route('/admin', sqliteUI({ db }));

serve(app);
```

### 3. In Node.js (with native `node:sqlite` - Node 22.5.0+)

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { DatabaseSync } from 'node:sqlite';
import { sqliteUI } from 'hono-sqlite-ui';

const app = new Hono();
const db = new DatabaseSync('./mydb.sqlite');

// Mount the dashboard UI at /admin
app.route('/admin', sqliteUI({ db }));

serve(app);
```

### 4. Passing a File Path directly (Tự động phát hiện driver)

```typescript
app.route('/admin', sqliteUI({ 
  db: './mydb.sqlite' 
}));
```

---

## Options (Cấu hình)

The `sqliteUI` function takes a configuration object:

| Property | Type | Description / Mô tả |
| :--- | :--- | :--- |
| `db` | `any` \| `string` | **Required**. A database connection instance (`better-sqlite3`, `bun:sqlite`, `node:sqlite`) OR a string file path. / *Bắt buộc. Đối tượng kết nối DB hoặc đường dẫn tệp cơ sở dữ liệu.* |
| `readOnly` | `boolean` | **Optional**. Default `false`. If `true`, hides CRUD actions and blocks write queries. / *Tùy chọn. Mặc định là `false`. Nếu là `true`, ẩn giao diện CRUD và chặn các câu lệnh ghi dữ liệu.* |

---

## License

MIT License.
