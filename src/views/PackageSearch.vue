<template>
  <div class="package-search-container">
    <div class="logo-section">
      <h1 class="main-title">EMS Customs Duty Payment</h1>
      <p class="main-subtitle">United States Customs Processing Service</p>
    </div>
    
    <el-card class="search-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>
            <el-icon><Box /></el-icon>
            Package Lookup
          </h2>
        </div>
      </template>

      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-position="top"
        @submit.prevent="handleSearch"
      >
        <el-form-item label="Tracking Number" prop="trackingNumber">
          <el-input
            ref="trackingInputRef"
            v-model="form.trackingNumber"
            placeholder="e.g., EA12345678901CN"
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><DocumentCopy /></el-icon>
            </template>
          </el-input>
          <div class="input-hint">
            Format: EA/EC/EE + 11 digits + CN or LV/LX/RV/RX + 9 digits + CN
          </div>
        </el-form-item>

        <el-form-item label="Destination City" prop="destinationCity">
          <el-autocomplete
            v-model="form.destinationCity"
            :fetch-suggestions="querySearch"
            placeholder="Enter city name"
            size="large"
            clearable
            style="width: 100%"
          >
            <template #prefix>
              <el-icon><Location /></el-icon>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            style="width: 100%"
            @click="handleSearch"
          >
            <el-icon v-if="!loading"><Search /></el-icon>
            Look Up Package
          </el-button>
        </el-form-item>
      </el-form>

      <div class="example-hints">
        <el-alert 
          title="Example Tracking Numbers" 
          type="info" 
          :closable="false"
          show-icon
        >
          <div class="examples">
            <el-tag 
              v-for="example in exampleNumbers" 
              :key="example"
              class="example-tag"
              @click="fillExample(example)"
            >
              {{ example }}
            </el-tag>
          </div>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePackageStore } from '../stores/package'

const router = useRouter()
const packageStore = usePackageStore()

const formRef = ref(null)
const trackingInputRef = ref(null)
const loading = ref(false)

const form = ref({
  trackingNumber: '',
  destinationCity: ''
})

// 验证规则
const validateTrackingNumber = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please enter tracking number'))
    return
  }
  
  // EMS 国际件格式: EA/EC/EE + 11位数字 + CN
  const emsPattern = /^(EA|EC|EE)\d{11}CN$/
  // e邮宝/挂号小包格式: LV/LX/RV/RX + 9位数字 + CN
  const ePacketPattern = /^(LV|LX|RV|RX)\d{9}CN$/
  
  if (!emsPattern.test(value) && !ePacketPattern.test(value)) {
    callback(new Error('Invalid tracking number format'))
    return
  }
  
  callback()
}

const rules = {
  trackingNumber: [
    { required: true, validator: validateTrackingNumber, trigger: 'blur' }
  ],
  destinationCity: [
    { required: true, message: 'Please enter destination city', trigger: 'blur' }
  ]
}

// 示例单号
const exampleNumbers = ['EA12345678901CN', 'EC98765432109CN', 'LV123456789CN']

// 城市列表（用于模糊搜索）
const cities = [
  { value: 'Los Angeles, USA' },
  { value: 'New York, USA' },
  { value: 'Chicago, USA' },
  { value: 'Houston, USA' },
  { value: 'San Francisco, USA' },
  { value: 'Seattle, USA' },
  { value: 'Boston, USA' },
  { value: 'Miami, USA' }
]

const querySearch = (queryString, cb) => {
  const results = queryString
    ? cities.filter(city => city.value.toLowerCase().includes(queryString.toLowerCase()))
    : cities
  cb(results)
}

const fillExample = (trackingNumber) => {
  form.value.trackingNumber = trackingNumber
  form.value.destinationCity = 'Los Angeles, USA'
}

const handleSearch = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const result = await packageStore.searchPackage(form.value.trackingNumber)
        
        if (result.success) {
          ElMessage.success('Package found!')
          router.push('/package-info')
        } else {
          ElMessage.error(result.message)
        }
      } catch (error) {
        ElMessage.error('Failed to search package')
      } finally {
        loading.value = false
      }
    }
  })
}

// 页面加载时聚焦到跟踪号输入框
onMounted(() => {
  setTimeout(() => {
    trackingInputRef.value?.focus()
  }, 300)
})
</script>

<style scoped>
.package-search-container {
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  background: var(--bg-white);
  padding: var(--spacing-xl) var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.logo-section .main-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.5px;
}

.logo-section .main-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: 500;
}

.search-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 2px solid var(--border-color);
}

:deep(.el-card__body) {
  padding: var(--spacing-xl);
}

.card-header {
  text-align: center;
  padding: var(--spacing-sm) 0;
}

.card-header h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: 600;
}

.card-header h2 .el-icon {
  font-size: 24px;
}

.input-hint {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  line-height: var(--line-height-normal);
}

.example-hints {
  margin-top: var(--spacing-lg);
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.example-tag {
  cursor: pointer;
  transition: all 0.3s;
  font-size: var(--font-size-sm);
}

.example-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
  border-radius: var(--radius-md);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-light);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(117, 59, 189, 0.25);
  border-color: var(--primary-color);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(117, 59, 189, 0.3);
  transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(117, 59, 189, 0.4);
}
</style>

