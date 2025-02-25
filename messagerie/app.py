from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Autoriser les requêtes cross-origin

# Stockage des messages (en mémoire)
messages = []

# Route pour la page principale
@app.route("/")
def index():
    return render_template("index.html")

# Route pour envoyer un message
@app.route("/send", methods=["POST"])
def send_message():
    data = request.json
    messages.append({
        "user": data.get("user"),
        "msg": data.get("msg"),
        "room": data.get("room"),
        "key": data.get("key"),
        "iv": data.get("iv"),
        "encryption": data.get("encryption", "cesar")
    })
    return jsonify({"status": "success"})

# Route pour récupérer les messages
@app.route("/messages", methods=["GET"])
def get_messages():
    room = request.args.get("room")
    room_messages = [msg for msg in messages if msg["room"] == room]
    return jsonify(room_messages)

# Démarrer l'application
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)