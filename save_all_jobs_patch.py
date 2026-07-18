"""
Patch to add to job_radar.py and career_scraper.py scan_all() functions.
After the existing save_seen(seen) line, add:

    # Save full job data for Supabase push
    ALL_JOBS_FILE = BASE_DIR / "all_jobs.json"
    ALL_JOBS_FILE.write_text(json.dumps(all_jobs, indent=2, default=str))

This creates all_jobs.json alongside seen_jobs.json after every scan.
"""
# This is a reference file — see SETUP.md for where to add these lines
