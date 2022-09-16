import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerList:[],//轮播图数据
        name: '',
        type: 'ios_qq',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        if (wx.getStorageSync('typeName')) {
            let type = wx.getStorageSync('typeName');
            this.setData({
                type
            })
        }
        let name = wx.getStorageSync('heroName');
        this.setData({
            name
        })
        this.getData();
    },

    async getData(){
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