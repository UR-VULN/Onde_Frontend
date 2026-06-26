export function maskEmail(email: string): string {
  if (!email) return '';
  const at = email.indexOf('@');
  if (at <= 0) return '***';

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const maskedLocal = local.length <= 2 ? `${local.charAt(0)}***` : `${local.slice(0, 2)}***`;
  const dot = domain.lastIndexOf('.');
  if (dot <= 0) return `${maskedLocal}@***`;

  const domainName = domain.slice(0, dot);
  const tld = domain.slice(dot);
  const maskedDomain = domainName.length <= 2 ? `**${tld}` : `${domainName.slice(0, 2)}***${tld}`;
  return `${maskedLocal}@${maskedDomain}`;
}

export function maskName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.length === 1) return '*';
  if (trimmed.length === 2) return `${trimmed.charAt(0)}*`;
  return `${trimmed.charAt(0)}${'*'.repeat(trimmed.length - 2)}${trimmed.charAt(trimmed.length - 1)}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return '***';
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-***-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  const trimmed = accountNumber.trim();
  if (trimmed.length <= 4) return '****';
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length >= 3) {
      return parts
        .map((part, index) => (index === 0 || index === parts.length - 1 ? part : '*'.repeat(part.length)))
        .join('-');
    }
  }
  if (trimmed.length < 8) return '****';
  return `${trimmed.slice(0, 3)}-***-${trimmed.slice(-4)}`;
}

export function maskBankName(bankName: string): string {
  if (!bankName) return '';
  const trimmed = bankName.trim();
  if (trimmed.length <= 2) return `${trimmed.charAt(0)}*`;
  return `${trimmed.slice(0, 2)}***`;
}
