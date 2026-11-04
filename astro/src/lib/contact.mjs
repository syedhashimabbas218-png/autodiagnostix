// Contact form rules shared by the browser (inline errors) and the
// /api/contact endpoint (authoritative validation).

export const SUBJECTS = [
  ['general', 'General Inquiry'],
  ['quote', 'Request a Quote'],
  ['product', 'Product Information'],
  ['support', 'Technical Support'],
  ['parts', 'Spare Parts'],
  ['other', 'Other'],
];

export const LIMITS = { name: 120, email: 160, phone: 24, message: 3000 };

export const RULES = {
  name: v => v.length < 2 ? 'Please enter your full name.' : v.length > LIMITS.name ? 'Please shorten your name.' : '',
  email: v => !v ? 'Please enter your email address.' : (v.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) ? 'Please enter a valid email address, for example name@company.com.' : '',
  phone: v => v && !/^\+?[\d\s()-]{7,20}$/.test(v) ? 'Please enter a valid phone number, or leave it blank.' : '',
  subject: v => !SUBJECTS.some(([value]) => value === v) ? 'Please choose a subject.' : '',
  message: v => v.length < 10 ? 'Please tell us a little more (at least 10 characters).' : v.length > LIMITS.message ? `Please keep your message under ${LIMITS.message} characters.` : '',
};

export function validateContact(input = {}) {
  const values = {};
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    values[field] = String(input[field] ?? '').trim();
    const message = rule(values[field]);
    if (message) errors[field] = message;
  }
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function subjectLabel(value) {
  return SUBJECTS.find(([key]) => key === value)?.[1] ?? value;
}

export function composeMessage(values) {
  return [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.phone ? `Phone: ${values.phone}` : '',
    `Subject: ${subjectLabel(values.subject)}`,
    '',
    values.message,
    '',
    '(Sent from the autodiagnostix.com.pk contact form)',
  ].filter((line, index) => line || index > 3).join('\n');
}
