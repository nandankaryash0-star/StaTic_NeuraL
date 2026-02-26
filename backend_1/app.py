import os
import base64
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

# Load environment variables from root .env file
load_dotenv(dotenv_path='../.env')

# ==========================================
# 1. CONFIGURATION (FROM ENVIRONMENT)
# ==========================================
# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# print(GROQ_API_KEY)
print(ELEVENLABS_API_KEY)

# Voice ID (Rachel)
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM" 

# ==========================================
# 2. APP SETUP
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Clients
# client_groq = Groq(api_key=GROQ_API_KEY)
client_eleven = ElevenLabs(api_key=ELEVENLABS_API_KEY)

class UserRequest(BaseModel):
    message: str

# ==========================================
# 3. THE CHAT ENDPOINT
# ==========================================
@app.post("/chat")
async def chat(request: UserRequest):
    try:
        print(f"User said: {request.message}")

        # --- STEP A: GROQ (LLAMA3) RESPONSE ---
        completion = client_groq.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated to current model
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are Sarthi, a helpful AI companion for elderly people. "
                        "Keep answers short, warm, and clear. "
                        "You MUST start your response with an emotion tag in brackets. "
                        "Options: [HAPPY], [SAD], [SURPRISED], [ANGRY], [NEUTRAL]. "
                        "Example: '[HAPPY] That is wonderful news!'"
                    )
                },
                {"role": "user", "content": request.message}
            ]
        )
        
        full_response = completion.choices[0].message.content
        print(f"AI Response: {full_response}")

        # --- STEP B: PARSE EMOTION ---
        emotion = "neutral"
        text_to_speak = full_response

        emotion_match = re.search(r"\[(.*?)\]", full_response)
        if emotion_match:
            emotion = emotion_match.group(1).lower()
            text_to_speak = re.sub(r"\[(.*?)\]", "", full_response).strip()

        # --- STEP C: ELEVENLABS AUDIO ---
        audio_generator = client_eleven.text_to_speech.convert(
            text=text_to_speak,
            voice_id=ELEVENLABS_VOICE_ID,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        audio_bytes = b"".join(audio_generator)
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        audio_data_url = f"data:audio/mp3;base64,{audio_base64}"

        return {
            "text": text_to_speak,
            "audio": audio_data_url,
            "emotion": emotion
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 4. RUNNER
# ==========================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)