import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        heroList: [],
        bannerList:[],//数据
        name: '貂蝉',
        type: 'ios_qq',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        let heroList = wx.getStorageSync('heroList');
        this.setData({
            heroList
        })
        this.getData();
    },

    async getData(){
        if (JSON.stringify(this.data.heroList).indexOf(JSON.stringify(this.data.name)) !== -1) {
            wx.setStorageSync('isLoading', true)
            setTimeout(() => {
                if (wx.getStorageSync('isLoading')) {
                    wx.setStorageSync('isToast', true)
                    wx.showLoading({
                        title: '加载中',
                    })
                }
            }, 500);
            let bannerListData = await request('getHeroInfo.php', {hero: this.data.name, type: this.data.type});        
            this.setData({
                bannerList: bannerListData
            })
        }
        else if (this.data.name === '') {
            wx.showToast({
                title: '你好,无名氏！',
                icon: 'none',
                duration: 2000,
            });
        }
        else if (this.data.name === '黄涛') {
            wx.showToast({
                title: '叫老公！没大没小的',
                icon: 'none',
                duration: 2000,
            });
        }
        else if (this.data.name === '徐雪美') {
            wx.showToast({
                title: '叫小雪姐姐！不懂事',
                icon: 'none',
                duration: 2000,
            });
        }
        else if (this.data.name === '雪不只是天气') {
            wx.showToast({
                title: '他朝若是同淋雪，此生也算共白头',
                icon: 'none',
                duration: 2000,
            });
        }
        else if (this.data.name === '小丫头') {
            wx.showToast({
                title: '想你想你想你',
                icon: 'none',
                duration: 2000,
            });
        }
        else if (this.data.name === '你好') {
            wx.showToast({
                title: '喜欢有礼貌的你',
                icon: 'none',
                duration: 2000,
            });
        }
        else {
            wx.showToast({
                title: '这是你的小名吗？',
                icon: 'none',
                duration: 2500,
            });
        }
    },

    type1(){
        wx.setStorageSync('typeName', 'qq');
        this.setData({
            type: 'qq'
        })
        this.getData();
    },
    type2(){
        wx.setStorageSync('typeName', 'ios_qq');
        this.setData({
            type: 'ios_qq'
        })
        this.getData();
    },
    type3(){
        wx.setStorageSync('typeName', 'wx');
        this.setData({
            type: 'wx'
        })
        this.getData();
    },
    type4(){
        wx.setStorageSync('typeName', 'ios_wx');
        this.setData({
            type: 'ios_wx'
        })
        this.getData();
    },

    change(e){
        this.setData({
            name: e.detail.value
        })
    },

    inputChange(){
            this.getData();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})