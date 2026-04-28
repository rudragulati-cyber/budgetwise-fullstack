from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date


# ─── Auth Models ──────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Transaction Models ──────────────────────────────────────────────────────
class TransactionCreate(BaseModel):
    type: str = Field(..., pattern="^(income|expense)$")
    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = ""
    date: str  # ISO date string YYYY-MM-DD


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    amount: float
    category: str
    description: str
    date: str


# ─── Budget Models ────────────────────────────────────────────────────────────
class BudgetUpdate(BaseModel):
    budgets: dict[str, float]  # { "Food": 4000, "Transport": 1200, ... }


class BudgetResponse(BaseModel):
    user_id: str
    budgets: dict[str, float]
