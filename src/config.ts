export const SITE = {
  title: '相空间札记',
  description: '关于数学物理、几何与量子理论的个人札记。',
  author: 'Errion',
  motto: '从结构中理解物理'
} as const;

export const TAG_LABELS: Record<string, string> = {
  geometry: '几何与拓扑',
  quantum: '量子理论',
  'statistical-physics': '统计物理',
  'mathematical-methods': '数学方法'
};
