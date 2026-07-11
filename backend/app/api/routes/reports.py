from io import BytesIO
import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, HRFlowable,
    Image as RLImage
)
from reportlab.lib.enums import TA_LEFT

from ...api.deps import get_db
from ...models import Claim

router = APIRouter()

ACCENT_BLUE = colors.HexColor("#4f8ef7")
DARK_BG = colors.HexColor("#0f172a")
PANEL_BG = colors.HexColor("#1e293b")
HEADER_TEXT = colors.HexColor("#ffffff")
BODY_TEXT = colors.HexColor("#1e293b")
MUTED = colors.HexColor("#94a3b8")


def _severity_color(severity: str):
    mapping = {
        "Severe":   colors.HexColor("#f87171"),
        "Moderate": colors.HexColor("#fbbf24"),
        "Minor":    colors.HexColor("#34d399"),
    }
    return mapping.get(severity, ACCENT_BLUE)


@router.get("/download")
@router.get("/{claim_id}/pdf")
def download_report(claim_id: str = "latest", db: Session = Depends(get_db)):
    """Generate and stream a real PDF report for the given claim."""
    if claim_id == "latest":
        claim = db.query(Claim).order_by(Claim.id.desc()).first()
    else:
        try:
            actual_id = int(claim_id.replace("CLM-", "")) - 1000
            claim = db.query(Claim).filter(Claim.id == actual_id).first()
        except (ValueError, AttributeError):
            raise HTTPException(status_code=400, detail="Invalid claim ID")

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    display_id = f"CLM-{claim.id + 1000}"

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            leftMargin=0.75*inch, rightMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CWTitle", parent=styles["Title"],
        fontSize=22, textColor=ACCENT_BLUE, spaceAfter=4, alignment=TA_LEFT,
    )
    subtitle_style = ParagraphStyle(
        "CWSub", parent=styles["Normal"],
        fontSize=10, textColor=MUTED, spaceAfter=12, alignment=TA_LEFT,
    )
    section_style = ParagraphStyle(
        "CWSection", parent=styles["Heading2"],
        fontSize=13, textColor=ACCENT_BLUE, spaceBefore=16, spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "CWBody", parent=styles["Normal"],
        fontSize=10, textColor=BODY_TEXT, leading=16,
    )

    story = []

    # Header
    story.append(Paragraph("ClaimWise AI", title_style))
    story.append(Paragraph("Insurance Claim Assessment Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT_BLUE, spaceAfter=12))

    # Claim Details
    story.append(Paragraph("Claim Details", section_style))
    detail_data = [
        ["Claim ID", display_id],
        ["Claimant", claim.claimant_name or "—"],
        ["Policy Number", claim.policy_number or "—"],
        ["Damage Type", claim.damage_type or "—"],
        ["Status", claim.status or "—"],
        ["Submitted At", claim.created_at.strftime("%Y-%m-%d %H:%M") if claim.created_at else "—"],
    ]
    detail_table = Table(detail_data, colWidths=[2.2*inch, 4.5*inch])
    detail_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (0, -1), ACCENT_BLUE),
        ("TEXTCOLOR",     (0, 0), (0, -1), HEADER_TEXT),
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (1, 0), (1, -1), BODY_TEXT),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS",(0, 0), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(detail_table)

    # AI Assessment
    story.append(Paragraph("AI Damage Assessment", section_style))
    sev_color = _severity_color(claim.severity or "")
    ai_data = [
        ["Metric", "Value"],
        ["Classification", "Vehicle Damage"],
        ["Severity", claim.severity or "—"],
        ["Confidence Score", f"{(claim.confidence_score or 0)*100:.1f}%"],
        ["Estimated Repair Cost", claim.estimated_cost_range or "—"],
        ["Fraud Risk Score", f"{(claim.fraud_risk_score or 0)*100:.0f}%"],
    ]
    ai_table = Table(ai_data, colWidths=[2.2*inch, 4.5*inch])
    ai_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), DARK_BG),
        ("TEXTCOLOR",     (0, 0), (-1, 0), HEADER_TEXT),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND",    (0, 2), (-1, 2), sev_color),
        ("TEXTCOLOR",     (0, 2), (-1, 2), HEADER_TEXT),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(ai_table)

    # Grad-CAM heatmap (if exists)
    heatmap_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static", "heatmaps")
    heatmap_path = os.path.join(heatmap_dir, f"{display_id}_gradcam.png")
    if os.path.exists(heatmap_path):
        story.append(Paragraph("Grad-CAM Heatmap", section_style))
        story.append(RLImage(heatmap_path, width=3*inch, height=3*inch))
        story.append(Paragraph(
            "The Grad-CAM visualization highlights regions of the vehicle image most "
            "influential in the AI model's damage classification decision.",
            body_style
        ))

    # Reviewer Decision
    if claim.reviewer_notes or claim.status in ("Approved", "Rejected"):
        story.append(Paragraph("Reviewer Decision", section_style))
        story.append(Paragraph(f"<b>Decision:</b> {claim.status}", body_style))
        if claim.reviewer_notes:
            story.append(Paragraph(f"<b>Notes:</b> {claim.reviewer_notes}", body_style))

    # Footer
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=1, color=MUTED))
    story.append(Paragraph(
        "This report was automatically generated by ClaimWise AI. "
        "All decisions are subject to human review and compliance approval.",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=MUTED, spaceBefore=6)
    ))

    doc.build(story)
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=claimwise_{display_id}.pdf"},
    )
