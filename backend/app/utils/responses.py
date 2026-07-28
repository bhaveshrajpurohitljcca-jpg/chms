from typing import Any
from app.schemas.response import StandardResponse

def success_response(data: Any = None, message: str = "Request successful.") -> StandardResponse:
    return StandardResponse(
        success=True,
        message=message,
        data=data
    )

def error_response(message: str = "An error occurred.", data: Any = None) -> StandardResponse:
    return StandardResponse(
        success=False,
        message=message,
        data=data
    )
