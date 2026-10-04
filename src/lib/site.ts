/**
 * Datos centrales del sitio DIAGHU Asesor Migratorio.
 *
 * ⚠️ El teléfono es el real facilitado por el cliente. El correo y la dirección
 * siguen siendo PLACEHOLDER: confírmalos y cámbialos aquí (se actualiza todo el sitio).
 */
export const SITE = {
  name: "DIAGHU",
  legalName: "DIAGHU Asesor Migratorio",
  /** Solo dígitos, con código de país, sin +, espacios ni guiones. */
  whatsappNumber: "593989632349",
  phoneDisplay: "+593 98 963 23 49",
  email: "bonjour@diaghu.com",
  address: "Port-au-Prince, Haïti",
} as const;

export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
