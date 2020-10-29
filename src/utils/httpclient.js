//给你作为参考，这是最简单的axios的二次封装，也有其他的封装，但是统一思想就是用promise作为异步请求的回调处理，
//你老师应该也会讲什么interceptors.request.use(发起请求前做出来)这种的，也可以按你老师的来
//我提供的是我在qf的时候，老师教的封装思想，下面是最简单的例子,作为参考



// 先给你怎么使用
//  import http from '../../utils/httpclient.js' 引入文件
//  http.post('addToShopcart',{product_id: this.currentObj['_id'], qty: this.qty}).then((res) => {
//      if(res.status){ // 如果状态正常就嘿嘿嘿
//          ............                    
//       }
//  })

// ===========================================上面是瞎扯的，下面就是内容了，文件名字先叫httpclient.js吧  ===========================================================================
// ================================================================  华丽分割线  ===========================================================================

// 引入axios
import axios from 'axios'
// 引入路由
import router from '../router/router'

// 设置默认的后端访问地址，根据你项目的地址来设置，也可以是拉出来变成单独的配置文件
const baseUrl = 'http://192.168.0.103:66/'

// 地址过滤器，访问baseUrl时做处理，访问其他后端地址时不做处理
let filterUrl = (_url) => {
    if (_url && _url.startsWith('http')) {
        return _url;
    }
    return baseUrl + _url;
}
// 暴露方法
export default {
    // get请求
    get(_url, _params = {}) {   // _url访问的地址  _params需要带的参数，是一个对象哦
        // 因为是异步加载，所以用promise来做
        return new Promise((resolve, reject) => {

            axios({
                url: filterUrl(_url), // 地址
                params: _params,  //参数
                method: 'get', // 请求方式
                headers: {
                    'auth': window.localStorage.getItem('access_token')   // 后端可能需要校验的参数，例如这个用户有没有登录
                },
            }).then((res) => {
                // 返回的结果
                if (!res.data.status && res.data.message == 'unauth') {
                    // 跟后端来协商，发现没有登录或者登录超时就跳转到登录页面
                    router.push({ name: 'login' });
                } else {
                  // 正常就返回来结果
                    resolve(res.data);
                }
            }).catch((error) => {
                // 统一处理异常
                reject(error);
            })
        })
    },
    post(_url, _params = {}) { // _url访问的地址  _params需要带的参数，是一个对象哦
        return new Promise((resolve, reject) => {
            axios({
                url: filterUrl(_url), //地址
                method: 'post', //请求方式
                data: _params, // 参数
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', //传参的格式
                    'auth': window.localStorage.getItem('access_token')  // 后端可能需要校验的参数，例如这个用户有没有登录，auth可变
                },
                transformRequest: [function (data) {
                    // 这里可以在发送请求之前对请求数据做处理，比如form-data格式化等
                    let ret = ''
                    for (let it in data) {
                        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                    }
                    return ret
                }],
            }).then(res => {
                if (!res.data.status && res.data.message == "unauth") { // 跟后端来协商，发现没有登录或者登录超时就跳转到登录页面
                    router.push({ name: 'login' });
                    return false;
                }
              // 返回结果
                resolve(res.data);
            }).catch(error => {
              // 处理错误
                reject(error)
            })
        })
    }
}
