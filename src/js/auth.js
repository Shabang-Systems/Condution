// Chapter 0: Fire! Base!
const { ipcRenderer } = require('electron');

(function() {
    if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
    currentTheme = "condutiontheme-default-dark";
    $("body").removeClass();
    $("body").addClass(currentTheme);
    //$("#loading").hide().css("display", "flex").fadeIn();
}
else {
    currentTheme = "condutiontheme-default-light";
    $("body").removeClass();
    $("body").addClass(currentTheme);
    //$("#loading").hide().css("display", "flex").fadeIn();
}

ipcRenderer.on("systheme-dark", function (event, data) {
    currentTheme = "condutiontheme-default-dark";
    $("body").removeClass();
    $("body").addClass(currentTheme);
});

ipcRenderer.on("systheme-light", function (event, data) {
    currentTheme = "condutiontheme-default-light";
    $("body").removeClass();
    $("body").addClass(currentTheme);
});
    let mode = "login";
    /*lottie.loadAnimation({*/
        //container: $("#loading-anim")[0],
        //renderer: 'svg',
        //autoplay: true,
        //loop: true,
        //path: 'static/loadanim_final.json'
    //})
    /*$("#loading").hide().css("display", "flex").fadeIn();*/
    // Initialize Firebase Application
    // TODO TODO TODO !!!! Change this on deploy
    const obj = require("./backend/secrets")
    firebase.initializeApp(obj.dbkeys.debug);

    let isNASuccess = false;

    let auth = function() {
        if (isNASuccess) {
            var user = firebase.auth().currentUser;
            user.updateProfile({displayName: $("#name").val()});
            // TODO: other wonderful onboarding things
            window.location = 'index.html'; 
            isNASuccess = false;
        }
        firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).then(function() {
            if (firebase.auth().currentUser.emailVerified){
                window.location = 'index.html'; 
            } else {
                firebase.auth().currentUser.sendEmailVerification();
                $('#auth-left-menu').fadeIn();
                $('#need-verify').fadeIn();
                $('#recover-password').fadeOut();
                //$("#loading").fadeOut();
                $("#authwall").fadeIn();
            }
        }).catch(function(error) {
            // Handle Errors here.
            console.log(error);
            console.log("Silly goose");
            const errorCode = error.code;
            const errorMessage = error.message;
            $(".auth-upf").addClass("wrong");
        });
    };

    let rec = function() {
        firebase.auth().sendPasswordResetEmail($("#email").val()).then(function() {
            $(".auth-upf").removeClass("wrong");
            $("#password").show();
            $("#newuser").html("Make an account.");
            $("#newuser").show();
            $("#recover-password").html("Recover Password");
            $("#greeting-auth-normal").html("Let's authenticate. Otherwise this may not be useful...");
            $('#recover-password').fadeOut();
            $('#need-verify').fadeIn();
        }).catch(function(error) {
            $(".auth-upf").addClass("wrong");
        });
    }

    let nu = function() {
        firebase.auth().createUserWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
            console.log("Silly goose");
        });
        $('#need-verify').fadeIn();
        $('#recover-password').fadeOut();
        isNASuccess = true;
    }

    $("#password").keydown(function(e) {
        if (e.keyCode == 13) {
            switch (mode) {
                case "login":
                    auth();
                    break;
                case "newuser":
                    nu();
                    break;
            }
        }
    });

    $("#login").click(function(e) {
        switch (mode) {
            case "login":
                auth();
                break;
            case "newuser":
                nu();
                break;
            case "recover":
                rec();
                break;
        }
    });

    $("#recover-password").click(function(e) {
        switch (mode) {
            case "login":
                $("#password").hide();
                $("#recover-password").html("Remembered? Login");
                $("#newuser").hide();
                $("#greeting-auth-normal").html("No worries! Let's recover your password.");
                mode = "recover";
                break;
            case "newuser":
                $("#name-tray").hide();
                $("#password").hide();
                $("#recover-password").html("Remembered? Login");
                $("#newuser").hide();
                $("#greeting-auth-normal").html("No worries! Let's recover your password.");
                mode = "recover";
                break;
            case "recover":
                $("#password").show();
                $("#newuser").html("Make an account.");
                $("#newuser").show();
                $("#recover-password").html("Recover Password");
                $("#greeting-auth-normal").html("Let's authenticate. Otherwise this may not be useful...");
                mode = "login";
        }
    });

    $("#newuser").click(function(e) {
        switch (mode) {
            case "login":
                $("#name-tray").slideDown(300);
                $(this).html("Sign in.");
                mode = "newuser";
                $("#greeting-auth-normal").html(`Welcome aboard! It is possible that we will loose your data...`);
                break;
            case "newuser":
                $("#name-tray").slideUp(300);
                $(this).html("Make an account.");
                $("#greeting-auth-normal").html("Let's authenticate. Otherwise this may not be useful...");
                mode = "login";
                break;
        }
    });

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            if (user.emailVerified){
                window.location = 'index.html'; 
            } else {
                user.sendEmailVerification();
                $('#auth-left-menu').fadeIn();
                $('#need-verify').fadeIn();
                $('#recover-password').fadeOut();
                //$("#loading").fadeOut();
                $("#authwall").fadeIn();
            }
        } else {
            //$("#loading").fadeOut();
            $("#authwall").fadeIn();
            $('#auth-left-menu').fadeIn();
        }
    });

    const greetings = ["Hello there!", "Hey!", "G'day!", "What's up!", "Howdy!", "Yo!"];
    $("#greeting-auth").html(greetings[Math.floor(Math.random() * greetings.length)]);

})();
console.log('%cSTOP! ', 'background: #fff0f0; color: #434d5f; font-size: 80px');
console.log('%cClose this panel now.', 'background: #fff0f0;color: red; font-size: 50px');
console.log('%c19/10 change you are either terribly smart person and should work with us (hliu@shabang.cf) or are being taken advantanged of by a very terrible person. ', 'background: #fff0f0; color: #434d5f; font-size: 20px');
console.log('%cPlease help us to help you... Don\'t self XSS yourself.', 'background: #fff0f0; color: #434d5f; font-size: 15px');

