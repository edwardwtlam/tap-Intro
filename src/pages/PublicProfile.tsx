import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, Mail, Share2, ChevronLeft, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProfileRow } from '../types';
import SocialIcon from '../components/SocialIcon';
import { downloadVCard } from '../utils/vcard';

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    supabase
      .from('profiles')
      .select('*')
      .eq('card_url_id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setProfile(data);
        }
        setLoading(false);
      });
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-sky-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">This card doesn't exist or has been removed.</p>
          <Link to="/" className="text-sky-400 hover:text-sky-300 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const isDark = profile.theme === 'dark';
  const isGradient = profile.theme === 'gradient';

  const bgClass = isGradient
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
    : isDark
      ? 'bg-gray-950'
      : 'bg-gray-50';

  const cardBg = isGradient
    ? 'bg-white/5 backdrop-blur-xl border border-white/10'
    : isDark
      ? 'bg-gray-900 border border-gray-800'
      : 'bg-white border border-gray-200 shadow-lg';

  const textColor = isDark || isGradient ? 'text-white' : 'text-gray-900';
  const subtextColor = isDark || isGradient ? 'text-gray-400' : 'text-gray-500';
  const linkBg = isDark || isGradient
    ? 'bg-white/5 hover:bg-white/10 border border-white/10'
    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200';
  const linkText = isDark || isGradient ? 'text-gray-200' : 'text-gray-700';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      {isGradient && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: profile.accent_color }}
          />
          <div
            className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
            style={{ backgroundColor: profile.accent_color, animationDelay: '1s' }}
          />
        </div>
      )}

      <div className="relative max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className={`flex items-center gap-1 text-sm ${subtextColor} hover:${textColor} transition-colors`}
          >
            <ChevronLeft size={16} />
            Home
          </Link>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-sm ${subtextColor} hover:${textColor} transition-colors`}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>

        <div className={`${cardBg} rounded-2xl p-8 transition-all duration-500`}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-transparent"
                style={{ ['--tw-ring-color' as string]: profile.accent_color }}
              >
                {profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: profile.accent_color,
                  borderColor: isDark || isGradient ? '#111827' : '#ffffff',
                }}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className={`text-2xl font-bold ${textColor} mb-1`}>{profile.name}</h1>
            <p className={`text-sm font-medium ${subtextColor}`}>
              {profile.title}{profile.company ? <><span className="mx-1">&middot;</span>{profile.company}</> : null}
            </p>
          </div>

          {profile.bio && (
            <p className={`text-sm text-center leading-relaxed ${subtextColor} mb-6`}>
              {profile.bio}
            </p>
          )}

          <div className="flex gap-3 mb-3">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${linkBg} ${linkText}`}
              >
                <Mail size={16} />
                Email
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${linkBg} ${linkText}`}
              >
                <Phone size={16} />
                Call
              </a>
            )}
          </div>

          <button
            onClick={() => downloadVCard(profile)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-6"
            style={{
              backgroundColor: profile.accent_color,
              color: '#ffffff',
            }}
          >
            <UserPlus size={16} />
            Save to Contacts
          </button>

          {profile.social_links && profile.social_links.length > 0 && (
            <>
              <div className={`border-t ${isDark || isGradient ? 'border-white/10' : 'border-gray-200'} mb-6`} />
              <div className="space-y-2.5">
                {profile.social_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${linkBg}`}
                  >
                    <SocialIcon
                      platform={link.icon}
                      size={18}
                      className="transition-colors"
                      style={{ color: profile.accent_color }}
                    />
                    <span className={`text-sm font-medium ${linkText}`}>{link.platform}</span>
                    <span className={`ml-auto text-xs ${subtextColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Visit
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-auto pt-8 text-center">
          <p className={`text-xs ${subtextColor}`}>
            Tap a link to connect
          </p>
        </div>
      </div>
    </div>
  );
}
