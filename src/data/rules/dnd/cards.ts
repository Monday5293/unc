/**
 * 龙与地下城 (DND) 预置角色卡数据
 * 
 * 包含 2 张示例冒险者卡：
 * - dnd-001: 索拉·晨星（木精灵游侠）
 * - dnd-002: 达格·铁砧（山地矮人战士）
 */
import type { CharacterCard } from '@/types/card'

export const dndCards: CharacterCard[] = [
  {
    id: 'dnd-001',
    system: 'DND',
    name: '索拉·晨星',
    player: '玩家C',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sola&backgroundColor=2a9d8f',
    description: '木精灵游侠，守望北境边境的孤狼，与森林中的精灵之灵立下盟约。',
    formData: {
      name: '索拉·晨星',
      race: '精灵',
      class: 'ranger',
      level: 5,
      profBonus: 3,
      background: '猎人',
      alignment: '混乱善良',
      str: 12,
      dex: 18,
      con: 14,
      int: 12,
      wis: 16,
      cha: 10,
      ac: 16,
      hp: 38,
      hpMax: 41,
      hitDice: '5d10',
      savingThrows: ['dex', 'wis'],
      skillProf: ['athletics', 'stealth', 'perception', 'survival', 'animal'],
      features: '宿敌（巨兽）、自然探索者、箭术战斗风格、法术施放（游侠）',
      backstory: '北境精灵部落的最后一名游侠，立誓守护部落遗址中的远古精灵之灵。沉默寡言，箭无虚发。',
    },
    createdAt: '2026-01-20T09:15:00Z',
    updatedAt: '2026-04-01T11:20:00Z',
    favorite: true,
  },
  {
    id: 'dnd-002',
    system: 'DND',
    name: '达格·铁砧',
    player: '玩家D',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dag&backgroundColor=e76f51',
    description: '山地矮人战士，曾是一名矿山工头，如今为了族人荣耀踏上冒险之路。',
    formData: {
      name: '达格·铁砧',
      race: '矮人',
      class: 'fighter',
      level: 4,
      profBonus: 2,
      background: '士兵',
      alignment: '守序中立',
      str: 18,
      dex: 10,
      con: 17,
      int: 10,
      wis: 12,
      cha: 8,
      ac: 18,
      hp: 40,
      hpMax: 44,
      hitDice: '4d10',
      savingThrows: ['str', 'con'],
      skillProf: ['athletics', 'intimidation', 'perception', 'history'],
      features: '战斗风格（防御）、回气、动作涌泉（1/Rest）、副职：战斗大师',
      backstory: '失落的铁砧氏族后裔，背负族旗四处寻找重振部落的契机，最爱在战后畅饮麦酒。',
    },
    createdAt: '2026-02-05T16:30:00Z',
    updatedAt: '2026-03-25T09:00:00Z',
    favorite: false,
  },
]