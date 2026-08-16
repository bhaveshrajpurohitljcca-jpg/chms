import { useEffect, useRef, useState } from 'react';
import { MousePointer2, Palette, Type, X } from 'lucide-react';

export type CertificateCanvasField = {
  key: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};

const fieldLabels: Record<string, string> = {
  student_name: 'Student name',
  team_name: 'Team name',
  hackathon_title: 'Hackathon title',
  certificate_type: 'Certificate type',
  issue_date: 'Issue date',
  verification_id: 'Verification ID',
  award_label: 'Award label',
};

const previewValues: Record<string, string> = {
  student_name: 'Aarav Sharma',
  team_name: 'Team Innovators',
  hackathon_title: 'HexaThon 2026',
  certificate_type: 'Participation Certificate',
  issue_date: '16 Aug 2026',
  verification_id: 'CERT-2026-A7F9E2',
  award_label: 'Winner',
};

type Props = {
  backgroundFile: File | null;
  fields: CertificateCanvasField[];
  onChange: (fields: CertificateCanvasField[]) => void;
};

export function CertificateCanvasDesigner({ backgroundFile, fields, onChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState(fields[0]?.key || '');
  const [previewUrl, setPreviewUrl] = useState('');
  const selectedField = fields.find((field) => field.key === selectedKey);

  useEffect(() => {
    if (!backgroundFile || !backgroundFile.type.startsWith('image/')) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(backgroundFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [backgroundFile]);

  const update = (key: string, updates: Partial<CertificateCanvasField>) => {
    onChange(fields.map((field) => field.key === key ? { ...field, ...updates } : field));
  };

  const add = (key: string) => {
    if (fields.some((field) => field.key === key)) return;
    onChange([...fields, { key, x: 50, y: 50, fontSize: 16, color: '#302312' }]);
    setSelectedKey(key);
  };

  const remove = (key: string) => {
    onChange(fields.filter((field) => field.key !== key));
    setSelectedKey(fields.find((field) => field.key !== key)?.key || '');
  };

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, key: string) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedKey(key);
    const move = (moveEvent: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      update(key, {
        x: Math.round(Math.max(4, Math.min(96, ((moveEvent.clientX - rect.left) / rect.width) * 100))),
        y: Math.round(Math.max(4, Math.min(96, ((moveEvent.clientY - rect.top) / rect.height) * 100))),
      });
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
  };

  return <div className="grid gap-4 xl:grid-cols-[170px_minmax(0,1fr)_190px]">
    <aside className="rounded-xl border border-[var(--border-color)] bg-black/[.08] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Add fields</p>
      <div className="mt-3 grid gap-2">
        {Object.keys(fieldLabels).filter((key) => !fields.some((field) => field.key === key)).map((key) => (
          <button key={key} onClick={() => add(key)} className="rounded-lg border border-[var(--border-color)] px-2 py-2 text-left text-xs hover:border-accent-primary">+ {fieldLabels[key]}</button>
        ))}
      </div>
    </aside>
    <div>
      <div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Drag fields on canvas</p><MousePointer2 size={15} className="text-accent-primary" /></div>
      <div ref={canvasRef} className="relative aspect-[1.414/1] select-none overflow-hidden rounded-xl bg-[#f7f0dc] shadow-inner" style={{ touchAction: 'none' }}>
        {previewUrl ? <img src={previewUrl} alt="Certificate background preview" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff6dc,#d9b06d)]" />}
        <div className="absolute inset-3 border-2 border-[#8a6429]/70" />
        {fields.map((field) => <button key={field.key} onPointerDown={(event) => startDrag(event, field.key)} className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 font-serif font-semibold outline-none ${selectedKey === field.key ? 'bg-accent-primary/20 ring-2 ring-accent-primary' : 'hover:ring-1 hover:ring-accent-primary/70'}`} style={{ left: `${field.x}%`, top: `${field.y}%`, fontSize: `${field.fontSize}px`, color: field.color }}>{previewValues[field.key]}</button>)}
      </div>
      <p className="mt-2 text-[11px] text-text-secondary">Preview values are examples. Issued certificates receive locked server data.</p>
    </div>
    <aside className="rounded-xl border border-[var(--border-color)] bg-black/[.08] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Field settings</p>
      {selectedField ? <div className="mt-3 grid gap-3"><p className="text-sm font-bold">{fieldLabels[selectedField.key]}</p><label className="text-xs text-text-secondary"><Type size={13} className="mr-1 inline" />Text size<input type="range" min="9" max="42" value={selectedField.fontSize} onChange={(event) => update(selectedField.key, { fontSize: Number(event.target.value) })} className="mt-2 w-full" /></label><label className="text-xs text-text-secondary"><Palette size={13} className="mr-1 inline" />Color<input type="color" value={selectedField.color} onChange={(event) => update(selectedField.key, { color: event.target.value })} className="mt-2 block h-9 w-full rounded border border-[var(--border-color)] bg-transparent" /></label><button onClick={() => remove(selectedField.key)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-danger/50 px-2 py-2 text-xs font-bold text-danger"><X size={13} /> Remove</button></div> : <p className="mt-3 text-xs text-text-secondary">Select a field to edit it.</p>}
    </aside>
  </div>;
}
