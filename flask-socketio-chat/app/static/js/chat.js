// This file contains the JavaScript code for the client-side functionality, including handling user input, connecting to the SocketIO server, sending and receiving messages, and updating the chat interface.

const socket = io();

let username;
let room;

// Function to join a room
function joinRoom() {
    username = document.getElementById('username').value;
    room = document.getElementById('room').value;

    if (username && room) {
        socket.emit('join', { username, room });
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('login-container').style.display = 'none';
    }
}

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;

    if (message) {
        const encryptedMessage = caesarCipher(message, 3); // Encrypting message with a shift of 3
        socket.emit('send_message', { message: encryptedMessage, room });
        messageInput.value = '';
    }
}

// Function to receive messages
socket.on('receive_message', (data) => {
    const decryptedMessage = caesarCipher(data.message, -3); // Decrypting message with a shift of -3
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.username}: ${decryptedMessage}`;
    document.getElementById('messages').appendChild(messageElement);
});

// Function to handle disconnection
socket.on('disconnect', () => {
    alert('You have been disconnected from the chat.');
});

// Caesar cipher function for encryption and decryption
function caesarCipher(str, shift) {
    return str.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt();
            const base = char.charCodeAt(0) < 91 ? 65 : 97;
            return String.fromCharCode(((code - base + shift + 26) % 26) + base);
        }
        return char;
    }).join('');
}

// Event listeners for buttons
document.getElementById('join-button').addEventListener('click', joinRoom);
document.getElementById('send-button').addEventListener('click', sendMessage);