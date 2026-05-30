from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.modules.pdf_processing.schemas import DocumentResponse
from app.modules.pdf_processing.service import PdfService

router = APIRouter()


def process_in_background(document_id: str, content: bytes) -> None:
    db = SessionLocal()
    try:
        PdfService(db).process(document_id, content)
    finally:
        db.close()


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    service = PdfService(db)
    doc = service.repo.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado")
    return doc


@router.post(
    "/trainings/{training_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def upload_document(
    training_id: str,
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo deve ser um PDF")

    content = file.file.read()
    doc = PdfService(db).upload(training_id=training_id, filename=file.filename, content=content)
    background_tasks.add_task(process_in_background, doc.id, content)
    return doc
