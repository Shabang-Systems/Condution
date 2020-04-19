// Chapter 0: Fire! Base!
const obj = require("./secrets")


// Initialize Firebase Application
// TODO TODO TODO !!!! Change this on deploy
firebase.initializeApp(obj.dbkeys.deploy);


let auth = function() {
    firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
        // Handle Errors here.
        console.log("Silly goose");
        const errorCode = error.code;
        const errorMessage = error.message;
        $(".auth-upf").addClass("wrong");
    });
};

$("#password").keydown(function(e) {
    if (e.keyCode == 13) {
        auth();
    }
});

$("#login").click(function(e) {
    auth();
});

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        if (user.emailVerified){
            window.location = 'app.html'; 
        } else {
            user.sendEmailVerification();
            $('#need-verify').fadeIn();
        }
    } else {
        $("#authwall").fadeIn();
    }
});

const greetings = ["Hello there!", "Hey!", "G'day!", "What's up!", "Howdy!", "Yo!"];
$("#greeting-auth").html(greetings[Math.floor(Math.random() * greetings.length)]);
