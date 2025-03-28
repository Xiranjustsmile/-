Page({
  data: {
    planData: [],
    showEditModal: false,
    editValue: '',
    editRow: -1,
    editCol: -1,
    editingTimeRange: false,
    activeRow: -1,
    isEditing: false,
    editingContent: '',
    isEditMode: false
  },
  
  // 页面加载时调用
  onLoad: function() {
    // 调用云数据库获取计划
    this.loadPlanData();
  },
  
  // 从云数据库加载计划数据
  loadPlanData: function() {
    wx.showLoading({
      title: '加载中',
    });
    
    // 检查云函数是否可用
    if (!wx.cloud) {
      console.error('云开发未初始化');
      wx.hideLoading();
      
      // 使用本地存储作为备选方案
      const planData = wx.getStorageSync('planData') || [];
      if (planData.length === 0) {
        this.setData({
          planData: [
            { timeRange: '3-6月', content: '过完基础数学', xMove: 0 },
            { timeRange: '6月', content: '开始考研809和英语', xMove: 0 },
            { timeRange: '', content: '', xMove: 0 },
            { timeRange: '', content: '', xMove: 0 },
            { timeRange: '', content: '', xMove: 0 }
          ]
        });
      } else {
        const updatedPlanData = planData.map(item => {
          return { ...item, xMove: 0 };
        });
        this.setData({ planData: updatedPlanData });
      }
      return;
    }
    
    // 获取用户openid
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        console.log('获取到的openid:', res.result.openid);
        const openid = res.result.openid;
        
        // 查询该用户的计划数据
        const db = wx.cloud.database();
        db.collection('plans')
          .where({
            _openid: openid
          })
          .get()
          .then(res => {
            console.log('查询结果:', res);
            wx.hideLoading();
            
            if (res.data.length > 0) {
              // 有数据则展示
              const planList = res.data[0].planList || [];
              // 确保每行都有xMove属性
              const updatedPlanList = planList.map(item => {
                return { ...item, xMove: 0 };
              });
              this.setData({
                planData: updatedPlanList
              });
            } else {
              // 无数据则初始化
              this.setData({
                planData: [
                  { timeRange: '3-6月', content: '过完基础数学', xMove: 0 },
                  { timeRange: '6月', content: '开始考研809和英语', xMove: 0 },
                  { timeRange: '', content: '', xMove: 0 },
                  { timeRange: '', content: '', xMove: 0 },
                  { timeRange: '', content: '', xMove: 0 }
                ]
              });
            }
          })
          .catch(err => {
            console.error('查询计划失败', err);
            wx.hideLoading();
            wx.showToast({
              title: '加载失败',
              icon: 'none'
            });
          });
      },
      fail: err => {
        console.error('获取用户ID失败:', err);
        wx.hideLoading();
        
        // 使用本地存储作为备选方案
        const planData = wx.getStorageSync('planData') || [];
        if (planData.length === 0) {
          this.setData({
            planData: [
              { timeRange: '3-6月', content: '过完基础数学', xMove: 0 },
              { timeRange: '6月', content: '开始考研809和英语', xMove: 0 },
              { timeRange: '', content: '', xMove: 0 },
              { timeRange: '', content: '', xMove: 0 },
              { timeRange: '', content: '', xMove: 0 }
            ]
          });
        } else {
          const updatedPlanData = planData.map(item => {
            return { ...item, xMove: 0 };
          });
          this.setData({ planData: updatedPlanData });
        }
      }
    });
  },
  
  // 显示删除按钮
  showDeleteBtn: function(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      activeRow: index
    });
  },
  
  // 隐藏删除按钮
  hideDeleteBtn: function() {
    this.setData({
      activeRow: -1
    });
  },
  
  // 双击开始编辑
  startEdit: function(e) {
    const { row, col, type } = e.currentTarget.dataset;
    const value = type === 'timeRange' ? 
      this.data.planData[row].timeRange : 
      this.data.planData[row].content;
    
    this.setData({
      isEditing: true,
      editRow: row,
      editCol: col,
      editingTimeRange: type === 'timeRange',
      editingContent: value
    });
  },
  
  // 编辑内容变化
  onInlineEdit: function(e) {
    this.setData({
      editingContent: e.detail.value
    });
  },
  
  // 完成编辑
  finishEdit: function() {
    const { editRow, editCol, editingContent, planData, editingTimeRange } = this.data;
    
    if (editRow >= 0) {
      if (editingTimeRange) {
        planData[editRow].timeRange = editingContent;
      } else {
        planData[editRow].content = editingContent;
      }
      
      this.setData({
        planData,
        isEditing: false,
        editRow: -1,
        editCol: -1
      });
    }
  },
  
  navigateToPlan: function() {
    wx.navigateTo({
      url: '/pages/plan/plan'
    });
  },
  
  addRow: function() {
    const planData = this.data.planData;
    planData.push({ timeRange: '', content: '', xMove: 0 });
    this.setData({ planData });
  },
  
  // 处理滑动变化
  handleMovableChange: function(e) {
    const { index } = e.currentTarget.dataset;
    const xMove = e.detail.x;
    
    // 只记录滑动位置，不做其他处理
    console.log('滑动中:', index, xMove);
  },
  
  // 处理触摸结束
  handleTouchEnd: function(e) {
    const { index } = e.currentTarget.dataset;
    const xMove = e.detail.x;
    const delBtnWidth = 100; // 删除按钮宽度
    
    // 如果滑动距离超过删除按钮宽度的一半，则显示删除按钮
    if (xMove < -delBtnWidth / 2) {
      // 设置为删除按钮的宽度，不自动回弹
      this.setData({
        [`planData[${index}].xMove`]: -delBtnWidth
      });
    } else {
      // 否则回到原位
      this.setData({
        [`planData[${index}].xMove`]: 0
      });
    }
  },
  
  // 添加点击行回弹的方法
  handleRowTap: function(e) {
    const { index } = e.currentTarget.dataset;
    
    // 获取当前行的xMove值
    const xMove = this.data.planData[index].xMove;
    
    // 如果当前行已经滑出，则回弹
    if (xMove < 0) {
      this.setData({
        [`planData[${index}].xMove`]: 0
      });
    }
  },
  
  // 添加一个方法用于重置所有行的滑动状态
  resetAllItems: function() {
    const planData = this.data.planData;
    planData.forEach((item, index) => {
      item.xMove = 0;
    });
    this.setData({ planData });
  },
  
  // 添加切换编辑模式的方法
  toggleEditMode: function() {
    this.setData({
      isEditMode: !this.data.isEditMode
    });
  },
  
  // 添加取消编辑模式的方法
  cancelEditMode: function() {
    this.setData({
      isEditMode: false
    });
  },
  
  // 修改删除行的方法
  deleteRow: function(e) {
    const { index } = e.currentTarget.dataset;
    
    // 如果不在编辑模式，不执行删除
    if (!this.data.isEditMode && !this.data.planData[index].xMove) return;
    
    const planData = [...this.data.planData];
    planData.splice(index, 1);
    
    // 重置所有行的滑动状态
    planData.forEach(item => {
      item.xMove = 0;
    });
    
    this.setData({ planData });
    
    wx.showToast({
      title: '已删除',
      icon: 'success'
    });
  },
  
  // 保存计划到云数据库
  savePlan: function() {
    // 过滤掉空行
    const filteredData = this.data.planData.filter(row => 
      row.timeRange.trim() !== '' || row.content.trim() !== ''
    );
    
    // 确保每行都有xMove属性
    const dataToSave = filteredData.map(item => {
      return { ...item, xMove: 0 };
    });
    
    console.log('准备保存的数据:', dataToSave);
    
    wx.showLoading({
      title: '保存中',
    });
    
    // 检查云函数是否可用
    if (!wx.cloud) {
      console.error('云开发未初始化');
      wx.hideLoading();
      
      // 使用本地存储作为备选方案
      wx.setStorageSync('planData', dataToSave);
      wx.showToast({
        title: '已保存到本地',
        icon: 'success',
        duration: 2000
      });
      return;
    }
    
    // 获取用户openid
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        console.log('保存时获取到的openid:', res.result.openid);
        const openid = res.result.openid;
        const db = wx.cloud.database();
        
        // 查询是否已有数据
        db.collection('plans')
          .where({
            _openid: openid
          })
          .get()
          .then(res => {
            console.log('保存前查询结果:', res);
            
            if (res.data.length > 0) {
              // 更新已有数据
              return db.collection('plans').doc(res.data[0]._id).update({
                data: {
                  planList: dataToSave,
                  updateTime: db.serverDate()
                }
              });
            } else {
              // 创建新数据
              return db.collection('plans').add({
                data: {
                  planList: dataToSave,
                  createTime: db.serverDate(),
                  updateTime: db.serverDate()
                }
              });
            }
          })
          .then(res => {
            console.log('保存结果:', res);
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
          })
          .catch(err => {
            console.error('保存失败详情:', err);
            wx.hideLoading();
            
            // 使用本地存储作为备选方案
            wx.setStorageSync('planData', dataToSave);
            wx.showToast({
              title: '已保存到本地',
              icon: 'success'
            });
          });
      },
      fail: err => {
        console.error('保存时获取用户ID失败:', err);
        wx.hideLoading();
        
        // 使用本地存储作为备选方案
        wx.setStorageSync('planData', dataToSave);
        wx.showToast({
          title: '已保存到本地',
          icon: 'success'
        });
      }
    });
  },
  
  // 以下方法保留但不再使用
  editCell: function(e) {
    // 保留但不使用
  },
  
  editTimeRange: function(e) {
    // 保留但不使用
  },
  
  onEditInput: function(e) {
    // 保留但不使用
  },
  
  cancelEdit: function() {
    // 保留但不使用
  },
  
  confirmEdit: function() {
    // 保留但不使用
  }
});