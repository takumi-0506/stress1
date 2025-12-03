<!-- <template>
  <ColumnChart></ColumnChart> -->
<!-- <HomeScreen></HomeScreen>
</template> -->
<!-- 
<template>
  <div>
    <StressBattle></StressBattle>
  </div>
</template>

<script setup>
import StressBattle from './components/StressBattle.vue'

// import ColumnChart from '@/components/ColumnChart.vue'
// import HomeScreen from './components/HomeScreen.vue'
</script> -->
<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import monsterjoy from '@/assets/shinwa_kirke_circe.png'
import monsteranger from '@/assets/character_cthulhu_night_gaunts.png'
import monstersurprise from '@/assets/fantasy_orc.png'
import monsterdisgust from '@/assets/fantasy_dragon_wyvern.png'
import monstersorrow from '@/assets/fantasy_harpy.png'
import monsteranxiety from '@/assets/fantasy_dullahan.png'

import choco from '@/assets/valentinesday_itachoco2.png'
import milk from '@/assets/drink_milk_pack.png'
import tomato from '@/assets/food_puchitomato.png'
import green from '@/assets/tea1.png'
import soy from '@/assets/drink_tounyu2.png'
import armond from '@/assets/nuts_almond.png'
import herb from '@/assets/herb_tea.png'

import yusya from '@/assets/yuusya_game.png'
import yusya1 from '@/assets/game_yuusya_woman.png'
import magicgirl from '@/assets/mahoutsukai_woman.png'
import sizin from '@/assets/music_ginyuu_shijin.png'

// --- 画面管理 ---
const currentScreen = ref('login') // 'home', 'statusEdit', 'eventInput', 'battle', 'goal'

// --- プレイヤーデータ ---
const playerBaseStats = ref({
  name: 'KAIT',
  // maxHp: Math.floor(Math.random() * 10),
  avatar: '@/assets/yuusya_game.png', // デフォルトアバター
  maxHp: 50,
  maxMp: 10,
  // attack: 5,
  magicattack: 10,
  attack: 20,
  defense: 8,
  magicdefense: 10,
  DEX: 80,
  evasion: 10,
  exp: 0,
  gold: 0,
  count: 0,
  totalGoldSpent: 0, // 累計消費ゴールド
  battlesWon: 0,
  goalsCompleted: 0,
  positiveAttacksUsed: 0,
})
const player = ref({}) // バトル中のインスタンス
const tempStats = ref({}) // ステータス編集用の一時データ

// 【追加】プレイヤーの所持アイテム
const playerInventory = ref([])
// プレイヤーが使える魔法
const playerMagics = ref([
  {
    id: 1,
    name: 'リラクゼーション',
    mpCost: 10,
    effect: 'damage',
    power: 25 + playerBaseStats.value.attack,
    textpower: '攻撃力： +25\n属性：火\n心身の緊張状態を緩め、ストレスを軽減させる方法',
    element: 'fire',
    description: '心身の緊張状態を緩め、ストレスを軽減させる方法',
  },
  {
    id: 2,
    name: 'ストレッチ',
    mpCost: 10,
    effect: 'damage',
    power: 25,
    textpower:
      '攻撃力：+25\n属性：水\n心拍数の低下や副交感神経が優位な状態につながり、リラックス効果がある',

    element: 'water',
    description: '心拍数の低下や副交感神経が優位な状態につながり、リラックス効果がある',
  },
  {
    id: 3,
    name: '睡眠',
    mpCost: 10,
    effect: 'damage',
    power: 25,
    textpower: '攻撃力： +25\n属性：木\n適切な睡眠時間は6～8時間とされている',
    element: 'wood',
    description: '適切な睡眠時間は6～8時間とされている',
  },
  {
    id: 4,
    name: 'マインドフルネス',
    mpCost: 30,
    effect: 'damage',
    power: 50,
    textpower: '攻撃力： +25\n属性：火\n',

    element: 'fire',
    description: '中火',
  },
  {
    id: 5,
    name: 'コーピング',
    mpCost: 30,
    effect: 'damage',
    power: 50,
    textpower: '攻撃力： +25\n属性：水\n',

    element: 'water',
    description: '中水',
  },
  {
    id: 6,
    name: 'コミュニケーション',
    mpCost: 30,
    effect: 'damage',
    power: 50,
    textpower: '攻撃力： +25\n属性：木\n',

    element: 'wood',
    description: '中木',
  },
  {
    id: 7,
    name: '運動',
    mpCost: 100,
    effect: 'damage',
    power: 100,
    textpower: '攻撃力： +25\n属性：火\n',

    element: 'fire',
    description: '大火',
  },
  {
    id: 8,
    name: 'ジャーナリング',
    mpCost: 100,
    effect: 'damage',
    power: 100,
    textpower: '攻撃力： +25\n属性：水\n',

    element: 'water',
    description: '大水',
  },
  {
    id: 9,
    name: 'セルフコンパッション',
    mpCost: 100,
    effect: 'damage',
    power: 100,
    textpower: '攻撃力： +25\n属性：木\n',

    element: 'wood',
    description: '大木',
  },
])

// 【追加】お店で販売するアイテムのリスト
const shopItems = ref([
  {
    id: 1,
    name: 'チョコレート',
    price: 20,
    effect: 'heal',
    power: 40,
    description: 'HPを40回復する',
    relaxingeffect: 'リラックス効果のあるポリフェノールが含まれている。',
    image: choco,
  },
  {
    id: 2,
    name: 'トマト',
    price: 100,
    effect: 'heal',
    power: 100,
    description: 'HPを100回復する',
    relaxingeffect: 'ストレス解消に効果的なビタミンCやビタミンB群が豊富に含まれている。',
    image: tomato,
  },
  {
    id: 3,
    name: 'アーモンド',
    price: 200,
    effect: 'heal',
    power: 250,
    description: 'HPを250回復する',
    relaxingeffect:
      'ストレスから心身の健康を守ってくれる「コルチゾール」の生成に必要な「ビタミンE」が含まれる。',
    image: armond,
  },
  {
    id: 101,
    name: '牛乳',
    price: 80,
    effect: 'boost',
    targetStat: 'attack',
    power: 20,
    duration: 3,
    description: '2ターンの間、攻撃力が20上昇',
    relaxingeffect: 'ストレス解消に有効なカルシウムやビタミンB2が含まれいる。',
    image: milk,
  },
  {
    id: 102,
    name: 'ハーブティー',
    price: 80,
    effect: 'boost',
    targetStat: 'defense',
    power: 20,
    duration: 3,
    description: '2ターンの間、防御力が20上昇',
    relaxingeffect: '自律神経を整える効果。',
    image: herb,
  },
  {
    id: 103,
    name: '豆乳',
    price: 100,
    effect: 'boost',
    targetStat: 'DEX',
    power: 10,
    duration: 3,
    description: '2ターンの間、命中率が10上昇',
    relaxingeffect: '自律神経を整えてくれます。',
    image: soy,
  },
  {
    id: 104,
    name: '緑茶',
    price: 300,
    effect: 'boost',
    targetStat: 'evasion',
    power: 10,
    duration: 3,
    description: '2ターンの間、回避率が10上昇',
    relaxingeffect:
      'リラックス作用のあるテアニンを含んでいる緑茶は、自律神経を落ち着かせる働きが期待できる。',
    image: green,
  },
])

// 【変更】enemyを複数形に
const enemies = ref([])
const alldamage = ref('')

// --- モンスターデータ ---
// const enemy = ref({})
const eventName = ref('')
const thoughts = ref('')
const emotions = ref({
  joy: 0,
  surprise: 0,
  disgust: 0,
  sorrow: 0,
  anxiety: 0,
  anger: 0,
})

// 勝利後の感情記録用データ
const postBattleEmotions = ref({
  joy: 0,
  surprise: 0,
  disgust: 0,
  sorrow: 0,
  anxiety: 0,
  anger: 0,
})

const emotionLabels = {
  joy: '喜び',
  surprise: '驚き',
  disgust: '嫌悪',
  sorrow: '悲しみ',
  anxiety: '不安',
  anger: '怒り',
}

// --- 目標管理データ ---
// 目標リストのデータ
// goalListのデータ構造変更
const goalList = ref([])

// 全記録を保存する配列
const memoryLog = ref([])
// 現在進行中のデータを一時的に保持するオブジェクト
const currentAdventure = ref(null)

// ポップアップで表示する冒険データ
const selectedAdventure = ref(null)

// 【追加】ツールチップ用のテキスト
const tooltipText = ref('')

// タスク追加フォーム用のデータ
const newGoal = ref({
  text: '',
  priority: 2,
})

// 並べ替えの状態管理
const sortOrder = ref('desc') // 'desc' (高い順), 'asc' (低い順)

// ステータス強化のコスト
const upgradeCost = {
  maxHp: 10, // 1回強化するのに20 EXP必要
  maxMp: 10,
  attack: 10,
  defense: 10,
  DEX: 100,
  evasion: 100,
}

// const itemCost = {
//   yaku: 100,
// }

// const tasks = ref([
//   { id: 1, text: '散歩する', completed: true },
//   { id: 2, text: '新しい技術を学ぶ', completed: false },
//   { id: 3, text: '部屋の掃除をする', completed: false },
// ])
// const newTaskText = ref('')

// --- バトルロジック用データ ---
const battleLog = ref([])
const isPlayerTurn = ref(true)
const isBattleOver = ref(false)
const gameMessage = ref('')
const isWaitingForInput = ref(false)
// const attackMoveName = ref('')
const isLogVisible = ref(false)
const didPlayerWin = ref(false)

// ポップアップ表示用の状態
const isEmotionLogVisible = ref(false)
// ログのオン／オフ
const Logmanual = ref(false)

// const positiveWords = ref(['勇気', '勝つ', '未来', '信じる', '友達', '守る', '笑顔', '相談'])

const positiveWords = ref([
  'ありがとう',
  '嬉しい',
  '楽しい',
  '幸せ',
  '大好き',
  '愛してる',
  '最高',
  '素晴らしい',
  '素敵',
  '感動',
  '感謝',
  '喜び',
  '希望',
  '笑顔',
  '笑う',
  '元気',
  '健康',
  '安心',
  '満足',
  '充実',
  '成功',
  '達成',
  '成長',
  '前進',
  '挑戦',
  '努力',
  '情熱',
  '夢',
  '目標',
  '可能性',
  '無限',
  '未来',
  '光',
  '輝き',
  '才能',
  '自信',
  '勇気',
  '尊敬',
  '信頼',
  '協力',
  '応援',
  '祝福',
  '幸運',
  'ラッキー',
  'ツイてる',
  'なんとかなる',
  '大丈夫',
  '問題ない',
  'できる',
  'やったー',
  'おめでとう',
  'さすが',
  '天才',
  '完璧',
  '絶好調',
  '順調',
  '平和',
  '豊か',
  '恵み',
  '奇跡',
  'ワクワク',
  'ドキドキ',
  'ときめき',
  '癒し',
  '優しい',
  '親切',
  '思いやり',
  '誠実',
  '素直',
  '明るい',
  'ポジティブ',
  '楽観的',
  '前向き',
  '積極的',
  '意欲',
  '集中',
  '学び',
  '発見',
  '創造',
  '革新',
  '美しい',
  '可愛い',
  'かっこいい',
  '魅力的',
  '清々しい',
  '爽やか',
  '心地よい',
  '快適',
  '自由',
  '平穏',
  '許す',
  '認める',
  '褒める',
  '称賛',
  '分かち合う',
  '助け合う',
  '繋がり',
  '絆',
  'おかげさま',
  '生きがい',
  '相談',
  '挽回',
])

// const attackHistory = ref([])

// 出来事の送信状態を管理
const isSubmittingEvent = ref(true)

// 【変更】UIの状態管理をより詳細に
const playerActionState = ref('selecting_command') // 'selecting_command', 'inputting_attack', 'selecting_magic', 'inputting_magic', 'selecting_item'
const attackMoveName = ref('')
const magicChant = ref('')
const selectedSpell = ref(null)
const selectedTargetIndex = ref(null) // 【追加】ターゲット選択用

// 【追加】属性アイコンのマッピング
const elementIcons = {
  fire: '🔥',
  water: '💧',
  wood: '🌳',
}

// import monsterjoy from '@/assets/shinwa_kirke_circe.png'
// import monsteranger from '@/assets/character_cthulhu_night_gaunts.png'
// import monstersurprise from '@/assets/fantasy_orc.png'
// import monsterdisgust from '@/assets/fantasy_dragon_wyvern.png'
// import monstersorrow from '@/assets/fantasy_harpy.png'
// import monsteranxiety from '@/assets/fantasy_dullahan.png'

// 【追加】モンスター画像のマッピング
const monsterImages = {
  anger: monsteranger,
  sorrow: monstersorrow,
  anxiety: monsteranxiety,
  joy: monsterjoy,
  surprise: monstersurprise,
  disgust: monsterdisgust,
  neutral: monsteranger,
  default: monsteranger, // 汎用的なモンスター画像
}

const newPlayerName = ref('')
const newPlayerAvatar = ref(yusya)
const avatarOptions = ref([yusya, yusya1, magicgirl, sizin])

// --- ロード & セーブ機能 ---
const GAME_DATA_KEY = 'myAdventureGameData'

// 【追加】ゲーム保存関数
const saveGame = () => {
  const dataToSave = {
    playerBaseStats: playerBaseStats.value,
    playerInventory: playerInventory.value,
    goalList: goalList.value,
    memoryLog: memoryLog.value,
    achievements: achievements.value,
    // currentScreen: currentScreen.value,
    // 中断している冒険データも保存する
    currentAdventure: currentAdventure.value,
    enemies: enemies.value, // 敵の状態も保存
  }
  localStorage.setItem(GAME_DATA_KEY, JSON.stringify(dataToSave))
}

