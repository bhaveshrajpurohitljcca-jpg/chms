import { useEffect, useState } from 'react';
import { Download, FileImage, Loader2, ShieldCheck } from 'lucide-react';
import { apiService, type BackendHackathon, type CertificateRecord } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { downloadCertificateAsPdf, downloadCertificateAsJpg } from '@/utils/certificateGenerator';

export default function CoordinatorCertificateVaultPage() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [selected, setSelected] = useState('');
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await apiService.listCoordinatorCertificateVault(id);
      setRecords(result.data || []);
    } catch (e: any) {
      setError(e.message || 'Vault could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (record: CertificateRecord) => {
    setDownloadingKey(`${record.id}-pdf`);
    setError('');
    try {
      await downloadCertificateAsPdf(record);
    } catch (clientErr) {
      console.warn('Client PDF generation error, trying API fallback:', clientErr);
      try {
        const blob = await apiService.downloadCertificateFile(record.id, 'pdf');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.verification_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (apiErr: any) {
        setError(`Download failed: ${apiErr.message || 'Unable to download PDF'}`);
      }
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadJpg = async (record: CertificateRecord) => {
    setDownloadingKey(`${record.id}-jpg`);
    setError('');
    try {
      await downloadCertificateAsJpg(record);
    } catch (clientErr) {
      console.warn('Client JPG generation error, trying API fallback:', clientErr);
      try {
        const blob = await apiService.downloadCertificateFile(record.id, 'jpg');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.verification_id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (apiErr: any) {
        setError(`Download failed: ${apiErr.message || 'Unable to download JPG'}`);
      }
    } finally {
      setDownloadingKey(null);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const [all, assignments] = await Promise.all([
          apiService.listHackathons(),
          apiService.listCoordinatorAssignments()
        ]);
        const ids = (assignments.data || [])
          .filter((a: any) => String(a.coordinator_id || a.coordinatorId) === String(user?.id))
          .map((a: any) => a.hackathon_id || a.hackathonId);
        const scoped = user?.role === 'admin' ? all.data || [] : (all.data || []).filter((h) => ids.includes(h.id));
        setHackathons(scoped);
        if (scoped[0]) {
          setSelected(scoped[0].id);
          await load(scoped[0].id);
        }
      } catch (e: any) {
        setError(e.message || 'Hackathons could not be loaded.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, user?.role]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.24em] text-accent-primary">Coordinator workspace</p>
        <h1 className="font-archivo text-3xl font-black uppercase">Certificate Vault</h1>
        <p className="mt-2 text-sm text-text-secondary">Bulk-issued immutable records and permanent PDF & JPG artifacts.</p>
      </header>

      {error && <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          void load(e.target.value);
        }}
        className="w-full max-w-lg rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
      >
        {hackathons.map((h) => (
          <option key={h.id} value={h.id}>{h.title}</option>
        ))}
      </select>

      {loading ? (
        <Loader2 className="animate-spin text-accent-primary" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-color)] text-xs uppercase text-text-secondary">
              <tr>
                <th className="p-4">Recipient</th>
                <th className="p-4">Type</th>
                <th className="p-4">Verification ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Download Formats</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-[var(--border-color)] last:border-0">
                  <td className="p-4 font-semibold">{record.recipient_name}</td>
                  <td className="p-4">{record.certificate_type}</td>
                  <td className="p-4 font-mono text-xs text-accent-primary">{record.verification_id}</td>
                  <td className="p-4">
                    <ShieldCheck size={15} className={record.revoked_at ? 'text-danger' : 'text-success'} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void handleDownloadPdf(record)}
                        disabled={downloadingKey !== null}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-accent-primary/10 border border-accent-primary/30 text-xs font-bold text-accent-primary hover:bg-accent-primary hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {downloadingKey === `${record.id}-pdf` ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} PDF
                      </button>
                      <button
                        onClick={() => void handleDownloadJpg(record)}
                        disabled={downloadingKey !== null}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-accent-secondary/10 border border-accent-secondary/30 text-xs font-bold text-accent-secondary hover:bg-accent-secondary hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {downloadingKey === `${record.id}-jpg` ? <Loader2 size={13} className="animate-spin" /> : <FileImage size={13} />} JPG
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && <p className="p-6 text-sm text-text-secondary">No certificates have been issued for this hackathon yet.</p>}
        </div>
      )}
    </div>
  );
}
