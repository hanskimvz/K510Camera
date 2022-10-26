
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<body>
<form>
<!-- 서버로 메시지를 보낼 텍스트 박스 -->
<input id="textMessage" type="text" value="live">
<!-- 전송 버튼 -->
<input onclick="sendMessage()" value="Send" type="button">
<!-- 접속 종료 버튼 -->
<input onclick="disconnect()" value="Disconnect" type="button">
</form>
<br />
<!-- 출력 area -->
<textarea id="messageTextArea" rows="10" cols="50"></textarea>
<canvas id="canvas" class="card-img-top" ></canvas>

<script type="text/javascript">
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var imageData = context.createImageData(720, 360);

var webSocket = new WebSocket("ws://192.168.1.209:1234");


var messageTextArea = document.getElementById("messageTextArea");
var img = document.getElementById("img");
    
webSocket.onopen = function(message){
    messageTextArea.value += "Server connect...\n";
};

// 소켓 접속이 끝나면 호출되는 함수
webSocket.onclose = function(message){
    messageTextArea.value += "Server Disconnect...\n";
};


// 소켓 통신 중에 에러가 발생되면 호출되는 함수
webSocket.onerror = function(message){
    messageTextArea.value += "error...\n";
};

// 소켓 서버로 부터 메시지가 오면 호출되는 함수.
webSocket.onmessage = function(message){
    // 출력 area에 메시지를 표시한다.
    console.log(message);
    if (message.data instanceof Blob) {
        
        // var file = message.dataTransfer.files[0];
        reader = new FileReader();
        // reader.readAsArrayBuffer(message.data);
        reader.readAsText(message.data);

        reader.onload = () => {
            imageData.putImageData(reader.result,0,0);
            // x = context.putImageData(reader.result,0,0);
            // console.log(x);
            console.log("Result: " + reader.result);
        };
        
        // console.log(reader);
        // img.src = reader;
    }
    else {
        messageTextArea.value += "Recieve From Server => "+message.data+"\n";
    }

};

// 서버로 메시지를 전송하는 함수
function sendMessage(msg){
    var message = document.getElementById("textMessage");
    messageTextArea.value += "Send to Server => "+message.value+"\n";
    //웹소켓으로 textMessage객체의 값을 보낸다.
    webSocket.send(message.value);
    //textMessage객체의 값 초기화
    // message.value = "";
    if (msg) {
        webSocket.send(msg);
    }
}

// sendMessage("hello");

function disconnect(){
    webSocket.close();
}
</script>
</body>
</html>

<html>
<body>
    <div id="root"></div>
    <script>
        // var host = 'ws://192.168.1.209:12345/websocket.php';
        // var socket = new WebSocket(host);
        // socket.onmessage = function(e) {
        //     document.getElementById('root').innerHTML = e.data;
        // };
    </script>
</body>
</html>