// ゲームロード関数
const loadGame = () => {
  const savedData = localStorage.getItem(GAME_DATA_KEY)
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData)
      // 【変更】ロード時に name が存在するかチェック
      if (parsedData.playerBaseStats && parsedData.playerBaseStats.name) {
        playerBaseStats.value = { ...playerBaseStats.value, ...parsedData.playerBaseStats }
        isSubmittingEvent.value = false // ボタンを非表示にする
      }
      // データが存在する場合のみ復元
      if (parsedData.playerBaseStats) playerBaseStats.value = parsedData.playerBaseStats
      if (parsedData.playerInventory) playerInventory.value = parsedData.playerInventory
      if (parsedData.goalList) goalList.value = parsedData.goalList
      if (parsedData.memoryLog) memoryLog.value = parsedData.memoryLog
      if (parsedData.achievements) achievements.value = parsedData.achievements
      // if (parsedData.currentScreen) currentScreen.value = parsedData.currentScreen

      if (parsedData.currentAdventure) currentAdventure.value = parsedData.currentAdventure
      if (parsedData.enemies) enemies.value = parsedData.enemies

      // データがあり、名前も設定されていればホームへ
      if (playerBaseStats.value.name) {
        goToScreen('home')
      }
      // } else {
      //   // データはあるが名前がない（古いセーブデータ）の場合
      //   newPlayerAvatar.value = playerBaseStats.value.avatar // ロードしたアバターを選択状態に
      //   goToScreen('nameInput')
      // }
    } catch (e) {
      console.error('セーブデータの読み込みに失敗しました:', e)
      localStorage.removeItem(GAME_DATA_KEY) // 壊れたデータを削除
    }
  }
}

// 【追加】実績データ
const achievements = ref({
  // --- ROW 1 (Easy) ---
  first_win: {
    name: '初めての勝利',
    description: 'モンスターを初めて倒した',
    unlocked: false,
    icon: '🏆',
    reward: 30,
  },
  positive_warrior: {
    name: 'ポジティブ・スタート',
    description: 'ポジティブな言葉で攻撃した',
    unlocked: false,
    icon: '✨',
    reward: 30,
  },

  first_purchase: {
    name: '初めてのお買い物',
    description: 'お店で初めてアイテムを購入した',
    unlocked: false,
    icon: '🛍️',
    reward: 30,
  },
  first_goal: {
    name: 'はじめの一歩',
    description: '目標を初めて達成した',
    unlocked: false,
    icon: '✅',
    reward: 30,
  },
  first_memory: {
    name: '最初の記録',
    description: '記録を初めて保存した',
    unlocked: false,
    icon: '✍️',
    reward: 30,
  },

  // --- ROW 2 (Medium) ---
  battle_novice: {
    name: 'ストレス・ルーキー',
    description: 'バトルで 15回 勝利した',
    kaisu: 'バトルで ' + playerBaseStats.value.battlesWon + '回 勝利した',
    unlocked: false,
    icon: '⚔️',
    reward: 50,
  },
  power_word: {
    name: 'ポジティブ・スピーカー',
    description: 'ポジティブな言葉で 25回 攻撃した',
    unlocked: false,
    icon: '🌟',
    reward: 50,
  },
  shopper: {
    name: '買い物好き',
    description: 'お店で合計 2500G 使った',
    unlocked: false,
    icon: '💰',
    reward: 50,
  },
  goal_setter: {
    name: '目標達成者',
    description: '目標を 35個 達成した',
    unlocked: false,
    icon: '🎯',
    reward: 50,
  },

  memory_collector_1: {
    name: '記録者',
    description: '記録を 25回 保存した',
    unlocked: false,
    icon: '📚',
    reward: 50,
  },

  // --- ROW 3 (Hard) ---
  battle_veteran: {
    name: 'ストレス・バスター',
    description: 'バトルで 70回 勝利した',
    unlocked: false,
    icon: '🎖️',
    reward: 70,
  },
  positive_master: {
    name: 'ポジティブシンキング',
    description: 'ポジティブな言葉で 85回 攻撃した',
    unlocked: false,
    icon: '💖',
    reward: 70,
  },
  big_spender: {
    name: 'お得意様',
    description: 'お店で合計 10000G 使った',
    unlocked: false,
    icon: '💸',
    reward: 70,
  },
  goal_master: {
    name: '目標達成のエキスパート',
    description: '目標を 75個 達成した',
    unlocked: false,
    icon: '🏅',
    reward: 70,
  },

  memory_collector_2: {
    name: '心のジャーナリスト',
    description: '記録を 70回 保存した',
    unlocked: false,
    icon: '📔',
    reward: 70,
  },

  // --- ROW 4 (Very Hard) ---
  battle_master: {
    name: 'ストレス・マスター',
    description: 'バトルで 100回 勝利した',
    unlocked: false,
    icon: '👑',
    reward: 100,
  },
  positive_legend: {
    name: 'ポジティブ・マスター',
    description: 'ポジティブな言葉で 100回 攻撃した',
    unlocked: false,
    icon: '☀️',
    reward: 100,
  },
  high_roller: {
    name: 'お買い物・マスター',
    description: 'お店で合計 50000G 使った',
    unlocked: false,
    icon: '💎',
    reward: 100,
  },
  goal_legend: {
    name: '目標・マスター',
    description: '目標を 100個 達成した',
    unlocked: false,
    icon: '📜',
    reward: 100,
  },

  memory_collector_3: {
    name: '記録・マスター',
    description: '冒険の記録を 100回 保存した',
    unlocked: false,
    icon: '🏛️',
    reward: 100,
  },
})
// 【追加】実績解除通知用
const achievementToast = ref(null)

// 【追加】実績の達成条件マッピング
const achievementRequirements = {
  first_win: { stat: 'battlesWon', target: 1, unit: '回' },
  first_goal: { stat: 'goalsCompleted', target: 1, unit: '個' },
  positive_warrior: { stat: 'positiveAttacksUsed', target: 1, unit: '回' },
  first_purchase: { stat: 'totalGoldSpent', target: 1, unit: '回' },
  first_memory: { stat: 'memoryLogLength', target: 1, unit: '回' },

  battle_novice: { stat: 'battlesWon', target: 15, unit: '回' },
  goal_setter: { stat: 'goalsCompleted', target: 35, unit: '個' },
  shopper: { stat: 'totalGoldSpent', target: 2500, unit: 'G' },
  memory_collector_1: { stat: 'memoryLogLength', target: 25, unit: '回' },
  power_word: { stat: 'positiveAttacksUsed', target: 25, unit: '回' },

  battle_veteran: { stat: 'battlesWon', target: 70, unit: '回' },
  goal_master: { stat: 'goalsCompleted', target: 75, unit: '個' },
  big_spender: { stat: 'totalGoldSpent', target: 10000, unit: 'G' },
  memory_collector_2: { stat: 'memoryLogLength', target: 70, unit: '回' },
  positive_master: { stat: 'positiveAttacksUsed', target: 85, unit: '回' },

  battle_master: { stat: 'battlesWon', target: 100, unit: '回' },
  goal_legend: { stat: 'goalsCompleted', target: 100, unit: '個' },
  high_roller: { stat: 'totalGoldSpent', target: 50000, unit: 'G' },
  memory_collector_3: { stat: 'memoryLogLength', target: 100, unit: '回' },
  positive_legend: { stat: 'positiveAttacksUsed', target: 100, unit: '回' },
}

// 【追加】実績の進捗情報を取得する関数
const getAchievementProgress = (id) => {
  const req = achievementRequirements[id]
  if (!req) return null

  const target = req.target
  const unit = req.unit
  let rawCurrent = 0

  if (req.stat === 'memoryLogLength') {
    rawCurrent = memoryLog.value.length
  } else {
    rawCurrent = playerBaseStats.value[req.stat] || 0
  }

  // 「初めてのお買い物」は、totalGoldSpentが0より大きければ1回と見なす
  if (id === 'first_purchase') {
    rawCurrent = rawCurrent > 0 ? 1 : 0
  }

  // 表示する現在値を目標値でキャップする (例: 6/5ではなく5/5と表示)
  const displayCurrentValue = Math.min(rawCurrent, target)

  return {
    current: displayCurrentValue,
    target: target,
    unit: unit,
    isComplete: rawCurrent >= target, // 達成済みかどうか
  }
}

watch(
  [playerBaseStats, playerInventory, goalList, memoryLog, achievements, currentAdventure, enemies],
  () => {
    saveGame()
  },
  { deep: true },
)

watch(
  battleLog,
  async () => {
    await nextTick()
    if (isLogVisible.value) {
      // ↓ この条件分岐をなくし、要素の存在チェックだけに絞る
      const logEl = document.querySelector('.battle-log')
      if (logEl) {
        logEl.scrollTop = logEl.scrollHeight
      }
    }
  },
  { deep: true },
)

// 【追加】アプリ起動時に一度だけロードを実行
onMounted(() => {
  loadGame()
})

// --- computed プロパティ ---
const playerHpBar = computed(() => ({
  width: player.value.maxHp > 0 ? `${(player.value.hp / player.value.maxHp) * 100}%` : '0%',
}))

const playerMpBar = computed(() => ({
  width: player.value.maxMp > 0 ? `${(player.value.mp / player.value.maxMp) * 100}%` : '0%',
}))

// const enemyHpBar = computed(() => ({
//   width: enemy.value.maxHp > 0 ? `${(enemy.value.hp / enemy.value.maxHp) * 100}%` : '0%',
// }))

// --- 感情の数値入力をバリデーションする関数 ---
const handleEmotionInput = (key, event) => {
  let value = parseInt(event.target.value, 10)

  if (isNaN(value)) {
    // もし入力が空欄や数値以外なら、データを0に戻す
    value = 0
  }

  // 100より大きい値が入力された場合、100に丸める
  if (value > 100) {
    // alert('入力は100以下')
    value = 100
  }

  // 0未満の値が入力された場合、0に丸める
  if (value < 0) {
    value = 0
  }

  // データを更新（これによりスライダーも連動して動く）
  emotions.value[key] = value
}

// ホーム画面に表示する今日の目標（最初の未完了タスク）
// const todaysGoal = computed(() => {
//   return tasks.value.find((task) => !task.completed) || { text: '全てのタスク完了！' }
// })

// 優先順位をテキストに変換するヘルパー
const priorityText = {
  3: '高',
  2: '中',
  1: '低',
}

// ソートされた目標リスト（表示用）
const computedGoals = computed(() => {
  return [...goalList.value].sort((a, b) => {
    if (sortOrder.value === 'desc') {
      return b.priority - a.priority // 高い順
    } else {
      return a.priority - b.priority // 低い順
    }
  })
})

// ホーム画面に表示するトップ3の未完了目標
const topPriorityGoals = computed(() => {
  return goalList.value
    .filter((goal) => !goal.completed) // 未完了のものだけをフィルタリング
    .sort((a, b) => b.priority - a.priority) // 優先度が高い順にソート
    .slice(0, 3) // 上位3件を取得
})

const allCompleteGoal = computed(() => {
  return goalList.value.filter((goal) => !goal.completed)
})

// 勝利後の感情記録ポップアップ用の関数
const handlePostBattleEmotionInput = (key, event) => {
  let value = parseInt(event.target.value, 10)
  if (isNaN(value)) {
    value = 0
  }
  if (value > 100) {
    value = 100
  }
  if (value < 0) {
    value = 0
  }
  postBattleEmotions.value[key] = value
}

const savePostBattleEmotions = () => {
  // console.log('勝利後の感情が記録されました:', postBattleEmotions.value)
  // 本来はここでデータベースなどに保存する
  // isEmotionLogVisible.value = false // ポップアップを閉じる

  if (
    postBattleEmotions.value.joy === 0 &&
    postBattleEmotions.value.surprise === 0 &&
    postBattleEmotions.value.disgust === 0 &&
    postBattleEmotions.value.sorrow === 0 &&
    postBattleEmotions.value.anxiety === 0 &&
    postBattleEmotions.value.anger === 0
  ) {
    alert('今の感情を1つ以上入力してください')
    return
  }

  // 【変更】現在の冒険データに勝利後の感情を記録
  if (currentAdventure.value) {
    currentAdventure.value.postBattleEmotions = { ...postBattleEmotions.value }
  }
  isEmotionLogVisible.value = false
}

// --- ナビゲーション関数 ---
const goToScreen = (screenName) => {
  if (screenName === 'eventInput') {
    eventName.value = ''
    thoughts.value = ''
    Object.keys(emotions.value).forEach((key) => (emotions.value[key] = 0))
    isSubmittingEvent.value = false // ボタンを再表示

    currentAdventure.value = {
      id: Date.now(),
      eventName: '',
      thoughts: '',
      emotions: {},
      attackHistory: [],
      postBattleEmotions: null,
    }
  }
  currentScreen.value = screenName
}

// 【追加】日付をフォーマットする関数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
// 冒険の記録を確定し、ホームに戻る関数
// const finalizeAdventure = () => {
//   if (currentAdventure.value) {
//     currentAdventure.value.recordedDate = new Date().toISOString() // 日付を記録
//     memoryLog.value.push(currentAdventure.value)
//   }
//   currentAdventure.value = null // 現在の冒険データをリセット
//   isSubmittingEvent.value = false // ボタンを再表示
//   goToScreen('home')
// }
const finalizeAdventure = () => {
  if (currentAdventure.value) {
    currentAdventure.value.recordedDate = new Date().toISOString()
    memoryLog.value.push(currentAdventure.value)

    // 実績チェック
    // if (memoryLog.value.length >= 3) {
    //   unlockAchievement('memory_collector')
    // }
    unlockAchievement('first_memory')
    if (memoryLog.value.length >= 25) unlockAchievement('memory_collector_1')
    if (memoryLog.value.length >= 70) unlockAchievement('memory_collector_2')
    if (memoryLog.value.length >= 100) unlockAchievement('memory_collector_3')
    // バトル後のアイテム状態を永続データに反映
    // playerInventory.value = JSON.parse(JSON.stringify(player.value.inventory))
  }
  tab.value = true
  currentAdventure.value = null
  isSubmittingEvent.value = false // ボタンを再表示
  goToScreen('home')
}

// ステータス割り振り関数
const upgradeStat = (statName) => {
  const cost = upgradeCost[statName]
  if (tempStats.value.exp >= cost) {
    tempStats.value.exp -= cost
    if (statName === 'maxHp') {
      tempStats.value.maxHp += 10
    } else if (statName === 'maxMp') {
      tempStats.value.maxMp += 10
    } else {
      tempStats.value[statName] += 1
    }
  } else {
    alert('経験値が足りません')
  }
}

const downgradeStat = (statName) => {
  const cost = upgradeCost[statName]
  const basestates = playerBaseStats.value[statName]
  const templatestates = tempStats.value[statName]
  // console.log(playerBaseStats.value.exp)
  // console.log(tempStats.value.exp)
  if (templatestates > basestates) {
    // ステータスによって上昇値を変える
    tempStats.value.exp += cost // 一時的なEXPを減らす

    if (statName === 'maxHp') {
      tempStats.value.maxHp -= 10
    } else if (statName === 'maxMp') {
      tempStats.value.maxMp -= 10
    } else {
      tempStats.value[statName] -= 1
    }
  } else {
    // alert('経験値が足りません')
  }
}

