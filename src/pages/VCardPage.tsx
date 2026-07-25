import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProfileRow } from '../types';
import { generateVCard } from '../utils/vcard';

export default function VCardPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<'loading' | 'downloaded' | 'error'>('loading');

  useEffect(() => {
    if (!id) return;

    const fetchAndDownload = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('card_url_id', id)
        .maybeSingle();

      if (error || !data) {
        setStatus('error');
        return;
      }

      const profile = data as ProfileRow;
      const vcard = generateVCard(profile);
      const filename = `${profile.name.replace(/\s+/g, '_')}.vcf`;

      // Use an anchor element to trigger download
      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);

      setStatus('downloaded');
    };

    fetchAndDownload();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center px-4">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="text-sky-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Opening Contact...</h1>
            <p className="text-gray-400 text-sm">Your phone should prompt to save this contact.</p>
          </>
        )}

        {status === 'downloaded' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Download size={28} className="text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Contact Downloaded</h1>
            <p className="text-gray-400 text-sm mb-6">
              Open the file to save to your phone book.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Contact Not Found</h1>
            <p className="text-gray-400 text-sm mb-6">This card doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Go Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
