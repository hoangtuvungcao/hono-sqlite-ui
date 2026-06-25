# fastapi-sqlite-ui

A lightweight, plug-and-play SQLite administration panel UI for FastAPI applications.

*Giao diện quản lý SQLite Admin Panel gọn nhẹ, cắm-là-chạy dành cho các ứng dụng FastAPI.*

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
- **Plug & Play**: Single function call to mount the APIRouter.
- **Data Browser**: Paginated table view with search filters on text columns.
- **Schema Inspector**: Structured view of columns, data types, primary keys, and foreign keys.
- **Full CRUD**: Complete row insert, update, and delete support with schema-aware input fields.
- **Raw SQL Console**: Text-area input for executing arbitrary raw SQL statements with elapsed time metrics.
- **Read-Only Mode**: Toggle option to restrict database modifications.
- **Self-contained SPA**: No asset build steps required by the parent Python server.

### Tiếng Việt
- **Tích hợp nhanh**: Chỉ cần gọi một hàm để gắn APIRouter vào ứng dụng.
- **Duyệt dữ liệu**: Hiển thị bảng dạng phân trang kèm bộ lọc tìm kiếm trên các cột văn bản.
- **Kiểm tra cấu trúc**: Xem cấu trúc cột, kiểu dữ liệu, khóa chính và khóa ngoại.
- **Hỗ trợ CRUD**: Thao tác thêm, sửa, xóa các dòng dữ liệu thông qua các biểu mẫu tự động tương thích theo cấu trúc bảng.
- **Trình chạy SQL Raw**: Nhập và thực thi trực tiếp các câu lệnh SQL tự do có đo lường thời gian phản hồi.
- **Chế độ chỉ đọc (Read-Only)**: Cấu hình tùy chọn để chặn các thao tác ghi dữ liệu.
- **SPA tự đóng gói**: Không yêu cầu bước biên dịch tài nguyên tĩnh từ phía server Python.

---

## Installation (Cài đặt)

```bash
pip install fastapi-sqlite-ui
```

Make sure you have `fastapi` and `uvicorn` installed.

---

## Usage (Cách dùng)

```python
from fastapi import FastAPI
from fastapi_sqlite_ui import mount_sqlite_ui

app = FastAPI()

# Mount the SQLite UI at /admin
mount_sqlite_ui(
    app,
    db_path="./mydb.sqlite",
    mount_path="/admin",
    read_only=False
)
```

---

## Options (Cấu hình)

The `mount_sqlite_ui` function takes the following parameters:

| Parameter | Type | Default | Description / Mô tả |
| :--- | :--- | :--- | :--- |
| `app` | `FastAPI` | *Required* | The FastAPI application instance. / *Đối tượng ứng dụng FastAPI.* |
| `db_path` | `str` | *Required* | Path to the SQLite database file. / *Đường dẫn đến tệp cơ sở dữ liệu SQLite.* |
| `mount_path` | `str` | `"/admin"` | URL prefix for the administration dashboard. / *Tiền tố đường dẫn URL cho trang quản trị.* |
| `read_only` | `bool` | `False` | Hides CRUD actions and blocks write queries if True. / *Nếu là True, ẩn giao diện CRUD và chặn các câu lệnh ghi dữ liệu.* |

---

## License

MIT License.
