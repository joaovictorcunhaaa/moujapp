export const SITE_LABELS = {
  abdomen_left: 'abdômen esquerdo',
  abdomen_right: 'abdômen direito',
  thigh_left: 'coxa esquerda',
  thigh_right: 'coxa direita',
  arm_left: 'braço esquerdo',
  arm_right: 'braço direito',
} as const;

export type InjectionSiteCode = keyof typeof SITE_LABELS;

export const getInjectionSiteLabel = (site?: string): string => {
  if (!site) return '';
  return SITE_LABELS[site as InjectionSiteCode] ?? site;
};