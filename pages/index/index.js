// pages/index/index.js
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerList:[],//英雄列表数据
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let bannerList = wx.getStorageSync('heroList');
        this.setData({
            bannerList
        })
        //英雄列表数据
        if (this.data.bannerList.length < 108) {
            this.upDataHeroList()
        }
    },

    async upDataHeroList() {
        this.setData({
            bannerList: []
        })
        wx.setStorageSync('isToast', true)
        wx.showLoading({
            title: '加载中',
        })
        let bannerListData = await request('getHeroList.php');
        // console.log('发请求')
        this.setData({
            bannerList: bannerListData.data
        })
        wx.setStorageSync('heroList', bannerListData.data);
    },

    toHeroDetail(e) {
        //跳转至每日推荐界面
        // console.log('跳转到heroDetail', e.currentTarget.id)
        wx.setStorageSync('heroName', e.currentTarget.id);
        wx.navigateTo({
            url: '/pages/heroDetail/heroDetail',
        });
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