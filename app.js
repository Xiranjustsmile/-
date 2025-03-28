// app.js
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-9guaz2y0cd9f0c90', // 确保这是您实际创建的环境ID
        traceUser: true,
      })
    }
    
    this.globalData = {}
  }
})