// =====================================
// B站批量收藏助手 v1.0
// popup.js
// =====================================


let running = false;


// DOM

const fileInput =
document.getElementById("fileInput");

const dropZone =
document.getElementById("dropZone");

const bvListBox =
document.getElementById("bvList");


const favList =
document.getElementById("favList");


const delayInput =
document.getElementById("delay");


const startBtn =
document.getElementById("start");


const resumeBtn =
document.getElementById("resume");


const pauseBtn =
document.getElementById("pause");


const clearBtn =
document.getElementById("clear");


const exportBtn =
document.getElementById("export");


const themeBtn =
document.getElementById("theme");


const refreshBtn =
document.getElementById("refreshFav");


const statusBox =
document.getElementById("status");


const countBox =
document.getElementById("count");


const progressBar =
document.getElementById("progressBar");


const logBox =
document.getElementById("log");





// ===============================
// 日志
// ===============================


function log(text){


    logBox.value +=
    `[${new Date().toLocaleTimeString()}] ${text}\n`;


    logBox.scrollTop =
    logBox.scrollHeight;


}





// ===============================
// 导入文件
// ===============================


async function readFile(file){


    let text =
    await file.text();


    bvListBox.value =
    text;


    log(
    "导入文件:"
    +file.name
    );


}



fileInput.onchange =
async e=>{


    if(e.target.files[0]){

        await readFile(
            e.target.files[0]
        );

    }


};





// ===============================
// 拖拽
// ===============================


dropZone.ondragover =
e=>{


    e.preventDefault();


};



dropZone.ondrop =
async e=>{


    e.preventDefault();


    let file =
    e.dataTransfer.files[0];


    if(file){

        await readFile(file);

    }


};






// ===============================
// 获取收藏夹
// ===============================


async function loadFav(){


    favList.innerHTML =
    "<option>加载中...</option>";



    chrome.runtime.sendMessage(

    {

        action:"getFavList"

    },


    res=>{


        favList.innerHTML="";



        if(!res || !res.success){


            favList.innerHTML =
            "<option>获取失败</option>";


            log(
            "收藏夹获取失败"
            );


            return;

        }




        res.data.forEach(item=>{


            let option =
            document.createElement(
            "option"
            );


            option.value =
            item.id;


            option.textContent =
            item.title;


            favList.appendChild(
            option
            );


        });



        log(
        "收藏夹加载完成:"
        +
        res.data.length
        );


    });


}



refreshBtn.onclick =
loadFav;



loadFav();






// ===============================
// BV解析
// ===============================


function parseBV(text){


    let result=[];



    text
    .split(/\r?\n/)
    .forEach(line=>{


        let match =
        line.match(
        /BV[a-zA-Z0-9]+/
        );



        if(match){

            result.push(
            match[0]
            );

        }


    });



    return [
        ...new Set(result)
    ];


}






// ===============================
// 开始任务
// ===============================


startBtn.onclick =
()=>{


    if(running){

        return;

    }


    let list =
    parseBV(
        bvListBox.value
    );



    if(list.length===0){


        alert(
        "没有有效BV号"
        );


        return;

    }




    if(list.length>5000){


        alert(
        "单次最多5000个视频"
        );


        return;

    }



    let favId =
    favList.value;



    let delay =
    Number(
        delayInput.value
    );



    if(!favId){


        alert(
        "请选择收藏夹"
        );


        return;

    }




    running=true;



    chrome.runtime.sendMessage({

        action:"startFav",

        list:list,

        favId:favId,

        delay:delay


    });



    log(
    "任务开始，共:"
    +
    list.length
    );


};







// ===============================
// 恢复任务
// ===============================


resumeBtn.onclick =
()=>{


    chrome.runtime.sendMessage({

        action:"resume"

    });



    log(
    "请求恢复任务"
    );


};






// ===============================
// 暂停
// ===============================


pauseBtn.onclick =
()=>{


    chrome.runtime.sendMessage({

        action:"pause"

    });



    running=false;


    log(
    "暂停请求发送"
    );


};







// ===============================
// 清空任务
// ===============================


clearBtn.onclick =
()=>{


    if(
    confirm(
    "确定清空任务?"
    )
    ){


        chrome.runtime.sendMessage({

            action:"clearTask"

        });



        log(
        "任务已清空"
        );


    }


};






// ===============================
// 导出日志
// ===============================


exportBtn.onclick =
()=>{


    chrome.runtime.sendMessage({

        action:"exportLogs"

    });


};






// ===============================
// 深色模式
// ===============================


themeBtn.onclick =
()=>{


    document.body
    .classList
    .toggle("dark");


};







// ===============================
// 接收后台消息
// ===============================


chrome.runtime.onMessage.addListener(
msg=>{


    if(msg.type==="log"){


        log(
        msg.message
        );


    }




    if(msg.type==="progress"){



        statusBox.innerText =
        `${msg.current}/${msg.total}`;



        countBox.innerText =

        `
成功:${msg.success}

跳过:${msg.skip}

失败:${msg.fail}
`;



        progressBar.style.width =

        (
        msg.current /
        msg.total *
        100
        )
        +
        "%";


    }





    if(msg.type==="finish"){



        running=false;


        statusBox.innerText =
        "任务完成";


        log(
        "全部完成"
        );


    }



});
