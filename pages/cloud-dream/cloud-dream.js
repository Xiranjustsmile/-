Page({
  data: {
    currentSound: '',
    volume: 50,
    isPlaying: false,
    isNapActive: false,
    showNapModal: false,
    napTime: 20,
    napTimeText: '',
    napTimer: null,
    napEndTime: null,
    sounds: [
      { id: 'rain', name: '雨声', category: '自然声音', emoji: '🌧️' },
      { id: 'thunder', name: '雷声', category: '自然声音', emoji: '⚡' },
      { id: 'forest', name: '森林', category: '自然声音', emoji: '🌲' },
      { id: 'ocean', name: '海浪', category: '自然声音', emoji: '🌊' },
      { id: 'night', name: '夜晚', category: '自然声音', emoji: '🌙' }, // 将夜晚移到自然声音
      { id: 'snow', name: '雪', category: '自然声音', emoji: '❄️' }, // 将风扇改为雪
      { id: 'cafe', name: '咖啡厅', category: '环境声音', emoji: '☕' },
      { id: 'fire', name: '篝火', category: '环境声音', emoji: '🔥' }
    ],
    soundsMap: {},
    categories: ['自然声音', '环境声音']
  },
  
  onLoad: function() {
    // 创建音频上下文
    this.audioContext = wx.createInnerAudioContext();
    this.audioContext.loop = true;
    
    // 设置音量
    this.audioContext.volume = this.data.volume / 100;
    
    // 添加音频播放错误监听
    this.audioContext.onError((res) => {
      console.error('音频播放错误:', res);
      wx.showToast({
        title: '音频加载失败',
        icon: 'none'
      });
    });
    
    // 从云存储获取音频文件列表
    this.loadSoundsFromCloud();
  },

  loadSoundsFromCloud: function() {
    wx.showLoading({
      title: '加载音频资源',
    });
  
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.hideLoading();
      return;
    }
    
    wx.cloud.init({
      env: 'cloud1-9guaz2y0cd9f0c90', // 确认云环境ID是否正确
      traceUser: true,
    });
    
    // 修正文件路径，添加 sounds/ 子文件夹
    const fileIDs = this.data.sounds.map(sound => 
      `cloud://cloud1-9guaz2y0cd9f0c90.636c-cloud1-9guaz2y0cd9f0c90-1314201170/sounds/${sound.id}.mp3`
    );
    
    // 添加调试信息
    console.log('尝试获取的文件路径:', fileIDs);
    
    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: res => {
        console.log('获取云存储文件成功', res);
        
        // 构建音频映射
        const soundsMap = {};
        res.fileList.forEach((file, index) => {
          if (file.status === 0) {
            const soundId = this.data.sounds[index].id;
            soundsMap[soundId] = file.tempFileURL;
            console.log(`音频 ${soundId} 的URL: ${file.tempFileURL}`);
          } else {
            console.error(`获取音频 ${this.data.sounds[index].id} 失败:`, file.errMsg);
          }
        });
        
        this.setData({ soundsMap });
        wx.hideLoading();
      },
      fail: err => {
        console.error('获取云存储文件失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '加载音频资源失败',
          icon: 'none'
        });
      }
    });
  },  // 这里添加了逗号

  backToHome: function() {
    wx.navigateBack();
  },

  playSound: function(e) {
    const sound = e.currentTarget.dataset.sound;
    
    // 如果点击当前正在播放的声音，则停止播放
    if (this.data.currentSound === sound && this.data.isPlaying) {
      this.stopSound();
      return;
    }
    
    // 停止当前播放的声音
    this.stopSound();
    
    // 检查音频URL是否存在
    const soundUrl = this.data.soundsMap[sound];
    if (!soundUrl) {
      console.error('音频资源不可用', sound);
      wx.showToast({
        title: '音频资源不可用',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '加载音频中',
    });
    
    // 播放新选择的声音
    console.log('准备播放音频:', soundUrl);
    
    this.audioContext.src = soundUrl;
    this.audioContext.play();
    
    // 添加播放成功和失败的监听
    this.audioContext.onPlay(() => {
      wx.hideLoading();
      console.log('音频开始播放');
    });
    
    this.audioContext.onError((err) => {
      wx.hideLoading();
      console.error('音频播放错误', err);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
    });
    
    this.setData({
      currentSound: sound,
      isPlaying: true
    });
  },

  stopSound: function() {
    if (this.data.isPlaying) {
      this.audioContext.stop();
      this.setData({
        isPlaying: false
      });
    }
  },

  changeVolume: function(e) {
    const volume = e.detail.value;
    this.audioContext.volume = volume / 100;
    this.setData({
      volume: volume
    });
  },

  toggleNapTimer: function() {
    if (this.data.isNapActive) {
      // 取消小睡定时
      this.cancelNapTimer();
    } else {
      // 显示设置小睡时间的模态框
      this.setData({
        showNapModal: true
      });
    }
  },

  setNapTime: function(e) {
    const time = parseInt(e.currentTarget.dataset.time);
    this.setData({
      napTime: time
    });
  },

  cancelNap: function() {
    this.setData({
      showNapModal: false
    });
  },

  confirmNap: function() {
    // 设置小睡定时器
    const napTimeInMs = this.data.napTime * 60 * 1000;
    const napEndTime = new Date().getTime() + napTimeInMs;
    
    // 创建定时器，每秒更新剩余时间
    const napTimer = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = napEndTime - now;
      
      if (timeLeft <= 0) {
        // 时间到，停止音频并清除定时器
        this.stopSound();
        this.cancelNapTimer();
        
        // 播放闹钟声音
        this.playAlarm();
        
        return;
      }
      
      // 更新显示的剩余时间
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      const napTimeText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      this.setData({
        napTimeText: napTimeText
      });
    }, 1000);
    
    this.setData({
      isNapActive: true,
      showNapModal: false,
      napTimer: napTimer,
      napEndTime: napEndTime
    });
  },

  cancelNapTimer: function() {
    if (this.data.napTimer) {
      clearInterval(this.data.napTimer);
    }
    
    this.setData({
      isNapActive: false,
      napTimer: null,
      napEndTime: null,
      napTimeText: ''
    });
  },

  playAlarm: function() {
    // 获取闹钟音频URL
    wx.cloud.getTempFileURL({
      fileList: ['cloud://cloud1-9guaz2y0cd9f0c90.636c-cloud1-9guaz2y0cd9f0c90-1314201170/sounds/alarm.mp3'],
      success: res => {
        if (res.fileList[0].status === 0) {
          // 创建闹钟音频上下文
          const alarmContext = wx.createInnerAudioContext();
          alarmContext.src = res.fileList[0].tempFileURL;
          alarmContext.loop = false;
          
          // 播放闹钟声音
          alarmContext.play();
          
          // 显示提示
          wx.showModal({
            title: '小睡时间到',
            content: '您设置的小睡时间已结束',
            showCancel: false,
            success: function(res) {
              // 用户点击确定后停止闹钟
              alarmContext.stop();
            }
          });
        }
      }
    });
  },

  onUnload: function() {
    // 页面卸载时停止音频
    this.stopSound();
    
    // 清除定时器
    if (this.data.napTimer) {
      clearInterval(this.data.napTimer);
    }
  }
});