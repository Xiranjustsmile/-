Page({
  data: {
    year: 2023,
    month: 0,
    day: 1,
    todos: [],
    newTodo: '',
    dateKey: ''
  },

  onLoad: function(options) {
    const year = parseInt(options.year);
    const month = parseInt(options.month);
    const day = parseInt(options.day);
    const dateKey = `${year}-${month}-${day}`;
    
    this.setData({
      year,
      month,
      day,
      dateKey
    });
    
    this.loadTodos(dateKey);
  },

  loadTodos: function(dateKey) {
    const allTodos = wx.getStorageSync('todos') || {};
    const todos = allTodos[dateKey] || [];
    
    this.setData({ todos });
  },

  onTodoInput: function(e) {
    this.setData({
      newTodo: e.detail.value
    });
  },

  addTodo: function() {
    if (!this.data.newTodo.trim()) return;
    
    const allTodos = wx.getStorageSync('todos') || {};
    const dateKey = this.data.dateKey;
    
    if (!allTodos[dateKey]) {
      allTodos[dateKey] = [];
    }
    
    allTodos[dateKey].push({
      text: this.data.newTodo,
      completed: false
    });
    
    wx.setStorageSync('todos', allTodos);
    
    this.setData({
      todos: allTodos[dateKey],
      newTodo: ''
    });
  },

  toggleTodoComplete: function(e) {
    const index = e.currentTarget.dataset.index;
    const allTodos = wx.getStorageSync('todos') || {};
    const dateKey = this.data.dateKey;
    
    if (allTodos[dateKey] && allTodos[dateKey][index]) {
      allTodos[dateKey][index].completed = !allTodos[dateKey][index].completed;
      
      wx.setStorageSync('todos', allTodos);
      
      this.setData({
        todos: allTodos[dateKey]
      });
      
      // 检查是否所有待办事项都已完成
      this.checkAllCompleted();
    }
  },
  
  checkAllCompleted: function() {
    const allTodos = wx.getStorageSync('todos') || {};
    const dateKey = this.data.dateKey;
    
    if (allTodos[dateKey] && allTodos[dateKey].length > 0) {
      const allCompleted = allTodos[dateKey].every(todo => todo.completed);
      
      // 如果所有待办事项都已完成，可以在这里添加额外的逻辑
      if (allCompleted) {
        wx.showToast({
          title: '今日任务已完成！',
          icon: 'success',
          duration: 2000
        });
      }
    }
  },
  
  backToCalendar: function() {
    // 返回上一页前，确保日历页面会刷新
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    // 设置一个标记，表示需要刷新日历
    if (prevPage) {
      prevPage.setData({
        needRefresh: true
      });
    }
    
    wx.navigateBack();
  }
});