import type { Locale } from '../i18n';

interface Friend {
  name: string;
  url: string;
  description: Record<Locale, string>;
}

// 添加真实友链时填写名称、完整的 HTTP(S) 网址，以及中英文简介。
export const friends: Friend[] = [
  {
    name: "Yukari's Blog",
    url: 'https://yukar.icu/',
    description: {
      zh: 'ロマンと理想は私の同義語です',
      en: 'ロマンと理想は私の同義語です'
    }
  }
];
