from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed(text: str) -> list[float] | None:
    try:
        result = _get_model().encode(text)
        if hasattr(result, "ndim") and result.ndim > 1:
            result = result[0]
        return result.tolist()
    except Exception:
        return None
