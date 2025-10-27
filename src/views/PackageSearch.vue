<template>
  <div class="package-search-container">
    <!-- Logo -->
    <div class="logo-header">
      <div class="logo-box">
        <img :src="logoUrl" alt="China Post" class="logo-img" />
      </div>
    </div>

    <!-- 页面标题 -->
    <div class="page-title-section">
      <h1 class="main-title">Import Tax Payment</h1>
      <p class="main-subtitle">Pay your customs duties in three simple steps</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-container">
      <div class="step active">
        <div class="step-number">1</div>
        <div class="step-label">Tracking</div>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-label">Package Info</div>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-label">Payment</div>
      </div>
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
          <div class="input-with-scan">
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
            <el-button 
              v-if="isMobile"
              type="primary" 
              size="large" 
              class="scan-button"
              @click="showScanner = true"
            >
              <el-icon><Camera /></el-icon>
            </el-button>
          </div>
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

    <!-- Scanner Dialog -->
    <el-dialog
      v-model="showScanner"
      title="Scan Tracking Number"
      :width="isMobile ? '95%' : '500px'"
      :fullscreen="isMobile"
      @close="stopScanner"
    >
      <div class="scanner-container">
        <div id="qr-reader" ref="qrReaderRef"></div>
        <div v-if="scanError" class="scan-error">
          <el-alert type="error" :closable="false">
            {{ scanError }}
          </el-alert>
        </div>
        <div class="scan-tips">
          <el-icon><InfoFilled /></el-icon>
          <span>Point your camera at the barcode or QR code</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showScanner = false">Cancel</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePackageStore } from '../stores/package'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()
const packageStore = usePackageStore()

const logoUrl = new URL('/china-post-logo.png', import.meta.url).href

const formRef = ref(null)
const trackingInputRef = ref(null)
const qrReaderRef = ref(null)
const loading = ref(false)
const showScanner = ref(false)
const scanError = ref('')
const isMobile = ref(false)

let html5QrCode = null

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

// 检测是否是移动设备
const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
}

// 开始扫描
const startScanner = async () => {
  try {
    scanError.value = ''
    
    // 初始化扫描器
    html5QrCode = new Html5Qrcode('qr-reader')
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: [
        0, // QR_CODE
        13, // CODE_128
        3, // EAN_13
        2, // EAN_8
        14, // CODE_39
        15  // CODE_93
      ]
    }
    
    await html5QrCode.start(
      { facingMode: 'environment' }, // 使用后置摄像头
      config,
      onScanSuccess,
      onScanError
    )
  } catch (err) {
    console.error('Scanner start failed:', err)
    scanError.value = 'Unable to start camera. Please check your permissions.'
  }
}

// 停止扫描
const stopScanner = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (err) {
      console.error('停止扫描失败:', err)
    }
  }
  html5QrCode = null
}

// 扫描成功回调
const onScanSuccess = (decodedText) => {
  // 填充到输入框
  form.value.trackingNumber = decodedText.toUpperCase()
  
  ElMessage.success('Scanned successfully!')
  
  // 关闭扫描器
  showScanner.value = false
}

// 扫描错误回调（静默处理）
const onScanError = () => {
  // 不需要显示错误，因为扫描过程中会持续触发
}

// 监听扫描器对话框的显示状态
watch(showScanner, (newValue) => {
  if (newValue) {
    // 延迟启动扫描器，等待DOM渲染
    setTimeout(() => {
      startScanner()
    }, 300)
  } else {
    stopScanner()
  }
})

// 页面加载时聚焦到跟踪号输入框
onMounted(() => {
  checkMobile()
  
  setTimeout(() => {
    trackingInputRef.value?.focus()
  }, 300)
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkMobile)
})

// 组件卸载时清理
onUnmounted(() => {
  stopScanner()
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.package-search-container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

/* Logo Header */
.logo-header {
  margin-bottom: var(--spacing-xl);
}

.logo-box {
  background: transparent;
  padding: 0;
  border-radius: 0;
  display: inline-block;
}

.logo-img {
  height: 80px;
  display: block;
}

/* Page Title Section */
.page-title-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: var(--spacing-sm);
}

.main-subtitle {
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.85);
}

/* Steps Container */
.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-gray-100);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-base);
  border: 2px solid var(--border-color);
}

.step.completed .step-number,
.step.active .step-number {
  background: #1e293b;
  color: white;
  border-color: #1e293b;
}

.step-label {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.step.completed .step-label,
.step.active .step-label {
  color: white;
  font-weight: 600;
}

.step-line {
  width: 80px;
  height: 2px;
  background: var(--border-color);
  margin: 0 var(--spacing-sm);
  margin-bottom: 32px;
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

/* 扫描按钮样式 */
.input-with-scan {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.input-with-scan .el-input {
  flex: 1;
}

.scan-button {
  flex-shrink: 0;
  min-width: 50px;
  height: 40px;
  padding: 0 15px;
  border-radius: var(--radius-md);
}

.scan-button .el-icon {
  font-size: 20px;
}

/* 扫描器容器样式 */
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
}

#qr-reader {
  width: 100%;
  max-width: 500px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.scan-error {
  margin-top: var(--spacing-md);
  width: 100%;
}

.scan-tips {
  margin-top: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.scan-tips .el-icon {
  font-size: 18px;
  color: var(--primary-color);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .scanner-container {
    padding: var(--spacing-sm);
  }
  
  #qr-reader {
    max-width: 100%;
  }
  
  .scan-button {
    height: 40px;
    padding: 0 12px;
  }
}
</style>