// 実績解除の管理関数
const unlockAchievement = (id) => {
  if (!achievements.value[id] || achievements.value[id].unlocked) {
    return // 存在しないか、既に解除済み
  }

  const achievement = achievements.value[id]
  achievement.unlocked = true

  // トースト通知を表示
  achievementToast.value = achievement.name
  setTimeout(() => {
    achievementToast.value = null
  }, 3000) // 3秒後に消す

  // 報酬がある場合
  if (achievement.reward > 0) {
    playerBaseStats.value.exp += achievement.reward
    addLog(`実績解除: ${achievement.name} (+${achievement.reward} EXP)`, 'positive')
  } else {
    addLog(`実績解除: ${achievement.name}`, 'positive')
  }
}

const buyitem = (itemName) => {
  if (playerBaseStats.value.gold < itemName.price) {
    alert('ゴールドが足りません！')
    return
  }
  // プレイヤーが既にそのアイテムを持っているか探す
  const existingItem = playerInventory.value.find((item) => item.id === itemName.id)
  if (existingItem) {
    if (existingItem.quantity < 99) {
      playerBaseStats.value.gold -= itemName.price
      playerBaseStats.value.totalGoldSpent += itemName.price // 累計消費を更新
      alert(`${itemName.name} を購入しました！`)

      // 実績チェック
      // if (playerBaseStats.value.totalGoldSpent >= 500) {
      //   unlockAchievement('high_spender')
      // }

      existingItem.quantity += 1 // 持っていれば個数を増やす
    } else if (existingItem.quantity >= 99) {
      alert(existingItem.name + 'はこれ以上は持てないよ')
    }
  } else {
    // 持っていなければ新しく追加
    // 【変更】購入時に画像パスも含めるように
    playerBaseStats.value.gold -= itemName.price
    playerBaseStats.value.totalGoldSpent += itemName.price // 累計消費を更新

    playerInventory.value.push({
      id: itemName.id,
      name: itemName.name,
      quantity: 1,
      effect: itemName.effect,
      power: itemName.power,
      price: itemName.price, // priceも入れておくと後で売却機能追加時に便利かも
      description: itemName.description,
      relaxingeffect: itemName.relaxingeffect,
      image: itemName.image, // 画像パスをコピー
      targetStat: itemName.targetStat, // ステータス系アイテム用
      duration: itemName.duration, // ステータス系アイテム用
    })
    alert(`${itemName.name} を購入しました！`)
    // 実績チェック
  }
  unlockAchievement('first_purchase')
  if (playerBaseStats.value.totalGoldSpent >= 2500) unlockAchievement('shopper')
  if (playerBaseStats.value.totalGoldSpent >= 10000) unlockAchievement('big_spender')
  if (playerBaseStats.value.totalGoldSpent >= 50000) unlockAchievement('high_roller')
}

// 目標リスト画面用の関数
const completeGoal = (goal) => {
  if (goal.completed) return // 既に達成済みなら何もしない

  goal.completed = true
  playerBaseStats.value.exp += goal.exp
  playerBaseStats.value.gold += goal.gold
  alert(`「${goal.text}」を達成！ ${goal.exp} EXP と ${goal.gold} G を獲得しました。`)

  // 実績チェック
  // unlockAchievement('first_goal')
  playerBaseStats.value.goalsCompleted++
  unlockAchievement('first_goal')
  if (playerBaseStats.value.goalsCompleted >= 35) unlockAchievement('goal_setter')
  if (playerBaseStats.value.goalsCompleted >= 75) unlockAchievement('goal_master')
  if (playerBaseStats.value.goalsCompleted >= 100) unlockAchievement('goal_legend')
}

// タスク追加関数
const addGoal = () => {
  if (!newGoal.value.text.trim()) {
    alert('タスクの内容を入力してください。')
    return
  }
  // console.log(parseInt(newGoal.value.priority))

  if (parseInt(newGoal.value.priority) == 3) {
    //8~10
    const rnd = Math.floor(Math.random() * 2) + 8
    newGoal.value.exp = rnd

    //80~100
    const rnd2 = Math.floor(Math.random() * 21) + 80
    newGoal.value.gold = rnd2
  } else if (parseInt(newGoal.value.priority) == 2) {
    //4~7
    const rnd = Math.floor(Math.random() * 4) + 4
    newGoal.value.exp = rnd

    //40~70
    const rnd2 = Math.floor(Math.random() * 41) + 40
    newGoal.value.gold = rnd2
  } else if (parseInt(newGoal.value.priority) == 1) {
    //1~3
    const rnd = Math.floor(Math.random() * 3) + 1
    newGoal.value.exp = rnd

    //10~30
    const rnd2 = Math.floor(Math.random() * 21) + 10
    newGoal.value.gold = rnd2
  }

  goalList.value.push({
    id: Date.now(), // ユニークなIDを生成
    text: newGoal.value.text,
    exp: newGoal.value.exp,
    gold: newGoal.value.gold,
    priority: parseInt(newGoal.value.priority, 10),
    completed: false,
  })

  // フォームをリセット
  newGoal.value.text = ''
  // newGoal.value.exp = 10
  newGoal.value.priority = 2
}

// タスク削除関数
const deleteGoal = (goalId) => {
  if (confirm('このタスクを削除しますか？')) {
    goalList.value = goalList.value.filter((goal) => goal.id !== goalId)
  }
}

// 並べ替え関数
const sortGoals = (order) => {
  sortOrder.value = order
}

// データの初期化処理を追加
// const startEventInput = () => {
//   eventName.value = ''
//   thoughts.value = ''
//   Object.keys(emotions.value).forEach((key) => (emotions.value[key] = 0))
//   isSubmittingEvent.value = false // ボタンを再表示

//   currentAdventure.value = {
//     id: Date.now(),
//     eventName: '',
//     thoughts: '',
//     emotions: {},
//     attackHistory: [],
//     postBattleEmotions: null,
//   }

//   goToScreen('eventInput')
// }
// const invent1 = ref([])
// 【変更】冒険の記録保存時に実績チェック

const openInvent = () => {
  // tempStats.value = { ...playerBaseStats.value }

  // invent1.value = { inventory: JSON.parse(JSON.stringify(playerInventory.value)) }
  // invent1.value = invent1.value.filter((invent1) => invent1.quantity <= 0)
  goToScreen('Invent')
}

const openStatusEdit = () => {
  tempStats.value = { ...playerBaseStats.value }
  goToScreen('statusEdit')
  isSubmittingEvent.value = true // ボタンを再表示
}

// --- ステータス保存 ---
const saveStats = () => {
  if (!tempStats.value.name.trim()) {
    alert('名前を入力してください')
  } else {
    playerBaseStats.value = { ...tempStats.value }
    goToScreen('home')
    isSubmittingEvent.value = false // ボタンを再表示
  }
}
const back = () => {
  goToScreen('home')
  isSubmittingEvent.value = false // ボタンを再表示
}

// --- 目標管理関数 ---
// const addTask = () => {
//   if (newTaskText.value.trim()) {
//     tasks.value.push({
//       id: Date.now(),
//       text: newTaskText.value.trim(),
//       completed: false,
//     })
//     newTaskText.value = ''
//   }
// }

// const toggleTask = (id) => {
//   const task = tasks.value.find((t) => t.id === id)
//   if (task) {
//     task.completed = !task.completed
//   }
// }

// const removeTask = (id) => {
//   tasks.value = tasks.value.filter((t) => t.id !== id)
// }

// ポップアップ操作用の関数
const openMemoryPopup = (adventure) => {
  selectedAdventure.value = adventure
}
const closeMemoryPopup = () => {
  selectedAdventure.value = null
}

// --- バトルロジック ---
// const getMonsterImage = () => {
//   let highestEmotion = 'default'
//   let maxValue = -1

//   for (const [emotion, value] of Object.entries(emotions.value)) {
//     if (value > maxValue) {
//       maxValue = value
//       highestEmotion = emotion
//     }
//   }

//   switch (highestEmotion) {
//     case 'anger':
//       return monsterjoy
//     case 'sorrow':
//       return monsteranger
//     case 'joy':
//       return monstersurprise
//     case 'disgust':
//       return monsterdisgust
//     case 'sprrow':
//       return monstersorrow
//     default:
//       return monsteranxiety
//   }
//   // プレースホルダーを返す（画像インポートがコメントアウトされているため）
//   // return null;
// }
// ログ表示を手動で切り替える関数
const toggleLogView = () => {
  if (isBattleOver.value) return // バトル終了後は切り替え不可
  isLogVisible.value = !isLogVisible.value
  Logmanual.value = true

  // 【変更】ログ表示に切り替わった場合もスクロール
  // if (isLogVisible.value) {
  //   nextTick(() => {
  //     const logEl = document.querySelector('.battle-log')
  //     if (logEl) logEl.scrollTop = logEl.scrollHeight
  //   })
  // }
}

// const confirmback = () => {
//   isWaitingForInput.value = false // 技名入力状態を解除
//   attackMoveName.value = '' // 入力中のテキストをリセット
// }

// 【修正】UIの状態をリセットするための関数
const returnToCommandSelect = () => {
  playerActionState.value = 'selecting_command'
  attackMoveName.value = ''
  magicChant.value = ''
  selectedSpell.value = null
}

const setPlayerName = () => {
  if (!newPlayerName.value.trim()) {
    alert('名前を入力してください。')
    return
  }
  playerBaseStats.value.name = newPlayerName.value.trim()
  playerBaseStats.value.avatar = newPlayerAvatar.value // アバターを保存
  isSubmittingEvent.value = false
  goToScreen('home') // ホーム画面へ
}

const tab = ref(true)

const retreatToHome = () => {
  // 冒険データ(currentAdventure)と敵データ(enemies)は保持したままホームに戻る
  isSubmittingEvent.value = false
  tab.value = false
  goToScreen('home')
}

const createMonsterAndStartBattle = () => {
  /*  if (!eventName.value.trim()) {
    alert('出来事の名前を入力してください。')
    return
  }
  isSubmittingEvent.value = true // ボタンを非表示にする

  const newMonster = {
    name: eventName.value,
    thoughts: thoughts.value,
    maxHp: 80,
    attack: 0,
    magicattack: 10,
    defense: 5,
    magicdefense: 10,
    DEX: 80,
    EVA: 10,
    image: getMonsterImage(),
    exp: 1,
  }
  newMonster.hp = newMonster.maxHp
  enemy.value = newMonster

  // 【変更】現在の冒険データに入力内容を保存
  if (currentAdventure.value) {
    currentAdventure.value.eventName = eventName.value
    currentAdventure.value.thoughts = thoughts.value
    currentAdventure.value.emotions = { ...emotions.value }
  }*/

  // 【変更】モンスター生成ロジック
  // const createMonsterAndStartBattle = () => {
  if (
    !eventName.value.trim() &&
    emotions.value.joy === 0 &&
    emotions.value.surprise === 0 &&
    emotions.value.disgust === 0 &&
    emotions.value.sorrow === 0 &&
    emotions.value.anxiety === 0 &&
    emotions.value.anger === 0 &&
    !thoughts.value.trim()
  ) {
    alert('出来事の名前とその時の感情と考え・思ったことを入力してください。')
    return
  } else if (!thoughts.value.trim()) {
    alert('考え・思ったことを入力してください。')
    return
  } else if (!eventName.value.trim()) {
    alert('出来事の名前を入力してください。')
    return
  } else if (
    emotions.value.joy === 0 &&
    emotions.value.surprise === 0 &&
    emotions.value.disgust === 0 &&
    emotions.value.sorrow === 0 &&
    emotions.value.anxiety === 0 &&
    emotions.value.anger === 0
  ) {
    alert('その時の感情を1つ以上入力してください。')
    return
  }

  isSubmittingEvent.value = true // ボタンを非表示にする

  const dominantEmotions = Object.entries(emotions.value)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const newEnemies = []
  // if (dominantEmotions.length === 0) {
  //   // 強い感情がない場合、通常モンスターを1体生成
  //   newEnemies.push({
  //     id: 1,
  //     name: `${eventName.value}`,
  //     hp: 80,
  //     maxHp: 80,
  //     attack: 10,
  //     defense: 5,
  //     DEX: 90,
  //     evasion: 10,
  //     element: 'neutral',
  //     exp: 30,
  //     gold: 20,
  //     image: monsterImages.neutral,
  //   })
  // } else {

  const randomstatusjoy = Math.floor(Math.random() * playerBaseStats.value.count) + 1
  const randomstatusanger = Math.floor(Math.random() * playerBaseStats.value.count) + 1
  const randomstatussorrow = Math.floor(Math.random() * playerBaseStats.value.count) + 1
  const randomstatusanxienty = Math.floor(Math.random() * playerBaseStats.value.count) + 1
  const randomstatussurprise = Math.floor(Math.random() * playerBaseStats.value.count) + 1
  const randomstatusdisgust = Math.floor(Math.random() * playerBaseStats.value.count) + 1

  dominantEmotions.forEach(([emotion], index) => {
    let monster = {
      id: index,
      hp: 10,
      maxHp: 10,
      attack: 5,
      defense: 2,
      DEX: 90,
      evasion: 10,
      exp: 30 + Math.floor(playerBaseStats.value.count / 5),
      gold: 20 + Math.floor(playerBaseStats.value.count / 5),
      image: monsterImages.default,
    }
    if (emotion === 'anger') {
      monster.name = `${eventName.value}` + '怒り'
      monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
      monster.maxHp += 5 * randomstatusanger
      monster.hp += 5 * randomstatusanger
      monster.attack += 5 * randomstatusanger
      monster.defense += 5 * randomstatusanger

      monster.image = monsterImages.anger
    } else if (emotion === 'sorrow') {
      monster.name = `${eventName.value}` + '悲しみ'
      monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
      monster.maxHp += 5 * randomstatussorrow
      monster.hp += 5 * randomstatussorrow

      monster.attack += 5 * randomstatussorrow
      monster.defense += 5 * randomstatussorrow

      monster.image = monsterImages.sorrow
    } else if (emotion === 'anxiety') {
      monster.name = `${eventName.value}` + '不安'
      monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
      monster.maxHp += 5 * randomstatusanxienty
      monster.hp += 5 * randomstatusanxienty

      monster.attack += 5 * randomstatusanxienty
      monster.defense += 5 * randomstatusanxienty

      monster.image = monsterImages.anxiety
    } else if (emotion === 'joy') {
      monster.name = `${eventName.value}` + '喜び'
      monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
      monster.maxHp += 5 * randomstatusjoy
      monster.hp += 5 * randomstatusjoy

      monster.attack += 5 * randomstatusjoy
      monster.defense += 5 * randomstatusjoy
      monster.image = monsterImages.joy
    } else if (emotion === 'surprise') {
      monster.name = `${eventName.value}` + '驚き'
      monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
      monster.maxHp += 5 * randomstatussurprise
      monster.hp += 5 * randomstatussurprise

      monster.attack += 5 * randomstatussurprise
      monster.defense += 5 * randomstatussurprise
      monster.image = monsterImages.surprise
    } else if (emotion === 'disgust') {
      monster.name = `${eventName.value}` + '嫌悪'
      monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
      monster.maxHp += 5 * randomstatusdisgust
      monster.hp += 5 * randomstatusdisgust

      monster.attack += 5 * randomstatusdisgust
      monster.defense += 5 * randomstatusdisgust
      monster.image = monsterImages.disgust
    } //else {
    //   monster.name = `${eventName.value}幻影 ${index + 1}`
    //   monster.element = ['fire', 'water', 'wood'][Math.floor(Math.random() * 3)]
    //   monster.maxHp += 5 * randomstatus
    //   monster.hp += 5 * randomstatus

    //   monster.attack += 5 * randomstatus
    //   monster.defense += 5 * randomstatus
    // }
    newEnemies.push(monster)
  })
  //}
  enemies.value = newEnemies

  if (currentAdventure.value) {
    currentAdventure.value.eventName = eventName.value
    currentAdventure.value.thoughts = thoughts.value
    currentAdventure.value.emotions = { ...emotions.value }
  }
  player.value = {
    name: playerBaseStats.value.name, // 基本ステータスの名前を参照
    avatar: playerBaseStats.value.avatar, // アバターを追加
    ...playerBaseStats.value,
    hp: playerBaseStats.value.maxHp,
    mp: playerBaseStats.value.maxMp, // MPを初期化
    isDefending: false,
    // inventory: JSON.parse(JSON.stringify(playerInventory.value)), // アイテムをディープコピー
    magic: JSON.parse(JSON.stringify(playerMagics.value)), // 魔法をディープコピー
    // 【追加】ステータス上昇効果を初期化
    boosts: { attack: 0, defense: 0, DEX: 0, evasion: 0, duration: 0 },
    lastCommand: null, // 【追加】最後に選択したコマンド
  }

  battleLog.value = []
  isPlayerTurn.value = true
  isBattleOver.value = false
  gameMessage.value = ''
  isWaitingForInput.value = false
  attackMoveName.value = ''
  returnToCommandSelect() // UI状態をリセット

  isLogVisible.value = false

  // attackHistory.value = [] // 攻撃履歴をリセット
  // console.log(playerBaseStats.value.attack)
  addLog(`あなたの感情から「${eventName.value}」が生まれた！`, 'system')
  isLogVisible.value = true

  setTimeout(() => {
    isLogVisible.value = false
  }, 2000)
  goToScreen('battle')
}

