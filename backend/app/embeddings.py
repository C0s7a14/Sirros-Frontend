import os
import time

import requests

HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{HF_MODEL}"


def embed(text: str) -> list[float] | None:
    headers = {}
    token = os.environ.get("HF_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    for attempt in range(3):
        try:
            response = requests.post(
                HF_URL,
                headers=headers,
                json={"inputs": text, "options": {"wait_for_model": True}},
                timeout=30,
            )
            response.raise_for_status()
            result = response.json()
            if result and isinstance(result[0], list):
                return result[0]
            return result
        except Exception:
            if attempt < 2:
                time.sleep(2 ** attempt)

    return None
