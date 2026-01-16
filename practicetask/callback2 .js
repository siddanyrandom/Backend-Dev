console.log("First")

function login(cb){
    setTimeout(() =>{
        console.log("login")
        cb()
    },2000)
}

function userDetails(cb){
    setTimeout(() =>{
        console.log("user details")
        cb()
    },1000)
}

function password(){ // never pass arguments in last function 
    setTimeout(() =>{
        console.log("password")
    },3000)
}

// callback hell
login(() => {
    userDetails(() =>{
        password()
    })
})
console.log("end")