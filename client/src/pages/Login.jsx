import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout, { Field, inputClass } from './AuthLayout';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!identifier.trim()) next.identifier = 'Enter your email or username';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const id = identifier.trim();
      await login(id.includes('@') ? { email: id, password } : { username: id, password });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Pick up where you left off."
      footer={<>Don&apos;t have an account? <Link to="/register" className="font-semibold text-white underline">Sign up</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email or username" error={errors.identifier}>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" autoFocus className={inputClass(errors.identifier)} />
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={`${inputClass(errors.password)} pr-10`} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        {formError && <p role="alert" className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-200">{formError}</p>}
        <button disabled={loading} className="w-full rounded-full bg-brand py-3 font-bold text-black transition hover:scale-[1.02] hover:bg-brand-light disabled:opacity-60">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
