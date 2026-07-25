import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ClaimPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [state, setState] = useState<'loading' | 'valid' | 'invalid' | 'claimed' | 'claiming' | 'success'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code || authLoading) return;
    verifyCode();
  }, [code, authLoading]);

  const verifyCode = async () => {
    setState('loading');
    const { data, error: err } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code!.toUpperCase())
      .maybeSingle();

    if (err || !data) {
      setState('invalid');
      return;
    }
    if (data.status === 'claimed') {
      setState('claimed');
      return;
    }
    setState('valid');
  };

  const handleClaim = async () => {
    if (!user || !code) return;
    setState('claiming');
    setError('');

    // Generate a card_url_id for this user
    const cardUrlId = `card-${Date.now()}`;

    const { error: claimErr } = await supabase
      .from('activation_codes')
      .update({
        status: 'claimed',
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        card_url_id: cardUrlId,
      })
      .eq('code', code.toUpperCase())
      .eq('status', 'unused');

    if (claimErr) {
      setError(claimErr.message);
      setState('valid');
      return;
    }

    // Create or update the user's profile with the card_url_id
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('profiles')
        .update({ card_url_id: cardUrlId })
        .eq('id', user.id);
    } else {
      await supabase.from('profiles').insert([{
        id: user.id,
        card_url_id: cardUrlId,
        name: '',
        email: user.email || '',
      }]);
    }

    setState('success');
    setTimeout(() => navigate('/dashboard'), 3000);
  };

  // --- Loading states ---
  if (authLoading || state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verifying activation code...</p>
        </div>
      </div>
    );
  }

  // --- Invalid code ---
  if (state === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShieldCheck size={40} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid Code</h1>
          <p className="text-gray-400 text-sm mb-6">
            This activation code doesn't exist. Please check the card and try again.
          </p>
          <Link to="/" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // --- Already claimed ---
  if (state === 'claimed') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle size={40} className="text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Already Claimed</h1>
          <p className="text-gray-400 text-sm mb-6">
            This activation code has already been used. If this is your card, please sign in to manage your profile.
          </p>
          <Link to="/login" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // --- Claiming in progress ---
  if (state === 'claiming') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Activating your card...</p>
        </div>
      </div>
    );
  }

  // --- Success ---
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Card Activated!</h1>
          <p className="text-gray-400 text-sm mb-6">
            Your Tapdex card is now linked to your account. Redirecting to your dashboard...
          </p>
          <Link to="/dashboard" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- Valid code: not logged in → prompt ---
  if (state === 'valid' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShieldCheck size={40} className="text-sky-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Activate Your Tapdex Card</h1>
          <p className="text-gray-400 text-sm mb-2">
            Code <span className="text-sky-400 font-mono">{code?.toUpperCase()}</span> is valid.
          </p>
          <p className="text-gray-500 text-xs mb-8">
            Create an account or sign in to claim this card and start managing your digital profile.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={`/login?claim=${code}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl transition-colors"
            >
              <LogIn size={18} />
              Sign In / Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Valid code + logged in → claim ---
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
          <img src="/tapdex-logo.svg" alt="Tapdex" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Claim Your Tapdex Card</h1>
        <p className="text-gray-400 text-sm mb-2">
          Signed in as <span className="text-white">{user?.email}</span>
        </p>
        <p className="text-gray-500 text-xs mb-8">
          Activation code: <span className="text-sky-400 font-mono">{code?.toUpperCase()}</span>
          <br />
          Claiming links this card to your account with lifetime free data management.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleClaim}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors"
        >
          <UserPlus size={18} />
          Activate My Card
        </button>

        <p className="text-gray-600 text-xs mt-6">
          Not you? <Link to="/login" className="text-sky-400 hover:text-sky-300 transition-colors">Switch account</Link>
        </p>
      </div>
    </div>
  );
}
