/**
 * 匕首之心 (Daggerheart) 预置角色卡数据
 * 
 * 包含 2 张示例英雄卡：
 * - daggerheart-001: 凯瑟·银刃（人类缚灵者）
 * - daggerheart-002: 伊洛·叶影（精灵德鲁伊）
 */
import type { CharacterCard } from '@/types/card'

export const daggerheartCards: CharacterCard[] = [
  {
    id: 'daggerheart-001',
    system: 'DAGGERHEART',
    name: '凯瑟·银刃',
    player: '玩家E',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kether&backgroundColor=8338ec',
    description: '人类缚灵者，能与逝者灵魂沟通，在边境村庄为亡魂寻求公正。',
    formData: {
      name: '凯瑟·银刃',
      ancestry: 'human',
      class: 'binder',
      level: 3,
      tier: 1,
      community: '黑石镇',
      agility: 1,
      strength: 0,
      finesse: 1,
      instinct: 2,
      presence: 2,
      knowledge: 1,
      staminaMax: 18,
      stamina: 15,
      stressMax: 6,
      stress: 2,
      experience: '已标记：通灵仪式、边境法律 / 未标记：古语研究',
      backstory: '自幼能听见亡魂低语，被族中视为异象。师从游方缚灵者，于黑石镇立誓为无主之魂寻觅归宿。',
    },
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-10T18:45:00Z',
    favorite: true,
  },
  {
    id: 'daggerheart-002',
    system: 'DAGGERHEART',
    name: '伊洛·叶影',
    player: '玩家F',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ilo&backgroundColor=06d6a0',
    description: '精灵德鲁伊，林间隐居者，与古树之灵共享记忆。',
    formData: {
      name: '伊洛·叶影',
      ancestry: 'elf',
      class: 'druid',
      level: 2,
      tier: 1,
      community: '苍叶林地',
      agility: 2,
      strength: 0,
      finesse: 1,
      instinct: 2,
      presence: 1,
      knowledge: 2,
      staminaMax: 14,
      stamina: 14,
      stressMax: 6,
      stress: 0,
      experience: '已标记：森林秘语、季节轮回 / 未标记：星辰识读',
      backstory: '苍叶林地最后的德鲁伊学徒，师长化为古树后独自守护林间秘法，能化为银狼巡游夜林。',
    },
    createdAt: '2026-03-15T12:00:00Z',
    updatedAt: '2026-03-15T12:00:00Z',
    favorite: false,
  },
]