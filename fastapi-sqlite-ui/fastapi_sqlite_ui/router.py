# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Request
# pyrefly: ignore [missing-import]
from fastapi.responses import HTMLResponse, JSONResponse
from .driver import SQLiteDriver
from .ui import get_html_template

def sqlite_ui_router(db_path: str, read_only: bool = False) -> APIRouter:
    router = APIRouter()
    driver = SQLiteDriver(db_path, read_only)

    @router.get("/", response_class=HTMLResponse)
    def index(request: Request):
        path = request.url.path
        base_path = path[:-1] if path.endswith('/') else path
        return get_html_template(base_path)

    @router.get("/index.html", response_class=HTMLResponse)
    def index_html(request: Request):
        path = request.url.path
        base_path = path[:-11] if path.endswith('/index.html') else path
        return get_html_template(base_path)

    @router.get("/api/tables")
    def list_tables():
        try:
            tables = driver.get_tables()
            return {
                "success": True,
                "tables": tables,
                "readOnly": read_only
            }
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    @router.get("/api/tables/{table_name}")
    def table_data(table_name: str, page: int = 1, limit: int = 10, search: str = ""):
        try:
            offset = (page - 1) * limit
            info = driver.get_table_info(table_name)
            data = driver.get_rows(table_name, limit, offset, search)
            return {
                "success": True,
                "info": info,
                "rows": data["rows"],
                "total": data["total"]
            }
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    @router.post("/api/query")
    async def run_query(request: Request):
        try:
            body = await request.json()
            sql = body.get("sql")
            params = body.get("params", [])
            
            if not sql:
                return JSONResponse(status_code=400, content={"success": False, "error": "SQL query is required"})
                
            res = driver.execute(sql, tuple(params))
            if "error" in res:
                return {"success": False, "error": res["error"]}
                
            return {
                "success": True,
                "rows": res["rows"],
                "columns": res["columns"],
                "affectedRows": res["affectedRows"]
            }
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    @router.post("/api/tables/{table_name}")
    async def add_row(table_name: str, request: Request):
        if read_only:
            return JSONResponse(status_code=403, content={"success": False, "error": "Database is in read-only mode"})
        try:
            body = await request.json()
            data = body.get("data")
            if not data:
                return JSONResponse(status_code=400, content={"success": False, "error": "Data is required"})
                
            driver.insert_row(table_name, data)
            return {"success": True}
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    @router.put("/api/tables/{table_name}")
    async def edit_row(table_name: str, request: Request):
        if read_only:
            return JSONResponse(status_code=403, content={"success": False, "error": "Database is in read-only mode"})
        try:
            body = await request.json()
            pk = body.get("pk")
            data = body.get("data")
            if not pk or not data:
                return JSONResponse(status_code=400, content={"success": False, "error": "pk and data are required"})
                
            driver.update_row(table_name, pk, data)
            return {"success": True}
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    @router.delete("/api/tables/{table_name}")
    async def delete_row(table_name: str, request: Request):
        if read_only:
            return JSONResponse(status_code=403, content={"success": False, "error": "Database is in read-only mode"})
        try:
            body = await request.json()
            pk = body.get("pk")
            if not pk:
                return JSONResponse(status_code=400, content={"success": False, "error": "pk is required"})
                
            driver.delete_row(table_name, pk)
            return {"success": True}
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

    return router
