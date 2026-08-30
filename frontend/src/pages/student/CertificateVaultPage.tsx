import { useEffect, useState } from 'react';
import { Award, CheckCircle2, Download, FileImage, Loader2, Plus, Printer, ShieldCheck } from 'lucide-react';
import { apiService, STATIC_BASE, type CertificateRecord, type CertificateTemplateRecord } from '@/services/api';
import {
  downloadCertificateAsPdf,
  downloadCertificateAsJpg,
  getCertificateFieldValue,
} from '@/utils/certificateGenerator';

const valueFor = (key: string, certificate: CertificateRecord) => getCertificateFieldValue(key, certificate);

const assetUrl = (url?: string) => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${STATIC_BASE}${url}`;
};

function CertificatePreview({ certificate }: { certificate: CertificateRecord }) {
  const { template } = certificate;
  return (
    <div className="relative aspect-[1.414/1] overflow-hidden rounded-xl border border-accent-primary/30 bg-[#f7f0dc] text-[#302312] shadow-xl">
      {template.background_url && <img src={assetUrl(template.background_url)} alt="Certificate template" className="absolute inset-0 h-full w-full object-cover" />}
      {!template.background_url && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff7df,#d4a85c)]" />}
      <div className="absolute inset-3 border-2 border-[#8a6429]/70" />
      {template.field_layout.length ? template.field_layout.map((field, index) => (
        field.visible !== false && (
          <span
            key={`${field.key}-${index}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
            style={{
              left: `${field.x ?? 50}%`,
              top: `${field.y ?? 50}%`,
              fontSize: `${field.fontSize ?? 16}px`,
              color: field.color || '#302312',
              fontFamily: field.fontFamily || 'Georgia, serif',
              fontWeight: field.fontWeight || 600,
              fontStyle: field.fontStyle || 'normal',
              textDecoration: field.textDecoration || 'none',
              opacity: field.opacity ?? 1,
              letterSpacing: `${field.letterSpacing || 0}px`,
              textAlign: field.textAlign || 'center',
              transform: `translate(-50%, -50%) rotate(${field.rotation || 0}deg)`,
            }}
          >
            {valueFor(field.key, certificate)}
          </span>
        )
      )) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <Award size={34} /><p className="text-lg font-bold">{certificate.certificate_type}</p><p>{certificate.recipient_name}</p><p className="text-xs">{certificate.hackathon_title}</p>
        </div>
      )}
    </div>
  );
}

