const greet = () =>{
    console.log("Morning");
}

function fun(cb){
    console.log("This is a fun function");
    cb()
}

fun(greet);
