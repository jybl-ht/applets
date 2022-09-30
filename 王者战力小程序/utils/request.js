
import config from "./config";
export default (url,data={},method='GET') => {
    return new Promise((resolve,reject) => {
        wx.request({
            // url:config.host + url,
            url:config.mobileHost + url,
            data,
            method,
            header: {},
            success: (res)=>{
                resolve(res.data);//resolve修改promise状态为成功状态resolved
            },
            fail: (err)=>{
                // console.log('请求失败:',err)
                reject(err)//reject修改promise状态为失败状态rejected
            },
        });
    })
}