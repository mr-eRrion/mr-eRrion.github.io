export const SITE = {
  title: '相空间札记',
  description: '记录数学、物理以及二者交汇处的个人札记。',
  author: 'eRrion',
  motto: '从结构中理解物理'
} as const;

export const TAG_LABELS: Record<string, string> = {
  geometry: '几何与拓扑',
  quantum: '量子理论',
  'statistical-physics': '统计物理',
  'mathematical-methods': '数学方法'
};
