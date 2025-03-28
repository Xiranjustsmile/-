Page({
  data: {
    year: 0,
    month: 0,
    monthName: '',
    days: [],
    plans: [],
    completedDays: [],
    weekdays: ['日', '一', '二', '三', '四', '五', '六']
  },

  onLoad: function(options) {
    const year = parseInt(options.year) || new Date().getFullYear();
    const month = parseInt(options.month) || new Date().getMonth() + 1;
    
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthName = monthNames[month - 1];
    
    this.setData({
      year,
      month,
      monthName
    });
    
    this.generateCalendar();
    this.loadPlansAndCompletions();
  },
  
  generateCalendar: function() {
    const { year, month } = this.data;
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month - 1, 1).getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 获取上个月天数
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    
    let days = [];
    
    // 添加上个月的日期
    for (let i = 0; i < firstDay; i++) {
      days.push({
        day: daysInPrevMonth - firstDay + i + 1,
        date: `${month === 1 ? year - 1 : year}-${month === 1 ? 12 : month - 1}-${daysInPrevMonth - firstDay + i + 1}`,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: `${year}-${month}-${i}`,
        isCurrentMonth: true,
        isToday: this.isToday(year, month, i)
      });
    }
    
    // 添加下个月的日期以填满6行
    const totalDaysNeeded = 42; // 6行 x 7列
    const remainingDays = totalDaysNeeded - days.length;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        date: `${month === 12 ? year + 1 : year}-${month === 12 ? 1 : month + 1}-${i}`,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }
    
    this.setData({ days });
  },
  
  isToday: function(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() + 1 === month && 
           today.getDate() === day;
  },
  
  // 修改 loadPlansAndCompletions 函数
  loadPlansAndCompletions: function() {
    // 从本地存储加载计划和完成情况
    const { year, month } = this.data;
    const plansKey = `plans_${year}_${month}`;
    const completionsKey = `completions_${year}_${month}`;
    
    const plans = wx.getStorageSync(plansKey) || [];
    const completedDays = wx.getStorageSync(completionsKey) || [];
    
    // 更新日期数据，标记有计划和已完成的日期
    const days = this.data.days.map(day => {
      // 检查是否有计划
      const hasPlans = plans.some(plan => plan.date === day.date);
      // 检查是否已完成
      const isCompleted = completedDays.includes(day.date);
      
      return {
        ...day,
        hasPlans,
        isCompleted
      };
    });
    
    this.setData({ 
      days,
      plans, 
      completedDays 
    });
  },
  
  navigateToDay: function(e) {
    const { date, isCurrentMonth } = e.currentTarget.dataset;
    
    // 只允许点击当月日期
    if (!isCurrentMonth) return;
    
    wx.navigateTo({
      url: `/pages/day-detail/day-detail?date=${date}`
    });
  },
  
  backToPlans: function() {
    wx.navigateBack();
  },
  
  onShow: function() {
    // 页面显示时重新加载数据，以便在添加计划后更新
    this.loadPlansAndCompletions();
  }
});