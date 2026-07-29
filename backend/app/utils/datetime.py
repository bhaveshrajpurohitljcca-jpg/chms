from datetime import datetime, timezone

def format_iso_datetime(dt: datetime) -> str:
    """Format datetime consistently to ISO 8601 UTC string."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

def get_current_utc_time() -> datetime:
    """Returns current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)
