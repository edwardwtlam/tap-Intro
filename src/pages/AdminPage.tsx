import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Copy, CheckCircle, Clock, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ActivationCode {
  code: string;
  etsy_order_id: string | null;
  status: 'unused' | 'claimed';
  claimed_at: string | null;
  card_url_id: string | null;
  created_at: string;
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `TDX-${code}`;
}

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) loadCodes();
  }, [isAuthenticated, authLoading]);

  const loadCodes = async () => {
    const { data } = await supabase
      .from('activation_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setCodes(data);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setCopied(false);
    const code = generateCode();

    const { error } = await supabase.from('activation_codes').insert([{ code }]);

    if (error) {
      // If duplicate (extremely unlikely), retry once
      const retryCode = generateCode();
      await supabase.from('activation_codes').insert([{ code: retryCode }]);
      setLastGenerated(retryCode);
    } else {
      setLastGenerated(code);
    }

    setGenerating(false);
    loadCodes();
  };

  const handleCopy = () => {
    if (!lastGenerated) return;
    navigator.clipboard.writeText(lastGenerated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-sky-400 animate-spin" />
      </div>
    );
  }

  const unusedCount = codes.filter((c) => c.status === 'unused').length;
  const claimedCount = codes.filter((c) => c.status === 'claimed').length;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Generate Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-bold text-white mb-2">Generate Activation Code</h2>
          <p className="text-gray-400 text-sm mb-6">
            Create a code when you receive an Etsy order. Write it on a card and ship with the NFC card.
          </p>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors mb-4"
          >
            {generating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {generating ? 'Generating...' : 'Generate New Code'}
          </button>

          {lastGenerated && (
            <div className="flex items-center gap-4 p-4 bg-sky-500/10 border border-sky-500/50 rounded-xl">
              <code className="text-2xl font-bold text-sky-400 tracking-wider font-mono">{lastGenerated}</code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm rounded-lg transition-colors"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <span className="text-gray-500 text-xs ml-auto">
                NFC URL: <span className="text-gray-400 font-mono">tapdex.com/claim/{lastGenerated}</span>
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-400" />
              <span className="text-gray-400 text-sm">Unused</span>
            </div>
            <span className="text-3xl font-bold text-white">{unusedCount}</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-gray-400 text-sm">Claimed</span>
            </div>
            <span className="text-3xl font-bold text-white">{claimedCount}</span>
          </div>
        </div>

        {/* Codes Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">All Codes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left">
                  <th className="py-3 px-5 font-medium">Code</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium">Claimed At</th>
                  <th className="py-3 px-5 font-medium">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {codes.map((c) => (
                  <tr key={c.code} className="hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-5">
                      <code className="text-white font-mono text-xs">{c.code}</code>
                    </td>
                    <td className="py-3 px-5">
                      {c.status === 'unused' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                          <Clock size={12} /> Unused
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle size={12} /> Claimed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-gray-500 text-xs">
                      {c.claimed_at ? new Date(c.claimed_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-5">
                      {c.status === 'claimed' ? (
                        <Link to={`/profile/${c.card_url_id}`} className="text-sky-400 hover:text-sky-300 text-xs inline-flex items-center gap-1">
                          View <ExternalLink size={10} />
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
