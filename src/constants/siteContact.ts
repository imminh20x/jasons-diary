const trimValue = (value: string | undefined): string => value?.trim() ?? '';

const PUBLIC_DEFAULTS = {
  email: 'you@example.com',
  phone: '+10000000000',
  github: 'https://github.com/your-username',
  linkedin: 'https://linkedin.com/in/your-username',
  facebook: '',
} as const;

export const SITE_CONTACT = {
  email: trimValue(import.meta.env.VITE_CONTACT_EMAIL) || PUBLIC_DEFAULTS.email,
  phone: trimValue(import.meta.env.VITE_CONTACT_PHONE) || PUBLIC_DEFAULTS.phone,
  github: trimValue(import.meta.env.VITE_GITHUB_URL) || PUBLIC_DEFAULTS.github,
  linkedin: trimValue(import.meta.env.VITE_LINKEDIN_URL) || PUBLIC_DEFAULTS.linkedin,
  facebook: trimValue(import.meta.env.VITE_FACEBOOK_URL) || PUBLIC_DEFAULTS.facebook,
} as const;

export const hasContactEmail = (): boolean => SITE_CONTACT.email.length > 0;
export const hasContactPhone = (): boolean => SITE_CONTACT.phone.length > 0;

export const contactEmailHref = (): string =>
  SITE_CONTACT.email ? `mailto:${SITE_CONTACT.email}` : '';

export const contactPhoneHref = (): string => {
  if (!SITE_CONTACT.phone) {
    return '';
  }

  const normalized = SITE_CONTACT.phone.replace(/\s+/g, '');
  return normalized.startsWith('tel:') ? normalized : `tel:${normalized}`;
};
