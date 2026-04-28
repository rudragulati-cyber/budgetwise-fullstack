from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, transactions, budgets, analytics

app = FastAPI(title="BudgetWise API", version="1.0.0")

# CORS – allow Vercel frontend + localhost dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://budgetwise-fullstack.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "BudgetWise API is running 🚀", "docs": "/docs"}