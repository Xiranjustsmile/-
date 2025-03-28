Page({
  data: {
    year: 2023,
    month: 0,
    days: []
  },

  onLoad: function(options) {
    const year = parseInt(options.year) || new Date().getFullYear();
    const month = parseInt(options.month) || new Date().getMonth();
    
    this.setData({
      year,
      month
    });
    
    this.generateCalendar(year, month);
  },

  generateCalendar: function(year, month) {
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let days = [];
    
    // 添加空白格子
    for (let i = 0; i < firstDay; i++) {
      days.push({ empty: true });
    }
    
    // 添加日期格子
    const today = new Date();
    const allTodos = wx.getStorageSync('todos') || {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === today.getFullYear() && 
                      month === today.getMonth() && 
                      day === today.getDate();
      
      // 检查是否所有待办事项都已完成
      const dateKey = `${year}-${month}-${day}`;
      let completed = false;
      
      if (allTodos[dateKey] && allTodos[dateKey].length > 0) {
        // 只有当有待办事项且全部完成时，才标记为已完成
        completed = allTodos[dateKey].every(todo => todo.completed);
        completed = completed && allTodos[dateKey].length > 0;
      }
      
      days.push({
        day,
        isToday,
        completed
      });
    }
    
    this.setData({ days });
    
    // 输出调试信息，帮助排查问题
    console.log('日历已更新', this.data.days);
  },

  navigateToTodo: function(e) {
    const day = e.currentTarget.dataset.day;
    wx.navigateTo({
      url: `/pages/todo/todo?year=${this.data.year}&month=${this.data.month}&day=${day}`
    });
  },

  backToPlan: function() {
    wx.navigateBack();
  },
  // 在 Page 对象中添加 onShow 函数
  onShow: function() {
    // 如果需要刷新，则重新生成日历
    if (this.data.needRefresh) {
      this.generateCalendar(this.data.year, this.data.month);
      this.setData({
        needRefresh: false
      });
    }
  },
});