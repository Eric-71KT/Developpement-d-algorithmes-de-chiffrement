from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # Pour gérer les requêtes cross-origin
from chiffrement.cesar import chiffrer_cesar, dechiffrer_cesar, normaliser_texte  # Importer les fonctions de chiffrement César
from chiffrement.xor import chiffrer_cle_xor, dechiffrer_cle_xor  # Importer les fonctions de chiffrement XOR
import random

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
    username = data.get("user")
    room = data.get("room")
    message = data.get("msg")
    key = random.randint(1, 25)  # Générer une clé aléatoire entre 1 et 25

    # Normaliser le message avant de le chiffrer
    message_normalise = normaliser_texte(message)

    # Chiffrer le message avant de le stocker
    message_chiffre = chiffrer_cesar(message_normalise, key)

    # Chiffrer la clé avec XOR
    key_chiffree = chiffrer_cle_xor(key)

    # Stocker le message avec la clé chiffrée
    messages.append({"user": username, "msg": message_chiffre, "room": room, "key": key_chiffree})

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