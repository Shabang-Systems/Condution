// Chapter 0: Fire! Base!
var firebaseConfig = {
    apiKey: "AIzaSyDFv40o-MFNy4eVfQzLtPG-ATkBUOHPaSI",
    authDomain: "condution-7133f.firebaseapp.com",
    databaseURL: "https://condution-7133f.firebaseio.com",
    projectId: "condution-7133f",
    storageBucket: "condution-7133f.appspot.com",
    messagingSenderId: "544684450810",
    appId: "1:544684450810:web:9b1caf7ed9285890fa3a43"
};
firebase.initializeApp(firebaseConfig);

var auth = function(){
    firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
        // Handle Errors here.
        console.log("Silly goose");
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

$("#password").keydown(function(e) {
    if(e.keyCode == 13){
        auth();
    }
});

firebase.auth().onAuthStateChanged(user => {
    if(user) {
        window.location = 'app.html'; 
    } else {
        $("#authwall").fadeIn();
    }
});

