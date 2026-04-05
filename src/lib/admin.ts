// Admin accounts with unlimited access
const ADMIN_EMAILS = new Set([
  "ivan27chen@gmail.com",
]);

export function isAdmin(email: string | undefined | null): boolean {
  return Boolean(email && ADMIN_EMAILS.has(email));
}
