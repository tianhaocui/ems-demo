<template>
  <div class="payment-container">
    <!-- Logo -->
    <div class="logo-header">
      <div class="logo-box">
        <img src="/china-post-logo.png" alt="China Post" class="logo-img" />
      </div>
    </div>

    <!-- 页面标题 -->
    <div class="page-title-section">
      <h1 class="main-title">Import Tax Payment</h1>
      <p class="main-subtitle">Pay your customs duties in three simple steps</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-container">
      <div class="step completed">
        <div class="step-number">1</div>
        <div class="step-label">Tracking</div>
      </div>
      <div class="step-line"></div>
      <div class="step completed">
        <div class="step-number">2</div>
        <div class="step-label">Package Info</div>
      </div>
      <div class="step-line"></div>
      <div class="step active">
        <div class="step-number">3</div>
        <div class="step-label">Payment</div>
      </div>
    </div>

    <el-card class="payment-card" shadow="hover">

      <div class="payment-content">
        <!-- Card Title -->
        <div class="card-title">
          <el-icon class="title-icon"><CreditCard /></el-icon>
          <div>
            <h2>Billing Information</h2>
            <p class="card-subtitle">Enter your payment details</p>
          </div>
        </div>

        <!-- Total Amount Section -->
        <div class="amount-section">
          <div class="amount-row">
            <span class="amount-label">Total Amount Due</span>
            <span class="amount-value">{{ packageData?.customsDuty }}</span>
          </div>
        </div>

        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-position="top"
          @submit.prevent="handleSubmit"
          class="payment-form"
        >
          <!-- Full Name -->
          <el-form-item label="Full Name" prop="fullName">
            <el-input
              v-model="form.fullName"
              placeholder="Enter your full name"
              size="large"
            />
          </el-form-item>

          <!-- Email -->
          <el-form-item label="Email" prop="email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="your.email@example.com"
              size="large"
            />
          </el-form-item>

          <!-- Card Address -->
          <el-form-item label="Card Address" prop="address">
            <el-input
              v-model="form.address"
              placeholder="Street address or P.O. Box"
              size="large"
            />
          </el-form-item>

          <!-- Billing Address -->
          <el-form-item label="Billing Address" prop="billingAddress">
            <el-input
              v-model="form.billingAddress"
              placeholder="10 Main St, Suite 23"
              size="large"
            />
          </el-form-item>

          <!-- Card Number -->
          <el-form-item label="Card Number" prop="cardNumber">
            <el-input
              v-model="form.cardNumber"
              placeholder="Last 4 digits: 1234"
              maxlength="19"
              size="large"
              @input="formatCardNumber"
            />
          </el-form-item>

          <!-- Expiry Date and CVV -->
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Expiry Date" prop="expiryDate">
                <el-input
                  v-model="form.expiryDate"
                  placeholder="12/25"
                  maxlength="5"
                  size="large"
                  @input="formatExpiryDate"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CVV" prop="cvv">
                <el-input
                  v-model="form.cvv"
                  placeholder="123"
                  maxlength="4"
                  type="password"
                  size="large"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <el-button 
              class="back-button"
              size="large" 
              @click="goBack"
              :disabled="loading"
            >
              Back
            </el-button>
            <el-button 
              class="pay-button"
              size="large"
              :loading="loading"
              @click="handleSubmit"
            >
              <span v-if="!loading">Pay {{ packageData?.customsDuty }}</span>
              <span v-else>Processing...</span>
            </el-button>
          </div>
        </el-form>

        <!-- Security Note -->
        <p class="security-note">Your payment is secure and encrypted. Powered by Stripe, we never store your card details.</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePackageStore } from '../stores/package'

const router = useRouter()
const packageStore = usePackageStore()

const packageData = computed(() => packageStore.currentPackage)

// 如果没有包裹数据，返回搜索页
if (!packageData.value) {
  ElMessage.warning('Please search for a package first')
  router.push('/')
}

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  fullName: '',
  email: '',
  address: '',
  billingAddress: '',
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})

// 验证邮箱
const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please enter email address'))
    return
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(value)) {
    callback(new Error('Please enter a valid email address'))
    return
  }
  callback()
}

