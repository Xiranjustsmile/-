Page({
  data: {
    sounds: [
      { id: 'rain', name: '雨声', category: '自然声音', uploaded: false, tempFilePath: '' },
      { id: 'thunder', name: '雷声', category: '自然声音', uploaded: false, tempFilePath: '' },
      { id: 'forest', name: '森林', category: '自然声音', uploaded: false, tempFilePath: '' },
      { id: 'ocean', name: '海浪', category: '自然声音', uploaded: false, tempFilePath: '' },
      { id: 'cafe', name: '咖啡厅', category: '环境声音', uploaded: false, tempFilePath: '' },
      { id: 'fire', name: '篝火', category: '环境声音', uploaded: false, tempFilePath: '' },
      { id: 'night', name: '夜晚', category: '环境声音', uploaded: false, tempFilePath: '' },
      { id: 'snow', name: '雪', category: '环境声音', uploaded: false, tempFilePath: '' },
      { id: 'alarm', name: '闹钟', category: '系统', uploaded: false, tempFilePath: '' }
    ]
  },

  onLoad: function() {
    // 检查云存储中已有的音频文件
    this.checkExistingSounds();
  },

  backToHome: function() {
    wx.navigateBack();
  },

  checkExistingSounds: function() {
    wx.cloud.init();
    
    // 获取云存储中的文件列表
    wx.cloud.getTempFileURL({
      fileList: this.data.sounds.map(sound => 
        `cloud://cloud1-9guaz2y0cd9f0c90.636c-cloud1-9guaz2y0cd9f0c90-1320405872/sounds/${sound.id}.mp3`
      ),
      success: res => {
        console.log('检查云存储文件', res);
        
        // 更新已上传状态
        const sounds = [...this.data.sounds];
        res.fileList.forEach((file, index) => {
          if (file.status === 0) {
            sounds[index].uploaded = true;
          }
        });
        
        this.setData({ sounds });
      },
      fail: err => {
        console.error('检查云存储文件失败', err);
      }
    });
  },

  chooseSound: function(e) {
    const soundId = e.currentTarget.dataset.id;
    const soundIndex = this.data.sounds.findIndex(s => s.id === soundId);
    
    if (soundIndex === -1) return;
    
    // 选择音频文件
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav'],
      success: res => {
        const tempFilePath = res.tempFiles[0].path;
        console.log('选择的音频文件', tempFilePath);
        
        // 更新临时文件路径
        const sounds = [...this.data.sounds];
        sounds[soundIndex].tempFilePath = tempFilePath;
        
        this.setData({ sounds });
      }
    });
  },

  uploadSound: function(e) {
    const soundId = e.currentTarget.dataset.id;
    const sound = this.data.sounds.find(s => s.id === soundId);
    
    if (!sound || !sound.tempFilePath) return;
    
    wx.showLoading({
      title: '上传中...',
    });
    
    // 上传到云存储
    wx.cloud.uploadFile({
      cloudPath: `sounds/${sound.id}.mp3`,
      filePath: sound.tempFilePath,
      success: res => {
        console.log('上传成功', res);
        
        // 更新状态
        const sounds = [...this.data.sounds];
        const soundIndex = sounds.findIndex(s => s.id === soundId);
        sounds[soundIndex].uploaded = true;
        
        this.setData({ sounds });
        
        wx.hideLoading();
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
      },
      fail: err => {
        console.error('上传失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    });
  },

  uploadAllSounds: function() {
    const soundsToUpload = this.data.sounds.filter(sound => 
      sound.tempFilePath && !sound.uploaded
    );
    
    if (soundsToUpload.length === 0) {
      wx.showToast({
        title: '没有可上传的音频',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '批量上传中...',
    });
    
    // 逐个上传
    let uploadedCount = 0;
    let failedCount = 0;
    
    const uploadNext = (index) => {
      if (index >= soundsToUpload.length) {
        // 全部上传完成
        wx.hideLoading();
        wx.showToast({
          title: `上传完成: ${uploadedCount}成功, ${failedCount}失败`,
          icon: 'none'
        });
        return;
      }
      
      const sound = soundsToUpload[index];
      
      wx.cloud.uploadFile({
        cloudPath: `sounds/${sound.id}.mp3`,
        filePath: sound.tempFilePath,
        success: res => {
          console.log(`上传成功: ${sound.name}`, res);
          uploadedCount++;
          
          // 更新状态
          const sounds = [...this.data.sounds];
          const soundIndex = sounds.findIndex(s => s.id === sound.id);
          sounds[soundIndex].uploaded = true;
          
          this.setData({ sounds });
          
          // 上传下一个
          uploadNext(index + 1);
        },
        fail: err => {
          console.error(`上传失败: ${sound.name}`, err);
          failedCount++;
          
          // 上传下一个
          uploadNext(index + 1);
        }
      });
    };
    
    // 开始上传第一个
    uploadNext(0);
  }
});