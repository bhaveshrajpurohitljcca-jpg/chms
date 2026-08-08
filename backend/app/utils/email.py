"""
Email utility for CHMS — sends transactional emails via Gmail SMTP.

Configuration (set in .env):
    SMTP_FROM_EMAIL  — Gmail address used as sender
    SMTP_PASSWORD    — Gmail App Password (16-char, no spaces)

If credentials are not configured, emails are silently skipped.
"""

import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("chms.email")


def _build_invitation_html(
    invitee_name: str,
    team_name: str,
    hackathon_name: str,
    inviter_name: str,
) -> str:
    """Build a styled HTML email body for a team invitation."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Team Invitation — CHMS</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#0f0f1a 0%,#12121f 100%);
                      border:1px solid rgba(0,243,255,0.15);
                      border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(0,243,255,0.12) 0%,rgba(0,100,180,0.08) 100%);
                       padding:32px 40px;border-bottom:1px solid rgba(0,243,255,0.1);">
              <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;
                        color:rgba(0,243,255,0.8);font-weight:700;">
                College Hackathon Management System
              </p>
              <h1 style="margin:10px 0 0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                🚀 Team Invitation
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.5);text-transform:uppercase;
                        letter-spacing:0.1em;font-weight:600;">
                Hey {invitee_name},
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.6;">
                <strong style="color:#ffffff;">{inviter_name}</strong> has invited you to join their team
                for an upcoming hackathon on CHMS.
              </p>

              <!-- Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:rgba(0,243,255,0.04);border:1px solid rgba(0,243,255,0.15);
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;width:130px;">Team</td>
                        <td style="font-size:14px;color:#00f3ff;font-weight:700;">{team_name}</td>
                      </tr>
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;">Hackathon</td>
                        <td style="font-size:14px;color:#ffffff;font-weight:600;">{hackathon_name}</td>
                      </tr>
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;">Invited By</td>
                        <td style="font-size:14px;color:#ffffff;">{inviter_name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">
                Log in to your CHMS student dashboard and go to
                <strong style="color:#ffffff;">Team Management</strong> to accept or decline this invitation.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#00f3ff,#0080ff);border-radius:8px;">
                    <a href="http://localhost:5173/student/teams"
                       style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;
                              color:#000000;text-decoration:none;letter-spacing:0.05em;">
                      View Invitation →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;">
                This is an automated notification from CHMS. If you did not expect this email,
                you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_team_invitation_email(
    to_email: str,
    invitee_name: str,
    team_name: str,
    hackathon_name: str,
    inviter_name: str,
) -> bool:
    """
    Send a team invitation notification email to the invitee.

    Returns True on success, False on failure (never raises).
    """
    smtp_email = getattr(settings, "SMTP_FROM_EMAIL", "").strip()
    smtp_password = getattr(settings, "SMTP_PASSWORD", "").strip()
    smtp_host = getattr(settings, "SMTP_HOST", "smtp.gmail.com")
    smtp_port = getattr(settings, "SMTP_PORT", 587)

    if not smtp_email or not smtp_password:
        logger.warning(
            "SMTP credentials not configured — skipping invitation email to %s", to_email
        )
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚀 You've been invited to join team '{team_name}' on CHMS"
        msg["From"] = f"CHMS Hackathons <{smtp_email}>"
        msg["To"] = to_email

        # Plain-text fallback
        plain_text = (
            f"Hi {invitee_name},\n\n"
            f"{inviter_name} has invited you to join team '{team_name}' "
            f"for the hackathon '{hackathon_name}' on CHMS.\n\n"
            f"Log in to your student dashboard and go to Team Management to respond.\n\n"
            f"— CHMS Team"
        )
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(
            MIMEText(
                _build_invitation_html(
                    invitee_name=invitee_name,
                    team_name=team_name,
                    hackathon_name=hackathon_name,
                    inviter_name=inviter_name,
                ),
                "html",
            )
        )

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())

        logger.info(
            "Team invitation email sent to %s (team: %s, hackathon: %s)",
            to_email, team_name, hackathon_name,
        )
        return True

    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Failed to send invitation email to %s: %s", to_email, exc
        )
        return False
