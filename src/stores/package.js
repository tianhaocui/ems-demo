import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePackageStore = defineStore('package', () => {
  // 当前包裹信息
  const currentPackage = ref(null)
  
  // 计算税费：Package Value * 0.1
  const calculateCustomsDuty = (itemValue) => {
    const value = parseFloat(itemValue.replace('$', ''))
    const duty = value * 0.1
    return `$${duty.toFixed(2)}`
  }

  // Mock包裹数据
  const mockPackages = {
    'EA12345678901CN': {
      trackingNumber: 'EA12345678901CN',
      originCity: 'Shenzhen, China',
      destinationCity: 'Los Angeles, USA',
      weight: '5.5 lb',
      volume: '30 x 20 x 15 cm',
      itemName: 'Electronic Components',
      hsCode: '8542.39.00',
      itemValue: '$150.00',
      get customsDuty() {
        return calculateCustomsDuty(this.itemValue)
      }
    },
    'EC98765432109CN': {
      trackingNumber: 'EC98765432109CN',
      originCity: 'Beijing, China',
      destinationCity: 'New York, USA',
      weight: '4.0 lb',
      volume: '25 x 15 x 10 cm',
      itemName: 'Books',
      hsCode: '4901.99.00',
      itemValue: '$80.00',
      get customsDuty() {
        return calculateCustomsDuty(this.itemValue)
      }
    },
    'LV123456789CN': {
      trackingNumber: 'LV123456789CN',
      originCity: 'Shanghai, China',
      destinationCity: 'Chicago, USA',
      weight: '1.1 lb',
      volume: '20 x 15 x 5 cm',
      itemName: 'Clothing',
      hsCode: '6109.10.00',
      itemValue: '$45.00',
      get customsDuty() {
        return calculateCustomsDuty(this.itemValue)
      }
    }
  }

  // 查询包裹
  const searchPackage = async (trackingNumber) => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const packageData = mockPackages[trackingNumber]
    if (packageData) {
      currentPackage.value = packageData
      return { success: true, data: packageData }
    }
    return { success: false, message: 'No package information was retrieved' }
  }

  // 清空当前包裹
  const clearPackage = () => {
    currentPackage.value = null
  }

  return {
    currentPackage,
    searchPackage,
    clearPackage
  }
})