// 【追加】属性相性によるダメージ倍率を計算
const getElementMultiplier = (attackElement, targetElement) => {
  if (attackElement === 'neutral' || !attackElement || !targetElement) return 1.0
  if (attackElement === 'fire' && targetElement === 'wood') return 1.5
  if (attackElement === 'wood' && targetElement === 'water') return 1.5
  if (attackElement === 'water' && targetElement === 'fire') return 1.5
  if (attackElement === 'fire' && targetElement === 'water') return 0.5
  if (attackElement === 'wood' && targetElement === 'fire') return 0.5
  if (attackElement === 'water' && targetElement === 'wood') return 0.5
  return 1.0
}

// addLog関数からスクロール処理
const addLog = (message, type = 'normal') => {
  battleLog.value.push({ text: message, type: type })
}

const checkHit = (attacker, target) => {
  // もしaccuracyやevasionが未設定でも、デフォルト値を使って計算がNaNになるのを防ぐ
  // console.log(attacker.DEX)
  // console.log(target.evasion)
  const totalAccuracy = (attacker.DEX || 100) + (attacker.boosts?.DEX || 0)
  const totalEvasion = (target.evasion || 5) + (target.boosts?.evasion || 0)
  const hitChance = (totalAccuracy - totalEvasion) / 100
  return Math.random() < hitChance
}

// 【追加】再挑戦（ホームから）用の関数
const resumeBattle = () => {
  // プレイヤー情報を現在のステータスで再初期化（強化反映）
  player.value = {
    name: playerBaseStats.value.name,
    avatar: playerBaseStats.value.avatar,
    ...playerBaseStats.value,
    hp: playerBaseStats.value.maxHp, // HP全快
    mp: playerBaseStats.value.maxMp, // MP全快
    isDefending: false,
    magic: JSON.parse(JSON.stringify(playerMagics.value)),
    boosts: { attack: 0, defense: 0, accuracy: 0, evasion: 0, duration: 0 },
  }

  enemies.value = enemies.value.map((enemy) => ({
    ...enemy,
    hp: enemy.maxHp,
  }))

  // 敵は `enemies.value` をそのまま使う（HPは減ったまま）

  battleLog.value = []
  isPlayerTurn.value = true
  isBattleOver.value = false
  gameMessage.value = ''
  returnToCommandSelect()
  isLogVisible.value = false
  isSubmittingEvent.value = true
  addLog(`再び立ち上がった！ バトル再開！`)
  isLogVisible.value = true
  setTimeout(() => {
    isLogVisible.value = false
  }, 2000)
  goToScreen('battle')
}

const retryBattle = () => {
  player.value.hp = player.value.maxHp
  player.value.mp = player.value.maxMp // MPも回復
  player.value.isDefending = false
  enemies.value.hp = enemies.value.maxHp
  enemies.value.mp = enemies.value.maxMp

  enemies.value = enemies.value.map((enemy) => ({
    ...enemy,
    hp: enemy.maxHp,
  }))

  isBattleOver.value = false
  gameMessage.value = ''
  isPlayerTurn.value = true
  isWaitingForInput.value = false
  attackMoveName.value = ''
  battleLog.value = []

  if (currentAdventure.value) {
    currentAdventure.value.attackHistory = [] // 【変更】攻撃履歴のみリセット
  }
  addLog(`${player.value.name}は再び立ち上がった！`, 'positive')
  setTimeout(() => {
    isLogVisible.value = false
  }, 1500)
}

// const playerAction = (action) => {
//   if (!isPlayerTurn.value || isBattleOver.value) return
//   if (action === 'attack') {
//     isWaitingForInput.value = true
//   } else if (action === 'defend') {
//     player.value.isDefending = true
//     addLog(`${player.value.name} は防御の姿勢をとった！`)
//     endPlayerTurn()
//   }
// }

// 【追加】ツールチップ操作用の関数
const showTooltip = (description) => {
  tooltipText.value = description
}
const tooltipPower = ref('')
const tooltipdescription = ref('')

const showTooltipmagic = (textpower, description) => {
  tooltipPower.value = textpower
  tooltipdescription.value = description
}

const hideTooltip = () => {
  tooltipText.value = ''
}
const hiddenTooltipmagic = () => {
  tooltipPower.value = ''
  tooltipdescription.value = ''
}

// 【変更】コマンド選択処理
// const selectCommand = (command) => {
//   if (!isPlayerTurn.value || isBattleOver.value) return

//   if (command === 'attack' || command === 'magic') {
//     playerActionState.value = 'selecting_target'
//   } else if (command === 'defend') {
//     player.value.isDefending = true
//     addLog(`${player.value.name} は精神を集中させ、防御の姿勢をとった！`)
//     endPlayerTurn()
//   } else if (command === 'item') {
//     playerActionState.value = 'selecting_item'
//   }
// }
// 【修正】選択したコマンドを記憶
const selectCommand = (command) => {
  Logmanual.value = false
  if (!isPlayerTurn.value || isBattleOver.value) return

  player.value.lastCommand = command // コマンドを記憶

  if (command === 'attack' || command === 'magic') {
    playerActionState.value = 'selecting_target' // ターゲット選択へ
  } else if (command === 'defend') {
    player.value.isDefending = true
    addLog(`${player.value.name} は精神を集中させ、防御の姿勢をとった！`)
    endPlayerTurn()
  } else if (command === 'item') {
    playerActionState.value = 'selecting_item' // アイテム選択へ
  }
}

// 【追加】ターゲット選択関数
// const selectTarget = (index) => {
//   if (playerActionState.value !== 'selecting_target') return
//   selectedTargetIndex.value = index

//   if (player.value.lastCommand === 'attack') {
//     playerActionState.value = 'inputting_attack'
//   } else if (player.value.lastCommand === 'magic') {
//     playerActionState.value = 'selecting_magic'
//   }
// }

const selectTarget = (index) => {
  if (playerActionState.value !== 'selecting_target') return
  // 選択した敵が生きていなければ何もしない
  if (enemies.value[index].hp <= 0) return

  selectedTargetIndex.value = index

  if (player.value.lastCommand === 'attack') {
    playerActionState.value = 'inputting_attack' // 技名入力へ
  } else if (player.value.lastCommand === 'magic') {
    playerActionState.value = 'selecting_magic' // 魔法選択へ
  }
}

// const confirmAttack = () => {
//   if (!attackMoveName.value.trim()) {
//     alert('入力してください！')
//     return
//   }
//   const damage = calculateDamage(player.value, enemy.value)
//   enemy.value.hp = Math.max(0, enemy.value.hp - damage)
//   addLog(
//     `${player.value.name} の「${attackMoveName.value}」！ ${enemy.value.name} に ${damage} のダメージ！`,
//     'player-action',
//   )
//   isWaitingForInput.value = false
//   attackMoveName.value = ''
//   endPlayerTurn()
// }
// 【変更】confirmAttack関数にボーナスロジックを追加
// const confirmAttack = () => {
//   if (!attackMoveName.value.trim()) {
//     alert('技名を入力してください！')
//     return
//   }

//   // 1. まず基本ダメージを計算
//   let damage = calculateDamage(player.value, enemy.value)
//   let isPositive = false

//   // 2. ポジティブな単語が含まれているかチェック
//   for (const word of positiveWords.value) {
//     if (attackMoveName.value.includes(word)) {
//       isPositive = true
//       break // 1つでも見つかればチェック終了
//     }
//   }

//   // 3. もしポジティブなら、ダメージを1.5倍にし、ログを追加
//   if (isPositive) {
//     addLog('ポジティブな言葉の力で攻撃が強化された！', 'positive')
//     damage = Math.floor(damage * 2)
//   }

//   // 4. 最終ダメージで敵のHPを減らす
//   enemy.value.hp = Math.max(0, enemy.value.hp - damage)
//   addLog(
//     `${player.value.name} の「${attackMoveName.value}」！ ${enemy.value.name} に ${damage} のダメージ！`,
//     'player-action',
//   )

//   isWaitingForInput.value = false
//   attackMoveName.value = ''
//   endPlayerTurn()
// }

// 【変更】confirmAttack関数にペナルティロジックを追加
const confirmAttack = () => {
  const moveName = attackMoveName.value.trim() // 最初に入力値から空白を除去
  const target = enemies.value[selectedTargetIndex.value]
  if (moveName.length === 0) {
    alert('別の考えを入力してください')
    return
  }
  // 命中判定
  if (!checkHit(player.value, target)) {
    addLog(`しかし ${player.value.name} の攻撃は外れた！`)
    endPlayerTurn()
    return
  }
  // let damage = calculateDamage(player.value, enemy.value)
  let damage = calculateDamage(player.value, target)
  let isPenalty = false

  // 1. ペナルティ条件をチェック
  if (
    currentAdventure.value &&
    currentAdventure.value.attackHistory.includes(attackMoveName.value)
  ) {
    addLog('同じ言葉では、力が弱まる', 'penalty')
    damage = Math.floor(damage * 0.5)
    isPenalty = true
  } else if (attackMoveName.value.length < 5) {
    addLog('短い言葉では、力が弱まる', 'penalty')
    damage = Math.floor(damage * 0.5)
    isPenalty = true
  }

  // 2. ペナルティがない場合のみ、ポジティブボーナスをチェック
  if (!isPenalty) {
    let isPositive = false
    for (const word of positiveWords.value) {
      if (attackMoveName.value.includes(word)) {
        isPositive = true
        break
      }
    }
    if (isPositive) {
      addLog('ポジティブな言葉の力で攻撃が強化された！', 'positive')
      damage = Math.floor(damage * 1.5)
      // unlockAchievement('positive_warrior') // 実績チェック
      playerBaseStats.value.positiveAttacksUsed++
      unlockAchievement('positive_warrior')
      if (playerBaseStats.value.positiveAttacksUsed >= 25) unlockAchievement('power_word')
      if (playerBaseStats.value.positiveAttacksUsed >= 70) unlockAchievement('positive_master')
      if (playerBaseStats.value.positiveAttacksUsed >= 100) unlockAchievement('positive_legend')
    }
  }
  const multiplier = getElementMultiplier('neutral', target.element)

  if (multiplier > 1.0) {
    addLog('効果は抜群だ！', 'positive')
  }
  if (multiplier < 1.0) {
    addLog('効果はいまひとつのようだ...', 'penalty')
  }
  damage = Math.floor(damage * multiplier) // ダメージに倍率を適用

  target.hp = Math.max(0, target.hp - damage) // ターゲットのHPを減らす
  addLog(
    `${player.value.name} の「${attackMoveName.value}」！ ${target.name} に ${damage} のダメージ！`,
    'player-action',
  )
  alldamage.value += damage
  // console.log(alldamage.value)
  if (!isPenalty && currentAdventure.value) {
    currentAdventure.value.attackHistory.push(attackMoveName.value)
  }

  endPlayerTurn()
}

const battleback = () => {
  playerActionState.value = 'selecting_target'
  selectedTargetIndex.value = null
}

// 3. 最終ダメージで敵のHPを減らす
//   if (multiplier !== 1.0) {
//     enemy.value.hp = Math.max(0, enemy.value.hp - damage)
//     addLog(
//       `${player.value.name} の「${attackMoveName.value}」！ ${enemy.value.name} に ${damage} のダメージ！`,
//       'player-action',
//     )
//   }
//   // damage = Math.floor(damage * multiplier);
//   target.hp = Math.max(0, target.hp - damage);
//   // 4. ペナルティがなければ攻撃履歴に追加
//   // if (!isPenalty && currentAdventure.value) {
//   currentAdventure.value.attackHistory.push(attackMoveName.value)
//   // }

