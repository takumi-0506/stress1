<template>
  <div class="cbt-form">
    <h2>コラム表</h2>

    <form @submit.prevent="handleSubmit">
      <div v-for="(column, index) in columns" :key="index" class="form-group">
        <label :for="'col-' + index">{{ column.label }}</label>
        <textarea
          v-if="index !== 1"
          :id="'col-' + index"
          v-model="column.value"
          :placeholder="column.placeholder"
          rows="3"
        ></textarea>

        <!-- 第2コラム: 感情スライダー -->
        <div v-if="index === 1" class="emotion-sliders">
          <div class="emotion-row">
            <div v-for="(emotion, idx) in emotions.slice(0, 3)" :key="idx" class="emotion">
              <label>{{ emotion.label }}</label>
              <input
                type="range"
                v-model="emotion.value"
                min="0"
                max="100"
                step="1"
                @input="updateEmotionValue(emotion)"
              />
              <span>{{ emotion.value }}%</span>
            </div>
          </div>
          <div class="emotion-row">
            <div v-for="(emotion, idx) in emotions.slice(3)" :key="idx" class="emotion">
              <label>{{ emotion.label }}</label>
              <input
                type="range"
                v-model="emotion.value"
                min="0"
                max="100"
                step="1"
                @input="updateEmotionValue(emotion)"
              />
              <span>{{ emotion.value }}%</span>
            </div>
          </div>
        </div>
      </div>

      <router-link to="/StressBattle">
        <button type="submit">作成</button>
      </router-link>
    </form>

    <div v-if="submitted" class="result">
      <h3>入力内容:</h3>
      <ul>
        <li v-for="(column, index) in columns" :key="'result-' + index">
          <strong>{{ column.label }}:</strong> {{ column.value }}
        </li>
      </ul>
      <h3>感情状態:</h3>
      <ul>
        <li v-for="(emotion, index) in emotions" :key="'emotion-' + index">
          <strong>{{ emotion.label }}:</strong> {{ emotion.value }}%
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const submitted = ref(false)

const columns = ref([
  {
    label: '状況（出来事）',
    placeholder: '例：上司に注意された',
    value: '',
  },
  {
    label: '気分（感情）',
    placeholder: '例：悲しい、怒り、不安',
    value: '',
  },
  {
    label: '浮かんだ考え',
    placeholder: '例：自分はダメな人間だ',
    value: '',
  },
  // {
  //   label: '第4コラム：反証（根拠）',
  //   placeholder: '例：以前も同じミスをしたが、改善した',
  //   value: ''
  // },
  // {
  //   label: '第5コラム：適応的思考',
  //   placeholder: '例：誰でもミスはある。次は気をつけよう',
  //   value: ''
  // }
])

const emotions = ref([
  { label: '喜び', value: 0 },
  { label: '驚き', value: 0 },
  { label: '嫌悪', value: 0 },
  { label: '悲しみ', value: 0 },
  { label: '不安', value: 0 },
  { label: '怒り', value: 0 },
])

function updateEmotionValue(emotion) {
  // スライダーの値を更新する処理（リアルタイムで値が表示されるようにする）
  emotion.value = parseInt(emotion.value, 10)
}

function handleSubmit() {
  submitted.value = true
}
</script>

<style scoped>
.cbt-form {
  max-width: 600px;
  margin: auto;
  font-family: sans-serif;
}

.form-group {
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  font-size: 1rem;
  padding: 0.5rem;
}

button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  margin-top: 1rem;
}

.emotion-sliders {
  margin-top: 1.5rem;
}

.emotion-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.emotion {
  flex: 1;
  text-align: center;
}

input[type='range'] {
  width: 100%;
  margin-top: 0.5rem;
}

.result {
  margin-top: 2rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}
</style>
