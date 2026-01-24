"""
CogniFillz Backend Server
Handles AI processing, resume scoring, and content tailoring using Local LLM
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from openai import OpenAI
import json

app = FastAPI(title="CogniFillz API", version="0.1.0")

# Configure CORS to allow Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client pointing to local LM Studio
# Default to LM Studio endpoint, but allow override via env var
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "not-needed-for-local")

client = OpenAI(
    base_url=LLM_BASE_URL,
    api_key=LLM_API_KEY
)

# Request/Response Models
class ProfileData(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None

class ScoreRequest(BaseModel):
    job_description: str
    profile: ProfileData

class ScoreResponse(BaseModel):
    score: int
    missing_keywords: List[str]
    suggestions: List[str]
    confidence: float

class TailorRequest(BaseModel):
    job_description: str
    profile: ProfileData
    section: str  # 'summary', 'experience', etc.

class TailorResponse(BaseModel):
    tailored_content: str
    changes_made: List[str]

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CogniFillz API",
        "status": "running",
        "version": "0.1.0",
        "llm_endpoint": LLM_BASE_URL
    }

@app.get("/health")
async def health_check():
    """Check if LLM is accessible"""
    try:
        # Try a simple completion to verify LLM is working
        response = client.chat.completions.create(
            model="local-model",
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=10
        )
        return {
            "status": "healthy",
            "llm_connected": True,
            "llm_endpoint": LLM_BASE_URL
        }
    except Exception as e:
        return {
            "status": "degraded",
            "llm_connected": False,
            "error": str(e),
            "llm_endpoint": LLM_BASE_URL
        }

@app.post("/score", response_model=ScoreResponse)
async def score_resume(request: ScoreRequest):
    """
    Calculate how well a resume matches a job description
    Returns a score out of 100 with missing keywords and suggestions
    """
    try:
        # Construct prompt for LLM
        profile_text = f"""
Name: {request.profile.firstName} {request.profile.lastName}
Location: {request.profile.location}
Summary: {request.profile.summary}
LinkedIn: {request.profile.linkedin}
GitHub: {request.profile.github}
"""
        
        prompt = f"""You are a professional resume analyst and ATS expert.

Analyze how well this resume matches the job description below.

RESUME:
{profile_text}

JOB DESCRIPTION:
{request.job_description}

Provide a detailed analysis in JSON format with exactly these fields:
{{
  "score": <integer 0-100>,
  "missing_keywords": [<array of 3-5 key missing skills/keywords>],
  "suggestions": [<array of 3-5 specific improvements>],
  "confidence": <float 0-1>
}}

Be strict but fair. Consider:
1. Keyword matches (skills, technologies, qualifications)
2. Experience relevance
3. Role fit
4. ATS compatibility

Output ONLY the JSON, no other text."""

        # Call LLM
        response = client.chat.completions.create(
            model="local-model",
            messages=[
                {"role": "system", "content": "You are a professional resume analyst. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Parse response
        content = response.choices[0].message.content
        
        # Try to extract JSON if there's extra text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        result = json.loads(content.strip())
        
        return ScoreResponse(**result)
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse LLM response as JSON: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scoring resume: {str(e)}"
        )

@app.post("/tailor", response_model=TailorResponse)
async def tailor_content(request: TailorRequest):
    """
    Tailor a specific section of the resume to match the job description
    """
    try:
        section_content = getattr(request.profile, request.section, "")
        
        if not section_content:
            raise HTTPException(
                status_code=400,
                detail=f"Profile section '{request.section}' is empty"
            )
        
        prompt = f"""You are an expert resume writer.

TASK: Rewrite this resume section to better match the job description while maintaining truthfulness.

ORIGINAL SECTION ({request.section}):
{section_content}

JOB DESCRIPTION:
{request.job_description}

Provide your response in JSON format:
{{
  "tailored_content": "<the rewritten content>",
  "changes_made": ["change 1", "change 2", "change 3"]
}}

Guidelines:
- Use keywords from the job description naturally
- Match the tone of the job posting
- Keep it concise and impactful
- Don't fabricate experience
- Highlight relevant skills

Output ONLY the JSON, no other text."""

        response = client.chat.completions.create(
            model="local-model",
            messages=[
                {"role": "system", "content": "You are an expert resume writer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1500
        )
        
        content = response.choices[0].message.content
        
        # Try to extract JSON if there's extra text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        result = json.loads(content.strip())
        
        return TailorResponse(**result)
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse LLM response as JSON: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error tailoring content: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
