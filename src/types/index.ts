export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ProfileRow {
  id: string;
  card_url_id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  profile_image: string;
  email: string;
  phone: string;
  social_links: SocialLink[];
  theme: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
}
