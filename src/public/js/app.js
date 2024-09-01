const socket = io();

/// socket event handler
socket.on("welcome", async () => {
  console.log("someone joined");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("send offer");
  socket.emit("offer", offer, roomName);
})

socket.on("offer", async offer => {
  console.log("recv offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer()
  myPeerConnection.setLocalDescription(answer);
  console.log("sent answer")
  socket.emit("answer", answer, roomName);
})

socket.on("answer", async answer => {
  console.log("recv answer")
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", async ice => {
  console.log("recv ice")
  myPeerConnection.addIceCandidate(ice);
});
/// welcome
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

const welcomForm = welcome.querySelector("form");
welcomForm.onsubmit = async (event) => {
  event.preventDefault();
  const input = welcomForm.querySelector("input");
  await startMedia();
  socket.emit("join-room", input.value)
  roomName = input.value;
  input.value = "";
}

const startMedia = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

// RTC
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302"
        ]
      }
    ]
  });
  myPeerConnection.onicecandidate = (data) => {
    console.log("send ice")
    socket.emit("ice", data.candidate, roomName);
  }
  myPeerConnection.ontrack = (data) => {
    const stream = data.streams[0];
    console.log("got stream from peer");
    console.log("peer stream : ", stream);
    console.log(" my  stream : ", myStream)

    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = stream;
  }
  myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}


/// call
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras")

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
/** @type {RTCPeerConnection} */
let myPeerConnection;

call.hidden = true;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameraSelect.innerHTML = "";

    cameras.forEach(camera => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (camera.label === currentCamera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    })
  } catch (e) {
    console.log(e);
  }
}

const getMedia = async (deviceId) => {
  const initialConstraints = {
    audio: false,
    video: { facingMode: "user" }
  };

  const cameraConstraints = {
    audio: false,
    video: { deviceId: { exact: deviceId } }
  }

  try {
    console.log("media devices : ", navigator.mediaDevices)
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    )
    console.log("myStream : ", myStream);
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

muteBtn.onclick = () => {
  myStream
    .getAudioTracks()
    .forEach(track => track.enabled = !track.enabled)

  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

cameraBtn.onclick = () => {
  myStream
    .getVideoTracks()
    .forEach(track => track.enabled = !track.enabled)

  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

cameraSelect.onchange = async (event) => {
  await getMedia(event.target.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind == "video")
    await videoSender.replaceTrack(videoTrack);
  }
}
