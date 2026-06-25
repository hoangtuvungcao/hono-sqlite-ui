import sqlite3
import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
import uvicorn
from fastapi_sqlite_ui import mount_sqlite_ui

db_path = "./python_test.db"

# Clean old db if exists
if os.path.exists(db_path):
    try:
        os.remove(db_path)
    except:
        pass

# Seed Database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.executescript("""
  CREATE TABLE IF NOT EXISTS developers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dev_id INTEGER,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY(dev_id) REFERENCES developers(id) ON DELETE CASCADE
  );
""")

cursor.executemany("INSERT INTO developers (name, email, language) VALUES (?, ?, ?)", [
    ("Nguyen Van Python", "python@gmail.com", "Python"),
    ("Tran Thi FastAPI", "fastapi@gmail.com", "Python"),
    ("Le Van Node", "node@gmail.com", "JavaScript")
])

cursor.executemany("INSERT INTO tasks (dev_id, title, completed) VALUES (?, ?, ?)", [
    (1, "Dựng API FastAPI", 1),
    (1, "Đóng gói pip package", 0),
    (2, "Viết router sqlite_ui", 1)
])

conn.commit()
conn.close()
print("Seeded Python SQLite database successfully!")

# Initialize FastAPI App
app = FastAPI()

# Mount our SQLite UI
mount_sqlite_ui(app, db_path=db_path, mount_path="/admin", read_only=False)

@app.get("/")
def home():
    return {"message": "Python SQLite UI Test Server. Go to http://localhost:8000/admin"}

if __name__ == "__main__":
    print("Starting FastAPI dev server...")
    print("Access SQLite Admin UI at: http://localhost:8000/admin")
    uvicorn.run(app, host="127.0.0.1", port=8000)
