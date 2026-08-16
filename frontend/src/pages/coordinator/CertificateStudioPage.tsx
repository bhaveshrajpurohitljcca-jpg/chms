import { useEffect, useState } from 'react';
import { FileUp, Loader2, Plus, Save, Send, Trash2 } from 'lucide-react';
import { apiService, type BackendHackathon, type CertificateTemplateRecord } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { CertificateCanvasDesigner, type CertificateCanvasField } from '@/components/coordinator/CertificateCanvasDesigner';

const standardFields: CertificateCanvasField[] = [
  { key: 'student_name', x: 50, y: 48, fontSize: 26, color: '#302312', fontFamily: 'Georgia', fontWeight: 700, opacity: 1, rotation: 0, visible: true },
  { key: 'team_name', x: 50, y: 58, fontSize: 16, color: '#302312' },
  { key: 'hackathon_title', x: 50, y: 68, fontSize: 16, color: '#302312' },
  { key: 'verification_id', x: 50, y: 85, fontSize: 11, color: '#302312' },
];

export default function CertificateStudioPage() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<BackendHackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [templates, setTemplates] = useState<CertificateTemplateRecord[]>([]);
  const [name, setName] = useState('Participation Certificate');
  const [type, setType] = useState('Participation Certificate');
  const [recipient, setRecipient] = useState<'participant' | 'coordinator'>('participant');
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<CertificateCanvasField[]>(standardFields);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState('');

  const loadTemplates = async (id: string) => {
    if (!id) return;
    const response = await apiService.listCertificateTemplates(id);
    setTemplates(response.data || []);
  };

  useEffect(() => {
    void (async () => {
      try {
        const [all, assignments] = await Promise.all([apiService.listHackathons(), apiService.listCoordinatorAssignments()]);
        const assigned = (assignments.data || []).filter((item: any) => item.coordinator_id === user?.id).map((item: any) => item.hackathon_id);
        const scoped = user?.role === 'admin' ? all.data || [] : (all.data || []).filter((item) => assigned.includes(item.id));
        setHackathons(scoped);
        if (scoped[0]) {
          setSelectedHackathon(scoped[0].id);
          await loadTemplates(scoped[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Assigned hackathons could not be loaded.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, user?.role]);

  const create = async () => {
    if (!selectedHackathon || !file) return;
    setSaving(true);
    setError('');
    try {
      const created = editingId ? await apiService.updateCertificateTemplate(editingId, {
        name, certificate_type: type, recipient_type: recipient, field_layout: fields,
      }) : await apiService.createCertificateTemplate({
        hackathon_id: selectedHackathon,
        name,
        recipient_type: recipient,
        certificate_type: type,
        field_layout: fields,
      });
      if (created.data && file) await apiService.uploadCertificateBackground(created.data.id, file);
      setMessage(editingId ? 'Draft updated successfully.' : 'Template saved as draft.');
      setEditingId(created.data?.id || editingId);
      await loadTemplates(selectedHackathon);
    } catch (err: any) {
      setError(err.message || 'Template could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const openTemplate = (template: CertificateTemplateRecord) => {
    setEditingId(template.id); setName(template.name); setType(template.certificate_type); setRecipient(template.recipient_type); setFields(template.field_layout as CertificateCanvasField[]); setBackgroundUrl(template.background_url || ''); setFile(null); setMessage(`Editing draft: ${template.name}`); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const newTemplate = () => { setEditingId(null); setName('Participation Certificate'); setType('Participation Certificate'); setRecipient('participant'); setFields(standardFields); setFile(null); setBackgroundUrl(''); setMessage('New draft started.'); };
  const removeTemplate = async (template: CertificateTemplateRecord) => {
    if (!window.confirm(`Delete draft "${template.name}"?`)) return;
    setError('');
    try {
      await apiService.deleteCertificateTemplate(template.id);
      if (editingId === template.id) newTemplate();
      setMessage('Draft deleted successfully.');
      await loadTemplates(selectedHackathon);
    } catch (err: any) { setError(err.message || 'Template could not be deleted.'); }
  };

  const publish = async (template: CertificateTemplateRecord) => {
    setError('');
    try {
      await apiService.updateCertificateTemplate(template.id, { is_published: !template.is_published });
      await loadTemplates(selectedHackathon);
    } catch (err: any) {
      setError(err.message || 'Template status could not be updated.');
    }
  };

  return <div className="mx-auto flex max-w-6xl flex-col gap-7">
    <header>
      <p className="text-xs font-bold uppercase tracking-[.24em] text-accent-primary">Coordinator workspace</p>
      <h1 className="font-archivo text-3xl font-black uppercase">Certificate Studio</h1>
      <p className="mt-2 text-sm text-text-secondary">Publish verified templates for participants and assigned coordinators. Values are issued from server records.</p>
    </header>
    {error && <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
    {message && <p className="rounded-lg border border-accent-primary/40 bg-accent-primary/10 p-3 text-sm text-accent-primary">{message}</p>}
    <section className="rounded-2xl border border-[var(--border-color)] bg-white/[.03] p-5">
      <label className="text-xs text-text-secondary">Assigned hackathon</label>
      <select value={selectedHackathon} onChange={(event) => { setSelectedHackathon(event.target.value); void loadTemplates(event.target.value); }} className="mt-1 w-full max-w-lg rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm">
        {hackathons.map((hackathon) => <option key={hackathon.id} value={hackathon.id}>{hackathon.title}</option>)}
      </select>
    </section>
    <section className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
      <div className="rounded-2xl border border-[var(--border-color)] bg-white/[.03] p-5">
        <div className="mb-4 flex items-center gap-2"><Plus size={18} className="text-accent-primary" /><h2 className="font-archivo font-bold uppercase">New Template</h2></div>
        <div className="grid gap-4">
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm" placeholder="Template name" />
          <input value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm" placeholder="Certificate type" />
          <select value={recipient} onChange={(e) => setRecipient(e.target.value as 'participant' | 'coordinator')} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm"><option value="participant">Hackathon participants</option><option value="coordinator">Assigned coordinators</option></select>
          <label className="rounded-lg border border-dashed border-accent-primary/50 p-4 text-sm"><FileUp size={18} className="mr-2 inline text-accent-primary" />Upload PNG/JPG background<input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 block text-xs" /></label>
          <p className="text-xs text-text-secondary">Use the canvas below to position and style each dynamic field before saving.</p>
          <div className="flex flex-wrap gap-2"><button onClick={() => void create()} disabled={saving || !selectedHackathon || (!file && !editingId)} className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-bold text-black disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {editingId ? 'Save draft changes' : 'Save draft'}</button>{editingId && <button onClick={newTemplate} className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm font-bold">New template</button>}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border-color)] bg-white/[.03] p-5"><h2 className="font-archivo font-bold uppercase">Publishing Rules</h2><ul className="mt-4 space-y-3 text-sm text-text-secondary"><li>Participant certificates unlock after results are published or the event ends.</li><li>Coordinator certificates unlock from assignment history.</li><li>Students can only correct their displayed name; all award and team data stays locked.</li><li>Every generated certificate receives a public verification ID.</li></ul></div>
    </section>
    <section className="rounded-2xl border border-[var(--border-color)] bg-white/[.03] p-5">
      <div className="mb-4"><h2 className="font-archivo font-bold uppercase">Certificate Canvas</h2><p className="mt-1 text-xs text-text-secondary">Upload a background above, then drag text fields onto the exact position you want.</p></div>
      <CertificateCanvasDesigner backgroundFile={file} backgroundUrl={backgroundUrl} fields={fields} onChange={setFields} />
    </section>
    <section><h2 className="mb-4 font-archivo font-bold uppercase">Saved Templates</h2>{loading ? <Loader2 className="animate-spin text-accent-primary" /> : <div className="grid gap-4 md:grid-cols-2">{templates.map((template) => <article key={template.id} className="rounded-xl border border-[var(--border-color)] bg-white/[.03] p-4"><button onClick={() => openTemplate(template)} className="text-left"><p className="font-bold">{template.name}</p><p className="mt-1 text-xs text-text-secondary">{template.certificate_type} · {template.recipient_type}</p></button><p className={`mt-3 text-xs font-bold uppercase ${template.is_published ? 'text-success' : 'text-yellow-400'}`}>{template.is_published ? 'Published' : 'Draft'}</p><div className="flex flex-wrap gap-2"><button onClick={() => openTemplate(template)} className="mt-4 rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs font-bold">Edit draft</button><button disabled={!template.background_url && !template.background_storage_path} onClick={() => void publish(template)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent-primary/50 px-3 py-2 text-xs font-bold text-accent-primary disabled:opacity-40"><Send size={14} /> {template.is_published ? 'Unpublish' : 'Publish'}</button>{!template.is_published && <button onClick={() => void removeTemplate(template)} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-danger/50 px-3 py-2 text-xs font-bold text-danger"><Trash2 size={14} /> Delete</button>}</div>{!template.background_url && !template.background_storage_path && <p className="mt-2 text-[11px] text-danger">Upload a background before publishing.</p>}</article>)}</div>}</section>
  </div>;
}
