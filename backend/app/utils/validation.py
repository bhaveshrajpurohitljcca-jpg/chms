import re

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
PHONE_REGEX = r"^\+?[1-9]\d{1,14}$"  # E.164 phone format

def is_valid_email(email: str) -> bool:
    return bool(re.match(EMAIL_REGEX, email))

def is_valid_phone(phone: str) -> bool:
    return bool(re.match(PHONE_REGEX, phone))
