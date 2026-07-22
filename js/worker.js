// =================================
// worker.js
// B站批量收藏助手 v1.0 修正版
// Manifest V3 Service Worker
// =================================


import API from "./api.js";


import {
    saveTask,
    loadTask,
    clearTask
}
from "./storage.js";


import {
    addLog,
    getLogs
}
from "./logger.js";



let stopped = false;

let running = false;





// ================================
// 消息入口
// ================================


chrome.runtime.onMessage.addListener(
    (msg, sender, sendResponse)=>{


        // 获取收藏夹

        if(msg.action === "getFavList"){


            API.getFavList()

            .then(data=>{


                sendResponse({

                    success:true,

                    data:data

                });


            })


            .catch(err=>{


                sendResponse({

                    success:false,

                    message:err.message

                });


            });



            return true;

        }





        // 开始任务

        if(msg.action === "startFav"){


            if(running){


                sendResponse({

                    success:false,

                    message:"已有任务运行"

                });


                return true;

            }




            let task={


                list:msg.list,


                index:0,


                total:msg.list.length,


                favId:msg.favId,


                delay:Number(msg.delay)||3,


                success:0,


                skip:0,


                fail:0


            };



            stopped=false;

            running=true;



            saveTask(task)

            .then(()=>{


                runTask(task);


                sendResponse({

                    success:true

                });


            });



            return true;

        }





        // 暂停


        if(msg.action==="pause"){



            stopped=true;



            sendResponse({

                success:true

            });


            return true;

        }





        // 恢复任务


        if(msg.action==="resume"){



            loadTask()

            .then(task=>{


                if(!task){


                    sendResponse({

                        success:false,

                        message:
                        "没有保存任务"

                    });


                    return;

                }



                stopped=false;

                running=true;



                runTask(task);



                sendResponse({

                    success:true

                });



            });



            return true;

        }







        // 清除任务


        if(msg.action==="clearTask"){



            clearTask()

            .then(()=>{


                sendResponse({

                    success:true

                });


            });



            return true;

        }







        // 导出日志


        if(msg.action==="exportLogs"){



            getLogs()

            .then(logs=>{


                let csv =
                "time,message\n";



                logs.forEach(item=>{


                    csv +=
                    `"${item.time}","${item.text}"\n`;


                });




                let blob =
                new Blob(

                    [csv],

                    {
                        type:
                        "text/csv"
                    }

                );



                let url =
                URL.createObjectURL(blob);




                chrome.downloads.download({

                    url:url,

                    filename:
                    "bili_fav_log.csv"


                });



                sendResponse({

                    success:true

                });



            });



            return true;

        }



    }

);







// ================================
// 执行任务
// ================================


async function runTask(task){



    for(
        let i=task.index;
        i<task.list.length;
        i++
    ){



        if(stopped){



            await saveTask(task);



            await sendLog(
                "任务暂停，进度已保存"
            );



            running=false;



            return;

        }




        let bv =
        task.list[i];



        try{



            await sendLog(
                "处理:"
                +
                bv
            );



            let info =
            await API.getVideoInfo(bv);



            let aid =
            info.aid;



            let exists =
            await API.checkFav(aid);





            if(exists){



                task.skip++;



                await sendLog(
                    bv+
                    " 已收藏，跳过"
                );



            }

            else{



                let result =
                await retry(

                    ()=>API.addFav(
                        aid,
                        task.favId
                    )

                );




                if(result.code===0){



                    task.success++;



                    await sendLog(
                        bv+
                        " 收藏成功"
                    );



                }

                else{



                    task.fail++;



                    await sendLog(
                        bv+
                        " 收藏失败:"
                        +
                        result.message
                    );


                }


            }




        }

        catch(e){



            task.fail++;



            await sendLog(

                bv+
                " 异常:"
                +
                e.message

            );


        }






        task.index=i+1;



        await saveTask(task);





        chrome.runtime.sendMessage({

            type:"progress",


            current:
            task.index,


            total:
            task.total,


            success:
            task.success,


            skip:
            task.skip,


            fail:
            task.fail


        });






        await sleep(
            randomDelay(task.delay)
        );



    }





    await clearTask();



    running=false;



    chrome.runtime.sendMessage({

        type:"finish"

    });



    await sendLog(
        "全部任务完成"
    );


}








// ================================
// 重试
// ================================


async function retry(
    fn,
    times=3
){


    for(
        let i=0;
        i<times;
        i++
    ){


        try{


            return await fn();


        }

        catch(e){



            if(i===times-1){

                throw e;

            }



            await sleep(3000);


        }


    }


}







// ================================
// 延迟
// ================================


function randomDelay(base){


    let min =
    base*1000;


    let max =
    (base+3)*1000;



    return Math.floor(

        Math.random()
        *
        (max-min)
        +
        min

    );


}





function sleep(ms){


    return new Promise(
        resolve=>
        setTimeout(resolve,ms)
    );


}







async function sendLog(text){


    await addLog(text);



    chrome.runtime.sendMessage({

        type:"log",

        message:text

    });


}
