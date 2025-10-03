from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
import base64
import os
import requests
import json

router = APIRouter(prefix="/vision", tags=["vision"])

# Configuration Google Vision API
GOOGLE_API_KEY = "AQ.Ab8RN6KMZund5AGf2mmkJQ4XVI8FkEQWJDXZM1AvQOsdjRVueQ"
VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

class ImageAnalysisRequest(BaseModel):
    image_base64: str

class ImageAnalysisResponse(BaseModel):
    detected_text: str
    confidence: float

@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """
    Analyze image using Google Vision API for text detection
    """
    try:
        # Prepare Google Vision API request
        vision_request = {
            "requests": [
                {
                    "image": {
                        "content": request.image_base64
                    },
                    "features": [
                        {
                            "type": "TEXT_DETECTION",
                            "maxResults": 50
                        }
                    ],
                    "imageContext": {
                        "languageHints": ["fr", "en"]  # French and English for pharmaceutical terms
                    }
                }
            ]
        }

        # Make request to Google Vision API
        response = requests.post(
            f"{VISION_API_URL}?key={GOOGLE_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=vision_request,
            timeout=30
        )

        if response.status_code != 200:
            print(f"Google Vision API error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google Vision API request failed: {response.status_code}"
            )

        vision_result = response.json()

        # Check for errors in the response
        if "responses" not in vision_result or not vision_result["responses"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No response from Google Vision API"
            )

        vision_response = vision_result["responses"][0]

        # Check for errors in the vision response
        if "error" in vision_response:
            error_msg = vision_response["error"].get("message", "Unknown error")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google Vision API error: {error_msg}"
            )

        # Extract text annotations
        if "textAnnotations" in vision_response and vision_response["textAnnotations"]:
            # The first annotation contains all detected text
            full_text = vision_response["textAnnotations"][0]["description"]
            confidence = vision_response["textAnnotations"][0].get("confidence", 0.9)

            print(f"🎯 Google Vision detected: {full_text}")

            return ImageAnalysisResponse(
                detected_text=full_text.strip(),
                confidence=confidence
            )
        else:
            # No text detected
            return ImageAnalysisResponse(
                detected_text="",
                confidence=0.0
            )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Google Vision API request timed out"
        )
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to connect to Google Vision API"
        )
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during image analysis"
        )

@router.get("/health")
async def vision_health_check():
    """Health check for Vision API"""
    return {"status": "healthy", "service": "Google Vision API"}