//   isWaitingForInput.value = false
//   attackMoveName.value = ''
//   endPlayerTurn()
// }

// 【追加】魔法選択・実行
const selectSpell = (spell) => {
  if (player.value.mp < spell.mpCost) {
    addLog('MPが足りない！', 'penalty')
    return
  }
  selectedSpell.value = spell
  playerActionState.value = 'inputting_magic'
}

const confirmMagicAttack = () => {
  if (!magicChant.value.trim()) {
    alert('考えを入力してください。')
    return
  }

  const target = enemies.value[selectedTargetIndex.value] // 選択したターゲットを取得
  const spell = selectedSpell.value
  player.value.mp -= spell.mpCost
  addLog(`MPを ${spell.mpCost} 消費した。`)
  // console.log(playerBaseStats.value.magicattack)
  if (!checkHit(player.value, target)) {
    addLog(`しかし ${spell.name} は ${target.name} には当たらなかった！`)
    endPlayerTurn()
    return
  }

  let damage = spell.power + Math.floor(magicChant.value.length / 2)
  damage = Math.round(damage * (1 + (Math.random() - 0.5) * 0.2))

  // 属性倍率を計算
  const multiplier = getElementMultiplier(spell.element, target.element)
  if (multiplier > 1.0) {
    addLog('効果は抜群だ！', 'positive')
  }
  if (multiplier < 1.0) {
    addLog('効果はいまひとつのようだ...', 'penalty')
  }
  damage = Math.floor(damage * multiplier) // ダメージに倍率を適用

  target.hp = Math.max(0, target.hp - damage) // ターゲットのHPを減らす
  addLog(
    `${player.value.name} は「${magicChant.value}」と唱え、${spell.name}を放った！ ${target.name} に ${damage} のダメージ！`,
    'player-action',
  )

  if (currentAdventure.value) {
    currentAdventure.value.attackHistory.push(`${magicChant.value}`)
  }
  endPlayerTurn()
}

//   if (!magicChant.value.trim()) {
//     alert('別の考えを入力してください。')
//     return
//   }
//   const target = enemies.value[selectedTargetIndex.value]; // 【変更】選択した敵が対象
//   const spell = selectedSpell.value;

//   // const spell = selectedSpell.value
//   player.value.mp -= spell.mpCost
//   addLog(`MPを ${spell.mpCost} 消費した。`)

//   if (!checkHit(player.value, enemy.value)) {
//     addLog(`しかし ${spell.name} は当たらなかった！`)
//     endPlayerTurn()
//     return
//   }

//   let damage = spell.power + Math.floor(magicChant.value.length / 2)
//   damage = Math.round(damage * (1 + (Math.random() - 0.5) * 0.2))

//   enemy.value.hp = Math.max(0, enemy.value.hp - damage)
//   addLog(
//     `${player.value.name} は「${magicChant.value}」と唱え、${spell.name}を放った！ ${enemy.value.name} に ${damage} のダメージ！`,
//     'player-action',
//   )
//   const multiplier = getElementMultiplier(spell.element, target.element); // 【追加】属性倍率計算
//   damage = Math.floor(damage * multiplier); // 【追加】倍率を適用
//   target.hp = Math.max(0, target.hp - damage);

//   if (currentAdventure.value) {
//     currentAdventure.value.attackHistory.push(`${magicChant.value}`)
//   }
//   endPlayerTurn()
// }
// 【追加】アイテム使用
const useItem = (item) => {
  // const inventoryItem = playerInventory.value.find((invItem) => invItem.id === item.id)
  if (item.quantity <= 0) return

  if (item.effect === 'heal') {
    player.value.hp = Math.min(player.value.maxHp, player.value.hp + item.power)
    addLog(`アイテム「${item.name}」を使った！ HPが ${item.power} 回復した！`, 'positive')
  } else if (item.effect === 'boost') {
    // 既存の効果をリセット
    //player.value.boosts = { attack: 0, defense: 0, DEX: 0, evasion: 0, duration: 0 }
    // 新しい効果を適用
    player.value.boosts[item.targetStat] = item.power
    player.value.boosts.duration = item.duration

    addLog(`アイテム「${item.name}」を使った！ ${item.description}！`, 'positive')
  }

  item.quantity -= 1
  playerInventory.value = playerInventory.value.filter(
    (playerInventory) => playerInventory.quantity > 0,
  )
  // item.value = item.value.filter((item) => item.quantity > 0)
  // inventoryItem.quantity -= 1
  endPlayerTurn()
}

// 【修正】ターン終了時の処理を明確化
const endPlayerTurn = () => {
  isPlayerTurn.value = false // プレイヤーのターンを終了
  selectedTargetIndex.value = null
  isLogVisible.value = true // ログを表示
  returnToCommandSelect() // 次のターンのためにUI状態をリセット
  checkWinner()

  // バトルが続いていれば、敵のターンを予約
  if (!isBattleOver.value) {
    setTimeout(enemyTurn, 1000)
  }
}

const enemyTurn = async () => {
  if (isBattleOver.value) return

  // 生きている敵が順番に行動
  for (const enemy of enemies.value) {
    if (enemy.hp > 0 && !isBattleOver.value) {
      // 途中でバトルが終わったらループ中断
      await new Promise((resolve) => setTimeout(resolve, 800)) // 次の敵の行動まで少し待つ

      let message = ''
      if (!checkHit(enemy, player.value)) {
        message = `しかし ${enemy.name} の攻撃は外れた！`
        addLog(message)
      } else {
        let damage = calculateDamage(enemy, player.value) // 敵の攻撃は属性考慮なし(必要なら追加)
        if (player.value.isDefending) {
          damage = Math.floor(damage / 2)
          addLog(`しかし ${player.value.name} は防御している！ ダメージが軽減された！`)
        }
        player.value.hp = Math.max(0, player.value.hp - damage)
        message = `${enemy.name} の攻撃！ ${player.value.name} は ${damage} のダメージを受けた！`
        addLog(message, 'enemy-action')
      }
      player.value.isDefending = false // プレイヤーの防御は1回の攻撃で解除される
      checkWinner() // 敵の攻撃でバトルが終わる可能性もある
    }
  }
  // ターン開始時にプレイヤーのバフターン数を減らす
  if (player.value.boosts.duration > 0) {
    player.value.boosts.duration--
    if (player.value.boosts.duration === 0) {
      player.value.boosts = { attack: 0, defense: 0, accuracy: 0, evasion: 0, duration: 0 }
      addLog('ステータス上昇効果が切れた。')
    }
  }

  // 全ての敵の行動が終わったら、プレイヤーのターンに戻す
  if (!isBattleOver.value) {
    isPlayerTurn.value = true
    setTimeout(() => {
      isLogVisible.value = false
    }, 1500)
  }
}

//   if (isBattleOver.value) return
//   // ターン開始時にステータス上昇効果のターン数を減らす
//   if (player.value.boosts.duration > 0) {
//     player.value.boosts.duration--
//     if (player.value.boosts.duration === 0) {
//       player.value.boosts = { attack: 0, defense: 0, DEX: 0, evasion: 0, duration: 0 }
//       addLog('ステータス上昇効果が切れた。')
//     }
//   }
//   let message = ''
//   if (!checkHit(enemy.value, player.value)) {
//     message = `しかし ${enemy.value.name} の攻撃は外れた！`
//     addLog(message)
//   } else {
//     let damage = calculateDamage(enemy.value, player.value)
//     if (player.value.isDefending) {
//       damage = Math.floor(damage / 2)
//       addLog(`しかし ${player.value.name} は防御している！ ダメージが軽減された！`)
//     }
//     player.value.hp = Math.max(0, player.value.hp - damage)
//     message = `${enemy.value.name} の攻撃！ ${player.value.name} は ${damage} のダメージを受けた！`
//     addLog(message, 'enemy-action')
//     // player.value.isDefending = false
//     // checkWinner()
//     // if (!isBattleOver.value) {
//     //   isPlayerTurn.value = true
//     //   setTimeout(() => {
//     //     isLogVisible.value = false
//     //   }, 1500)
//   }
//   player.value.isDefending = false
//   checkWinner()

//   // バトルが続いていれば、プレイヤーのターンに戻し、コマンド画面を表示
//   if (!isBattleOver.value) {
//     isPlayerTurn.value = true
//     setTimeout(() => {
//       isLogVisible.value = false
//     }, 1500) // ログを読む時間
//   }
// }

// const calculateDamage = (attacker, target) => {
//   const baseDamage = attacker.attack - target.defense / 2
//   const randomFactor = (Math.random() - 0.5) * 4
//   const finalDamage = Math.round(baseDamage + randomFactor)
//   return Math.max(1, finalDamage)
// }

// 【変更】calculateDamageはボーナス計算を含まない形に戻す（純粋なダメージ計算）
const calculateDamage = (attacker, target) => {
  const totalAttack = (attacker.attack || 0) + (attacker.boosts?.attack || 0)
  const totalDefense = (target.defense || 0) + (target.boosts?.defense || 0)
  const baseDamage = totalAttack - totalDefense
  const randomFactor = (Math.random() - 0.5) * 4
  return Math.max(1, Math.round(baseDamage + randomFactor))
}

const checkWinner = () => {
  //   if (enemy.value.hp <= 0) {
  //     isBattleOver.value = true
  //     didPlayerWin.value = true
  //     // gameMessage.value = '感情を乗り越えた！'
  //     addLog(`${enemy.value.name} は消え去った...`, 'system')

  //     // EXP獲得処理
  //     // const monsterExp = enemy.value.exp || 10 // モンスターがexpを持っていなければ50
  //     const monsterExp = Math.floor(Math.random() * 6) + 5 // モンスターがexpを持っていなければ50
  //     playerBaseStats.value.exp += monsterExp
  //     addLog(`${monsterExp} の経験値を手に入れた！`, 'positive')

  //     // ポップアップを表示する
  //     isEmotionLogVisible.value = true
  //   } else if (player.value.hp <= 0) {
  //     isBattleOver.value = true
  //     didPlayerWin.value = false
  //     // gameMessage.value = '感情に飲み込まれた...'
  //     addLog(`${player.value.name} は倒れた...`, 'enemy-action')
  //     addLog('焦らず少しずつ進んでみよう', 'positive')
  //   }
  // }
  // 全ての敵のHPが0以下かチェック
  if (enemies.value.length > 0 && enemies.value.every((e) => e.hp <= 0)) {
    isBattleOver.value = true
    didPlayerWin.value = true
    // gameMessage.value = '🎉 感情を乗り越えた！'
    addLog(`全ての敵を倒した！`)
    playerBaseStats.value.count += 1

    // コマンドに戻るボタンをオフ
    Logmanual.value = false

    // 経験値とゴールドは敵ごとに合算
    let totalExp = 0
    let totalGold = 0
    enemies.value.forEach((e) => {
      totalExp += e.exp || 0
      totalGold += e.gold || 0
    })
    // 記録した数
    playerBaseStats.value.count += 1

    playerBaseStats.value.exp += totalExp
    playerBaseStats.value.gold += totalGold
    addLog(`${totalExp} の経験値と ${totalGold} ゴールドを手に入れた！`, 'positive')

    // unlockAchievement('first_win') // 実績チェック
    playerBaseStats.value.battlesWon++
    // console.log(playerBaseStats.value.battlesWon)
    unlockAchievement('first_win')
    if (playerBaseStats.value.battlesWon >= 15) unlockAchievement('battle_novice')
    if (playerBaseStats.value.battlesWon >= 70) unlockAchievement('battle_veteran')
    if (playerBaseStats.value.battlesWon >= 100) unlockAchievement('battle_master')

    isEmotionLogVisible.value = true
  } else if (player.value.hp <= 0) {
    // プレイヤー敗北条件は変更なし
    isBattleOver.value = true
    didPlayerWin.value = false
    gameMessage.value = ''
    addLog(`${player.value.name} は倒れた...`, 'enemy-action')
    addLog('負けることは終わりじゃない。それは新しい学びの始まり。', 'positive')
  }
}
</script>

