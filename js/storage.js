// =================================
// storage.js
// =================================



export async function saveTask(task){


    await chrome.storage.local.set({

        biliTask:task

    });


}





export async function loadTask(){


    let result =
    await chrome.storage.local.get(
        "biliTask"
    );


    return result.biliTask || null;


}





export async function clearTask(){


    await chrome.storage.local.remove(
        "biliTask"
    );


}
