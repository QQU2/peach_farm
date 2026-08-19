export function generateOrderNo() {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(2, 14); // yyMMddHHmmss
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `${stamp}${random}`;
}
