import { useState } from 'react';
import Modal from './Modal';
import { getErrorMessage } from '../api';

// Used for both creating and editing a playlist. `onSubmit(values)` should throw on failure.
export default function PlaylistFormModal({ initial, onSubmit, onClose }) {
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic || false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Give your playlist a name');
    setSaving(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), isPublic });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit playlist' : 'Create playlist'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block text-sm font-semibold">
          Name
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="My playlist"
            className="mt-1 w-full rounded-md bg-hover px-3 py-2.5 font-normal outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white" />
        </label>
        <label className="block text-sm font-semibold">
          Description <span className="font-normal text-muted">(optional)</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} rows={3}
            className="mt-1 w-full resize-none rounded-md bg-hover px-3 py-2.5 font-normal outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 accent-[#1db954]" />
          Make public (appears under Featured playlists for other users)
        </label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={saving} className="w-full rounded-full bg-brand py-2.5 font-bold text-black transition hover:scale-[1.02] hover:bg-brand-light disabled:opacity-60">
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
        </button>
      </form>
    </Modal>
  );
}
