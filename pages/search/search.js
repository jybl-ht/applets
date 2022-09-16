// pages/search/search.js
import request from '../../utils/request'
let timer,startTimeStamp = 0;//定时器开始时间戳
let wait = 300

Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeholderContent: '',//默认内容
        hotList: [],//热搜榜数据
        searchContent: '',//表单数据
        searchList: [],//搜索数据
        historyList: [],//历史数据数组
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获取初始化数据
        this.getInitData();
        this.getSearchHistory()
    },

    //获取初始化数据
    async getInitData(){
        let  placeholderContent = await request('/search/default')
        let hotListData = await request('/search/hot/detail')
        this.setData({
            placeholderContent: placeholderContent.data.showKeyword,
            hotList: hotListData.data
        })
    },

    //获取本地历史记录的功能函数
    getSearchHistory(){
        let historyList = wx.getStorageSync('searchHistory');
        if (historyList) {
            this.setData({
                historyList
            })
        }
    },

    //表单内容改变的回调
    handleInputChange(e) {
        this.setData({
            searchContent: e.detail.value.trim()
        })
        //函数防抖  
        startTimeStamp = (new Date()).getTime();
        if(!timer){
			this.run(wait);    // last timer alreay executed, set a new timer
		}
    },
    run(wait) {
        timer = setTimeout( () => {
            let now = (new Date()).getTime();
			let interval = now - startTimeStamp
            if(interval < wait){ // the timer start time has been reset, so the interval is less than wait
				this.run(wait);  // reset timer for left time 
			}else{
				this.getSearchData()
				clearTimeout(timer);
				timer = false;
			}
        },wait)
    },

    async getSearchData() {
        if (!this.data.searchContent) {
            this.setData({
                searchList: []
            })
            return
        }
        let {searchContent, historyList} = this.data
        //发请求获取关键字模糊匹配数据
        let searchListData = await request('/search', {keywords: searchContent, limit: 10});
        this.setData({
            searchList: searchListData.result.songs
        })
        
        //添加搜索历史数据
        if (historyList.indexOf(searchContent) !== -1) {
            historyList.splice(historyList.indexOf(searchContent), 1)
        }
        historyList.unshift(searchContent);
        this.setData({
            historyList
        })

        wx.setStorageSync('searchHistory', historyList);
    },

    // 清空搜索内容
    clearSearchContent() {
        this.setData({
            searchContent: '',
            searchList: []
        })
    },

    // 删除历史记录
    deleteSearchHistory() {
        wx.showModal({
            title: '',
            content: '确认删除吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#d43c33',
            success: (result) => {
                if(result.confirm){
                    this.setData({
                        historyList: []
                    })
                    wx.removeStorageSync('searchHistory');
                }
            },
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