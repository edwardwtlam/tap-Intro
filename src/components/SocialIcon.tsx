import {
  Linkedin,
  Twitter,
  Github,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  Mail,
  type LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  globe: Globe,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  mail: Mail,
};

interface SocialIconProps {
  platform: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SocialIcon({ platform, size = 20, className, style }: SocialIconProps) {
  const Icon = iconMap[platform.toLowerCase()];
  if (!Icon) return <Globe size={size} className={className} style={style} />;
  return <Icon size={size} className={className} style={style} />;
}
