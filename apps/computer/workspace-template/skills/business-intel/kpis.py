def kpis(rows):
    if not rows: return {"error":"no data"}
    return {"rows": len(rows), "avg": sum(r.get("value",0) for r in rows)/len(rows)}
