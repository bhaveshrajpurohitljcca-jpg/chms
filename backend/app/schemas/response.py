from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[T] = None

class PaginatedData(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int = 1
    size: int = 50
