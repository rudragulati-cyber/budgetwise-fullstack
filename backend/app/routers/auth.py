from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import users_collection
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    """Register a new user."""
    existing = await users_collection.find_one({"email": user.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    user_doc = {
        "name": user.name.strip(),
        "email": user.email.lower().strip(),
        "password": hash_password(user.password),
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "email": user_doc["email"]})

    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, name=user_doc["name"], email=user_doc["email"])
    )


@router.post("/login", response_model=TokenResponse)
async def login(creds: UserLogin):
    """Authenticate & return JWT."""
    user = await users_collection.find_one({"email": creds.email.lower()})
    if not user or not verify_password(creds.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"]})

    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, name=user["name"], email=user["email"])
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Validate token and return user info."""
    user = await users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=str(user["_id"]), name=user["name"], email=user["email"])
