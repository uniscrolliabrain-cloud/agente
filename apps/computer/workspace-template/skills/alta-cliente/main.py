import json, sys, re
def normalize_client(data):
    email = data.get("email","")
    cif = data.get("cif","").upper().strip()
    if not re.match(r"^[A-Z0-9]{8,9}$", cif):
        return {"valid": False, "error": "CIF inválido, pedir de nuevo"}
    return {
        "valid": True,
        "client": {
            "name": data.get("name","").title(),
            "company": data.get("company","").title(),
            "cif": cif,
            "email": email.lower(),
            "need": data.get("need",""),
            "budget": data.get("budget"),
        },
        "next_steps": ["Crear carpeta Drive", "Mandar bienvenida", "Agendar kickoff"]
    }
if __name__ == "__main__":
    raw = json.loads(sys.argv[1]) if len(sys.argv)>1 else {}
    print(json.dumps(normalize_client(raw), indent=2, ensure_ascii=False))
