"""
Email utility for CHMS — sends transactional emails via Gmail SMTP.

Configuration (set in .env):
    SMTP_FROM_EMAIL  — Gmail address used as sender
    SMTP_PASSWORD    — Gmail App Password (16-char, spaces optional)
    FRONTEND_URL     — Base URL for links in emails (default http://localhost:5173)

If credentials are not configured, emails are silently skipped.
"""

import html
import json
import smtplib
import socket
import logging
import urllib.request
from typing import Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("chms.email")


import urllib.error


def _resolve_resend_sender(smtp_email: str) -> Optional[str]:
    """
    Choose a valid sender for Resend.

    Resend's testing sender (`onboarding@resend.dev`) is limited and should not
    hijack normal SMTP delivery for real recipients. Prefer an explicitly
    configured verified sender, then a non-Gmail SMTP sender, otherwise skip
    Resend and fall back to the next provider.
    """
    resend_from = getattr(settings, "RESEND_FROM_EMAIL", "").strip()
    if resend_from and "@" in resend_from:
        return resend_from
    if smtp_email and "@" in smtp_email and not smtp_email.lower().endswith("@gmail.com"):
        return smtp_email
    return None


def _send_via_resend(api_key: str, from_email: str, to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    try:
        sender = f"CHMS Hackathons <{from_email}>"
        payload = json.dumps({
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CHMS/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info("Email sent via Resend HTTP API to %s", to_email)
                return True, "SUCCESS"
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        logger.warning("Resend HTTP API failed for %s: %s - %s", to_email, exc, err_body)
        return False, f"HTTP {exc.code}: {err_body}"
    except Exception as exc:  # noqa: BLE001
        logger.warning("Resend HTTP API failed for %s: %s", to_email, exc)
        return False, str(exc)
    return False, "Unknown failure"


def _send_via_brevo(api_key: str, from_email: str, to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    try:
        sender_email = from_email if "@" in from_email else "no-reply@chms-app.com"
        payload = json.dumps({
            "sender": {"name": "CHMS Hackathons", "email": sender_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_body,
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.brevo.com/v3/smtp/email",
            data=payload,
            headers={
                "api-key": api_key.strip(),
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CHMS/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201, 202):
                logger.info("Email sent via Brevo HTTP API to %s", to_email)
                return True, "SUCCESS"
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        logger.warning("Brevo HTTP API failed for %s: %s - %s", to_email, exc, err_body)
        return False, f"HTTP {exc.code}: {err_body}"
    except Exception as exc:  # noqa: BLE001
        logger.warning("Brevo HTTP API failed for %s: %s", to_email, exc)
        return False, str(exc)
    return False, "Unknown failure"


def _frontend_url() -> str:
    return getattr(settings, "FRONTEND_URL", "https://chms-lj.vercel.app").rstrip("/")


class IPv4SMTP(smtplib.SMTP):
    """SMTP subclass forcing IPv4 socket connection to bypass Render IPv6 unreachable route."""
    def _get_socket(self, host, port, timeout):
        res = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        if not res:
            raise socket.error(f"Could not resolve IPv4 address for {host}")
        af, socktype, proto, _, sa = res[0]
        sock = socket.socket(af, socktype, proto)
        if timeout is not None and timeout != socket._GLOBAL_DEFAULT_TIMEOUT:
            sock.settimeout(timeout)
        sock.connect(sa)
        return sock


class IPv4SMTP_SSL(smtplib.SMTP_SSL):
    """SMTP_SSL subclass forcing IPv4 socket connection to bypass Render IPv6 unreachable route."""
    def _get_socket(self, host, port, timeout):
        res = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        if not res:
            raise socket.error(f"Could not resolve IPv4 address for {host}")
        af, socktype, proto, _, sa = res[0]
        sock = socket.socket(af, socktype, proto)
        if timeout is not None and timeout != socket._GLOBAL_DEFAULT_TIMEOUT:
            sock.settimeout(timeout)
        sock.connect(sa)
        return self.context.wrap_socket(sock, server_hostname=self._host)


def _send_html_email(
    to_email: str,
    subject: str,
    plain_text: str,
    html_body: str,
) -> bool:
    """Send email via Resend/Brevo HTTP API or Gmail SMTP (with SSL fallback)."""
    resend_key = getattr(settings, "RESEND_API_KEY", "").strip()
    brevo_key = getattr(settings, "BREVO_API_KEY", "").strip()
    smtp_email = getattr(settings, "SMTP_FROM_EMAIL", "").strip()

    if resend_key:
        resend_sender = _resolve_resend_sender(smtp_email)
        if resend_sender:
            ok, _ = _send_via_resend(resend_key, resend_sender, to_email, subject, html_body)
            if ok:
                return True
            logger.warning("Resend delivery failed for %s, falling back to next provider.", to_email)
        else:
            logger.warning(
                "RESEND_API_KEY is configured but no verified Resend sender is available. "
                "Set RESEND_FROM_EMAIL to a verified domain sender or remove the key to use SMTP/Brevo."
            )
    if brevo_key:
        ok, _ = _send_via_brevo(brevo_key, smtp_email, to_email, subject, html_body)
        if ok:
            return True
        logger.warning("Brevo delivery failed for %s, falling back to SMTP.", to_email)

    smtp_password = getattr(settings, "SMTP_PASSWORD", "").strip().replace(" ", "")
    smtp_host = getattr(settings, "SMTP_HOST", "smtp.gmail.com")
    try:
        smtp_port = int(getattr(settings, "SMTP_PORT", 587))
    except (ValueError, TypeError):
        smtp_port = 587

    if not smtp_email or not smtp_password:
        logger.warning(
            "SMTP credentials not configured (SMTP_FROM_EMAIL or SMTP_PASSWORD empty) — skipping email to %s",
            to_email,
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"CHMS Hackathons <{smtp_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    # Attempt 1: Configured port (587 TLS or 465 SSL)
    try:
        if smtp_port == 465:
            with IPv4SMTP_SSL(smtp_host, 465, timeout=12) as server:
                server.login(smtp_email, smtp_password)
                server.sendmail(smtp_email, to_email, msg.as_string())
        else:
            with IPv4SMTP(smtp_host, smtp_port, timeout=12) as server:
                server.ehlo()
                server.starttls()
                server.login(smtp_email, smtp_password)
                server.sendmail(smtp_email, to_email, msg.as_string())
        return True
    except Exception as exc1:  # noqa: BLE001
        logger.warning(
            "Primary SMTP attempt (host: %s, port: %s) failed for %s: %s. Trying SSL fallback (port 465)...",
            smtp_host, smtp_port, to_email, exc1,
        )

    # Attempt 2: Fallback to SSL on port 465
    if smtp_port != 465:
        try:
            with IPv4SMTP_SSL(smtp_host, 465, timeout=12) as server:
                server.login(smtp_email, smtp_password)
                server.sendmail(smtp_email, to_email, msg.as_string())
            logger.info("Fallback IPv4SMTP_SSL (port 465) succeeded for %s", to_email)
            return True
        except Exception as exc2:  # noqa: BLE001
            logger.error("Failed to send email to %s after SSL fallback: %s", to_email, exc2)
            return False

    return False


def _build_invitation_html(
    invitee_name: str,
    team_name: str,
    hackathon_name: str,
    inviter_name: str,
) -> str:
    """Build a styled HTML email body for a team invitation."""
    safe_invitee = html.escape(invitee_name)
    safe_team = html.escape(team_name)
    safe_hackathon = html.escape(hackathon_name)
    safe_inviter = html.escape(inviter_name)
    teams_url = f"{_frontend_url()}/student/teams"

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
          <tr>
            <td style="background:linear-gradient(135deg,rgba(0,243,255,0.12) 0%,rgba(0,100,180,0.08) 100%);
                       padding:32px 40px;border-bottom:1px solid rgba(0,243,255,0.1);">
              <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;
                        color:rgba(0,243,255,0.8);font-weight:700;">
                College Hackathon Management System
              </p>
              <h1 style="margin:10px 0 0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Team Invitation
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.5);text-transform:uppercase;
                        letter-spacing:0.1em;font-weight:600;">
                Hey {safe_invitee},
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.6;">
                <strong style="color:#ffffff;">{safe_inviter}</strong> has invited you to join their team
                for an upcoming hackathon on CHMS.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:rgba(0,243,255,0.04);border:1px solid rgba(0,243,255,0.15);
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;width:130px;">Team</td>
                        <td style="font-size:14px;color:#00f3ff;font-weight:700;">{safe_team}</td>
                      </tr>
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;">Hackathon</td>
                        <td style="font-size:14px;color:#ffffff;font-weight:600;">{safe_hackathon}</td>
                      </tr>
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;">Invited By</td>
                        <td style="font-size:14px;color:#ffffff;">{safe_inviter}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">
                Log in to your CHMS student dashboard and go to
                <strong style="color:#ffffff;">Team Management</strong> to accept or decline this invitation.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#00f3ff,#0080ff);border-radius:8px;">
                    <a href="{teams_url}"
                       style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;
                              color:#000000;text-decoration:none;letter-spacing:0.05em;">
                      View Invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
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


def _build_announcement_html(
    recipient_name: str,
    title: str,
    message: str,
    sender_name: str,
    hackathon_name: Optional[str] = None,
) -> str:
    """Build a styled HTML email body for an announcement."""
    safe_recipient = html.escape(recipient_name)
    safe_title = html.escape(title)
    safe_message = html.escape(message).replace("\n", "<br/>")
    safe_sender = html.escape(sender_name)
    safe_hackathon = html.escape(hackathon_name) if hackathon_name else None
    dashboard_url = f"{_frontend_url()}/student"

    scope_row = ""
    if safe_hackathon:
        scope_row = f"""
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;width:130px;">Hackathon</td>
                        <td style="font-size:14px;color:#ffffff;font-weight:600;">{safe_hackathon}</td>
                      </tr>"""

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{safe_title} — CHMS</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#0f0f1a 0%,#12121f 100%);
                      border:1px solid rgba(0,243,255,0.15);
                      border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,rgba(0,243,255,0.12) 0%,rgba(0,100,180,0.08) 100%);
                       padding:32px 40px;border-bottom:1px solid rgba(0,243,255,0.1);">
              <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;
                        color:rgba(0,243,255,0.8);font-weight:700;">
                College Hackathon Management System
              </p>
              <h1 style="margin:10px 0 0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                New Announcement
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.5);text-transform:uppercase;
                        letter-spacing:0.1em;font-weight:600;">
                Hi {safe_recipient},
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.6;">
                <strong style="color:#ffffff;">{safe_sender}</strong> published a new announcement on CHMS.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:rgba(0,243,255,0.04);border:1px solid rgba(0,243,255,0.15);
                            border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;width:130px;">Title</td>
                        <td style="font-size:14px;color:#00f3ff;font-weight:700;">{safe_title}</td>
                      </tr>{scope_row}
                      <tr>
                        <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;
                                   color:rgba(255,255,255,0.4);font-weight:600;vertical-align:top;">Message</td>
                        <td style="font-size:14px;color:#ffffff;line-height:1.6;">{safe_message}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#00f3ff,#0080ff);border-radius:8px;">
                    <a href="{dashboard_url}"
                       style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;
                              color:#000000;text-decoration:none;letter-spacing:0.05em;">
                      Open CHMS Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;">
                This is an automated notification from CHMS.
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
    """Send a team invitation notification email to the invitee."""
    plain_text = (
        f"Hi {invitee_name},\n\n"
        f"{inviter_name} has invited you to join team '{team_name}' "
        f"for the hackathon '{hackathon_name}' on CHMS.\n\n"
        f"Log in to your student dashboard and go to Team Management to respond.\n\n"
        f"— CHMS Team"
    )
    sent = _send_html_email(
        to_email=to_email,
        subject=f"You've been invited to join team '{team_name}' on CHMS",
        plain_text=plain_text,
        html_body=_build_invitation_html(
            invitee_name=invitee_name,
            team_name=team_name,
            hackathon_name=hackathon_name,
            inviter_name=inviter_name,
        ),
    )
    if sent:
        logger.info(
            "Team invitation email sent to %s (team: %s, hackathon: %s)",
            to_email, team_name, hackathon_name,
        )
    return sent

def send_welcome_email(to_email: str, recipient_name: str) -> bool:
    """Send a transactional welcome email after account creation."""
    safe_name = html.escape(recipient_name or to_email)
    dashboard_url = f"{_frontend_url()}/student"
    plain_text = f"Hi {recipient_name or to_email},\n\nWelcome to CHMS. Your account is ready.\n\nOpen your dashboard: {dashboard_url}\n\n— CHMS Team"
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;background:#0a0a0f;color:#fff;padding:32px">
      <div style="max-width:560px;margin:auto;padding:32px;border:1px solid #164e63;border-radius:14px;background:#111827">
        <p style="color:#00f3ff;font-weight:700;letter-spacing:.12em">CHMS</p>
        <h1>Welcome, {safe_name}!</h1>
        <p>Your College Hackathon Management System account has been created successfully.</p>
        <p><a href="{dashboard_url}" style="display:inline-block;padding:12px 22px;background:#00f3ff;color:#001018;border-radius:7px;text-decoration:none;font-weight:700">Open dashboard</a></p>
      </div>
    </body></html>
    """
    return _send_html_email(to_email, "Welcome to CHMS", plain_text, html_body)


def send_announcement_email(
    to_email: str,
    recipient_name: str,
    title: str,
    message: str,
    sender_name: str,
    hackathon_name: Optional[str] = None,
) -> bool:
    """Send an announcement notification email to a single recipient."""
    scope = f" ({hackathon_name})" if hackathon_name else ""
    plain_text = (
        f"Hi {recipient_name},\n\n"
        f"{sender_name} published a new announcement on CHMS{scope}.\n\n"
        f"Title: {title}\n\n"
        f"{message}\n\n"
        f"Log in to CHMS to view your dashboard.\n\n"
        f"— CHMS Team"
    )
    sent = _send_html_email(
        to_email=to_email,
        subject=f"CHMS Announcement: {title}",
        plain_text=plain_text,
        html_body=_build_announcement_html(
            recipient_name=recipient_name,
            title=title,
            message=message,
            sender_name=sender_name,
            hackathon_name=hackathon_name,
        ),
    )
    if sent:
        logger.info("Announcement email sent to %s (title: %s)", to_email, title)
    return sent


def send_bulk_announcement_emails(
    recipients: list[tuple[str, str]],
    title: str,
    message: str,
    sender_name: str,
    hackathon_name: Optional[str] = None,
) -> int:
    """
    Send announcement emails to multiple recipients using a single reusable SMTP connection.
    Includes auto-reconnect on socket disconnect so failure on one recipient does not stop others.
    Returns the count of successfully sent emails.
    """
    resend_key = getattr(settings, "RESEND_API_KEY", "").strip()
    brevo_key = getattr(settings, "BREVO_API_KEY", "").strip()
    smtp_email = getattr(settings, "SMTP_FROM_EMAIL", "").strip()

    if (resend_key or brevo_key) and recipients:
        bulk_delivered = 0
        resend_sender = _resolve_resend_sender(smtp_email)
        for to_email, recipient_name in recipients:
            if not to_email or "@" not in to_email:
                continue
            scope = f" ({hackathon_name})" if hackathon_name else ""
            plain_text = f"Hi {recipient_name},\n\n{sender_name} published a new announcement on CHMS{scope}.\n\nTitle: {title}\n\n{message}\n\n— CHMS Team"
            html_body = _build_announcement_html(recipient_name, title, message, sender_name, hackathon_name)
            subject = f"CHMS Announcement: {title}"

            if resend_key and resend_sender:
                ok, _ = _send_via_resend(resend_key, resend_sender, to_email, subject, html_body)
                if ok:
                    bulk_delivered += 1
                    continue
            elif resend_key and not resend_sender:
                logger.warning(
                    "Skipping Resend bulk delivery because RESEND_FROM_EMAIL is missing or invalid for production sending."
                )

            if brevo_key:
                ok, _ = _send_via_brevo(brevo_key, smtp_email, to_email, subject, html_body)
                if ok:
                    bulk_delivered += 1
                    continue
        return bulk_delivered

    smtp_password = getattr(settings, "SMTP_PASSWORD", "").strip().replace(" ", "")
    smtp_host = getattr(settings, "SMTP_HOST", "smtp.gmail.com")
    try:
        smtp_port = int(getattr(settings, "SMTP_PORT", 587))
    except (ValueError, TypeError):
        smtp_port = 587

    if not smtp_email or not smtp_password or not recipients:
        return 0

    def _send_on_server(initial_server) -> int:
        delivered_count = 0
        server = initial_server

        for to_email, recipient_name in recipients:
            if not to_email or "@" not in to_email:
                continue

            for attempt in range(2):
                try:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = f"CHMS Announcement: {title}"
                    msg["From"] = f"CHMS Hackathons <{smtp_email}>"
                    msg["To"] = to_email

                    scope = f" ({hackathon_name})" if hackathon_name else ""
                    plain_text = (
                        f"Hi {recipient_name},\n\n"
                        f"{sender_name} published a new announcement on CHMS{scope}.\n\n"
                        f"Title: {title}\n\n"
                        f"{message}\n\n"
                        f"— CHMS Team"
                    )
                    html_body = _build_announcement_html(
                        recipient_name=recipient_name,
                        title=title,
                        message=message,
                        sender_name=sender_name,
                        hackathon_name=hackathon_name,
                    )
                    msg.attach(MIMEText(plain_text, "plain"))
                    msg.attach(MIMEText(html_body, "html"))

                    server.sendmail(smtp_email, to_email, msg.as_string())
                    delivered_count += 1
                    logger.info("Bulk announcement email sent to %s", to_email)
                    break
                except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, socket.error) as conn_err:
                    logger.warning("SMTP connection lost while sending to %s (attempt %d): %s", to_email, attempt + 1, conn_err)
                    if attempt == 0:
                        try:
                            if smtp_port == 465:
                                server = IPv4SMTP_SSL(smtp_host, 465, timeout=12)
                                server.login(smtp_email, smtp_password)
                            else:
                                server = IPv4SMTP(smtp_host, smtp_port, timeout=12)
                                server.ehlo()
                                server.starttls()
                                server.login(smtp_email, smtp_password)
                        except Exception as rec_err:  # noqa: BLE001
                            logger.error("Failed to reconnect SMTP server: %s", rec_err)
                            break
                    else:
                        break
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Failed sending bulk email to %s: %s", to_email, exc)
                    break

        return delivered_count

    # Attempt 1: Configured port
    try:
        if smtp_port == 465:
            with IPv4SMTP_SSL(smtp_host, 465, timeout=15) as server:
                server.login(smtp_email, smtp_password)
                return _send_on_server(server)
        else:
            with IPv4SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.login(smtp_email, smtp_password)
                return _send_on_server(server)
    except Exception as exc1:  # noqa: BLE001
        logger.warning("Primary bulk SMTP failed (%s:%s): %s. Trying SSL fallback (465)...", smtp_host, smtp_port, exc1)

    # Attempt 2: Fallback SSL (Port 465)
    if smtp_port != 465:
        try:
            with IPv4SMTP_SSL(smtp_host, 465, timeout=15) as server:
                server.login(smtp_email, smtp_password)
                return _send_on_server(server)
        except Exception as exc2:  # noqa: BLE001
            logger.error("Bulk SMTP SSL fallback failed: %s", exc2)

    return 0
