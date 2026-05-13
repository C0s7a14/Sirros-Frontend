from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.routes import router as auth_router
from app.modules.trainings.routes import router as trainings_router
from app.modules.pdf_processing.routes import router as pdf_router
from app.modules.progress.routes import router as progress_router
from app.modules.quizzes.routes import router as quizzes_router
from app.modules.rag.routes import router as rag_router

app = FastAPI(title="Sirros")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(trainings_router, prefix="/trainings", tags=["trainings"])
app.include_router(pdf_router, tags=["pdf"])
app.include_router(progress_router, prefix="/progress", tags=["progress"])
app.include_router(quizzes_router, prefix="/quizzes", tags=["quizzes"])
app.include_router(rag_router, tags=["rag"])
