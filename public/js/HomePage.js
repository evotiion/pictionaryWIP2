var makesSessionID = (function() {
    //sessionStorage.setItem('createSession', false);
    return function() {
        if (!sessionStorage.getItem('sessionID')) {
            //sessionStorage.setItem('createSession', true);
            sessionStorage.setItem('sessionID', "id" + Math.random().toString(16).slice(2));
        }
    };
})();
makesSessionID();

function usernameUpdated() {
    console.log("usernameUpdated");
    sessionStorage.setItem('username', $("#username").val());
    console.log(sessionStorage.getItem('username'));
    console.log(sessionStorage.getItem('sessionID'));
}

$(document).ready(function () {
    console.log("hello world from HomePage.js");
    $("#username").val(sessionStorage.getItem('username'))
    console.log(sessionStorage.getItem('sessionID'));
});