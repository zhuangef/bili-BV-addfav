// =================================
// logger.js
// =================================



export async function addLog(text){



let data =
await chrome.storage.local.get(
"logs"
);



let logs =
data.logs || [];



logs.push({

time:
new Date()
.toLocaleString(),

text:text

});



if(logs.length>5000){

logs =
logs.slice(-5000);

}



await chrome.storage.local.set({

logs

});



}





export async function getLogs(){



let data =
await chrome.storage.local.get(
"logs"
);



return data.logs || [];

}





export async function clearLogs(){


await chrome.storage.local.remove(
"logs"
);


}
