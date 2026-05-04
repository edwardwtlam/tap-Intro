import { ProfileRow } from '../types';

export function generateVCard(profile: ProfileRow): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//CardLink//NFC Digital Business Card//EN',
  ];

  // Name: FN (full name) and N (structured: LastName;FirstName)
  const nameParts = profile.name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || '';
  lines.push(`FN:${profile.name}`);
  lines.push(`N:${lastName};${firstName};;;`);

  if (profile.title) lines.push(`TITLE:${profile.title}`);
  if (profile.company) lines.push(`ORG:${profile.company}`);
  if (profile.email) lines.push(`EMAIL;type=INTERNET;type=WORK:${profile.email}`);
  if (profile.phone) lines.push(`TEL;type=CELL;type=VOICE:${profile.phone}`);
  if (profile.profile_image) lines.push(`PHOTO;VALUE=URI:${profile.profile_image}`);
  if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, '\\n')}`);

  // Social links as URL entries
  if (profile.social_links && profile.social_links.length > 0) {
    for (const link of profile.social_links) {
      if (link.url) {
        lines.push(`URL;type=${link.platform}:${link.url}`);
      }
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(profile: ProfileRow): void {
  const vcard = generateVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
