Page({
  data: {
    date: '',
    formattedDate: '',
    plans: [],
    newPlan: '',
    isCompleted: false
  },

  onLoad: function(options) {
    const date = options.date;
    
    // 格式化日期显示
    const [year, month, day] = date.split('-');
    const formattedDate = `${year}年${month}月${day}日`;
    
    this.setData({ 
      date,
      formattedDate
    });
    
    this.loadPlans();
  },
  
  loadPlans: function() {
    const { date } = this.data;
    const [year, month] = date.split('-');
    
    // 从本地存储加载当月计划
    const plansKey = `plans_${year}_${month}`;
    const plans = wx.getStorageSync(plansKey) || [];
    
    // 过滤出当天的计划
    const dayPlans = plans.filter(p => p.date === date);
    
    // 从本地存储加载完成情况
    const completionsKey = `completions_${year}_${month}`;
    const completedDays = wx.getStorageSync(completionsKey) || [];
    const isCompleted = completedDays.includes(date);
    
    this.setData({ 
      plans: dayPlans,
      isCompleted
    });
  },
  
  inputPlan: function(e) {
    this.setData({
      newPlan: e.detail.value
    });
  },
  
  addPlan: function() {
    const { date, newPlan, plans } = this.data;
    
    if (!newPlan.trim()) {
      wx.showToast({
        title: '请输入计划内容',
        icon: 'none'
      });
      return;
    }
    
    // 创建新计划
    const newPlanObj = {
      id: Date.now().toString(),
      date: date,
      content: newPlan,
      completed: false
    };
    
    // 更新本地数据
    const updatedPlans = [...plans, newPlanObj];
    this.setData({
      plans: updatedPlans,
      newPlan: ''
    });
    
    // 保存到本地存储
    this.savePlans(updatedPlans);
  },
  
  togglePlanStatus: function(e) {
    const { id } = e.currentTarget.dataset;
    const { plans } = this.data;
    
    // 更新计划状态
    const updatedPlans = plans.map(plan => {
      if (plan.id === id) {
        return { ...plan, completed: !plan.completed };
      }
      return plan;
    });
    
    this.setData({ plans: updatedPlans });
    
    // 保存到本地存储
    this.savePlans(updatedPlans);
  },
  
  deletePlan: function(e) {
    const { id } = e.currentTarget.dataset;
    const { plans } = this.data;
    
    // 删除计划
    const updatedPlans = plans.filter(plan => plan.id !== id);
    
    this.setData({ plans: updatedPlans });
    
    // 保存到本地存储
    this.savePlans(updatedPlans);
  },
  
  savePlans: function(updatedPlans) {
    const { date } = this.data;
    const [year, month] = date.split('-');
    
    // 从本地存储加载当月所有计划
    const plansKey = `plans_${year}_${month}`;
    let allPlans = wx.getStorageSync(plansKey) || [];
    
    // 移除当天的旧计划
    allPlans = allPlans.filter(p => p.date !== date);
    
    // 添加当天的新计划
    allPlans = [...allPlans, ...updatedPlans];
    
    // 保存回本地存储
    wx.setStorageSync(plansKey, allPlans);
  },
  
  toggleCompletion: function() {
    const { date, isCompleted } = this.data;
    const [year, month] = date.split('-');
    
    // 从本地存储加载完成情况
    const completionsKey = `completions_${year}_${month}`;
    let completedDays = wx.getStorageSync(completionsKey) || [];
    
    if (isCompleted) {
      // 移除完成标记
      completedDays = completedDays.filter(d => d !== date);
    } else {
      // 添加完成标记
      completedDays.push(date);
    }
    
    // 保存回本地存储
    wx.setStorageSync(completionsKey, completedDays);
    
    this.setData({ isCompleted: !isCompleted });
    
    wx.showToast({
      title: isCompleted ? '已取消完成标记' : '已标记为完成',
      icon: 'success'
    });
  },
  
  backToMonth: function() {
    wx.navigateBack();
  }
});