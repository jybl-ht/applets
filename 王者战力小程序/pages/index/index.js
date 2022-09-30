// pages/index/index.js
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerList: [],//英雄列表数据
        heroNavIndex: 1,//分类显示英雄index
        currentIndex: 0,//设置swiper当前index
        sortTabbar: ["战士","坦克","刺客","法师","射手","辅助"],
        sortNumber: [1,3,4,2,5,6],
        scrollViewHeight: 0,
    },

    changeNav(e) {
        this.setData({
            heroNavIndex: this.data.sortNumber[e.currentTarget.dataset.index],
            currentIndex: e.currentTarget.dataset.index
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //英雄列表数据
        wx.setStorageSync('isToast', true)
        wx.showLoading({
            title: '加载中',
        })
        this.upDataHeroList()
        if (wx.getStorageSync('isToast')) {
            wx.hideLoading()
            wx.setStorageSync('isToast', false)
        }
        wx.setStorageSync('isLoading', false)
        this.scrollViewHeight()
    },

    //获取页面高度，动态计算高度
    scrollViewHeight() {
        //获取屏幕可用高度
        let scrollViewHeight = wx.getSystemInfoSync().windowHeight - 40; 
        this.setData({
            scrollViewHeight
        })
    },

    // 请求数据
    async upDataHeroList() {
        let bannerListData = await request('getHeroList.php');
        this.setData({
            bannerList: bannerListData.data
        })
        wx.setStorageSync('heroList', bannerListData.data);
    },

    toHeroDetail(e) {
        // console.log('跳转到heroDetail', e.currentTarget.id)
        wx.setStorageSync('heroName', e.currentTarget.id);
        wx.navigateTo({
            url: '/pages/heroDetail/heroDetail',
        });
    },

    swiperChanged(e) {
        let heroNavIndex = this.data.sortNumber[e.detail.current]
        this.setData({
            heroNavIndex
        })
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
        // 显示顶部刷新图标  
        wx.showNavigationBarLoading();
        this.upDataHeroList()
        setTimeout(() => {
            // 隐藏导航栏加载框  
            wx.hideNavigationBarLoading();
            // 停止下拉动作  
            wx.stopPullDownRefresh();
        }, 1000);
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