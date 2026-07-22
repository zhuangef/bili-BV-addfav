// =================================
// api.js
// B站接口模块
// =================================


const API = {


// 获取视频信息

async getVideoInfo(bv){


    let res =
    await fetch(

        `https://api.bilibili.com/x/web-interface/view?bvid=${bv}`,

        {
            credentials:"include"
        }

    );


    let json =
    await res.json();



    if(json.code!==0){

        throw new Error(
            json.message
        );

    }


    return json.data;

},





// 获取收藏夹

async getFavList(){


    // 获取当前登录用户信息

    let userRes =
    await fetch(
        "https://api.bilibili.com/x/web-interface/nav",
        {
            credentials:"include"
        }
    );


    let userJson =
    await userRes.json();



    if(userJson.code !== 0){

        throw new Error(
            "登录状态异常:"
            +
            userJson.message
        );

    }



    let mid =
    userJson.data.mid;



    console.log(
        "当前用户mid:",
        mid
    );




    let res =
    await fetch(

        `https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${mid}&web_location=333.1387`,

        {

            credentials:"include",

            headers:{

                "Referer":
                `https://space.bilibili.com/${mid}/`

            }

        }

    );




    let json =
    await res.json();



    console.log(
        "收藏夹接口返回:",
        json
    );




    if(json.code !== 0){


        throw new Error(

            "收藏夹接口错误:"
            +
            json.code
            +
            " "
            +
            json.message

        );


    }




    return json.data.list.map(item=>({


        id:item.id,


        title:item.title


    }));


},





// 获取 csrf

async getCsrf(){



    let cookies =
    await chrome.cookies.getAll({

        domain:".bilibili.com"

    });



    let cookie =
    cookies
    .map(
        c=>`${c.name}=${c.value}`
    )
    .join(";");



    let match =
    cookie.match(
        /bili_jct=([^;]+)/
    );



    if(!match){


        throw new Error(
            "未找到 bili_jct"
        );


    }



    return match[1];

},







// 检查收藏状态

async checkFav(aid){



    let res =
    await fetch(

        `https://api.bilibili.com/x/v3/fav/resource/ids?rid=${aid}&type=2`,

        {
            credentials:"include"
        }

    );


    let json =
    await res.json();



    if(json.code!==0){

        return false;

    }



    return json.data.includes(1);


},







// 收藏视频

async addFav(aid,favId){



    let csrf =
    await this.getCsrf();



    let body =
    new URLSearchParams();



    body.append(
        "rid",
        aid
    );


    body.append(
        "type",
        "2"
    );


    body.append(
        "add_media_ids",
        favId
    );


    body.append(
        "csrf",
        csrf
    );



    let res =
    await fetch(

        "https://api.bilibili.com/x/v3/fav/resource/deal",

        {

            method:"POST",

            credentials:"include",

            headers:{

                "Content-Type":
                "application/x-www-form-urlencoded"

            },


            body

        }

    );



    return await res.json();


}



};


export default API;
