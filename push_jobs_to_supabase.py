"""
push_jobs_to_supabase.py
Reads job data produced by job_radar.py and career_scraper.py
and upserts them into the Supabase jobs table.

Run after each scan, or add to GitHub Actions workflow.
Usage: python push_jobs_to_supabase.py

Requires: pip install supabase
Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY
"""

import json
import os
import hashlib
import re
import logging
from datetime import datetime, timezone
from pathlib import Path

log = logging.getLogger("push-jobs")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ajoymshdwmloeuxxltgs.supabase.co")
# Use SERVICE KEY (not anon key) for writing — set as GitHub secret SUPABASE_SERVICE_KEY
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

def get_client():
    from supabase import create_client
    if not SUPABASE_KEY:
        raise ValueError("SUPABASE_SERVICE_KEY not set. Add it as an environment variable or GitHub secret.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def _norm(t):
    t = (t or "").lower()
    t = re.sub(r"[^a-z0-9 ]", " ", t)
    return re.sub(r"\s+", " ", t).strip()

def make_job_id(job):
    key = f"{_norm(job.get('company',''))}|{_norm(job.get('title',''))}|{job.get('url','')}"
    return hashlib.md5(key.encode()).hexdigest()

def load_jobs_from_seen_file(seen_file_path: Path, all_jobs_file: Path = None) -> list:
    """
    Load jobs to push. Two strategies:
    1. If all_jobs.json exists (we'll add this to scrapers) — use that
    2. Fall back to seen_jobs.json keys (IDs only, no full data)
    """
    jobs = []
    if all_jobs_file and all_jobs_file.exists():
        jobs = json.loads(all_jobs_file.read_text())
        log.info(f"Loaded {len(jobs)} jobs from {all_jobs_file}")
    return jobs

def push_jobs(jobs: list, source: str = "ats") -> dict:
    if not jobs:
        log.info("No jobs to push")
        return {"inserted": 0, "updated": 0, "errors": 0}

    client = get_client()
    now    = datetime.now(timezone.utc).isoformat()

    records = []
    for j in jobs:
        jid = j.get("id") or make_job_id(j)
        records.append({
            "id":           jid,
            "title":        (j.get("title") or "")[:500],
            "company":      (j.get("company") or "")[:200],
            "location":     (j.get("location") or "")[:200],
            "url":          (j.get("url") or "")[:1000],
            "category":     j.get("category") or "mnc",
            "pay_level":    j.get("pay") or j.get("pay_level") or "",
            "ats":          j.get("ats") or source,
            "source":       source,
            "posted_date":  j.get("posted") or "",
            "posted_pretty":j.get("posted_pretty") or "Recently",
            "is_iim":       bool(j.get("iim", False)),
            "last_seen":    now,
        })

    # Batch upsert in chunks of 100
    inserted = 0
    errors   = 0
    for i in range(0, len(records), 100):
        chunk = records[i:i+100]
        try:
            result = client.table("jobs").upsert(
                chunk,
                on_conflict="id",
                returning="minimal"
            ).execute()
            inserted += len(chunk)
            log.info(f"  Pushed chunk {i//100 + 1}: {len(chunk)} jobs")
        except Exception as e:
            log.error(f"  Chunk {i//100 + 1} failed: {e}")
            errors += len(chunk)

    log.info(f"Done — pushed: {inserted}, errors: {errors}")
    return {"inserted": inserted, "errors": errors}


def main():
    """
    Looks for all_jobs.json files produced by the scrapers.
    job_radar produces: job-radar/all_jobs.json
    career_scraper produces: career-scraper/all_jobs.json
    """
    base = Path(__file__).parent

    sources = [
        (base.parent / "job-radar" / "all_jobs.json",       "ats"),
        (base.parent / "career-scraper" / "all_jobs.json",  "career_page"),
    ]

    total_pushed = 0
    for jobs_file, source in sources:
        if not jobs_file.exists():
            log.warning(f"No all_jobs.json at {jobs_file} — skipping")
            continue
        jobs = json.loads(jobs_file.read_text())
        log.info(f"Pushing {len(jobs)} jobs from {source} ({jobs_file.name})")
        result = push_jobs(jobs, source)
        total_pushed += result["inserted"]

    log.info(f"Total pushed to Supabase: {total_pushed}")


if __name__ == "__main__":
    main()
