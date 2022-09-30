import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList: [],//导航标签数据
        navId: '',//导航的标识
        videoList: [],//视频列表数据
        videoId: '',//video标识
        videoUpdataTime: [],//记录video播放的时长
        isTriggered: false,//下拉刷新是否被触发
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获取导航数据
        this.getVideoGroupListData();
    },

    //获取导航数据
    async getVideoGroupListData() {
        let videoGroupListData = await request('/video/group/list');
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0, 14),
            navId: videoGroupListData.data[0].id
        })
        //获取视频列表数据
        this.getVideoList(this.data.navId)
    },
    //获取视频列表数据
    async getVideoList(navId) {
        if (!navId) {//判断navId为空串的情况
            return;
        };
        let videoListData = await request('/video/group', {id:navId});
        //关闭加载提示框
        wx.hideLoading();
        let index = 0;
        let videoList = videoListData.datas;
        //添加Id属性
        videoList = videoList?videoList.map(item =>{
            item.id = index++;
            return item;
        }):'';
        // let videoList = videoListData.datas.map(item =>{
        //     item.id = index++;
        //     return item;
        // })
        this.setData({
            videoList,
            isTriggered: false//关闭下拉刷新
        })
    },
    //点击切换导航的回调
    changeNav(e) {
       let navId = e.currentTarget.id;
       this.setData({
        navId: navId >>> 0,
        videoList:[],
        videoId: ''//更新data中video标签的实例对象,播放对应视频
       })
       //显示正在加载
       wx.showLoading({
           title: '正在加载',
       });
       //动态获取当前导航对应的视频数据
       this.getVideoList(this.data.navId)
    },

    //点击播放/继续播放的回调
    handlePlay(e){
        let vid = e.currentTarget.id;
        //关闭上一个播放的不同的视频
        // this.vid !== vid && this.videoContext && this.videoContext.stop();
        // this.vid = vid;

        //更新data中video标签的实例对象,播放对应视频
        this.setData({
            videoId: vid
        })
        //创建控制video标签的对象
        this.videoContext = wx.createVideoContext(vid);
        //判断当前视频是否存在播放记录，并跳转指定进度
        let {videoUpdataTime} = this.data;
        let videoItem = videoUpdataTime.find(item => item.vid === vid);
        if (videoItem) {
            this.videoContext.seek(videoItem.currentTime);
        }
    },

    //监听视频播放进度的回调
    handleTimeUpdata(e) {
        let videoTimeObj = {vid: e.currentTarget.id,currentTime: e.detail.currentTime};
        let {videoUpdataTime} = this.data;
        let videoItem = videoUpdataTime.find(item => item.vid === videoTimeObj.vid)
        if (videoItem) {
            videoItem.currentTime = e.detail.currentTime;
        } else {
            videoUpdataTime.push(videoTimeObj);
        }
        this.setData({
            videoUpdataTime
        })
    },

    //视频播放结束回调,移除记录播放时长数组中当前视频对象
    handleEnded(e){
        let {videoUpdataTime} = this.data;
        let i = videoUpdataTime.findIndex(item => item.vid === e.currentTarget.id)
        console.log(i)
        videoUpdataTime.splice(i, 1);
        this.setData({
            videoUpdataTime
        })
    },

    //自定义下拉刷新的回调
    handleRefresher() {
        //再次发请求，获取最新视频列表数据
        this.getVideoList(this.data.navId);
    },

    //自定义上拉触底的回调
    handleTolower() {
        console.log('1')
        //数据分页 
        //模拟数据
        let newVideoList = [
            {
            "type":1,
            "displayed":false,
            "alg":"onlineHotGroup",
            "extAlg":null,
            "data":{
                "alg":"onlineHotGroup",
                "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                "height":720,
                "width":1280,
                "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                "commentCount":464,
                "shareCount":3888,
                "resolutions":[
                    {
                        "resolution":240,
                        "size":12845461
                    },
                    {
                        "resolution":480,
                        "size":20932528
                    },
                    {
                        "resolution":720,
                        "size":28666330
                    }
                ],
                "creator":{
                    "defaultAvatar":false,
                    "province":310000,
                    "authStatus":0,
                    "followed":false,
                    "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                    "accountStatus":0,
                    "gender":2,
                    "city":310101,
                    "birthday":-1572940800000,
                    "userId":267750119,
                    "userType":205,
                    "nickname":"再见_2小姐",
                    "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                    "description":"",
                    "detailDescription":"",
                    "avatarImgId":109951163095931490,
                    "backgroundImgId":109951165410099600,
                    "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                    "authority":0,
                    "mutual":false,
                    "expertTags":null,
                    "experts":{
                        "2":"资讯(生活)"
                    },
                    "djStatus":10,
                    "vipType":11,
                    "remarkName":null,
                    "avatarImgIdStr":"109951163095931493",
                    "backgroundImgIdStr":"109951165410099595"
                },
                "urlInfo":{
                    "id":"0AC38B9F31CD429DCA97773AF028227B",
                    "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                    "size":28666330,
                    "validityTime":1200,
                    "needPay":false,
                    "payInfo":null,
                    "r":720
                },
                "videoGroup":[
                    {
                        "id":58100,
                        "name":"现场",
                        "alg":null
                    },
                    {
                        "id":1100,
                        "name":"音乐现场",
                        "alg":null
                    },
                    {
                        "id":5100,
                        "name":"音乐",
                        "alg":null
                    }
                ],
                "previewUrl":null,
                "previewDurationms":0,
                "hasRelatedGameAd":false,
                "markTypes":null,
                "relateSong":[

                ],
                "relatedInfo":null,
                "videoUserLiveInfo":null,
                "vid":"0AC38B9F31CD429DCA97773AF028227B",
                "durationms":131806,
                "playTime":1962462,
                "praisedCount":17031,
                "praised":false,
                "subscribed":false
            }}, 
            {
                "type":1,
                "displayed":false,
                "alg":"onlineHotGroup",
                "extAlg":null,
                "data":{
                    "alg":"onlineHotGroup",
                    "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                    "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                    "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                    "height":720,
                    "width":1280,
                    "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                    "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                    "commentCount":464,
                    "shareCount":3888,
                    "resolutions":[
                        {
                            "resolution":240,
                            "size":12845461
                        },
                        {
                            "resolution":480,
                            "size":20932528
                        },
                        {
                            "resolution":720,
                            "size":28666330
                        }
                    ],
                    "creator":{
                        "defaultAvatar":false,
                        "province":310000,
                        "authStatus":0,
                        "followed":false,
                        "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                        "accountStatus":0,
                        "gender":2,
                        "city":310101,
                        "birthday":-1572940800000,
                        "userId":267750119,
                        "userType":205,
                        "nickname":"再见_2小姐",
                        "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                        "description":"",
                        "detailDescription":"",
                        "avatarImgId":109951163095931490,
                        "backgroundImgId":109951165410099600,
                        "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                        "authority":0,
                        "mutual":false,
                        "expertTags":null,
                        "experts":{
                            "2":"资讯(生活)"
                        },
                        "djStatus":10,
                        "vipType":11,
                        "remarkName":null,
                        "avatarImgIdStr":"109951163095931493",
                        "backgroundImgIdStr":"109951165410099595"
                    },
                    "urlInfo":{
                        "id":"0AC38B9F31CD429DCA97773AF028227B",
                        "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                        "size":28666330,
                        "validityTime":1200,
                        "needPay":false,
                        "payInfo":null,
                        "r":720
                    },
                    "videoGroup":[
                        {
                            "id":58100,
                            "name":"现场",
                            "alg":null
                        },
                        {
                            "id":1100,
                            "name":"音乐现场",
                            "alg":null
                        },
                        {
                            "id":5100,
                            "name":"音乐",
                            "alg":null
                        }
                    ],
                    "previewUrl":null,
                    "previewDurationms":0,
                    "hasRelatedGameAd":false,
                    "markTypes":null,
                    "relateSong":[
    
                    ],
                    "relatedInfo":null,
                    "videoUserLiveInfo":null,
                    "vid":"0AC38B9F31CD429DCA97773AF028227B",
                    "durationms":131806,
                    "playTime":1962462,
                    "praisedCount":17031,
                    "praised":false,
                    "subscribed":false
            }},
            {
                "type":1,
                "displayed":false,
                "alg":"onlineHotGroup",
                "extAlg":null,
                "data":{
                    "alg":"onlineHotGroup",
                    "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                    "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                    "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                    "height":720,
                    "width":1280,
                    "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                    "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                    "commentCount":464,
                    "shareCount":3888,
                    "resolutions":[
                        {
                            "resolution":240,
                            "size":12845461
                        },
                        {
                            "resolution":480,
                            "size":20932528
                        },
                        {
                            "resolution":720,
                            "size":28666330
                        }
                    ],
                    "creator":{
                        "defaultAvatar":false,
                        "province":310000,
                        "authStatus":0,
                        "followed":false,
                        "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                        "accountStatus":0,
                        "gender":2,
                        "city":310101,
                        "birthday":-1572940800000,
                        "userId":267750119,
                        "userType":205,
                        "nickname":"再见_2小姐",
                        "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                        "description":"",
                        "detailDescription":"",
                        "avatarImgId":109951163095931490,
                        "backgroundImgId":109951165410099600,
                        "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                        "authority":0,
                        "mutual":false,
                        "expertTags":null,
                        "experts":{
                            "2":"资讯(生活)"
                        },
                        "djStatus":10,
                        "vipType":11,
                        "remarkName":null,
                        "avatarImgIdStr":"109951163095931493",
                        "backgroundImgIdStr":"109951165410099595"
                    },
                    "urlInfo":{
                        "id":"0AC38B9F31CD429DCA97773AF028227B",
                        "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                        "size":28666330,
                        "validityTime":1200,
                        "needPay":false,
                        "payInfo":null,
                        "r":720
                    },
                    "videoGroup":[
                        {
                            "id":58100,
                            "name":"现场",
                            "alg":null
                        },
                        {
                            "id":1100,
                            "name":"音乐现场",
                            "alg":null
                        },
                        {
                            "id":5100,
                            "name":"音乐",
                            "alg":null
                        }
                    ],
                    "previewUrl":null,
                    "previewDurationms":0,
                    "hasRelatedGameAd":false,
                    "markTypes":null,
                    "relateSong":[
    
                    ],
                    "relatedInfo":null,
                    "videoUserLiveInfo":null,
                    "vid":"0AC38B9F31CD429DCA97773AF028227B",
                    "durationms":131806,
                    "playTime":1962462,
                    "praisedCount":17031,
                    "praised":false,
                    "subscribed":false
            }},
                    {
                        "type":1,
                        "displayed":false,
                        "alg":"onlineHotGroup",
                        "extAlg":null,
                        "data":{
                            "alg":"onlineHotGroup",
                            "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                            "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                            "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                            "height":720,
                            "width":1280,
                            "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                            "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                            "commentCount":464,
                            "shareCount":3888,
                            "resolutions":[
                                {
                                    "resolution":240,
                                    "size":12845461
                                },
                                {
                                    "resolution":480,
                                    "size":20932528
                                },
                                {
                                    "resolution":720,
                                    "size":28666330
                                }
                            ],
                            "creator":{
                                "defaultAvatar":false,
                                "province":310000,
                                "authStatus":0,
                                "followed":false,
                                "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                                "accountStatus":0,
                                "gender":2,
                                "city":310101,
                                "birthday":-1572940800000,
                                "userId":267750119,
                                "userType":205,
                                "nickname":"再见_2小姐",
                                "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                                "description":"",
                                "detailDescription":"",
                                "avatarImgId":109951163095931490,
                                "backgroundImgId":109951165410099600,
                                "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                                "authority":0,
                                "mutual":false,
                                "expertTags":null,
                                "experts":{
                                    "2":"资讯(生活)"
                                },
                                "djStatus":10,
                                "vipType":11,
                                "remarkName":null,
                                "avatarImgIdStr":"109951163095931493",
                                "backgroundImgIdStr":"109951165410099595"
                            },
                            "urlInfo":{
                                "id":"0AC38B9F31CD429DCA97773AF028227B",
                                "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                                "size":28666330,
                                "validityTime":1200,
                                "needPay":false,
                                "payInfo":null,
                                "r":720
                            },
                            "videoGroup":[
                                {
                                    "id":58100,
                                    "name":"现场",
                                    "alg":null
                                },
                                {
                                    "id":1100,
                                    "name":"音乐现场",
                                    "alg":null
                                },
                                {
                                    "id":5100,
                                    "name":"音乐",
                                    "alg":null
                                }
                            ],
                            "previewUrl":null,
                            "previewDurationms":0,
                            "hasRelatedGameAd":false,
                            "markTypes":null,
                            "relateSong":[
            
                            ],
                            "relatedInfo":null,
                            "videoUserLiveInfo":null,
                            "vid":"0AC38B9F31CD429DCA97773AF028227B",
                            "durationms":131806,
                            "playTime":1962462,
                            "praisedCount":17031,
                            "praised":false,
                            "subscribed":false
                        }},
                        {
                            "type":1,
                            "displayed":false,
                            "alg":"onlineHotGroup",
                            "extAlg":null,
                            "data":{
                                "alg":"onlineHotGroup",
                                "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                                "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                                "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                                "height":720,
                                "width":1280,
                                "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                                "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                                "commentCount":464,
                                "shareCount":3888,
                                "resolutions":[
                                    {
                                        "resolution":240,
                                        "size":12845461
                                    },
                                    {
                                        "resolution":480,
                                        "size":20932528
                                    },
                                    {
                                        "resolution":720,
                                        "size":28666330
                                    }
                                ],
                                "creator":{
                                    "defaultAvatar":false,
                                    "province":310000,
                                    "authStatus":0,
                                    "followed":false,
                                    "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                                    "accountStatus":0,
                                    "gender":2,
                                    "city":310101,
                                    "birthday":-1572940800000,
                                    "userId":267750119,
                                    "userType":205,
                                    "nickname":"再见_2小姐",
                                    "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                                    "description":"",
                                    "detailDescription":"",
                                    "avatarImgId":109951163095931490,
                                    "backgroundImgId":109951165410099600,
                                    "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                                    "authority":0,
                                    "mutual":false,
                                    "expertTags":null,
                                    "experts":{
                                        "2":"资讯(生活)"
                                    },
                                    "djStatus":10,
                                    "vipType":11,
                                    "remarkName":null,
                                    "avatarImgIdStr":"109951163095931493",
                                    "backgroundImgIdStr":"109951165410099595"
                                },
                                "urlInfo":{
                                    "id":"0AC38B9F31CD429DCA97773AF028227B",
                                    "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                                    "size":28666330,
                                    "validityTime":1200,
                                    "needPay":false,
                                    "payInfo":null,
                                    "r":720
                                },
                                "videoGroup":[
                                    {
                                        "id":58100,
                                        "name":"现场",
                                        "alg":null
                                    },
                                    {
                                        "id":1100,
                                        "name":"音乐现场",
                                        "alg":null
                                    },
                                    {
                                        "id":5100,
                                        "name":"音乐",
                                        "alg":null
                                    }
                                ],
                                "previewUrl":null,
                                "previewDurationms":0,
                                "hasRelatedGameAd":false,
                                "markTypes":null,
                                "relateSong":[
                
                                ],
                                "relatedInfo":null,
                                "videoUserLiveInfo":null,
                                "vid":"0AC38B9F31CD429DCA97773AF028227B",
                                "durationms":131806,
                                "playTime":1962462,
                                "praisedCount":17031,
                                "praised":false,
                                "subscribed":false
                            }},
                            {
                                "type":1,
                                "displayed":false,
                                "alg":"onlineHotGroup",
                                "extAlg":null,
                                "data":{
                                    "alg":"onlineHotGroup",
                                    "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                                    "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                                    "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                                    "height":720,
                                    "width":1280,
                                    "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                                    "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                                    "commentCount":464,
                                    "shareCount":3888,
                                    "resolutions":[
                                        {
                                            "resolution":240,
                                            "size":12845461
                                        },
                                        {
                                            "resolution":480,
                                            "size":20932528
                                        },
                                        {
                                            "resolution":720,
                                            "size":28666330
                                        }
                                    ],
                                    "creator":{
                                        "defaultAvatar":false,
                                        "province":310000,
                                        "authStatus":0,
                                        "followed":false,
                                        "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                                        "accountStatus":0,
                                        "gender":2,
                                        "city":310101,
                                        "birthday":-1572940800000,
                                        "userId":267750119,
                                        "userType":205,
                                        "nickname":"再见_2小姐",
                                        "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                                        "description":"",
                                        "detailDescription":"",
                                        "avatarImgId":109951163095931490,
                                        "backgroundImgId":109951165410099600,
                                        "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                                        "authority":0,
                                        "mutual":false,
                                        "expertTags":null,
                                        "experts":{
                                            "2":"资讯(生活)"
                                        },
                                        "djStatus":10,
                                        "vipType":11,
                                        "remarkName":null,
                                        "avatarImgIdStr":"109951163095931493",
                                        "backgroundImgIdStr":"109951165410099595"
                                    },
                                    "urlInfo":{
                                        "id":"0AC38B9F31CD429DCA97773AF028227B",
                                        "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                                        "size":28666330,
                                        "validityTime":1200,
                                        "needPay":false,
                                        "payInfo":null,
                                        "r":720
                                    },
                                    "videoGroup":[
                                        {
                                            "id":58100,
                                            "name":"现场",
                                            "alg":null
                                        },
                                        {
                                            "id":1100,
                                            "name":"音乐现场",
                                            "alg":null
                                        },
                                        {
                                            "id":5100,
                                            "name":"音乐",
                                            "alg":null
                                        }
                                    ],
                                    "previewUrl":null,
                                    "previewDurationms":0,
                                    "hasRelatedGameAd":false,
                                    "markTypes":null,
                                    "relateSong":[
                    
                                    ],
                                    "relatedInfo":null,
                                    "videoUserLiveInfo":null,
                                    "vid":"0AC38B9F31CD429DCA97773AF028227B",
                                    "durationms":131806,
                                    "playTime":1962462,
                                    "praisedCount":17031,
                                    "praised":false,
                                    "subscribed":false
                                }},
                                {
                                    "type":1,
                                    "displayed":false,
                                    "alg":"onlineHotGroup",
                                    "extAlg":null,
                                    "data":{
                                        "alg":"onlineHotGroup",
                                        "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                                        "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                                        "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                                        "height":720,
                                        "width":1280,
                                        "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                                        "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                                        "commentCount":464,
                                        "shareCount":3888,
                                        "resolutions":[
                                            {
                                                "resolution":240,
                                                "size":12845461
                                            },
                                            {
                                                "resolution":480,
                                                "size":20932528
                                            },
                                            {
                                                "resolution":720,
                                                "size":28666330
                                            }
                                        ],
                                        "creator":{
                                            "defaultAvatar":false,
                                            "province":310000,
                                            "authStatus":0,
                                            "followed":false,
                                            "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                                            "accountStatus":0,
                                            "gender":2,
                                            "city":310101,
                                            "birthday":-1572940800000,
                                            "userId":267750119,
                                            "userType":205,
                                            "nickname":"再见_2小姐",
                                            "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                                            "description":"",
                                            "detailDescription":"",
                                            "avatarImgId":109951163095931490,
                                            "backgroundImgId":109951165410099600,
                                            "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                                            "authority":0,
                                            "mutual":false,
                                            "expertTags":null,
                                            "experts":{
                                                "2":"资讯(生活)"
                                            },
                                            "djStatus":10,
                                            "vipType":11,
                                            "remarkName":null,
                                            "avatarImgIdStr":"109951163095931493",
                                            "backgroundImgIdStr":"109951165410099595"
                                        },
                                        "urlInfo":{
                                            "id":"0AC38B9F31CD429DCA97773AF028227B",
                                            "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                                            "size":28666330,
                                            "validityTime":1200,
                                            "needPay":false,
                                            "payInfo":null,
                                            "r":720
                                        },
                                        "videoGroup":[
                                            {
                                                "id":58100,
                                                "name":"现场",
                                                "alg":null
                                            },
                                            {
                                                "id":1100,
                                                "name":"音乐现场",
                                                "alg":null
                                            },
                                            {
                                                "id":5100,
                                                "name":"音乐",
                                                "alg":null
                                            }
                                        ],
                                        "previewUrl":null,
                                        "previewDurationms":0,
                                        "hasRelatedGameAd":false,
                                        "markTypes":null,
                                        "relateSong":[
                        
                                        ],
                                        "relatedInfo":null,
                                        "videoUserLiveInfo":null,
                                        "vid":"0AC38B9F31CD429DCA97773AF028227B",
                                        "durationms":131806,
                                        "playTime":1962462,
                                        "praisedCount":17031,
                                        "praised":false,
                                        "subscribed":false
                                    }},
                                    {
                                        "type":1,
                                        "displayed":false,
                                        "alg":"onlineHotGroup",
                                        "extAlg":null,
                                        "data":{
                                            "alg":"onlineHotGroup",
                                            "scm":"1.music-video-timeline.video_timeline.video.181017.-295043608",
                                            "threadId":"R_VI_62_0AC38B9F31CD429DCA97773AF028227B",
                                            "coverUrl":"https://p2.music.126.net/5JcR7ubyNm0tc9tTHGqXGQ==/109951164297206994.jpg",
                                            "height":720,
                                            "width":1280,
                                            "title":"我必须给你们安利他们唱到甜掉牙的《Lucky》",
                                            "description":"很抱歉，再次打CALL这个节目Begin Again3\n亨瑞和妹妹的声音真的真的 真的。。。好好听啊~~~~",
                                            "commentCount":464,
                                            "shareCount":3888,
                                            "resolutions":[
                                                {
                                                    "resolution":240,
                                                    "size":12845461
                                                },
                                                {
                                                    "resolution":480,
                                                    "size":20932528
                                                },
                                                {
                                                    "resolution":720,
                                                    "size":28666330
                                                }
                                            ],
                                            "creator":{
                                                "defaultAvatar":false,
                                                "province":310000,
                                                "authStatus":0,
                                                "followed":false,
                                                "avatarUrl":"http://p1.music.126.net/uyBbRfkEVCU6sc9gS77LTQ==/109951163095931493.jpg",
                                                "accountStatus":0,
                                                "gender":2,
                                                "city":310101,
                                                "birthday":-1572940800000,
                                                "userId":267750119,
                                                "userType":205,
                                                "nickname":"再见_2小姐",
                                                "signature":"听说喜欢吃甜食的双鱼都很善解人意",
                                                "description":"",
                                                "detailDescription":"",
                                                "avatarImgId":109951163095931490,
                                                "backgroundImgId":109951165410099600,
                                                "backgroundUrl":"http://p1.music.126.net/v6TEb3wmlf28sOwv8gPzEg==/109951165410099595.jpg",
                                                "authority":0,
                                                "mutual":false,
                                                "expertTags":null,
                                                "experts":{
                                                    "2":"资讯(生活)"
                                                },
                                                "djStatus":10,
                                                "vipType":11,
                                                "remarkName":null,
                                                "avatarImgIdStr":"109951163095931493",
                                                "backgroundImgIdStr":"109951165410099595"
                                            },
                                            "urlInfo":{
                                                "id":"0AC38B9F31CD429DCA97773AF028227B",
                                                "url":"http://vodkgeyttp9.vod.126.net/vodkgeyttp8/fyiTxn3k_2638558879_shd.mp4?ts=1646207892&rid=E771B74D0E0C06CE866ABD56053D56B2&rl=3&rs=DLmPtRDuGrCOyfXvUYHSIqOTozKvMMNu&sign=ca319a47d347e2902136ba43ac4d9d29&ext=Atpg0T6vCAbqmCYeSSx3r21l5JCWrc0EGdPYsfgbe5mgQTpG%2B3EkSheZJqWotJu4E%2BXZQtYrqUyGOvEZwSG2cH7dyJy2HmgQLwoWUjiysQmiCqQuMZHtWQzTM%2BrizZdtvpxSIpqepNEUDs85sUdhK8R3FNKL8wBWPPkcB2zOypGfU%2F76bY4baOeZ0YbUThdgbOpD8xLfCUX941VnlRR33FTrU2YDmjc9nc3IJ79NMJ93iSuxI1Jw0xRtkK9SwWkg",
                                                "size":28666330,
                                                "validityTime":1200,
                                                "needPay":false,
                                                "payInfo":null,
                                                "r":720
                                            },
                                            "videoGroup":[
                                                {
                                                    "id":58100,
                                                    "name":"现场",
                                                    "alg":null
                                                },
                                                {
                                                    "id":1100,
                                                    "name":"音乐现场",
                                                    "alg":null
                                                },
                                                {
                                                    "id":5100,
                                                    "name":"音乐",
                                                    "alg":null
                                                }
                                            ],
                                            "previewUrl":null,
                                            "previewDurationms":0,
                                            "hasRelatedGameAd":false,
                                            "markTypes":null,
                                            "relateSong":[
                            
                                            ],
                                            "relatedInfo":null,
                                            "videoUserLiveInfo":null,
                                            "vid":"0AC38B9F31CD429DCA97773AF028227B",
                                            "durationms":131806,
                                            "playTime":1962462,
                                            "praisedCount":17031,
                                            "praised":false,
                                            "subscribed":false
                                        }},
        ];
        let videoList = this.data.videoList;
        videoList.push(...newVideoList);
        this.setData({
            videoList
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
        if (e.from === 'button') {
            return {
                title: 'button此生也算共白头',
                page: '/pages/video/video',
                imageUrl: '/static/images/1.jpg'
            }
        }else {
            return {
                title: 'menu他朝若是同淋雪',
                page: '/pages/video/video',
                imageUrl: '/static/images/1.jpg'
            }
        }
    }
})