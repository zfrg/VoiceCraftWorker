// 后端 API 地址。
// 开发环境默认同源（vite 代理到本地 worker），生产通过 .env.production 的 VITE_API_BASE 覆盖。
export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export const VOICES = [
  { label: '晓晓 (女声·温柔)', value: 'zh-CN-XiaoxiaoNeural' },
  { label: '云希 (男声·清朗)', value: 'zh-CN-YunxiNeural' },
  { label: '云扬 (男声·阳光)', value: 'zh-CN-YunyangNeural' },
  { label: '晓伊 (女声·甜美)', value: 'zh-CN-XiaoyiNeural' },
  { label: '云健 (男声·稳重)', value: 'zh-CN-YunjianNeural' },
  { label: '晓辰 (女声·知性)', value: 'zh-CN-XiaochenNeural' },
  { label: '晓涵 (女声·优雅)', value: 'zh-CN-XiaohanNeural' },
  { label: '晓梦 (女声·梦幻)', value: 'zh-CN-XiaomengNeural' },
  { label: '晓墨 (女声·文艺)', value: 'zh-CN-XiaomoNeural' },
  { label: '晓秋 (女声·成熟)', value: 'zh-CN-XiaoqiuNeural' },
  { label: '晓睿 (女声·智慧)', value: 'zh-CN-XiaoruiNeural' },
  { label: '晓双 (女声·活泼)', value: 'zh-CN-XiaoshuangNeural' },
  { label: '晓萱 (女声·清新)', value: 'zh-CN-XiaoxuanNeural' },
  { label: '晓颜 (女声·柔美)', value: 'zh-CN-XiaoyanNeural' },
  { label: '晓悠 (女声·悠扬)', value: 'zh-CN-XiaoyouNeural' },
  { label: '晓甄 (女声·端庄)', value: 'zh-CN-XiaozhenNeural' },
  { label: '云枫 (男声·磁性)', value: 'zh-CN-YunfengNeural' },
  { label: '云皓 (男声·豪迈)', value: 'zh-CN-YunhaoNeural' },
  { label: '云夏 (男声·热情)', value: 'zh-CN-YunxiaNeural' },
  { label: '云野 (男声·野性)', value: 'zh-CN-YunyeNeural' },
  { label: '云泽 (男声·深沉)', value: 'zh-CN-YunzeNeural' }
];

export const SPEEDS = [
  { label: '🐌 很慢', value: '0.5' },
  { label: '🚶 慢速', value: '0.75' },
  { label: '⚡ 正常', value: '1.0' },
  { label: '🏃 快速', value: '1.25' },
  { label: '🚀 很快', value: '1.5' },
  { label: '💨 极速', value: '2.0' }
];

export const PITCHES = [
  { label: '📉 很低沉', value: '-50' },
  { label: '📊 低沉', value: '-25' },
  { label: '🎵 标准', value: '0' },
  { label: '📈 高亢', value: '25' },
  { label: '🎶 很高亢', value: '50' }
];

export const STYLES = [
  { label: '🎭 通用风格', value: 'general' },
  { label: '🤖 智能助手', value: 'assistant' },
  { label: '💬 聊天对话', value: 'chat' },
  { label: '📞 客服专业', value: 'customerservice' },
  { label: '📺 新闻播报', value: 'newscast' },
  { label: '💕 亲切温暖', value: 'affectionate' },
  { label: '😌 平静舒缓', value: 'calm' },
  { label: '😊 愉快欢乐', value: 'cheerful' },
  { label: '🌸 温和柔美', value: 'gentle' },
  { label: '🎼 抒情诗意', value: 'lyrical' },
  { label: '🎯 严肃正式', value: 'serious' }
];