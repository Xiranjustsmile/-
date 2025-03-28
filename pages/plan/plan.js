Page({
  data: {
    months: []
  },

  onLoad: function() {
    this.generateMonths();
  },

  generateMonths: function() {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let months = [];
    
    // 显示当前月份和未来7个月
    for (let i = 0; i < 12; i++) {
      const monthIndex = i;
      const year = currentYear;
      
      months.push({
        name: monthNames[monthIndex],
        month: monthIndex + 1, // 月份从1开始
        year: year,
        displayName: `${monthIndex + 1}月`
      });
    }
    
    this.setData({ months });
  },

  navigateToMonth: function(e) {
    const { month, year } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/month-detail/month-detail?year=${year}&month=${month}`
    });
  },

  backToHome: function() {
    wx.navigateBack();
  }
});