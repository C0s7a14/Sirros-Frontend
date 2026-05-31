from sqlalchemy.orm import Session

from app.modules.pdf_processing.models import TrainingChunk, TrainingDocument


class PdfRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_document(self, training_id: str, filename: str) -> TrainingDocument:
        doc = TrainingDocument(training_id=training_id, filename=filename)
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_document(self, document_id: str) -> TrainingDocument | None:
        return self.db.query(TrainingDocument).filter(TrainingDocument.id == document_id).first()

    def save_chunks(self, document_id: str, chunks: list[tuple[str, list[float]]]) -> None:
        for index, (text, embedding) in enumerate(chunks):
            chunk = TrainingChunk(document_id=document_id, chunk_text=text, chunk_index=index, embedding=embedding)
            self.db.add(chunk)
        self.mark_done(document_id)

    def mark_done(self, document_id: str) -> None:
        doc = self.get_document(document_id)
        if doc:
            doc.status = "done"
        self.db.commit()
