import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from openai import OpenAI
from google import genai

load_dotenv()

def get_ollama_base_url() -> str:
    url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1").strip()
    if not url.endswith("/v1"):
        url = url.rstrip("/") + "/v1"
    return url

def is_local_gemma() -> bool:
    val = os.getenv("USE_LOCAL_GEMMA", "")
    if val.lower() in ("true", "1", "yes"):
        return True
    if val.lower() in ("false", "0", "no"):
        return False
    if os.getenv("VERCEL"):
        return False
    has_gemini_key = any([
        os.getenv("GEMINI_PLANNER_API_KEY"),
        os.getenv("GEMINI_RESEARCH_API_KEY"),
        os.getenv("GEMINI_API_KEY"),
        os.getenv("GOOGLE_API_KEY")
    ])
    return not has_gemini_key

def get_langchain_llm(temperature: float = 0):
    if is_local_gemma():
        model_name = os.getenv("LOCAL_GEMMA_MODEL", "gemma2:2b")
        base_url = get_ollama_base_url()
        return ChatOpenAI(
            base_url=base_url,
            api_key="ollama",
            model=model_name,
            temperature=temperature
        )
    else:
        return ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=temperature)

def generate_text(prompt: str, api_key_env_var: str = "GEMINI_API_KEY") -> str:
    if is_local_gemma():
        model_name = os.getenv("LOCAL_GEMMA_MODEL", "gemma2:2b")
        base_url = get_ollama_base_url()
        client = OpenAI(
            base_url=base_url,
            api_key="ollama"
        )
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content or ""
    else:
        api_key = os.getenv(api_key_env_var) or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(f"Missing {api_key_env_var} in .env file!")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )
        return response.text or ""