<template>
  <div id="app-wrapper">
    <!-- <main class="screen-content"> -->
    <div v-if="achievementToast" class="achievement-toast">🏆 実績解除: {{ achievementToast }}</div>

    <div v-if="currentScreen === 'login'" class="screen login-screen">
      <h1>キャラクター作成</h1>
      <!-- <button @click="a">作成</button> -->
      <!-- <input id="goal-text" type="text" v-model="newGoal.text" placeholder="例: 10分散歩する" /> -->
      <form @submit.prevent="setPlayerName" class="login-text">
        <div class="form-group">
          <label for="player-name">名前</label>
          <input type="text" id="player-name" v-model="newPlayerName" placeholder="太郎" />
        </div>

        <div class="form-group">
          <label>アバター</label>
          <div class="avatar-selector">
            <img
              v-for="avatarSrc in avatarOptions"
              :key="avatarSrc"
              :src="avatarSrc"
              alt="アバター"
              class="avatar-option"
              :class="{ selected: newPlayerAvatar === avatarSrc }"
              @click="newPlayerAvatar = avatarSrc"
            />
          </div>
        </div>
        <button type="submit" class="save-button">決定</button>
      </form>
    </div>

    <div v-if="currentScreen === 'home'" class="screen home-screen">
      <div class="home-layout">
        <div class="home-left">
          <h3>今日の目標</h3>
          <div class="goal-highlight">
            <span v-if="allCompleteGoal.length === 0" class="allcompletegoal"
              >今日の目標はありません</span
            >
            <li
              v-for="goal in topPriorityGoals"
              :key="goal.id"
              :class="'priority-' + goal.priority"
            >
              <span class="goal-priority">[{{ priorityText[goal.priority] }}]</span>
              {{ goal.text }} (+{{ goal.exp }} EXP +{{ goal.gold }} G)
            </li>
          </div>
          <div class="character-art">
            <img class="placeholder-image" :src="playerBaseStats.avatar" />
          </div>
        </div>

        <div class="home-right">
          <div class="item-box">
            <button @click="openInvent">
              <img src="@/assets/travel_bag.png" />
              <div class="inventory-name">インベントリ</div>
            </button>
          </div>
          <div class="status-box">
            <h3>経験値：{{ playerBaseStats.exp }} EXP</h3>
            <h3>所持金： {{ playerBaseStats.gold }} G</h3>

            <p>名前: {{ playerBaseStats.name }}</p>
            <p>最大HP: {{ playerBaseStats.maxHp }}</p>
            <p>最大MP: {{ playerBaseStats.maxMp }}</p>
            <p>攻撃力: {{ playerBaseStats.attack }}</p>
            <p>防御力: {{ playerBaseStats.defense }}</p>
            <p>命中率: {{ playerBaseStats.DEX }}%</p>
            <p>回避率: {{ playerBaseStats.evasion }}%</p>
            <button @click="openStatusEdit" class="edit-button">変更</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentScreen === 'goalList'" class="screen goal-screen">
      <h1>目標リスト</h1>

      <form @submit.prevent="addGoal" class="goal-add-form">
        <div class="form-row">
          <label for="goal-text">タスク内容</label>
          <input id="goal-text" type="text" v-model="newGoal.text" placeholder="例: 10分散歩する" />
        </div>
        <!-- <div class="form-row">
            <label for="goal-exp">獲得EXP</label>
            <input id="goal-exp" type="number" v-model.number="newGoal.exp" min="1" />
          </div> -->
        <div class="form-row">
          <label for="goal-priority">優先度</label>
          <select id="goal-priority" v-model.number="newGoal.priority">
            <option value="3">高</option>
            <option value="2">中</option>
            <option value="1">低</option>
          </select>
        </div>
        <button type="submit" class="add-button">タスクを追加</button>
      </form>

      <hr class="divider" />

      <!-- <p>目標を達成して経験値を獲得</p> -->

      <div class="sort-buttons">
        <button @click="sortGoals('desc')" :class="{ active: sortOrder === 'desc' }">
          優先度 (高い順)
        </button>
        <button @click="sortGoals('asc')" :class="{ active: sortOrder === 'asc' }">
          優先度 (低い順)
        </button>
      </div>

      <ul class="goal-list">
        <li
          v-for="goal in computedGoals"
          :key="goal.id"
          :class="['priority-' + goal.priority, { completed: goal.completed }]"
        >
          <div class="goal-info">
            <span class="goal-priority">[{{ priorityText[goal.priority] }}]</span>
            <span class="goal-text"
              >{{ goal.text }} ( +{{ goal.exp }} EXP + {{ goal.gold }} G)</span
            >
          </div>
          <div class="goal-actions">
            <button @click="completeGoal(goal)" :disabled="goal.completed" class="complete-btn">
              {{ goal.completed ? '達成済み' : '達成' }}
            </button>
            <button @click="deleteGoal(goal.id)" class="delete-btn">削除</button>
          </div>
        </li>
      </ul>
    </div>

    <div v-else-if="currentScreen === 'statusEdit'" class="screen setup-screen">
      <h1>ステータス変更</h1>
      <p>残り経験値：{{ tempStats.exp }} EXP</p>
      <div class="form-group">
        <label for="stat-name">名前</label>
        <input type="text" id="stat-name" v-model="tempStats.name" />
      </div>
      <div class="form-group">
        <label for="stat-hp">最大HP (必要EXP:10)</label>
        <input type="number" v-model.number="tempStats.maxHp" readonly />
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="upgradeStat('maxHp')"
          class="plus-button"
          :disabled="tempStats.exp < upgradeCost.maxHp"
        >
          +
        </button>
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="downgradeStat('maxHp')"
          class="minus-button"
          :disabled="tempStats.exp >= playerBaseStats.exp"
        >
          -
        </button>
      </div>

      <div class="form-group">
        <label for="stat-mp">最大MP (必要EXP:10)</label>
        <input type="number" v-model.number="tempStats.maxMp" readonly />
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="upgradeStat('maxMp')"
          class="plus-button"
          :disabled="tempStats.exp < upgradeCost.maxMp"
        >
          +
        </button>
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="downgradeStat('maxMp')"
          class="minus-button"
          :disabled="tempStats.exp >= playerBaseStats.exp"
        >
          -
        </button>
      </div>

      <div class="form-group">
        <label for="stat-attack">攻撃力 (必要EXP:10)</label>
        <input type="number" v-model.number="tempStats.attack" readonly />
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="upgradeStat('attack')"
          class="plus-button"
          :disabled="tempStats.exp < upgradeCost.attack"
        >
          +
        </button>
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="downgradeStat('attack')"
          class="minus-button"
          :disabled="tempStats.exp >= playerBaseStats.exp"
        >
          -
        </button>
      </div>
      <div class="form-group">
        <label for="stat-defense">防御力 (必要EXP:10)</label>
        <input type="number" v-model.number="tempStats.defense" readonly />
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="upgradeStat('defense')"
          class="plus-button"
          :disabled="tempStats.exp < upgradeCost.defense"
        >
          +
        </button>
        <button
          v-if="playerBaseStats.exp >= 10"
          @click="downgradeStat('defense')"
          class="minus-button"
          :disabled="tempStats.exp >= playerBaseStats.exp"
        >
          -
        </button>
      </div>

      <div class="form-group">
        <label for="stat-DEX">命中率 (必要EXP:100)</label>
        <input type="number" v-model.number="tempStats.DEX" readonly />
        <button
          v-if="playerBaseStats.exp >= 100"
          @click="upgradeStat('DEX')"
          class="plus-button"
          :disabled="tempStats.exp < upgradeCost.DEX"
        >
          +
        </button>
        <button
          v-if="playerBaseStats.exp >= 100"
          @click="downgradeStat('DEX')"
          class="minus-button"
          :disabled="tempStats.exp >= playerBaseStats.exp"
        >
          -
        </button>
      </div>

      <div class="form-group">
        <label for="stat-evasion">回避率 (必要EXP:100)</label>
        <input type="number" v-model.number="tempStats.evasion" readonly />
        <button
          v-if="playerBaseStats.exp >= 100"
          @click="upgradeStat('evasion')"
          class="plus-button"
          :disabled="tempStats.exp < upgradeCost.evasion"
        >
          +
        </button>
        <button
          v-if="playerBaseStats.exp >= 100"
          @click="downgradeStat('evasion')"
          class="minus-button"
          :disabled="tempStats.exp >= playerBaseStats.exp"
        >
          -
        </button>
      </div>
      <div class="button-group">
        <button @click="saveStats" class="save-button">保存する</button>
        <button @click="back" class="cancel-button">戻る</button>
      </div>
    </div>

    <div v-else-if="currentScreen === 'Invent'" class="screen inventory-screen">
      <h1>インベントリ</h1>
      <div v-if="playerInventory.length === 0">アイテムを所持していません</div>

      <div v-else-if="playerInventory" class="inventory-grid">
        <div
          v-for="item in playerInventory"
          :key="item.id"
          @mouseover="showTooltip(item.description)"
          @mouseleave="hideTooltip"
          class="inventory-card"
        >
          <!-- <div v-if="item.quantity >= 1"> -->
          <img :src="item.image" :alt="item.name" class="item-image" />
          <span class="item-name">{{ item.name }} 所持数: {{ item.quantity }} 個</span>
          <!-- </div> -->
        </div>
      </div>
      <div v-if="tooltipText" class="tooltip-inventory">{{ tooltipText }}</div>
    </div>

    <div v-else-if="currentScreen === 'eventInput'" class="screen setup-screen">
      <h1>出来事と感情の記録</h1>
      <div class="form-group">
        <label for="event-name">出来事の名前</label>
        <input type="text" id="event-name" v-model="eventName" placeholder="例：大事なプレゼン" />
      </div>
      <div class="form-group">
        <label>その時の感情 (0 ~ 100)</label>
        <div class="emotion-sliders">
          <div v-for="(value, key) in emotions" :key="key" class="slider-group">
            <span>{{ emotionLabels[key] }}</span>
            <input type="range" min="0" max="100" v-model.number="emotions[key]" />
            <input
              type="number"
              min="0"
              max="100"
              :value="emotions[key]"
              @input="handleEmotionInput(key, $event)"
              class="emtion-number-input"
            />
            <!-- <span>{{ value }}</span> -->
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="thoughts">考え・思ったこと</label>
        <textarea
          id="thoughts"
          v-model="thoughts"
          rows="3"
          placeholder="例：とても緊張したけど、やりきった。"
        ></textarea>
      </div>
      <div class="button-group">
        <button @click="createMonsterAndStartBattle" class="create-button">モンスターを作成</button>
      </div>
    </div>

    <div v-else-if="currentScreen === 'battle'" id="game-container">
      <div
        class="background"
        :style="{ backgroundImage: 'url(/path/to/battle_background.png)' }"
      ></div>
      <div class="enemy-area">
        <div
          v-for="(enemyUnit, index) in enemies"
          :key="enemyUnit.id"
          class="enemy-container"
          :class="{
            'is-targetable': playerActionState === 'selecting_target' && enemyUnit.hp > 0,
            'is-dead': enemyUnit.hp <= 0,
            'selected-target': selectedTargetIndex === index, // 選択中のターゲットを強調
          }"
          @click="selectTarget(index)"
        >
          <div class="character-status enemy-status">
            <h2>
              <span v-if="enemyUnit.element">{{ elementIcons[enemyUnit.element] }}</span>
              {{ enemyUnit.name }}
            </h2>
            <div class="hp-bar-container">
              <div
                class="hp-bar enemy"
                :style="{
                  width: enemyUnit.maxHp > 0 ? `${(enemyUnit.hp / enemyUnit.maxHp) * 100}%` : '0%',
                }"
              ></div>
            </div>
            <span class="hp-text">{{ enemyUnit.hp }} / {{ enemyUnit.maxHp }}</span>
          </div>
          <img
            :src="enemyUnit.image || monsterImages.default"
            :alt="enemyUnit.name"
            class="monster-image"
          />
        </div>
      </div>
      <div class="main-content-area">
        <div v-if="isLogVisible" class="battle-log-wrapper">
          <div class="battle-log">
            <p v-for="(log, index) in battleLog" :key="index" :class="log.type">{{ log.text }}</p>
          </div>
          <!-- <div v-if="isBattleOver && !isEmotionLogVisible" class="game-over-message">
            <h2>{{ gameMessage }}</h2>
            <button v-if="didPlayerWin" @click="finalizeAdventure" class="win-button">
              ホームに戻る
            </button>
            <button v-else @click="retryBattle" class="lose-button">再挑戦</button>
          </div>
          <button v-else-if="Logmanual" @click="toggleLogView" class="return-button">
            コマンドに戻る
          </button> -->

          <div v-if="isBattleOver && !isEmotionLogVisible" class="game-over-message">
            <h2>{{ gameMessage }}</h2>
            <button v-if="didPlayerWin" @click="finalizeAdventure" class="win-button">
              ホームに戻る
            </button>
            <div v-else class="lose-buttons">
              <button @click="retryBattle" class="lose-button">再挑戦</button>
              <button @click="retreatToHome" class="retreat-button">ホームに戻る</button>
            </div>
          </div>
          <button v-else-if="Logmanual" @click="toggleLogView" class="return-button">
            コマンドに戻る
          </button>
        </div>
        <div v-else class="player-control-wrapper">
          <div class="action-menu">
            <div class="command-menu" v-if="playerActionState === 'selecting_command'">
              <button @click="selectCommand('attack')" :disabled="!isPlayerTurn">攻撃</button>
              <button @click="selectCommand('defend')" :disabled="!isPlayerTurn">防御</button>
              <button @click="selectCommand('magic')" :disabled="!isPlayerTurn">スキル</button>
              <button @click="selectCommand('item')" :disabled="!isPlayerTurn">アイテム</button>
              <button @click="toggleLogView" :disabled="!isPlayerTurn" class="log-view-button">
                ログを見る
              </button>
            </div>

            <div class="targeting-message" v-else-if="playerActionState === 'selecting_target'">
              <p>モンスターを選択してください</p>
              <button @click="returnToCommandSelect" class="cancel-button small">
                コマンドに戻る
              </button>
            </div>

            <div class="attack-input-form" v-else-if="playerActionState === 'inputting_attack'">
              <p>ターゲット: {{ enemies[selectedTargetIndex]?.name }}</p>
              <input
                type="text"
                v-model="attackMoveName"
                placeholder="別の考えを入力"
                @keyup.enter="confirmAttack"
              />
              <div class="attack-buttons">
                <button @click="confirmAttack">決定</button>
                <button @click="battleback" class="cancel-button">戻る</button>
              </div>
            </div>

            <div class="sub-menu" v-else-if="playerActionState === 'selecting_magic'">
              <p>ターゲット: {{ enemies[selectedTargetIndex]?.name }}</p>
              <button
                v-for="spell in playerMagics"
                :key="spell.id"
                @mouseover="showTooltipmagic(spell.textpower, spell.description)"
                @mouseleave="hiddenTooltipmagic"
                @click="selectSpell(spell)"
                :disabled="player.mp < spell.mpCost"
              >
                {{ elementIcons[spell.element] }} {{ spell.name }} (MP: {{ spell.mpCost }})
              </button>
              <button @click="battleback" class="cancel-button">戻る</button>

              <div v-if="tooltipPower" class="tooltip-magic">{{ tooltipPower }}</div>
              <!-- <div v-if="tooltipdescription" class="tooltip-magic">
                {{ tooltipdescription }}
              </div> -->
            </div>

            <div class="attack-input-form" v-else-if="playerActionState === 'inputting_magic'">
              <p>ターゲット: {{ enemies[selectedTargetIndex]?.name }}</p>
              <p>
                スキル:
                {{ selectedSpell?.name }}
              </p>
              <input
                type="text"
                v-model="magicChant"
                placeholder="考えを入力..."
                @keyup.enter="confirmMagicAttack"
              />
              <div class="attack-buttons">
                <button @click="confirmMagicAttack">決定</button>
                <button @click="playerActionState = 'selecting_magic'" class="cancel-button">
                  戻る
                </button>
              </div>
            </div>

            <div class="sub-menu" v-else-if="playerActionState === 'selecting_item'">
              <button
                v-for="item in playerInventory"
                :key="item.id"
                @click="useItem(item)"
                @mouseover="showTooltip(item.description)"
                @mouseleave="hideTooltip"
                :disabled="item.quantity <= 0"
              >
                <img :src="item.image" :alt="item.name" class="item-image-battle" />
                {{ item.name }} (残: {{ item.quantity }})
              </button>
              <div v-if="tooltipText" class="tooltip">{{ tooltipText }}</div>

              <button @click="returnToCommandSelect" class="cancel-button">戻る</button>
            </div>
          </div>

          <div class="character-status player-status">
            <div>{{ player.name }}</div>
            <label>HP</label>
            <div class="hp-bar-container">
              <div class="hp-bar player" :style="playerHpBar"></div>
            </div>
            <label>MP</label>
            <div class="hp-bar-container"><div class="hp-bar mp" :style="playerMpBar"></div></div>
            <div class="stats dual-column">
              <span>HP: {{ player.hp }} / {{ player.maxHp }}</span>
              <span>MP: {{ player.mp }} / {{ player.maxMp }}</span>
              <span
                >攻撃力: {{ player.attack }}
                <span v-if="player.boosts.attack > 0" class="boost-text"
                  >(+{{ player.boosts.attack }})</span
                ></span
              >
              <span
                >防御力: {{ player.defense }}
                <span v-if="player.boosts.defense > 0" class="boost-text"
                  >(+{{ player.boosts.defense }})</span
                ></span
              >
              <span
                >命中率: {{ player.DEX }}%
                <span v-if="player.boosts.DEX > 0" class="boost-text"
                  >(+{{ player.boosts.DEX }}%)</span
                ></span
              >
              <span
                >回避率: {{ player.evasion }}%
                <span v-if="player.boosts.evasion > 0" class="boost-text"
                  >(+{{ player.boosts.evasion }}%)</span
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isEmotionLogVisible" class="popup-overlay">
      <div class="popup-content">
        <h2>今の感情を記録</h2>
        <div class="emotion-sliders">
          <div v-for="(value, key) in postBattleEmotions" :key="key" class="slider-group">
            <span>{{ emotionLabels[key] }}</span>
            <input type="range" min="0" max="100" v-model.number="postBattleEmotions[key]" />
            <input
              type="number"
              min="0"
              max="100"
              :value="postBattleEmotions[key]"
              @input="handlePostBattleEmotionInput(key, $event)"
              class="emotion-number-input"
            />
          </div>
        </div>
        <button @click="savePostBattleEmotions" class="save-button popup-button">記録する</button>
      </div>
    </div>

    <div v-else-if="currentScreen === 'lookBack'" class="screen lookback-screen">
      <!-- <div v-else-if="currentScreen === 'memoryLog'" class="screen memory-log-screen"> -->
      <!-- <div v-else-if="currentScreen === 'memoryLog'" class="screen memory-log-screen"> -->
      <h1>記録</h1>
      <div>記録した回数： {{ playerBaseStats.battlesWon }} 回</div>

      <div v-if="memoryLog.length > 0" class="memory-list">
        <div
          v-for="adventure in memoryLog"
          :key="adventure.id"
          class="memory-card-summary"
          @click="openMemoryPopup(adventure)"
        >
          <span class="memory-card-date">{{ formatDate(adventure.recordedDate) }}</span>
          <h3>{{ adventure.eventName }}</h3>
        </div>
      </div>
      <div v-else class="empty-state-card">
        <p class="empty-state-icon"></p>
        <p>まだ完了した記録はありません。</p>
        <p>新しい記録を追加しましょう！</p>
      </div>
      <div v-if="selectedAdventure" class="popup-overlay" @click="closeMemoryPopup">
        <div class="popup-content memory-detail-popup" @click.stop>
          <button @click="closeMemoryPopup" class="close-button">×</button>
          <h2>{{ selectedAdventure.eventName }}</h2>
          <div class="memory-section">
            <h3>考え・思ったこと</h3>
            <p>{{ selectedAdventure.thoughts }}</p>
          </div>
          <div class="memory-section dual-column">
            <div>
              <h3>感情</h3>
              <ul>
                <li v-for="(value, key) in selectedAdventure.emotions" :key="key">
                  {{ emotionLabels[key] }}: {{ value }}
                </li>
              </ul>
            </div>
            <div>
              <h3>その後の感情</h3>
              <ul>
                <li v-for="(value, key) in selectedAdventure.postBattleEmotions" :key="key">
                  {{ emotionLabels[key] }}: {{ value }}
                </li>
              </ul>
            </div>
          </div>
          <div class="memory-section">
            <h3>別の考え</h3>
            <ul v-if="selectedAdventure.attackHistory.length > 0" class="attack-history-list">
              <li v-for="(move, index) in selectedAdventure.attackHistory" :key="index">
                {{ move }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentScreen === 'itemshop'" class="screen itemshop-screen">
      <h1>ショップ</h1>
      <div class="shop-info">
        <span>所持ゴールド: {{ playerBaseStats.gold }} G</span>
      </div>
      <div class="shop-grid">
        <div v-for="item in shopItems" :key="item.id" class="shop-item-card">
          <img :src="item.image" :alt="item.name" class="item-image" />
          <div class="item-details">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-desc">{{ item.description }}</span>
            <div></div>
            <span class="item-relaxe">{{ item.relaxingeffect }}</span>
          </div>
          <div class="item-actions">
            <span class="item-price">{{ item.price }} G {{ item.quantity }} 個</span>
            <button @click="buyitem(item)" :disabled="playerBaseStats.gold < item.price">
              購入
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="currentScreen === 'achievement'" class="screen achivement-screen">
      <h1>実績</h1>
      <div class="achievements-grid">
        <div
          v-for="(ach, id) in achievements"
          :key="id"
          class="achievement-card"
          :class="{ unlocked: ach.unlocked }"
        >
          <div class="achievement-icon">{{ ach.unlocked ? ach.icon : '❓' }}</div>
          <div class="achievement-details">
            <h3 class="achievement-name">{{ ach.unlocked ? ach.name : '？？？' }}</h3>
            <p class="achievement-desc">
              {{ ach.unlocked ? ach.description : ach.description }}
            </p>
            <p class="achievement-desc">
              現在: {{ getAchievementProgress(id).current }} /
              {{ getAchievementProgress(id).target }} {{ getAchievementProgress(id).unit }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <nav v-if="!isSubmittingEvent" class="bottom-nav">
    <button :class="{ active: currentScreen === 'home' }" @click="goToScreen('home')">
      ホーム
    </button>
    <button
      v-if="tab"
      :class="{ active: currentScreen === 'eventInput' }"
      @click="goToScreen('eventInput')"
    >
      バトル
    </button>
    <button
      v-else-if="!tab"
      :class="{ active: currentScreen === 'eventInput' }"
      @click="resumeBattle()"
    >
      再挑戦
    </button>

    <button :class="{ active: currentScreen === 'itemshop' }" @click="goToScreen('itemshop')">
      ショップ
    </button>
    <button :class="{ active: currentScreen === 'goalList' }" @click="goToScreen('goalList')">
      目標
    </button>
    <button :class="{ active: currentScreen === 'lookBack' }" @click="goToScreen('lookBack')">
      記録
    </button>
    <button :class="{ active: currentScreen === 'achievement' }" @click="goToScreen('achievement')">
      実績
    </button>
  </nav>
</template>

<style scoped>
/* --- グローバルレイアウト --- */

#app-wrapper {
  max-width: 740px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 98vh;
  background-color: #f9f9f9;
}
/*.screen-content {*/
/* flex-grow: 1; */
/* overflow-y: auto; */
/* padding-bottom: 60px; ナビゲーションバーの高さ分 */
/* border: 1px solid #000; */
/*}*/
/* .screen {
  padding: 20px;
} */

/* --- 下部ナビゲーション --- */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 740px; /* #app-wrapperと合わせる */
  margin: 0 auto;
  display: flex;
  height: 60px;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
}
.bottom-nav button {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  color: #888;
  transition: color 0.2s;
}
.bottom-nav button:hover {
  color: #333;
}
.bottom-nav button.active {
  color: #3498db;
  font-weight: bold;
}

