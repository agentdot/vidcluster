from openai import OpenAI

def embed_texts(api_key: str, model: str, texts: list[str]) -> list[list[float]]:
    client = OpenAI(api_key=api_key)
    resp = client.embeddings.create(model=model, input=texts)
    return [d.embedding for d in resp.data]
