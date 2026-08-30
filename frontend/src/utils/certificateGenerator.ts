import { jsPDF } from 'jspdf';
import { STATIC_BASE, type CertificateRecord } from '@/services/api';

export const assetUrl = (url?: string): string => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${STATIC_BASE}${url}`;
};

export const getCertificateFieldValue = (key: string, certificate: CertificateRecord): string => {
  const map: Record<string, string> = {
    student_name: certificate.recipient_name || '',
    team_name: certificate.team_name || '',
    hackathon_title: certificate.hackathon_title || '',
    certificate_type: certificate.certificate_type || 'Certificate of Participation',
    issue_date: certificate.issued_at
      ? new Date(certificate.issued_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    verification_id: certificate.verification_id || '',
    award_label: certificate.award_label || '',
  };
  return map[key] ?? '';
};

/**
 * Loads an image with CORS handling. If CORS or load fails, resolves to null.
 */
function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Try again without crossOrigin if first attempt failed
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Draws a luxury ornate certificate frame when background is missing or fails to load.
 */
function drawFallbackBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Parchment radial gradient
  const grad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, width / 1.1);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#faf5ea');
  grad.addColorStop(1, '#ede2ca');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Outer primary gold border
  ctx.strokeStyle = '#8a6429';
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Accent bright gold thin border
  ctx.strokeStyle = '#c59b27';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Inner navy thin border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(58, 58, width - 116, height - 116);

  // Corner decorative flourishes
  const cornerSize = 40;
  const corners = [
    [64, 64],
    [width - 64, 64],
    [64, height - 64],
    [width - 64, height - 64],
  ];
  ctx.fillStyle = '#8a6429';
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeRect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
  }
}

/**
 * Renders the certificate onto a high-resolution HTML5 canvas (2000x1414).
 */
export async function renderCertificateToCanvas(
  certificate: CertificateRecord,
  targetWidth = 2000,
  targetHeight = 1414
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context.');

  const { template } = certificate;
  const bgUrl = template?.background_url ? assetUrl(template.background_url) : '';

  let bgLoaded = false;
  if (bgUrl) {
    const img = await loadImageSafe(bgUrl);
    if (img) {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      bgLoaded = true;
    }
  }

  if (!bgLoaded) {
    drawFallbackBackground(ctx, targetWidth, targetHeight);
  }

  const fields = template?.field_layout || [];

  if (fields.length > 0) {
    // Relative scaling factor between designer preview and target high-res canvas
    const fontScale = targetWidth / 680;

    for (const field of fields) {
      if (field.visible === false) continue;
      const textVal = getCertificateFieldValue(field.key, certificate);
      if (!textVal) continue;

      const posX = ((field.x ?? 50) / 100) * targetWidth;
      const posY = ((field.y ?? 50) / 100) * targetHeight;
      const fontSize = Math.max(12, Math.round((field.fontSize ?? 16) * fontScale));
      const fontFamily = field.fontFamily || 'Georgia, "Times New Roman", serif';
      const fontWeight = field.fontWeight || 600;
      const fontStyle = field.fontStyle || 'normal';

      ctx.save();
      ctx.globalAlpha = field.opacity ?? 1;
      ctx.fillStyle = field.color || '#1e293b';
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = (field.textAlign as CanvasTextAlign) || 'center';
      ctx.textBaseline = 'middle';

      if (field.rotation) {
        ctx.translate(posX, posY);
        ctx.rotate((field.rotation * Math.PI) / 180);
        ctx.fillText(textVal, 0, 0);
        if (field.textDecoration === 'underline') {
          const textMetrics = ctx.measureText(textVal);
          const underlineY = fontSize * 0.55;
          ctx.beginPath();
          ctx.strokeStyle = field.color || '#1e293b';
          ctx.lineWidth = Math.max(2, fontSize * 0.06);
          const halfWidth = textMetrics.width / 2;
          ctx.moveTo(-halfWidth, underlineY);
          ctx.lineTo(halfWidth, underlineY);
          ctx.stroke();
        }
      } else {
        ctx.fillText(textVal, posX, posY);
        if (field.textDecoration === 'underline') {
          const textMetrics = ctx.measureText(textVal);
          const underlineY = posY + fontSize * 0.55;
          ctx.beginPath();
          ctx.strokeStyle = field.color || '#1e293b';
          ctx.lineWidth = Math.max(2, fontSize * 0.06);
          if (ctx.textAlign === 'center') {
            const halfWidth = textMetrics.width / 2;
            ctx.moveTo(posX - halfWidth, underlineY);
            ctx.lineTo(posX + halfWidth, underlineY);
          } else if (ctx.textAlign === 'right') {
            ctx.moveTo(posX - textMetrics.width, underlineY);
            ctx.lineTo(posX, underlineY);
          } else {
            ctx.moveTo(posX, underlineY);
            ctx.lineTo(posX + textMetrics.width, underlineY);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  } else {
    // Default styled layout when field_layout is empty
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Header Title
    ctx.font = 'bold 54px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#8a6429';
    ctx.fillText(certificate.certificate_type.toUpperCase(), targetWidth / 2, targetHeight * 0.28);

    // Subtitle
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('This certificate is proudly awarded to', targetWidth / 2, targetHeight * 0.38);

    // Recipient Name
    ctx.font = 'bold 64px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(certificate.recipient_name, targetWidth / 2, targetHeight * 0.48);

    // Event & Details
    ctx.font = '30px Georgia, serif';
    ctx.fillStyle = '#334155';
    let detailText = `for participation in ${certificate.hackathon_title}`;
    if (certificate.team_name) {
      detailText += ` with Team ${certificate.team_name}`;
    }
    ctx.fillText(detailText, targetWidth / 2, targetHeight * 0.58);

    // Award Label if present
    if (certificate.award_label) {
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillStyle = '#c59b27';
      ctx.fillText(certificate.award_label, targetWidth / 2, targetHeight * 0.66);
    }

    // Bottom details
    const issueDateStr = getCertificateFieldValue('issue_date', certificate);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText(`Issued: ${issueDateStr}`, targetWidth * 0.12, targetHeight * 0.84);

    ctx.textAlign = 'right';
    ctx.font = 'mono 20px monospace';
    ctx.fillStyle = '#0284c7';
    ctx.fillText(`ID: ${certificate.verification_id}`, targetWidth * 0.88, targetHeight * 0.84);

    ctx.restore();
  }

  return canvas;
}

/**
 * Downloads a canvas as a high-quality JPEG file.
 */
export async function downloadCertificateAsJpg(certificate: CertificateRecord): Promise<void> {
  const canvas = await renderCertificateToCanvas(certificate);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to generate JPG blob.'));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${certificate.verification_id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Downloads the certificate as a high-resolution A4 Landscape PDF.
 */
export async function downloadCertificateAsPdf(certificate: CertificateRecord): Promise<void> {
  const canvas = await renderCertificateToCanvas(certificate);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 Landscape: 297mm x 210mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
  pdf.save(`${certificate.verification_id}.pdf`);
}
