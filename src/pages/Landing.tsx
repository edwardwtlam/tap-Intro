import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProfileRow } from '../types';

export default function Landing() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .limit(6)
      .then(({ data }) => {
        if (data) setProfiles(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <img src="/tap-intro-logo.svg" alt="Tap-Intro Logo" className="w-10 h-10 object-contain" />
              <span className="text-lg font-bold text-white">Tap-Intro</span>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </nav>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
            Connect instantly.
            <br />
            <span className="text-sky-400">Tap into the future.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            NFC digital business cards that work everywhere. Share your contact with a single tap. No app required. Professional identity, always in reach.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl transition-colors"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/order"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Smartphone,
              title: 'Instant Sharing',
              desc: 'Share your card via NFC tap, QR code, or a simple link. No app required for recipients.',
            },
            {
              icon: Smartphone,
              title: 'Always Updated',
              desc: 'Change your info once and it updates everywhere. No more outdated cards in circulation.',
            },
            {
              icon: Zap,
              title: 'Professional Design',
              desc: 'Choose from beautiful themes and accent colors. Make a lasting first impression.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-sky-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {profiles.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">See it in action</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <Link
                key={p.id}
                to={`/profile/${p.card_url_id}`}
                className="group bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  {p.profile_image ? (
                    <img
                      src={p.profile_image}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">{p.name}</p>
                    <p className="text-gray-500 text-xs">{p.title}</p>
                  </div>
                </div>
                {(p.social_links as { platform: string }[])?.length > 0 && (
                  <div className="flex gap-1.5">
                    {(p.social_links as { platform: string }[]).slice(0, 4).map((_l, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/tap-intro-logo.svg" alt="Tap-Intro Logo" className="w-7 h-7 object-contain" />
            <span className="text-sm font-semibold text-white">Tap-Intro</span>
          </div>
          <p className="text-xs text-gray-500">www.tap-intro.com</p>
        </div>
      </footer>
    </div>
  );
}
