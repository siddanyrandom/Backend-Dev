function login() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("login");
      resolve();
    }, 2000);
  });
}

function userDetails() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("user details");
      resolve()
    }, 2000);
  });
}

function password() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("password");
      resolve();
    }, 2000);
  });
}

// callback promises
// login()
//   .then(() => {
//     return userDetails();
//   })
//   .then(() => {
//     return password();
//   })
//   .then(() => {
//     console.log("All task done");
//   })
//   .catch((error) => {
//     console.log(error);
//   });

async function run(){
    try{
        await login()
        await userDetails()
        await password()
    }
    catch(error){
        console.log(error)
    }
}
run();