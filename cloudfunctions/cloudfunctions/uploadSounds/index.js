const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID, soundID } = event
  
  try {
    // 将临时文件上传到云存储
    const result = await cloud.uploadFile({
      cloudPath: `sounds/${soundID}.mp3`,
      fileContent: fileID
    })
    
    return {
      success: true,
      fileID: result.fileID
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
}