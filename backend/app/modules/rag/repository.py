import math

from sqlalchemy.orm import Session

from app.modules.pdf_processing.models import TrainingChunk, TrainingDocument


def _cosine_distance(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 1.0
    return 1.0 - dot / (norm_a * norm_b)


class RagRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def search_similar_chunks(
        self, training_id: str, embedding: list[float] | None, limit: int = 5
    ) -> list[TrainingChunk]:
        chunks = (
            self.db.query(TrainingChunk)
            .join(TrainingDocument, TrainingChunk.document_id == TrainingDocument.id)
            .filter(TrainingDocument.training_id == training_id)
            .all()
        )
        if not chunks:
            return []
        if not embedding:
            return sorted(chunks, key=lambda c: c.chunk_index)[:limit]
        scored = [c for c in chunks if c.embedding]
        if not scored:
            return sorted(chunks, key=lambda c: c.chunk_index)[:limit]
        ranked = sorted(scored, key=lambda c: _cosine_distance(c.embedding, embedding))
        return ranked[:limit]
