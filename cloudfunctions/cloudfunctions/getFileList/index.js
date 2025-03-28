// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const { prefix = '' } = event
  
  try {
    const result = await cloud.getTempFileURL({
      fileList: [prefix],
    })
    
    // 获取文件列表
    const fileList = await cloud.database().collection('cloud').where({
      fileID: new RegExp('^' + prefix)
    }).get()
    
    return {
      fileList: fileList.data
    }
  } catch (error) {
    return {
      error
    }
  }
}