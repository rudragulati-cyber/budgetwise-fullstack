from fastapi import APIRouter, Depends
from app.database import budgets_collection
from app.auth import get_current_user
from app.models import BudgetUpdate, BudgetResponse

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("/", response_model=BudgetResponse)
async def get_budgets(current_user: dict = Depends(get_current_user)):
    """Get budget limits for current user."""
    doc = await budgets_collection.find_one({"user_id": current_user["user_id"]})
    if not doc:
        # Return default empty budgets
        return BudgetResponse(user_id=current_user["user_id"], budgets={})
    return BudgetResponse(user_id=doc["user_id"], budgets=doc["budgets"])


@router.put("/", response_model=BudgetResponse)
async def update_budgets(data: BudgetUpdate, current_user: dict = Depends(get_current_user)):
    """Set / update budget limits for current user (upsert)."""
    await budgets_collection.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"budgets": data.budgets}},
        upsert=True
    )
    return BudgetResponse(user_id=current_user["user_id"], budgets=data.budgets)
