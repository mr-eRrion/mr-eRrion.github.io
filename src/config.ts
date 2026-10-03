export const SITE = {
  title: 'eRrion 的小屋',
  description: '这个人很神秘，什么都留下了',
  author: 'eRrion',
  motto: '行胜于言，勤能补拙'
} as const;

export const TAG_LABELS: Record<string, string> = {
  'ai-for-research': 'AI for Research',
  geometry: '几何与拓扑',
  quantum: '量子理论',
  'statistical-physics': '统计物理',
  'mathematical-methods': '数学方法'
};

export const EN_SITE = {
  title: "eRrion’s Corner",
  description: 'A mysterious person who left everything here.',
  author: SITE.author,
  motto: 'Actions speak louder; diligence makes up for talent.'
} as const;

export const EN_TAG_LABELS: Record<string, string> = {
  'ai-for-research': 'AI for Research',
  geometry: 'Geometry & Topology',
  quantum: 'Quantum Theory',
  'statistical-physics': 'Statistical Physics',
  'mathematical-methods': 'Mathematical Methods'
};
