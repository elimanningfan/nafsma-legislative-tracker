"""Email delivery via SendGrid for NAFSMA Legislative Tracker."""

from __future__ import annotations

import logging
import os
import re
from dataclasses import dataclass
from typing import Any

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Content

logger = logging.getLogger(__name__)


def markdown_to_html(markdown_text: str) -> str:
    """Convert markdown to simple HTML for email.

    Handles headers, bold, links, and lists.
    """
    lines = markdown_text.split('\n')
    html_lines = []
    in_list = False

    for line in lines:
        # Close list if we're no longer in one
        if in_list and not line.strip().startswith('- '):
            html_lines.append('</ul>')
            in_list = False

        # Headers
        if line.startswith('# '):
            html_lines.append(f'<h1 style="color: #2c5282; margin-top: 20px;">{line[2:]}</h1>')
        elif line.startswith('## '):
            html_lines.append(f'<h2 style="color: #2d3748; margin-top: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">{line[3:]}</h2>')
        elif line.startswith('### '):
            html_lines.append(f'<h3 style="color: #4a5568; margin-top: 15px;">{line[4:]}</h3>')
        # Horizontal rule
        elif line.strip() == '---':
            html_lines.append('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">')
        # List items
        elif line.strip().startswith('- '):
            if not in_list:
                html_lines.append('<ul style="margin: 10px 0; padding-left: 20px;">')
                in_list = True
            content = line.strip()[2:]
            # Convert markdown formatting within list items
            content = convert_inline_markdown(content)
            html_lines.append(f'<li style="margin: 8px 0;">{content}</li>')
        # Empty lines
        elif line.strip() == '':
            html_lines.append('<br>')
        # Regular paragraphs
        else:
            content = convert_inline_markdown(line)
            html_lines.append(f'<p style="margin: 5px 0; color: #4a5568;">{content}</p>')

    # Close any open list
    if in_list:
        html_lines.append('</ul>')

    html_content = '\n'.join(html_lines)

    # Wrap in a styled container
    return f'''
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #2d3748;">
        {html_content}
    </div>
    '''


def convert_inline_markdown(text: str) -> str:
    """Convert inline markdown (bold, links) to HTML."""
    # Convert **bold** to <strong>
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)

    # Convert [text](url) to <a href="url">text</a>
    text = re.sub(
        r'\[([^\]]+)\]\(([^)]+)\)',
        r'<a href="\2" style="color: #3182ce; text-decoration: none;">\1</a>',
        text
    )

    return text


@dataclass
class EmailResult:
    """Result of an email send attempt."""

    success: bool
    status_code: int | None
    message: str


class EmailClient:
    """SendGrid email client for digest delivery."""

    def __init__(self, api_key: str | None = None):
        """Initialize the SendGrid client.

        Args:
            api_key: SendGrid API key. If not provided, reads from
                     SENDGRID_API_KEY environment variable.
        """
        self.api_key = api_key or os.environ.get("SENDGRID_API_KEY")
        if not self.api_key:
            logger.warning("No SendGrid API key configured")
            self._client = None
        else:
            self._client = SendGridAPIClient(self.api_key)

    def send_digest(
        self,
        config: dict[str, Any],
        subject: str,
        markdown_content: str,
    ) -> EmailResult:
        """Send a digest email to configured recipients.

        Args:
            config: Configuration dict with notifications settings.
            subject: Email subject line.
            markdown_content: Markdown content of the digest.

        Returns:
            EmailResult with success status and details.
        """
        if not self._client:
            return EmailResult(
                success=False,
                status_code=None,
                message="SendGrid API key not configured",
            )

        notifications = config.get("notifications", {})
        recipients = notifications.get("email_recipients", [])
        from_email = notifications.get("from_email", "noreply@example.com")

        if not recipients:
            return EmailResult(
                success=False,
                status_code=None,
                message="No email recipients configured",
            )

        # Convert markdown to HTML for better email formatting
        html_content = markdown_to_html(markdown_content)

        # Build the email with both HTML and plain text versions
        message = Mail(
            from_email=from_email,
            to_emails=recipients,
            subject=subject,
        )
        message.add_content(Content("text/plain", markdown_content))
        message.add_content(Content("text/html", html_content))

        try:
            response = self._client.send(message)
            status_code = response.status_code

            if 200 <= status_code < 300:
                logger.info(f"Email sent successfully to {len(recipients)} recipients")
                return EmailResult(
                    success=True,
                    status_code=status_code,
                    message=f"Email sent to {len(recipients)} recipients",
                )
            else:
                logger.error(f"Email send failed with status {status_code}")
                return EmailResult(
                    success=False,
                    status_code=status_code,
                    message=f"SendGrid returned status {status_code}",
                )

        except Exception as e:
            logger.error(f"Email send error: {e}")
            return EmailResult(
                success=False,
                status_code=None,
                message=str(e),
            )

    def send_comment_alert(
        self,
        config: dict[str, Any],
        documents: list[Any],
    ) -> EmailResult:
        """Send an alert about closing comment periods.

        Args:
            config: Configuration dict with notifications settings.
            documents: List of FederalRegisterDocument objects with closing comment periods.

        Returns:
            EmailResult with success status and details.
        """
        if not documents:
            return EmailResult(
                success=True,
                status_code=None,
                message="No documents with closing comment periods",
            )

        # Build alert content
        lines = [
            "NAFSMA Comment Period Alert",
            "=" * 40,
            "",
            f"The following {len(documents)} document(s) have comment periods closing soon:",
            "",
        ]

        for doc in documents:
            days = doc.days_until_comment_close
            urgency = "URGENT" if days is not None and days <= 3 else ""
            lines.append(f"{'[' + urgency + '] ' if urgency else ''}{doc.title}")
            lines.append(f"  Agencies: {', '.join(doc.agencies)}")
            lines.append(f"  Document: {doc.document_number}")
            if doc.comments_close_on:
                lines.append(f"  Comment Period Closes: {doc.comments_close_on} ({days} days)")
            lines.append(f"  URL: {doc.html_url}")
            lines.append("")

        lines.append("---")
        lines.append("Generated by NAFSMA Legislative Tracker")

        content = "\n".join(lines)
        subject = f"NAFSMA Alert: {len(documents)} Comment Period(s) Closing Soon"

        return self.send_digest(config, subject, content)


def send_daily_digest(
    config: dict[str, Any],
    digest_content: str,
    date_str: str,
) -> EmailResult:
    """Convenience function to send the daily digest.

    Args:
        config: Configuration dict.
        digest_content: Markdown content of the digest.
        date_str: Date string for subject line (e.g., "2026-01-22").

    Returns:
        EmailResult with success status.
    """
    client = EmailClient()
    subject = f"NAFSMA Legislative Update - {date_str}"
    return client.send_digest(config, subject, digest_content)


def send_comment_period_alert(
    config: dict[str, Any],
    documents: list[Any],
) -> EmailResult:
    """Convenience function to send comment period alerts.

    Args:
        config: Configuration dict.
        documents: List of FederalRegisterDocument objects.

    Returns:
        EmailResult with success status.
    """
    client = EmailClient()
    return client.send_comment_alert(config, documents)
