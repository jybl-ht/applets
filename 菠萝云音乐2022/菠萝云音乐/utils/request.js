import config from "./config";
export default (url,data={},method='GET') => {
    return new Promise((resolve,reject) => {
        wx.request({
            url:config.host + url,
            // url:config.mobileHost + url,
            data,
            method,
            header: {
                cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
            },
            success: (res)=>{
                if (data.isLogin) {//登录请求
                    //将用户的cookies存入本地
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies,
                    });
                }
                // console.log('请求成功:',res)
                resolve(res.data);//resolve修改promise状态为成功状态resolved
            },
            fail: (err)=>{
                // console.log('请求失败:',err)
                reject(err)//reject修改promise状态为失败状态rejected
            },
        });
    })
}