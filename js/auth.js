// Chapter 0: Fire! Base!
const { ipcRenderer } = require('electron');

(function() {
    if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
    currentTheme = "condutiontheme-default-dark";
    $("body").removeClass();
    $("body").addClass(currentTheme);
    $("#loading").hide().css("display", "flex").fadeIn();
}
else {
    currentTheme = "condutiontheme-default-light";
    $("body").removeClass();
    $("body").addClass(currentTheme);
    $("#loading").hide().css("display", "flex").fadeIn();
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
    lottie.loadAnimation({
        container: $("#loading-anim")[0],
        renderer: 'svg',
        autoplay: true,
        loop: true,
        path: 'static/loadanim_final.json'
    })
    $("#loading").hide().css("display", "flex").fadeIn();
    // Initialize Firebase Application
    // TODO TODO TODO !!!! Change this on deploy
    const obj = require("./backend/secrets")
    firebase.initializeApp(obj.dbkeys.debug);

    let isNA = false;
    let isNASuccess = false;

    let auth = function() {
        if (isNASuccess) {
            var user = firebase.auth().currentUser;
            user.updateProfile({displayName: $("#name").val()});
            // TODO: other wonderful onboarding things
            window.location = 'app.html'; 
            isNASuccess = false;
        }
        firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
            // Handle Errors here.
            console.log("Silly goose");
            const errorCode = error.code;
            const errorMessage = error.message;
            $(".auth-upf").addClass("wrong");
        });
    };

    let nu = function() {
        firebase.auth().createUserWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
            console.log("Silly goose");
        });
        $('#need-verify').fadeIn();
        isNA = false;
        isNASuccess = true;
    }

    $("#password").keydown(function(e) {
        if (e.keyCode == 13) {
            if (isNA) {
                nu();
            } else {
                auth();
            }
        }
    });

    $("#login").click(function(e) {
        if (isNA) {
            nu();
        } else {
            auth();
        }
    });

    $("#newuser").click(function(e) {
        if (isNA) {
            $("#name-tray").slideUp(300);
            $(this).html("Make an account.");
            $("#greeting-auth-normal").html("Let's authenticate. Otherwise this may not be useful...");
            isNA = false;
        } else {
            $("#name-tray").slideDown(300);
            $(this).html("Sign in.");
            isNA = true;
            $("#greeting-auth-normal").html(`Welcome aboard! It is possible that we will loose your data...`);
        }
    });

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            if (user.emailVerified){
                window.location = 'app.html'; 
            } else {
                user.sendEmailVerification();
                $('#auth-left-menu').fadeIn();
                $('#need-verify').fadeIn();
                $("#loading").fadeOut();
                $("#authwall").fadeIn();
            }
        } else {
            $("#loading").fadeOut();
            $("#authwall").fadeIn();
            $('#auth-left-menu').fadeIn();
        }
    });

    const greetings = ["Hello there!", "Hey!", "G'day!", "What's up!", "Howdy!", "Yo!"];
    $("#greeting-auth").html(greetings[Math.floor(Math.random() * greetings.length)]);

})();