/* --- ホーム画面 --- */
/* .home-screen { */
/* background-color: #fff; */
/* position: relative; */
/* } */
.home-layout {
  display: flex;

  /* width: 100%; */
  height: 800px;
  background-image: url('@/assets/bg_natural_sougen.jpg');
  /* gap: 20px; */
}
.home-left {
  flex: 2;
  position: relative;
}
.home-right {
  flex: 1;
}

.goal-highlight {
  background-color: #fafafa;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
  margin-left: 10px;
  margin-bottom: 20px;
}

.character-art .placeholder-image {
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;
  top: 200px;
  width: 500px;
  height: 500px;
  /* background-color: #eee; */
  border-radius: 8px;

  color: #aaa;
}

/* kaizoku_takarabako.png */
.item-box {
  margin-left: 65px;
  margin-bottom: 30px;
  margin-top: 65px;
  /* position: relative; */
}
.item-box button {
  /* width: 100px;
  height: 100px;
  border-radius: 100%; */
  /* background-color: transparent;
  border: none; */
  border-radius: 15px;

  cursor: pointer;
}
/* .item-box button :hover {
  color: #000;
} */
.item-box img {
  width: 60px;
  height: 60px;
  border-radius: 100%;
  /* position: relative; */
}
/* .inventory-name {
  background-color: #fafafa;
} */

.status-box {
  background-color: #fafafa;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
  /* margin-top: 150px; */
  margin-right: 30px;
}
.status-box h3 {
  margin-top: 0;
}
.edit-button {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  background-color: #ecf0f1;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  cursor: pointer;
}
.edit-button:hover {
  color: #333;
}

/* --- ボタン --- */
/* .plus-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}
.minus-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
} */
.plus-button,
.minus-button {
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  margin-left: 8px;
  font-size: 1.5em;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.plus-button {
  background-color: #27ae60; /* 緑 */
}
.plus-button:hover {
  background-color: #229954;
}
.plus-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* 【追加】マイナスボタンのスタイル */
.minus-button {
  background-color: #e74c3c; /* 赤 */
}
.minus-button:hover {
  background-color: #c0392b;
}

.minus-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* --- インベントリ --- */
.inventory-screen {
  background-color: #f9f9f9;
  height: 95vh;
}
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.inventory-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: white;
  margin-left: 5px;
}

/* --- 目標設定画面 --- */
.task-input {
  display: flex;
  margin-bottom: 20px;
}
.task-input input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
}
.task-input button {
  padding: 10px 15px;
  border: none;
  background-color: #3498db;
  color: white;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
}
.task-list {
  list-style: none;
  padding: 0;
}
.task-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.task-list li.completed span {
  text-decoration: line-through;
  color: #aaa;
}
.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

/* --- フォーム画面共通スタイル --- */
/* .screen setup-screenn {
  border: #000;
  height: 95vh;
  background-color: ;
} */

.setup-screen {
  /* height: 95vh; */
  background-color: #f9f9f9;
  /* margin-top: 100px; */
}
.setup-screen h1 {
  text-align: center;
}
.form-group {
  margin-bottom: 8px;
  margin: 10px 10px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
.form-group input[type='text'],
.form-group input[type='number'],
.form-group textarea {
  width: 100%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}
.form-group input[type='number'] {
  width: 50%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.emotion-sliders {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}
@media (min-width: 600px) {
  .emotion-sliders {
    grid-template-columns: 1fr 1fr;
  }
}
.slider-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.slider-group span:first-child {
  width: 50px;
  font-size: 0.9em;
}
.slider-group input[type='range'] {
  flex-grow: 1;
}
.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}
.button-group button {
  flex: 1;
  padding: 15px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  border: none;
}
.create-button,
.save-button {
  color: white;
  background-color: #2c3e50;
}
.create-button {
  margin: 10px 10px;
}
.cancel-button {
  color: #333;
  background-color: #ecf0f1;
  border: 1px solid #bdc3c7;
}
.emotion-number-input {
  width: 65px;
  padding: 5px 8px;
  font-size: 1em;
  text-align: center;
}

/* --- バトル画面スタイル --- */
#game-container {
  /* height: calc(100vh - 60px); */
  border: none;
  border-radius: 0;
  background-color: #000;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  z-index: 1;
}
.enemy-area,
.main-content-area {
  position: relative;
  z-index: 2;
  gap: 30px;
}
.enemy-area {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-image: url('@/assets/bg_natural_sougen.jpg');
}
.monster-image {
  max-width: 100%;
  max-height: 250px;
  object-fit: contain;
  /* margin-bottom を削除 */
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}
.enemy-status {
  /* width: 70%; */
  max-width: 450px;
  padding: 10px;
  border: 2px solid #333;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  text-align: center;
}
.main-content-area {
  flex: 3;
  border-top: 2px solid #333;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
}
.battle-log-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px;
  box-sizing: border-box;
}
.player-control-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 35px;
  box-sizing: border-box;
  align-items: stretch;
}
.battle-log {
  width: 100%;
  height: 210px;
  flex-grow: 1;
  border: 2px solid #333;
  padding: 15px;
  overflow-y: auto;

  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  background-color: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
  /* 高さを少し調整してボタンのスペースを確保 */
  /* height: calc(100% - 60px); */
}
.player-status {
  flex: 1;
  margin-left: 15px;
  border: 2px solid #333;
  border-radius: 8px;
  background-color: #fff;
  padding: 15px;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
}
.action-menu {
  flex: 1;
  /* display: flex; */
  justify-content: center;
  align-items: center;
  border: 2px solid #333;
  border-radius: 8px;
  background-color: #fff;
  padding: 10px;
  overflow: auto;
  height: 250px;
}
.command-menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 100%;
  /* padding: 10px 0; ボタンのスペース確保 */
}
.targeting-message {
  /* display: flex; */
  text-align: center;
}

/* ログを見るボタンのスタイル */
.log-view-button {
  background-color: #7f8c8d !important; /* グレー系の色 */
  color: white !important;
  border-color: #7f8c8d !important;
}
.log-view-button:hover:not(:disabled) {
  background-color: #95a5a6 !important;
}

/* ログ画面下部のアクションエリアのスタイル */
.log-actions {
  padding-top: 15px;
  text-align: center;
}

.return-button {
  padding: 12px 24px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  color: #333;
  background-color: #ecf0f1;
  border: 1px solid #bdc3c7;
  width: 80%;
}

.command-menu button {
  width: 80%;
  margin: 0;
  padding: 9px 12px;
  font-size: 1em;
  cursor: pointer;
  border: 2px solid #333;
  border-radius: 5px;
  color: #333;
  background-color: #fff;
}
.stats {
  margin-top: 10px;
  font-size: 0.9em;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 5px;
}
.hp-bar-container {
  width: 100%;
  height: 25px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ccc;
}
.hp-bar {
  height: 100%;
  transition: width 0.5s ease-in-out;
}
.hp-bar.player {
  background-color: #4caf50;
}
.hp-bar.enemy {
  background-color: #f44336;
}

/* .enemy-container.is-targetable {
  cursor: pointer;
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 0 15px yellow;
} */

