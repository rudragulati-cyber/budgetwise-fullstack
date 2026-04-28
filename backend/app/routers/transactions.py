from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import transactions_collection
from app.auth import get_current_user
from app.models import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("/", response_model=list[TransactionResponse])
async def get_transactions(current_user: dict = Depends(get_current_user)):
    """Get all transactions for the current user."""
    txns = []
    cursor = transactions_collection.find({"user_id": current_user["user_id"]}).sort("date", -1)
    async for doc in cursor:
        txns.append(TransactionResponse(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            type=doc["type"],
            amount=doc["amount"],
            category=doc["category"],
            description=doc.get("description", ""),
            date=doc["date"],
        ))
    return txns


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(tx: TransactionCreate, current_user: dict = Depends(get_current_user)):
    """Create a new transaction."""
    doc = {
        "user_id": current_user["user_id"],
        "type": tx.type,
        "amount": tx.amount,
        "category": tx.category,
        "description": tx.description or "",
        "date": tx.date,
    }
    result = await transactions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return TransactionResponse(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        type=doc["type"],
        amount=doc["amount"],
        category=doc["category"],
        description=doc["description"],
        date=doc["date"],
    )


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(transaction_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a transaction (only if it belongs to the current user)."""
    result = await transactions_collection.delete_one({
        "_id": ObjectId(transaction_id),
        "user_id": current_user["user_id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None
