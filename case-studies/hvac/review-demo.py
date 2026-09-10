"""Synthetic provenance demo. Run: python3 review-demo.py

This example illustrates review controls used in the case study. It does not
parse PDFs, run RAG or reproduce the private client pipeline.
Only Python's standard library is required. No external calls are made.
"""
import csv
import json
from pathlib import Path

def review(data):
    rows = []
    for source in data["sources"]:
        for field in ("airflow_m3_h", "pressure_pa", "filter_class"):
            value = source[field]
            rows.append({"equipment": source["equipment"], "field": field,
                         "value": value, "source_page": source["page"] if value is not None else None,
                         "status": "source_present" if value is not None else "needs_review"})
    candidate = data["candidate"]
    evidence = next((source for source in data["sources"]
                     if source["page"] == candidate["source_page"]
                     and source["equipment"] == candidate["source_equipment"]), None)
    if candidate["source_equipment"] != candidate["target_equipment"]:
        reason = "equipment_mismatch"
    elif evidence is None or evidence.get(candidate["field"]) != candidate["value"]:
        reason = "unsupported_value"
    else:
        reason = None
    return {"kind": data["kind"], "rows": rows,
            "candidate_review": {**candidate, "accepted": reason is None, "reason": reason}}

if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    output = review(json.loads((root / "example-input.json").read_text()))
    (root / "example-output.json").write_text(json.dumps(output, indent=2) + "\n")
    with (root / "example-output.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(output["rows"][0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(output["rows"])
    print("Wrote example-output.json and example-output.csv")
