if(localStorage.getItem("amntOfBootModules") == null){
    localStorage.setItem("amntOfBootModules", "0");
}

for (i=1;i<parseInt(localStorage.getItem("amntOfBootModules")) + 1;i++){
    console.log(i);
    eval(localStorage.getItem(i));
}

function newBootModule(code){
    let slot = parseInt(localStorage.getItem("amntOfBootModules")) + 1;
    localStorage.setItem(slot, code);
    localStorage.setItem("amntOfBootModules", slot);
}
