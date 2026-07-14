from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

# In-memory image cache for the demo (avoids disk I/O)
_IMAGE_CACHE: dict[int, bytes] = {}

from ...core.database import engine, Base
from ...api.deps import get_db
from ...models import Claim
from ...services.ai_engine import run_cnn_damage_assessment

# Ensure tables are created
Base.metadata.create_all(bind=engine)

router = APIRouter()

class ClaimItem(BaseModel):
    id: str
    claimant_name: str
    policy_number: str
    damage_type: str
    severity: str
    confidence: float
    estimated_cost_range: str
    fraud_risk_score: float
    status: str
    created_at: str
    classification: Optional[str] = None
    explanation: Optional[str] = None

class RecommendationResponse(BaseModel):
    claim_id: str
    classification: str
    severity: str
    confidence_score: float
    estimated_cost_range: str
    fraud_risk_score: float
    explanation: str
    feature_importance: List[str]

@router.get("", response_model=List[ClaimItem])
def list_claims(db: Session = Depends(get_db)):
    claims_db = db.query(Claim).order_by(Claim.created_at.desc()).limit(10).all()
    result = []
    for c in claims_db:
        result.append(ClaimItem(
            id=f"CLM-{c.id + 1000}",
            claimant_name=c.claimant_name,
            policy_number=c.policy_number,
            damage_type=c.damage_type,
            severity=c.severity,
            confidence=c.confidence_score or 0.0,
            estimated_cost_range=c.estimated_cost_range or "",
            fraud_risk_score=c.fraud_risk_score or 0.0,
            status=c.status,
            created_at=c.created_at.isoformat() if c.created_at else "",
            classification=c.classification,
            explanation=c.explanation
        ))
    return result

@router.post("/submit")
async def submit_claim(
    claimant_name: str = Form(...),
    policy_number: str = Form(...),
    damage_type: str = Form(...),
    image: Optional[UploadFile] = File(default=None),
    pdf_document: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db)
):
    # Read image bytes if an image was uploaded
    image_bytes = None
    if image:
        image_bytes = await image.read()
    
    new_claim = Claim(
        claimant_name=claimant_name,
        policy_number=policy_number,
        damage_type=damage_type,
        severity="Pending",
        confidence_score=0.0,
        estimated_cost_range="Pending",
        fraud_risk_score=0.0,
        status="Pending Analysis"
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    
    # Store image bytes temporarily in session for analyze endpoint
    # (In production, upload to S3 and store the path)
    if image_bytes:
        _IMAGE_CACHE[new_claim.id] = image_bytes
    
    return {
        "message": "Claim submitted successfully", 
        "claim": {
            "id": f"CLM-{new_claim.id + 1000}",
            "status": new_claim.status
        }
    }

@router.post("/analyze", response_model=RecommendationResponse)
def analyze_claim(db: Session = Depends(get_db)):
    # Get the latest claim for the demo
    claim = db.query(Claim).order_by(Claim.id.desc()).first()
    if not claim:
        raise HTTPException(status_code=404, detail="No claims found to analyze")

    # Call the real CNN engine with image bytes if available
    image_bytes = _IMAGE_CACHE.pop(claim.id, None)
    claim_id_str = f"CLM-{claim.id + 1000}"
    assessment = run_cnn_damage_assessment(
        image_bytes=image_bytes,
        claim_metadata={"damage_type": claim.damage_type},
        claim_id=claim_id_str
    )
    
    # Update the DB with the actual AI results
    claim.classification = assessment.classification
    claim.explanation = assessment.explanation
    claim.severity = assessment.severity
    claim.confidence_score = assessment.confidence_score
    claim.estimated_cost_range = assessment.estimated_cost_range
    claim.fraud_risk_score = assessment.fraud_risk_score
    claim.status = "Pending Review"
    db.commit()

    return RecommendationResponse(
        claim_id=f"CLM-{claim.id + 1000}",
        classification=assessment.classification,
        severity=assessment.severity,
        confidence_score=assessment.confidence_score,
        estimated_cost_range=assessment.estimated_cost_range,
        fraud_risk_score=assessment.fraud_risk_score,
        explanation=assessment.explanation,
        feature_importance=assessment.feature_importance,
    )

@router.patch("/{claim_id}/review")
def review_claim(claim_id: str, decision: str, reviewer_notes: str = "", db: Session = Depends(get_db)):
    try:
        actual_id = int(claim_id.replace("CLM-", "")) - 1000
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid claim ID format")
        
    claim = db.query(Claim).filter(Claim.id == actual_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = decision.title()
    if reviewer_notes:
        claim.reviewer_notes = reviewer_notes
    db.commit()

    return {
        "message": "Decision stored successfully",
        "claim_id": claim_id,
        "decision": claim.status,
        "reviewer_notes": reviewer_notes,
    }
