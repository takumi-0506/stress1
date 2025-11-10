<!-- <template>
  <div>
    <h2 v-if="!winner">ターン: {{ currentTurn === 'player' ? 'プレイヤー' : '敵' }}</h2>
    <h2 v-else>🎉 {{ winner }} の勝利！</h2>

    <div>
      <p>プレイヤー HP: {{ player.hp }}</p>
      <p>敵 HP: {{ enemy.hp }}</p>
    </div>

    <div v-if="currentTurn === 'player' && !winner">
      <button @click="attack">攻撃</button>
      <button @click="defend">防御</button>
    </div>

    <div v-else-if="!winner">
      <p>敵のターン中...</p>
    </div>

    <div class="log">
      <h3>バトルログ</h3>
      <ul>
        <li v-for="(entry, index) in battleLog" :key="index">{{ entry }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const player = ref({ hp: 100 })
const enemy = ref({ hp: 100 })
const currentTurn = ref('player')
const battleLog = ref([])
const winner = ref(null) // ← 勝者（プレイヤー or 敵）を記録

function checkBattleEnd() {
  if (enemy.value.hp <= 0) {
    enemy.value.hp = 0
    battleLog.value.push('敵を倒した！')
    winner.value = 'プレイヤー'
    return true
  }

  if (player.value.hp <= 0) {
    player.value.hp = 0
    battleLog.value.push('プレイヤーは倒れた…')
    winner.value = '敵'
    return true
  }

  return false
}

function attack() {
  const damage = Math.floor(Math.random() * 10) + 5
  enemy.value.hp -= damage
  battleLog.value.push(`プレイヤーの攻撃！ 敵に${damage}ダメージ`)

  if (!checkBattleEnd()) {
    endTurn()
  }
}

function defend() {
  battleLog.value.push('プレイヤーは防御した')
  endTurn()
}

function enemyAction() {
  const damage = Math.floor(Math.random() * 10) + 5
  player.value.hp -= damage
  battleLog.value.push(`敵の攻撃！ プレイヤーに${damage}ダメージ`)

  if (!checkBattleEnd()) {
    currentTurn.value = 'player'
  }
}

function endTurn() {
  currentTurn.value = 'enemy'
  setTimeout(() => {
    if (!winner.value) {
      enemyAction()
    }
  }, 1000)
}
</script> -->
<script setup>
import { ref, computed, nextTick } from 'vue'

// --- リアクティブなデータ定義 ---
// 【変更】defenseとisDefendingを追加
const player = ref({
  name: '勇者',
  hp: 100,
  maxHp: 100,
  attack: 15,
  defense: 5, // 防御力を追加
  isDefending: false, // 防御中かどうかのフラグ
})

// 【変更】defenseを追加
const enemy = ref({
  name: 'スライム',
  hp: 80,
  maxHp: 80,
  attack: 12, // 少し攻撃力を調整
  defense: 3, // 防御力を追加
})

const battleLog = ref([])
const isPlayerTurn = ref(true)
const isBattleOver = ref(false)
const gameMessage = ref('')
const isWaitingForInput = ref(false)
const attackMoveName = ref('')

const playerHpBar = computed(() => ({
  width: `${(player.value.hp / player.value.maxHp) * 100}%`,
}))
const enemyHpBar = computed(() => ({
  width: `${(enemy.value.hp / enemy.value.maxHp) * 100}%`,
}))

const addLog = async (message) => {
  battleLog.value.push(message)
  await nextTick()
  const logEl = document.querySelector('.battle-log')
  if (logEl) logEl.scrollTop = logEl.scrollHeight
}

// 【変更】かいふく(heal)をぼうぎょ(defend)に変更
const playerAction = (action) => {
  if (!isPlayerTurn.value || isBattleOver.value) return

  if (action === 'attack') {
    isWaitingForInput.value = true
  } else if (action === 'defend') {
    // 防御処理
    player.value.isDefending = true
    addLog(`🛡️ ${player.value.name} は防御の姿勢をとった！`)
    endPlayerTurn()
  }
}

const confirmAttack = () => {
  if (!attackMoveName.value.trim()) {
    alert('技名を入力してください！')
    return
  }
  // 【変更】ダメージ計算に防御力を考慮
  const damage = calculateDamage(player.value, enemy.value)
  enemy.value.hp = Math.max(0, enemy.value.hp - damage)

  addLog(
    `⚔️ ${player.value.name} の「${attackMoveName.value}」！ ${enemy.value.name} に ${damage} のダメージ！`,
  )
  isWaitingForInput.value = false
  attackMoveName.value = ''
  endPlayerTurn()
}

const endPlayerTurn = () => {
  isPlayerTurn.value = false
  checkWinner()
  if (!isBattleOver.value) {
    setTimeout(enemyTurn, 1000)
  }
}

const enemyTurn = () => {
  if (isBattleOver.value) return

  // 【変更】ダメージ計算に防御力を考慮
  let damage = calculateDamage(enemy.value, player.value)

  // 【追加】プレイヤーが防御中の場合、ダメージを半減
  if (player.value.isDefending) {
    damage = Math.floor(damage / 2)
    addLog(`しかし ${player.value.name} は防御している！ ダメージが軽減された！`)
  }

  player.value.hp = Math.max(0, player.value.hp - damage)
  addLog(`💥 ${enemy.value.name} の攻撃！ ${player.value.name} は ${damage} のダメージを受けた！`)

  // 【追加】敵のターンが終わったら防御状態を解除
  player.value.isDefending = false

  checkWinner()
  if (!isBattleOver.value) {
    isPlayerTurn.value = true
  }
}

// 【追加】ダメージ計算を共通関数化
const calculateDamage = (attacker, target) => {
  // 基本ダメージ = 攻撃力 - 防御力 / 2
  const baseDamage = attacker.attack - target.defense / 2
  // ダメージにランダムな揺らぎを追加
  const randomFactor = (Math.random() - 0.5) * 4 // -2 から +2 の間の揺らぎ
  const finalDamage = Math.round(baseDamage + randomFactor)

  // ダメージは最低でも1は与える
  return Math.max(1, finalDamage)
}

const checkWinner = () => {
  if (enemy.value.hp <= 0) {
    isBattleOver.value = true
    gameMessage.value = '🎉 勝利！'
    addLog(`${enemy.value.name} を倒した！`)
  } else if (player.value.hp <= 0) {
    isBattleOver.value = true
    gameMessage.value = '😢 敗北...'
    addLog(`${player.value.name} は倒れた...`)
  }
}

const resetGame = () => {
  player.value.hp = player.value.maxHp
  player.value.isDefending = false // 防御状態もリセット
  enemy.value.hp = enemy.value.maxHp
  battleLog.value = []
  isPlayerTurn.value = true
  isBattleOver.value = false
  isWaitingForInput.value = false
  attackMoveName.value = ''
  gameMessage.value = ''
  addLog('戦闘開始！')
}

addLog('スライムが現れた！')
</script>

<template>
  <div id="game-container">
    <div class="enemy-area">
      <div class="character-status enemy-status">
        <h2>{{ enemy.name }}</h2>
        <div class="hp-bar-container">
          <div class="hp-bar enemy" :style="enemyHpBar"></div>
        </div>
        <div class="stats">
          <span>HP: {{ enemy.hp }} / {{ enemy.maxHp }}</span>
          <span>攻撃力: {{ enemy.attack }}</span>
          <span>防御力: {{ enemy.defense }}</span>
        </div>
      </div>
    </div>

    <div class="battle-log-area">
      <div class="battle-log">
        <p v-for="(log, index) in battleLog" :key="index">{{ log }}</p>
      </div>
    </div>

    <div class="player-area">
      <div class="character-status player-status">
        <h2>{{ player.name }}</h2>
        <div class="hp-bar-container">
          <div class="hp-bar player" :style="playerHpBar"></div>
        </div>
        <div class="stats">
          <span>HP: {{ player.hp }} / {{ player.maxHp }}</span>
          <span>攻撃力: {{ player.attack }}</span>
          <span>防御力: {{ player.defense }}</span>
        </div>
      </div>

      <div class="action-menu">
        <div v-if="isBattleOver" class="game-over-message">
          <h2>{{ gameMessage }}</h2>
          <button @click="resetGame">もう一度戦う</button>
        </div>

        <div class="command-menu" v-else-if="!isWaitingForInput">
          <button @click="playerAction('attack')" :disabled="!isPlayerTurn">こうげき</button>
          <button @click="playerAction('defend')" :disabled="!isPlayerTurn">ぼうぎょ</button>
        </div>

        <div class="attack-input-form" v-else>
          <input
            type="text"
            v-model="attackMoveName"
            placeholder="技名を入力..."
            @keyup.enter="confirmAttack"
          />
          <button @click="confirmAttack">決定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全体のコンテナ */
#game-container {
  max-width: 800px;
  height: 95vh;
  margin: 1vh auto;
  border: 2px solid #333;
  border-radius: 10px;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 各エリアの定義 */
.enemy-area {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.battle-log-area {
  flex: 3;
  padding: 0 20px 10px;
  display: flex;
}
.player-area {
  flex: 2;
  background-color: #e0e0e0;
  border-top: 2px solid #ccc;
  border-radius: 0 0 8px 8px;
  display: flex;
  padding: 15px;
}

/* キャラクターのステータス表示 */
.character-status {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.enemy-status {
  width: 70%;
  max-width: 450px;
  text-align: center;
}
.player-status {
  flex: 1;
  margin-right: 15px;
}

h2 {
  margin: 0 0 10px;
}
.stats {
  margin-top: 10px;
  font-size: 0.9em;
  display: flex;
  justify-content: space-around;
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

/* バトルログ */
.battle-log {
  width: 100%;
  border: 1px solid #ddd;
  padding: 15px;
  overflow-y: scroll;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
}
.battle-log p {
  margin: 5px 0;
  padding: 0;
  font-size: 1em;
}

/* アクションメニュー */
.action-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  padding: 10px;
}
.command-menu,
.attack-input-form,
.game-over-message {
  width: 100%;
  text-align: center;
}

.command-menu button,
.game-over-message button,
.attack-input-form button {
  font-size: 1.1em;
  padding: 12px 24px;
  margin: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  color: white;
  transition: background-color 0.3s;
  min-width: 100px;
}
.command-menu button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}
.command-menu button,
.attack-input-form button {
  background-color: #2196f3;
}
.command-menu button:hover:not(:disabled),
.attack-input-form button:hover {
  background-color: #1976d2;
}
.game-over-message button {
  background-color: #4caf50;
}

.game-over-message h2 {
  font-size: 1.8em;
  color: #c0392b;
  margin-bottom: 15px;
}
.attack-input-form {
  display: flex;
}
.attack-input-form input {
  font-size: 1.1em;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
  flex-grow: 1;
}
</style>
