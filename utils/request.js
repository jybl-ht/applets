
import config from "./config";
export default (url,data={},method='GET') => {
    return new Promise((resolve,reject) => {
        wx.request({
            // url:config.host + url,
            url:config.mobileHost + url,
            data,
            method,
            header: {},
            //将用户的cookies存入本地
            success: (res)=>{
                //登录请求
                // if (data.isLogin) {
                    // wx.setStorage({
                    //     key: 'cookies',
                    //     data: res.cookies,
                    // });
                // }
                // console.log('请求成功:',res)
                if (wx.getStorageSync('isToast')) {
                    wx.hideLoading()
                    wx.setStorageSync('isToast', false)
                }
                wx.setStorageSync('isLoading', false)
                resolve(res.data);//resolve修改promise状态为成功状态resolved
            },
            fail: (err)=>{
                // console.log('请求失败:',err)
                reject(err)//reject修改promise状态为失败状态rejected
            },
        });
    })
}