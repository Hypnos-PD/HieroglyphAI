import { Variant, FilterStyle, FilterSubject } from './types';

export const PRESET_VARIANTS: Variant[] = [
  {
    id: 'daily',
    name: '日常生活',
    description: '常见的物品、场景和概念',
    keywords: ['日常', '生活', '实物', '现实']
  },
  {
    id: 'programmer',
    name: '程序员',
    description: '代码、极客文化、硬件、抽象逻辑',
    keywords: ['编程', '代码', '计算机', '黑客', '赛博朋克', '科技']
  },
  {
    id: 'movie',
    name: '影视作品',
    description: '电影海报、经典镜头、演员',
    keywords: ['电影', '剧照', '名场面', '影视']
  },
  {
    id: 'anime',
    name: '日本动漫',
    description: '二次元、漫画风格、经典角色',
    keywords: ['动漫', '二次元', '日本动画', '漫画']
  },
  {
    id: 'game',
    name: '游戏世界',
    description: '电子游戏、像素风、游戏角色',
    keywords: ['游戏', '电子竞技', '像素', '3A大作', 'RPG']
  },
  {
    id: 'history',
    name: '历史文化',
    description: '古迹、文物、水墨画、书法',
    keywords: ['历史', '中国文化', '古风', '文物', '水墨']
  },
];

export const DEFAULT_FILTERS = {
  style: FilterStyle.ANY,
  subject: FilterSubject.ANY,
  allowHomophone: true,
  excludeContent: '',
};

export const MOCK_IMAGES = [
  "https://picsum.photos/400/400",
  "https://picsum.photos/401/400",
  "https://picsum.photos/400/401",
];