// 验证银行卡号（Luhn算法）
const validateCardNumber = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please enter card number'))
    return
  }
  
  const cardNumber = value.replace(/\s/g, '')
  
  // 长度检查 (13-19位)
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    callback(new Error('Card number must be 13-19 digits'))
    return
  }
  
  // Luhn算法校验
  let sum = 0
  let isEven = false
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  if (sum % 10 !== 0) {
    callback(new Error('Invalid card number'))
    return
  }
  
  callback()
}

// 验证有效期
const validateExpiryDate = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please enter expiry date'))
    return
  }
  
  const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/
  if (!pattern.test(value)) {
    callback(new Error('Please enter valid date (MM/YY)'))
    return
  }
  
  const [month, year] = value.split('/')
  const now = new Date()
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
  
  if (expiry < now) {
    callback(new Error('Card has expired'))
    return
  }
  
  callback()
}

// 验证CVV
const validateCVV = (rule, value, callback) => {
  if (!value) {
    callback(new Error('Please enter CVV'))
    return
  }
  
  if (!/^\d{3,4}$/.test(value)) {
    callback(new Error('CVV must be 3 or 4 digits'))
    return
  }
  
  callback()
}

const rules = {
  fullName: [
    { required: true, message: 'Please enter your full name', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  address: [
    { required: true, message: 'Please enter your address', trigger: 'blur' }
  ],
  billingAddress: [
    { required: true, message: 'Please enter billing address', trigger: 'blur' }
  ],
  cardNumber: [
    { required: true, validator: validateCardNumber, trigger: 'blur' }
  ],
  expiryDate: [
    { required: true, validator: validateExpiryDate, trigger: 'blur' }
  ],
  cvv: [
    { required: true, validator: validateCVV, trigger: 'blur' }
  ]
}

// 格式化卡号（每4位加空格）
const formatCardNumber = () => {
  let value = form.value.cardNumber.replace(/\s/g, '')
  value = value.replace(/(\d{4})/g, '$1 ').trim()
  form.value.cardNumber = value
}

// 格式化有效期
const formatExpiryDate = () => {
  let value = form.value.expiryDate.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  form.value.expiryDate = value
}

const goBack = () => {
  router.push('/package-info')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 模拟支付API调用
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 模拟支付结果（90%成功率）
        const isSuccess = Math.random() > 0.1
        
        if (isSuccess) {
          await ElMessageBox.alert(
            'Your payment has been processed successfully. An invoice has been sent to your email.',
            'Payment Successful',
            {
              confirmButtonText: 'Back to Home',
              type: 'success',
              callback: () => {
                packageStore.clearPackage()
                router.push('/')
              }
            }
          )
        } else {
          await ElMessageBox.alert(
            'Payment failed. Please check your card information and try again.',
            'Payment Failed',
            {
              confirmButtonText: 'Try Again',
              type: 'error'
            }
          )
        }
      } catch (error) {
        ElMessage.error('Payment processing failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.payment-container {
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

/* Payment Card */
.payment-card {
  border-radius: var(--radius-xl);
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.payment-content {
  padding: var(--spacing-lg);
}

/* Card Title */
.card-title {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.title-icon {
  font-size: 24px;
  color: var(--text-primary);
  flex-shrink: 0;
}

.card-title h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Amount Section */
.amount-section {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  border: 2px solid #F0283C;
  box-shadow: 0 4px 12px rgba(240, 40, 60, 0.15);
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Payment Form */
.payment-form {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--text-tertiary);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.2);
  border-color: var(--text-primary);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.back-button,
.pay-button {
  flex: 1;
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
}

.back-button {
  background: var(--bg-white);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
  transition: all 0.3s;
}

.back-button:hover {
  background: var(--bg-gray-50);
  border-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pay-button {
  background: linear-gradient(135deg, #F0283C 0%, #dc2626 100%);
  border: none;
  color: white;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(240, 40, 60, 0.3);
}

.pay-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 40, 60, 0.4);
}

/* Security Note */
.security-note {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
  margin: var(--spacing-lg) 0 0 0;
  line-height: 1.5;
}
</style>

