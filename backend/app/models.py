from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="claims_officer")
    created_at = Column(DateTime, default=func.now())

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claimant_name = Column(String(255), nullable=False)
    policy_number = Column(String(120), nullable=False)
    damage_type = Column(String(120), nullable=False)
    severity = Column(String(50), nullable=False)
    confidence_score = Column(Float)
    estimated_cost_range = Column(String(120))
    fraud_risk_score = Column(Float)
    status = Column(String(50), default="Pending Review", index=True)
    classification = Column(String(120), default="Pending Analysis")
    explanation = Column(Text, default="AI has not completed analysis on this claim.")
    reviewer_notes = Column(Text)
    created_at = Column(DateTime, default=func.now(), index=True)

class DecisionLog(Base):
    __tablename__ = "decision_logs"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    decision = Column(String(50), nullable=False)
    reviewer_notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
