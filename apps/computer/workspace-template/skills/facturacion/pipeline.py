import json, sys
def process_invoices(rows):
    total = sum(r.get("amount",0) for r in rows)
    unpaid = [r for r in rows if not r.get("paid")]
    return {"total": total, "count": len(rows), "unpaid": unpaid}
if __name__ == "__main__":
    print(json.dumps(process_invoices(json.loads(sys.stdin.read() or "[]"))))
