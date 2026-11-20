import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { Field, inputClass } from './AuthLayout';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(form.username.trim())) e.username = '3-30 characters: letters, numbers, . _ -';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await register({ username: form.username.trim(), email: form.email.trim(), password: form.password, role: form.role });
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start listening in a minute."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-white underline">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Username" error={errors.username}>
          <input value={form.username} onChange={set('username')} autoComplete="username" autoFocus className={inputClass(errors.username)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" className={inputClass(errors.email)} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" className={inputClass(errors.password)} />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" className={inputClass(errors.confirm)} />
        </Field>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Account type</legend>
          <div className="grid grid-cols-2 gap-2">
            {[['user', 'Listener'], ['artist', 'Artist']].map(([value, label]) => (
              <label key={value} className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold ring-1 transition ${form.role === value ? 'bg-brand/15 text-brand ring-brand' : 'bg-hover ring-white/10 hover:ring-white/40'}`}>
                <input type="radio" name="role" value={value} checked={form.role === value} onChange={set('role')} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Artists can add their own songs.</p>
        </fieldset>
        {formError && <p role="alert" className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-200">{formError}</p>}
        <button disabled={loading} className="w-full rounded-full bg-brand py-3 font-bold text-black transition hover:scale-[1.02] hover:bg-brand-light disabled:opacity-60">
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  );
}
