import PubSub from 'pubsub-js';
import moment from 'moment';
import request from '../../utils/request';
//获取全局实例
const appInstance = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay: false,//音乐是否播放
        song: {},//歌曲详情对象
        musicId: '',//音乐ID
        musicLink: '',//音乐url
        currentTime: '00:00',//实时时长
        durationTime: '00:00',//总时长
        currentWidth: 0,//实时进度条的宽度
        degData: true,//重置旋转角度
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let musicId = options.musicId;
        this.setData({
            musicId
        })
        //获取音乐详情
        this.getMusicInfo(musicId);
        //初始化播放状态,自动播放省略此功能
        // if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
        //     this.setData({
        //         isPlay: true
        //     })
        // }
        //创建控制音乐播放的实例
        this.backgroundAudioManager = wx.getBackgroundAudioManager();
        //监视音乐播放/暂停/停止
        this.backgroundAudioManager.onPlay(() => {
            this.changePlayState(true);
            appInstance.globalData.musicId = musicId;
        });
        this.backgroundAudioManager.onPause(() => {
            this.changePlayState(false);
        });
        this.backgroundAudioManager.onStop(() => {
            this.changePlayState(false);
        });
        //监听音乐实时进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            // console.log(this.backgroundAudioManager.duration, this.backgroundAudioManager.currentTime)
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss');
            let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450;
            this.setData({
                currentTime,
                currentWidth
            })
        });
    },
    //修改播放状态的功能函数
    changePlayState(isPlay) {
        this.setData({
            isPlay
        })
        //修改全局音乐播放状态
        appInstance.globalData.isMusicPlay = isPlay;
    },
    //获取音乐详情并自动播放的功能函数
    async getMusicInfo(musicId){
        let songData = await request('/song/detail', {ids: musicId})

        let durationTime = moment(songData.songs[0].dt).format('mm:ss')

        //获取音乐播放连接
        let musicLinkData = await request('/song/url', {id: musicId})
        let musicLink = musicLinkData.data[0].url;
        this.setData({
            song: songData.songs[0],
            musicLink,
            durationTime
        })
        //动态修改窗口标题
        wx.setNavigationBarTitle({
            title: this.data.song.name,
        });
        this.musicControl(true);
    },
    // 点击播放/暂停回调
    handleMusicPlay() {
        let isPlay = !this.data.isPlay;
        this.musicControl(isPlay);
    },
    //控制音乐播放/暂停的功能函数
    musicControl(isPlay) {
        if (isPlay) {//音乐播放
            if (this.data.musicLink === null) {
                wx.showToast({
                    title: '非VIP,播放失败!',
                    icon: 'error',
                    duration: 2000,
                    mask: false
                });
                return;
            }
            this.backgroundAudioManager.src = this.data.musicLink;
            this.backgroundAudioManager.title = this.data.song.name;
        } else {//音乐暂停
            this.backgroundAudioManager.pause();
        }
    },
    //点击切歌的回调
    handleSwitch(e){
        //关闭当前音乐
        this.backgroundAudioManager.stop();
        //获取切歌类型（上/下一首）
        let type = e.currentTarget.id;
        //订阅来自recommendSong发布的musicId消息
        PubSub.subscribe('musicId', (msg, musicId) => {
            this.setData({
                musicId
            })
            //获取音乐详情信息
            this.getMusicInfo(musicId);
            //取消订阅
            PubSub.unsubscribe('musicId')
        });
        //发布消息数据给recommendSong页面
        PubSub.publish('switchType', type)
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