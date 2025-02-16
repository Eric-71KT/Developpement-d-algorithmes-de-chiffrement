from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import eventlet

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Liste des utilisateurs connectés
users = {}

@app.route('/')
def index():
    return render_template('chat.html')

@socketio.on('join')
def handle_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    users[request.sid] = username
    emit('message', {'user': 'Serveur', 'msg': f"{username} a rejoint la salle {room}."}, room=room)
    print(f"{username} a rejoint la salle {room}.")

@socketio.on('message')
def handle_message(data):
    username = users.get(request.sid, "Inconnu")
    msg = data['msg']
    room = data['room']
    print(f"[{room}] {username}: {msg}")
    emit('message', {'user': username, 'msg': msg}, room=room)

@socketio.on('leave')
def handle_leave(data):
    username = users.pop(request.sid, "Inconnu")
    room = data['room']
    leave_room(room)
    emit('message', {'user': 'Serveur', 'msg': f"{username} a quitté la salle {room}."}, room=room)
    print(f"{username} a quitté la salle {room}.")

@socketio.on('disconnect')
def handle_disconnect():
    username = users.pop(request.sid, "Inconnu")
    print(f"{username} s'est déconnecté.")

if __name__ == '__main__':
    print("Serveur démarré sur http://127.0.0.1:5000 🚀")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)