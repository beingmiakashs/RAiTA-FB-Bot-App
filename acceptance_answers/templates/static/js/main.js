/**
 * Created by fsociety on 8/12/17.
 */
var base_url = "http://localhost/";
$(function(){
// Initialize library
    SE.init({
        // Parameters obtained by registering an app, these are specific to the SE
        //   documentation site
        clientId: 10570,
        key: '5KWjCKT2zt6p7fnUvEz48Q((',
        // Used for cross domain communication, it will be validated
        channelUrl: "http://localhost/",
        // Called when all initialization is finished
        complete: function(data) {
            $('#login-button')
                .removeAttr('disabled')
                .text('Login With Stackoverflow Account');
        }
    });

    //User Authorized with account id = 5901872, got access token = yQkVhttGyfgfABYesaSqdg))

    // Attach click handler to login button
    $('#login-button').click(function() {

        // Make the authentication call, note that being in an onclick handler
        //   is important; most browsers will hide windows opened without a
        //   'click blessing'
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        console.log("Token:"+csrftoken);
        SE.authenticate({
            success: function(data) {

                function csrfSafeMethod(method) {
                    // these HTTP methods do not require CSRF protection
                    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
                }
                $.ajaxSetup({
                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                        }
                    }
                });

                $.ajax({
                    url: base_url+'session-create',
                    type: 'post',
                    data: {userId: data.networkUsers[0].account_id, token: data.accessToken, key: '5KWjCKT2zt6p7fnUvEz48Q(('},
                    success: function(feedback){
                        console.log(feedback);
                        location.reload();
                    }
                });
                /*alert(
                    'User Authorized with account id = ' +
                    data.networkUsers[0].account_id + ', got access token = ' +
                    data.accessToken
                );*/
            },
            error: function(data) {
                console.log(data);
                alert('An error occurred:\n' + data.errorName + '\n' + data.errorMessage);
            },
            networkUsers: true
        });
    });
});
