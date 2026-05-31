import os

from groq import Groq
from sqlalchemy.orm import Session

from app.embeddings import embed
from app.modules.rag.repository import RagRepository
from app.modules.rag.schemas import AskResponse, ChunkSource

GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
TOP_K = 5


def _build_prompt(question: str, context_chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(context_chunks)
    return (
        "Você é um assistente de treinamentos corporativos. "
        "Use apenas o contexto abaixo para responder à pergunta. "
        "Se a resposta não estiver no contexto, diga que não encontrou a informação.\n\n"
        f"Contexto:\n{context}\n\n"
        f"Pergunta: {question}\n\n"
        "Resposta:"
    )


class RagService:
    def __init__(self, db: Session) -> None:
        self.repo = RagRepository(db)

    def ask(self, training_id: str, question: str) -> AskResponse:
        query_embedding = embed(question)
        chunks = self.repo.search_similar_chunks(training_id, query_embedding, limit=TOP_K)

        if not chunks:
            return AskResponse(
                answer="Nenhum conteúdo encontrado para este treinamento.",
                sources=[],
            )

        prompt = _build_prompt(question, [c.chunk_text for c in chunks])
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        answer = response.choices[0].message.content

        sources = [
            ChunkSource(chunk_id=c.id, chunk_text=c.chunk_text, chunk_index=c.chunk_index)
            for c in chunks
        ]
        return AskResponse(answer=answer, sources=sources)
