<template>
  <div class="package-info-container">
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
      <div class="step active">
        <div class="step-number">2</div>
        <div class="step-label">Package Info</div>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-label">Payment</div>
      </div>
    </div>
    
    <el-card class="info-card" shadow="hover">

      <div v-if="packageData" class="package-details">
        <!-- Package Information Header -->
        <div class="card-title">
          <el-icon class="title-icon"><Box /></el-icon>
          <div>
            <h2>Package Information</h2>
            <p class="card-subtitle">Review your package details and calculated tax</p>
          </div>
        </div>

        <!-- Package Details Table -->
        <div class="details-table">
          <div class="detail-row">
            <span class="detail-label">Tracking Number</span>
            <span class="detail-value">{{ packageData.trackingNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Origin</span>
            <span class="detail-value">{{ packageData.originCity }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Destination</span>
            <span class="detail-value">{{ packageData.destinationCity }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Package Value</span>
            <span class="detail-value">{{ packageData.itemValue }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Weight</span>
            <span class="detail-value">{{ packageData.weight }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Commodity</span>
            <span class="detail-value">{{ packageData.itemName }}</span>
          </div>
        </div>

        <!-- Calculated Import Tax -->
        <div class="tax-section">
          <div class="tax-header">
            <span class="tax-title">Calculated Import Tax</span>
            <span class="tax-amount">{{ packageData.customsDuty }}</span>
          </div>
          <p class="tax-note">Tax calculated at 15% of package value plus $5 per kilogram</p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button 
            class="back-button"
            size="large" 
            @click="goBack"
          >
            Back
          </el-button>
          <el-button 
            class="continue-button"
            type="primary" 
            size="large"
            @click="continueToPayment"
          >
            Continue to Payment
          </el-button>
        </div>
      </div>

      <el-empty v-else description="No package information available" />
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePackageStore } from '../stores/package'

const router = useRouter()
const packageStore = usePackageStore()

const packageData = computed(() => packageStore.currentPackage)

// 如果没有包裹数据，返回搜索页
if (!packageData.value) {
  ElMessage.warning('No package information was retrieved')
  router.push('/')
}

const goBack = () => {
  router.push('/')
}

const continueToPayment = () => {
  router.push('/payment')
}
</script>

<style scoped>
.package-info-container {
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

/* Info Card */
.info-card {
  border-radius: var(--radius-xl);
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.package-details {
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

/* Details Table */
.details-table {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
}

/* Tax Section */
.tax-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #15803D;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
}

.tax-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.tax-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.tax-amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.tax-note {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.back-button,
.continue-button {
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

.continue-button {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: none;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 41, 59, 0.4);
}
</style>

