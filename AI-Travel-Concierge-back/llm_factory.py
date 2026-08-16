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
    # If running inside Vercel cloud serverless container
    if os.getenv("VERCEL"):
        tunnel_url = os.getenv("OLLAMA_BASE_URL", "").strip()
        # Only use local Gemma on Vercel if a valid public HTTPS tunnel URL is set
        if not tunnel_url.startswith("https://"):
            return False

    val = os.getenv("USE_LOCAL_GEMMA", "")
    if val.lower() in ("true", "1", "yes"):
        return True
    if val.lower() in ("false", "0", "no"):
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
        try:
            return ChatOpenAI(
                base_url=base_url,
                api_key="ollama",
                model=model_name,
                temperature=temperature,
                request_timeout=15.0
            )
        except Exception as e:
            print(f"Local Gemma LLM failed: {e}. Falling back to Gemini...")

    api_key = os.getenv("GEMINI_PLANNER_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    return ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=temperature)

def generate_text(prompt: str, api_key_env_var: str = "GEMINI_API_KEY") -> str:
    if is_local_gemma():
        model_name = os.getenv("LOCAL_GEMMA_MODEL", "gemma2:2b")
        base_url = get_ollama_base_url()
        try:
            client = OpenAI(
                base_url=base_url,
                api_key="ollama",
                timeout=15.0
            )
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            if response.choices and response.choices[0].message.content:
                return response.choices[0].message.content
        except Exception as e:
            print(f"Local Gemma tunnel unreachable: {e}. Falling back to Gemini API...")

    api_key = os.getenv(api_key_env_var) or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    if not api_key:
        return ""
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )
        return response.text or ""
    except Exception as e:
        print("Gemini API Error:", e)
        return ""