.enemy-container.selected-target {
  outline: 3px solid #ffcc00;
  outline-offset: 5px;
  transform: scale(1.08);
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
}

.enemy-container.is-dead {
  opacity: 0.5;
  filter: grayscale(80%);
  pointer-events: none;
}

.hp-bar.enemy {
  transition: width 0.5s ease-in-out;
}
.hp-text {
  font-size: 0.9em;
  color: #333;
  font-weight: bold;
  margin-top: 5px;
}

/* 【追加】MPバーのスタイル */
.hp-bar.mp {
  background-color: #3498db;
}
.player-status label {
  font-size: 0.8em;
  text-align: left;
  margin: 8px 0 2px;
}
.player-status .stats.dual-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  text-align: left;
}
.game-over-message {
  padding: 10px;
  text-align: center;
  width: 100%;
}
.game-over-message h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}
.game-over-message button {
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  color: white;
  transition: background-color 0.3s;
  width: 80%;
}
.win-button {
  background-color: #4caf50;
}
.lose-button {
  background-color: #f44336;
}
.retreat-button {
  margin-top: 10px;
  background-color: #34495e !important;
}
.retreat-button:hover {
  background-color: #2c3e50 !important;
}

.attack-input-form {
  /* display: flex; */
  width: 100%;
}
.attack-input-form input {
  flex-grow: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}
.attack-input-form button {
  padding: 12px 20px;
}
/* 【追加】サブメニューのスタイル */
.sub-menu {
  width: 100%;
  display: flex;
  /* justify-content: center; */
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}
.sub-menu button {
  width: 80%;
  margin: 0 auto;
  padding: 10px;
}
.item-image-battle {
  width: 16px;
  height: 15px;
  object-fit: contain; /* アスペクト比を保つ */
}
/* ペナルティログのスタイル */
.battle-log p.penalty {
  color: #9b59b6; /* 紫色 */
  font-style: italic;
  background-color: rgba(249, 231, 250, 0.8);
  border-left: 5px solid #8e44ad;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

/* --- 【変更】目標リスト画面のスタイル --- */
.goal-screen h1 {
  text-align: center;
  margin-bottom: 20px;
}
.goal-screen {
  background-color: #f9f9f9;
  padding-bottom: 60px;
}
.divider {
  /* border: 0;
  border-top: 2px solid #eee; */
  margin: 30px 0;
}

/* タスク追加フォーム */
.goal-add-form {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr 100px 100px;
  gap: 15px;
  margin: 10px 10px;
  align-items: flex-end;
}
.goal-add-form .form-row {
  display: flex;
  flex-direction: column;
}
.goal-add-form label {
  margin-bottom: 5px;
  font-size: 0.9em;
}
.goal-add-form input,
.goal-add-form select {
  padding: 8px;
}
.add-button {
  padding: 10px;
  font-weight: bold;
  color: white;
  background-color: #2c3e50;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  height: 40px;
}

/* 並べ替えボタン */
.sort-buttons {
  margin: 10px 0;
}
.sort-buttons button {
  padding: 8px 12px;
  margin-right: 10px;
  border: 1px solid #bdc3c7;
  background-color: #ecf0f1;
  border-radius: 5px;
  cursor: pointer;
}
.sort-buttons button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

/* タスク一覧 */
.goal-list {
  list-style: none;
  padding: 0;
  margin: 5px;
}
.goal-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  border-left-width: 5px;
}
.goal-list li.completed {
  background-color: #f1f1f1;
  text-decoration: line-through;
  color: #999;
}
.goal-list li.priority-3 {
  border-left-color: #e74c3c;
} /* 高 */
.goal-list li.priority-2 {
  border-left-color: #f39c12;
} /* 中 */
.goal-list li.priority-1 {
  border-left-color: #3498db;
} /* 低 */

.priority-3 {
  margin-left: 10px;
}
.priority-2 {
  margin-left: 10px;
}
.priority-1 {
  margin-left: 10px;
}

.goal-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.goal-priority {
  font-weight: bold;
  font-size: 0.9em;
}
.goal-actions {
  display: flex;
  gap: 8px;
}
.goal-list .complete-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}
.goal-list .complete-btn:disabled {
  background-color: #bdc3c7;
}
.goal-list .delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

/* ログのスタイル */
.battle-log p.positive {
  color: #16a085;
  font-weight: bold;
  background-color: rgba(236, 241, 241, 0.9);
  border-left: 5px solid #1abc9c;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}
.battle-log p.player-action {
  color: #2980b9;
}
.battle-log p.enemy-action {
  color: #c0392b;
}
.battle-log p.thought {
  font-style: italic;
  color: #7f8c8d;
}
.battle-log p.system {
  font-weight: bold;
  color: #2c3e50;
}

/* ポップアップのスタイル */
.popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.popup-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  text-align: center;
}
.popup-content h2 {
  margin-top: 0;
  margin-bottom: 10px;
}
.popup-content p {
  margin-bottom: 20px;
}
.popup-content .emotion-sliders {
  margin-bottom: 20px;
}
.popup-button {
  width: 80%;
  height: 35px;
}

/* 冒険の記録画面のスタイル */
.memory-log-screen h1 {
  text-align: center;
}
.memory-list {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding-bottom: 60px;
}
.memory-card-summary {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 10px;
}
.memory-card-summary:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.memory-card-summary h3 {
  margin: 5px 0 0;
  font-size: 1.2em;
}
.memory-card-date {
  font-size: 0.8em;
  color: #777;
}
.lookback-screen {
  height: 100%;
  width: 740px;
  background-color: #f9f9f9;
  margin: 0 auto;
}
.lookback-screen h1 {
  text-align: center;
}

/* 【追加】記録がない場合のカードスタイル */
.empty-state-card {
  margin-top: 20px;
  margin: 10px 10px;
  text-align: center;
  background: #fff;
  padding: 40px 20px;
  border-radius: 8px;
  border: 2px dashed #ccc;
  color: #777;
}
.empty-state-icon {
  font-size: 3em;
  margin-bottom: 10px;
}

/* 【変更】詳細表示ポップアップのスタイル */
.popup-header {
  text-align: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.popup-header h2 {
  margin: 0;
}
.popup-header .memory-card-date {
  font-size: 0.9em;
  color: #777;
}

/* 詳細表示ポップアップのスタイル */
.popup-overlay {
  position: fixed; /* 画面全体を覆う */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.popup-content {
  background-color: white;
  padding: 20px 30px 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 700px;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #999;
}
.memory-detail-popup {
  max-height: 80vh;
  overflow-y: auto;
  text-align: left;
}
.memory-detail-popup h2 {
  margin-top: 0;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  text-align: center;
}
.memory-section {
  margin-top: 15px;
}
.memory-section h3 {
  font-size: 1.1em;
  margin-bottom: 8px;
  color: #3498db;
}
.memory-section p {
  font-style: italic;
  color: #555;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}
.memory-section ul {
  list-style: none;
  padding: 0;
}
.memory-section li {
  padding: 5px 0;
}
.dual-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  border: solid 1px #000;
  border-radius: 5px;
}
.attack-history-list li {
  background-color: #f1f1f1;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
}

/* --- 【追加】お店画面のスタイル --- */
/* .shop-screen h1 {
  text-align: center;
}
.shop-info {
  text-align: right;
  font-weight: bold;
  font-size: 1.1em;
  margin: 10px 0 20px;
}
.item-list {
  list-style: none;
  padding: 0px;
}
.item-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.item-details {
  display: flex;
  flex-direction: column;
}
.item-name {
  font-weight: bold;
  font-size: 1.1em;
}
.item-desc {
  font-size: 0.9em;
  color: #555;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}
.item-price {
  font-weight: bold;
  color: #e67e22;
}
.item-actions button {
  padding: 8px 16px;
  font-size: 1em;
  font-weight: bold;
  color: white;
  background-color: #2980b9;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.item-actions button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
} */
/* --- 【変更】お店画面のスタイル --- */
.shop-screen h1 {
  text-align: center;
}
.shop-info {
  text-align: right;
  font-weight: bold;
  font-size: 1.1em;
  margin: 10px 0 20px;
}

.itemshop-screen {
  background-color: #f9f9f9;
  padding-bottom: 55px;
}
.itemshop-screen h1 {
  text-align: center;
}

/* グリッドレイアウト */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列表示 */
  gap: 20px; /* カード間の隙間 */
  height: auto;
  margin: 10px;
}

/* アイテムカード */
.shop-item-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column; /* 要素を縦に並べる */
  align-items: center; /* 中央揃え */
  text-align: center;
}

/* アイテム画像 */
.item-image {
  width: 80px; /* 画像サイズを固定 */
  height: 80px;
  object-fit: contain; /* アスペクト比を保つ */
  margin-bottom: 10px;
}

.item-details {
  margin-bottom: 10px;
  flex-grow: 1; /* 名前と説明で高さを埋める */
}
.item-name {
  font-weight: bold;
  font-size: 1.1em;
  display: block; /* 改行させる */
  margin-bottom: 5px;
}
.item-desc {
  font-size: 0.9em;
  color: green;
}

.item-relaxe {
  font-size: 0.8em;
  color: #555;
}
.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 価格とボタンを両端に */
  width: 100%; /* 幅をカードいっぱいに */
  margin-top: auto; /* カード下部に配置 */
}
.item-price {
  font-weight: bold;
  color: #e67e22;
}
.item-actions button {
  padding: 8px 16px;
  font-size: 1em;
  font-weight: bold;
  color: white;
  background-color: #2980b9;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.item-actions button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
/* 【追加】ステータス上昇テキストのスタイル */
.boost-text {
  color: #27ae60; /* 緑色 */
  font-weight: bold;
}
/* 【追加】ツールチップのスタイル */
.tooltip {
  position: absolute;
  bottom: 10px; /*メニューエリアの下部に配置*/
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  width: 70%;
  text-align: center;
  pointer-events: none; /* ツールチップ自体がマウスイベントを妨害しないようにする */
  z-index: 10;
  box-sizing: border-box;
}

.tooltip-magic {
  position: absolute;
  bottom: 20px; /*メニューエリアの下部に配置 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  width: 70%;
  text-align: center;
  pointer-events: none; /* ツールチップ自体がマウスイベントを妨害しないようにする */
  z-index: 10;
  box-sizing: border-box;
  white-space: pre-line;
}

.tooltip-inventory {
  position: absolute;
  /* bottom: 20px; メニューエリアの下部に配置 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  width: 40%;
  text-align: center;
  pointer-events: none; /* ツールチップ自体がマウスイベントを妨害しないようにする */
  z-index: 10;
  box-sizing: border-box;
  white-space: pre-line;
}

/* 吹き出し本体 */
/* .tooltip1 { */
/* position: relative;
  display: inline-block;
  margin: 1.5em 0;
  padding: 7px 10px;
  min-width: 120px;
  max-width: 100%;
  color: #007bff;
  font-size: 16px;
  background: #1abc9c; */
/*position: absolute;

/*bottom: 10px; /*メニューエリアの下部に配置 */
/*left: 50%;*/
/*transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  width: 40%;
  text-align: center;
  pointer-events: none; /* ツールチップ自体がマウスイベントを妨害しないようにする */
/* z-index: 10; */
/*box-sizing: border-box;*/
/* } */

.tooltip1::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -15px;
  border: 15px solid transparent;
  border-top: 15px solid #3498db;
}
/* 吹き出しの「しっぽ」（三角形） */
/* .tooltip1::after {
  content: '';
  position: absolute;
  top: 100%; /* 吹き出しの下側に配置 */
/*left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent; /* 上向きの三角形 */

/* .tooltip1:after {
  border-bottom: 12px solid rgba(0, 0, 0, 0.7);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  top: 12px;
  left: 5%;
  content: '';
  position: absolute;
} */

.itemshop-screen {
  max-width: 800px;
  margin: 0 auto;
}

.login-screen {
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20% auto;
  border-radius: 10px;
}

.login-screen input {
  width: 80%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 10px;
}
.login-screen button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  border-radius: 10px;
  color: #fff;
  border: none;
  cursor: pointer;
}

/* 【追加】名前入力画面のアバタースタイル */
.avatar-selector {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  background: #eee;
  padding: 10px;
  border-radius: 5px;
}
.avatar-option {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.avatar-option:hover {
  transform: scale(1.1);
}
.avatar-option.selected {
  border-color: #3498db;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
}

/* 【追加】ホーム画面のアバタースタイル */
.home-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.home-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #ccc;
  margin-bottom: 10px;
}
.home-profile p {
  font-size: 1.2em;
  font-weight: bold;
  margin: 0;
}

/* 【追加】ステータス画面のアバタースタイル */
.status-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.status-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #ccc;
}
.status-profile .form-group {
  flex-grow: 1;
  margin-bottom: 0;
}

/* 【追加】バトル画面のアバタースタイル */
.player-profile-battle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.battle-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #333;
}
.player-profile-battle h2 {
  margin: 0;
}

/* 【追加】実績解除トーストのスタイル */
.achievement-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2c3e50;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: bold;
  z-index: 2000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: fade-in-out 3s ease-out;
}

@keyframes fade-in-out {
  0% {
    top: -50px;
    opacity: 0;
  }
  20% {
    top: 20px;
    opacity: 1;
  }
  80% {
    top: 20px;
    opacity: 1;
  }
  100% {
    top: -50px;
    opacity: 0;
  }
}

.achivement-screen {
  padding-bottom: 60px;
  background-color: #f9f9f9;
}

/* 【追加】実績画面のスタイル */
.achievements-screen h1 {
  text-align: center;
}

/* 【変更】実績画面のスタイルを5列対応に */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* モバイルは2列 */
  gap: 15px;
  margin-top: 20px;
}

/* 画面幅が広い場合(768px以上)は5列にする */
@media (min-width: 768px) {
  .achievements-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.achievement-card {
  display: flex;
  flex-direction: column; /* 縦並びに変更 */
  align-items: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  opacity: 0.5; /* 未解除は半透明 */
  transition:
    opacity 0.3s,
    border 0.3s;
  min-height: 120px; /* 高さを揃える */
}
.achievement-card.unlocked {
  opacity: 1; /* 解除済みは不透明 */
  border-left: 5px solid #27ae60; /* 解除済みの印 */
}
.achievement-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
}
.achievement-details {
  flex: 1;
}
.achievement-name {
  margin: 0;
  font-size: 1em;
  font-weight: bold;
}
.achievement-desc {
  margin: 5px 0 0;
  font-size: 0.9em;
  color: #555;
}
</style>
