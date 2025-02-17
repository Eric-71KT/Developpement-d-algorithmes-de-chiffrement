from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room, emit
from .utils.encryption import encrypt, decrypt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('chat.html')

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    emit('message', {'msg': f'{username} has joined the room.'}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    room = data['room']
    message = data['message']
    encrypted_message = encrypt(message, 3)  # Encrypt with Caesar cipher
    emit('message', {'msg': encrypted_message}, room=room)

@socketio.on('disconnect')
def handle_disconnect():
    # Handle disconnection logic if needed
    pass

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    emit('message', {'msg': f'{username} has left the room.'}, room=room)

if __name__ == '__main__':
    socketio.run(app)