from fastapi import APIRouter, Depends
from app.database import transactions_collection
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
async def get_summary(current_user: dict = Depends(get_current_user)):
    """Return income, expenses, category breakdown for the current user."""
    txns = []
    cursor = transactions_collection.find({"user_id": current_user["user_id"]})
    async for doc in cursor:
        txns.append(doc)

    income = sum(t["amount"] for t in txns if t["type"] == "income")
    expenses = sum(t["amount"] for t in txns if t["type"] == "expense")

    category_spend = {}
    for t in txns:
        if t["type"] == "expense":
            category_spend[t["category"]] = category_spend.get(t["category"], 0) + t["amount"]

    return {
        "income": income,
        "expenses": expenses,
        "balance": income - expenses,
        "category_spend": category_spend,
        "total_transactions": len(txns),
    }
