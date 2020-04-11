// Chapter 0: Fire! Base!
const firebaseConfig = {
    apiKey: "AIzaSyDFv40o-MFNy4eVfQzLtPG-ATkBUOHPaSI",
    authDomain: "condution-7133f.firebaseapp.com",
    databaseURL: "https://condution-7133f.firebaseio.com",
    projectId: "condution-7133f",
    storageBucket: "condution-7133f.appspot.com",
    messagingSenderId: "544684450810",
    appId: "1:544684450810:web:9b1caf7ed9285890fa3a43"
};
firebase.initializeApp(firebaseConfig);

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

var greetings = ["Hello there!", "Hey!", "G'day!", "What's up!", "Howdy!", "Yo!"];
$("#greeting-auth").html(greetings[Math.floor(Math.random() * greetings.length)]);

