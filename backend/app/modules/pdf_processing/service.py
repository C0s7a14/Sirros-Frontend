import tempfile

import pymupdf4llm
from sqlalchemy.orm import Session

from app.embeddings import embed
from app.modules.pdf_processing.repository import PdfRepository
from app.modules.pdf_processing.schemas import DocumentResponse

CHUNK_SIZE = 1000


def _split_chunks(text: str, size: int) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size) if text[i : i + size].strip()]


class PdfService:
    def __init__(self, db: Session) -> None:
        self.repo = PdfRepository(db)

    def upload(self, training_id: str, filename: str, content: bytes) -> DocumentResponse:
        doc = self.repo.create_document(training_id=training_id, filename=filename)
        return DocumentResponse.model_validate(doc)

    def process(self, document_id: str, content: bytes) -> None:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        text = pymupdf4llm.to_markdown(tmp_path)
        raw_chunks = _split_chunks(text, CHUNK_SIZE)
        chunks = [(chunk, embed(chunk)) for chunk in raw_chunks]
        self.repo.save_chunks(document_id, chunks)
