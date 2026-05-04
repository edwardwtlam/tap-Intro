import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Briefcase,
  Building2,
  FileText,
  Mail,
  Phone,
  Link2,
  Plus,
  Trash2,
  Save,
  Eye,
  LogOut,
  Palette,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ProfileRow, SocialLink } from '../types';

const themeOptions = [
  { name: 'Dark Blue', bg: 'bg-gray-950', accent: 'text-sky-400', border: 'border-sky-500' },
  { name: 'Ocean', bg: 'bg-blue-950', accent: 'text-cyan-400', border: 'border-cyan-500' },
  { name: 'Forest', bg: 'bg-green-950', accent: 'text-emerald-400', border: 'border-emerald-500' },
];

export default function Dashboard() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    social_links: [] as SocialLink[],
    theme: 'Dark Blue',
    avatar_url: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            title: data.title || '',
            company: data.company || '',
            bio: data.bio || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            social_links: data.social_links || [],
            theme: data.theme || 'Dark Blue',
            avatar_url: data.avatar_url || '',
          });
        } else {
          const newCard = {
            user_id: user.id,
            card_url_id: `card-${Date.now()}`,
            full_name: '',
            title: '',
            company: '',
            bio: '',
            email: user.email || '',
            phone: '',
            website: '',
            social_links: [],
            theme: 'Dark Blue',
            avatar_url: '',
          };

          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert([newCard])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(created);
          setFormData({ ...newCard });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const updated = [...formData.social_links];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, social_links: updated }));
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, { platform: '', url: '' }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          title: formData.title,
          company: formData.company,
          bio: formData.bio,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          social_links: formData.social_links,
          theme: formData.theme,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, ...formData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/tap-intro-logo.png" alt="Tap-Intro Logo" className="w-8 h-8 object-contain" />
            <span className="text-sm font-bold text-white">Tap-Intro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${profile?.card_url_id}`}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-gray-800"
            >
              <Eye size={14} />
              Preview
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg bg-gray-800"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-20">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <Palette size={16} />
                Theme
              </h3>
              <div className="space-y-2">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setFormData((prev) => ({ ...prev, theme: theme.name }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.theme === theme.name
                        ? `${theme.bg} ${theme.accent} border ${theme.border}`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Profile Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder="Your Full Name"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                      placeholder="Job Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder="Tell people about yourself"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Mail size={20} />
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder="Email"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder="Phone Number"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Link2 size={18} className="text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder="Website URL"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Social Links</h2>

              <div className="space-y-3 mb-4">
                {formData.social_links.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => handleSocialLinkChange(idx, 'platform', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                      placeholder="Platform (e.g., LinkedIn)"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                      placeholder="Profile URL"
                    />
                    <button
                      onClick={() => removeSocialLink(idx)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addSocialLink}
                className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
              >
                <Plus size={16} />
                Add Social Link
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
