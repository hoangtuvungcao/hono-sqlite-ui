from .router import sqlite_ui_router

def mount_sqlite_ui(app, db_path: str, mount_path: str = "/admin", read_only: bool = False):
    """
    Mount the SQLite Admin UI APIRouter into your FastAPI application.
    
    Args:
        app: The FastAPI application instance.
        db_path: Path to the SQLite database file.
        mount_path: URL prefix under which the UI and API will be mounted (default: "/admin").
        read_only: If True, hides mutation actions (add/edit/delete) and blocks write queries.
    """
    router = sqlite_ui_router(db_path, read_only)
    app.include_router(router, prefix=mount_path)

__all__ = ["sqlite_ui_router", "mount_sqlite_ui"]
