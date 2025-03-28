Page({
  data: {},
  
  onLoad: function() {},
  
  navigateToPlan: function() {
    wx.navigateTo({
      url: '/pages/index/index'  // 如果计划总览页面是 index
    });
  },
  
  navigateToDream: function() {
    wx.navigateTo({
      url: '/pages/cloud-dream/cloud-dream'
    });
  },
  
  navigateToSoundAdmin: function() {
    wx.navigateTo({
      url: '/pages/sound-admin/sound-admin'
    });
  }
});