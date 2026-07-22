// =================================
// task.js
// =================================



export function createTask(
list,
favId,
delay
){


return {


running:true,


list:list,


index:0,


total:list.length,


favId:favId,


delay:delay,


success:0,


skip:0,


fail:0


};



}
