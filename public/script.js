const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");
const myvideo= document.createElement("video")
myvideo.muted=true
let mystream;
navigator.mediaDevices.getUserMedia({
    audio:true,
    video:true
})
.then((stream)=>{
    mystream=stream
    addVideoStream(myvideo,stream)
    socket.on("user-connected",(userId)=>{
        connectToNewServer(userId,stream)
    })
    peer.on("call",(call)=>{
        call.answer(stream)
        const video=document.createElement("video")
        call.on("stream",(userVideoStream)=>{
        addVideoStream(video,userVideoStream)
    })
    })
})
function addVideoStream  (video,stream){
    video.srcObject=stream
    video.addEventListener("loadedmetadata",()=>{
        video.play()
        $("#video_grid").append(video)
    })
}
function connectToNewServer(userId,stream){
    const call=peer.call(userId,stream)
    const video=document.createElement("video")
    call.on("stream",(userVideoStream)=>{
        addVideoStream(video,userVideoStream)
    })
}
$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })
    $("#mute_button").click(function(){
        const enabled=mystream.getAudioTracks()[0].enabled
        if (enabled){
            mystream.getAudioTracks()[0].enabled=false
            html=`<i class="fas fa-microphone-slash"><i/>`
            $("#mute_button").toggleClass("redBg")
            $("#mute_button").html(html)
        }
        else{
            mystream.getAudioTracks()[0].enabled=true
            html=`<i class="fas fa-microphone"><i/>`
            $("#mute_button").toggleClass("redBg")
            $("#mute_button").html(html)
        }
    })
    $("stop_video").click(function(){
        const enabled=mystream.getVideoTracks()[0].enabled
        if (enabled){
            mystream.getVideoTracks()[0].enabled=false
            html=`<i class="fas fa-video-camera-slash"><i/>`
            $("#stop_video").toggleClass("redBg")
            $("#stop_video").html(html)
        }
        else{
            mystream.getVideoTracks()[0].enabled=true
            html=`<i class="fas fa-video-camera"><i/>`
            $("#stop_video").toggleClass("redBg")
            $("#stop_video").html(html)
        }
    })

})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});