export default function CertificateVaultPage() {
  const [issued, setIssued] = useState<CertificateRecord[]>([]);
  const [available, setAvailable] = useState<CertificateTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CertificateRecord | null>(null);
  const [downloading, setDownloading] = useState<'pdf' | 'jpg' | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [mine, templates] = await Promise.all([apiService.listMyCertificates(), apiService.listAvailableCertificateTemplates()]);
      setIssued(mine.data || []); setAvailable(templates.data || []);
    } catch (err: any) { setError(err.message || 'Certificates could not be loaded.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const generate = async (template: CertificateTemplateRecord) => {
    setWorkingId(template.id); setError('');
    try {
      const result = await apiService.generateCertificate(template.id);
      if (result.data) { setSelected(result.data); await load(); }
    } catch (err: any) { setError(err.message || 'Certificate could not be generated.'); }
    finally { setWorkingId(null); }
  };

  const handleDownloadPdf = async (cert: CertificateRecord) => {
    setDownloading('pdf');
    setError('');
    try {
      await downloadCertificateAsPdf(cert);
    } catch (clientErr) {
      console.warn('Client PDF generation error, trying API fallback:', clientErr);
      try {
        const blob = await apiService.downloadCertificateFile(cert.id, 'pdf');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cert.verification_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (apiErr: any) {
        setError(`Download failed: ${apiErr.message || 'Unable to generate PDF'}`);
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadJpg = async (cert: CertificateRecord) => {
    setDownloading('jpg');
    setError('');
    try {
      await downloadCertificateAsJpg(cert);
    } catch (clientErr) {
      console.warn('Client JPG generation error, trying API fallback:', clientErr);
      try {
        const blob = await apiService.downloadCertificateFile(cert.id, 'jpg');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cert.verification_id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (apiErr: any) {
        setError(`Download failed: ${apiErr.message || 'Unable to generate JPG'}`);
      }
    } finally {
      setDownloading(null);
    }
  };

  return <div className="mx-auto flex max-w-6xl flex-col gap-7">
    <header><p className="text-xs font-bold uppercase tracking-[.24em] text-accent-primary">Verified credentials</p><h1 className="font-archivo text-3xl font-black uppercase">Certificates Vault</h1><p className="mt-2 text-sm text-text-secondary">Your hackathon, team and award details are locked from the official record.</p></header>
    {error && <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
    <section className="rounded-2xl border border-[var(--border-color)] bg-white/[.03] p-5">
      <div className="mb-4 flex items-center gap-2"><Plus size={18} className="text-accent-primary" /><h2 className="font-archivo font-bold uppercase">Available To Generate</h2></div>
      {loading ? <Loader2 className="animate-spin text-accent-primary" /> : available.length === 0 ? <p className="text-sm text-text-secondary">No published certificate is available for your completed hackathons yet.</p> : <div className="grid gap-3 md:grid-cols-2">{available.map((template) => <div key={template.id} className="rounded-xl border border-[var(--border-color)] p-4"><p className="font-bold">{template.certificate_type}</p><p className="mt-1 text-xs text-text-secondary">{template.recipient_type} template: {template.name}</p><button onClick={() => void generate(template)} disabled={workingId === template.id} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-primary px-3 py-2 text-xs font-bold text-black disabled:opacity-60">{workingId === template.id ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />} Generate certificate</button></div>)}</div>}
    </section>
    <section><div className="mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-accent-primary" /><h2 className="font-archivo font-bold uppercase">Issued Certificates</h2></div><div className="grid gap-5 md:grid-cols-2">{issued.map((certificate) => <article key={certificate.id} className="rounded-2xl border border-[var(--border-color)] bg-white/[.03] p-4"><CertificatePreview certificate={certificate} /><div className="mt-4"><p className="font-bold">{certificate.certificate_type}</p><p className="text-sm text-text-secondary">{certificate.hackathon_title}</p><p className="mt-2 font-mono text-[10px] text-accent-primary">{certificate.verification_id}</p><button onClick={() => setSelected(certificate)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent-primary/40 px-3 py-2 text-xs font-bold text-accent-primary"><Download size={14} /> View / Download</button></div></article>)}</div></section>
    {selected && (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4">
        <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-[var(--bg-primary)] p-6">
          <div className="mb-4 flex justify-between gap-4">
            <div>
              <h2 className="font-archivo text-xl font-bold uppercase">Certificate Preview</h2>
              <p className="text-xs text-text-secondary">Verification ID: {selected.verification_id}</p>
            </div>
            <button onClick={() => setSelected(null)} className="px-3 py-1 rounded bg-white/10 text-sm font-semibold hover:bg-white/20">Close</button>
          </div>
          <div className="certificate-print-target">
            <CertificatePreview certificate={selected} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => void handleDownloadPdf(selected)}
              disabled={downloading !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {downloading === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF (.pdf)'}
            </button>
            <button
              onClick={() => void handleDownloadJpg(selected)}
              disabled={downloading !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-accent-primary hover:bg-accent-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {downloading === 'jpg' ? <Loader2 size={15} className="animate-spin" /> : <FileImage size={15} />}
              {downloading === 'jpg' ? 'Generating JPG...' : 'Download JPG (.jpg)'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Printer size={15} /> Print / Browser PDF
            </button>
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            <CheckCircle2 size={13} className="mr-1 inline text-success" />
            Verified official record issued by CHMS engine.
          </p>
        </div>
      </div>
    )}
  </div>;
}
