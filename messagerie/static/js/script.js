let currentUser = null;
let currentRoom = null;
const defaultKey = 3; // Clé de chiffrement par défaut

// Fonction de déchiffrement César côté client
function dechiffrerCesar(message, decalage = defaultKey) {
    let resultat = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let shift = char === char.toUpperCase() ? 65 : 97;
            resultat += String.fromCharCode(((char.charCodeAt(0) - shift - decalage + 26) % 26 + shift));
        } else {
            resultat += char;
        }
    }
    return resultat;
}

// Fonction pour convertir une lettre en clé numérique
function lettre_to_cle(lettre) {
    return lettre.toUpperCase().charCodeAt(0) - 64; // A=1, B=2, ..., Z=26
}

// Fonction pour déchiffrer la clé (sous forme de lettre)
function dechiffrerCle(cle_chiffree) {
    // Déchiffrer la lettre avec un décalage de 5 (identique à celui utilisé côté serveur)
    const cle_lettre = dechiffrerCesar(cle_chiffree, 5);
    // Convertir la lettre en clé numérique
    return lettre_to_cle(cle_lettre);
}

// Rejoindre une salle
document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    currentUser = document.getElementById("username").value;
    currentRoom = document.getElementById("room").value;

    // Masquer le formulaire de connexion et afficher le chat
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "block";

    // Afficher le pseudo et le nom de la salle
    document.getElementById("chat-header").innerHTML = `
        <h4>Messagerie en temps réel - ${currentUser} (Salle: ${currentRoom})</h4>
    `;

    // Commencer à récupérer les messages
    fetchMessages();
});

// Envoyer un message
document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = document.getElementById("message").value;

    // Envoyer le message au serveur via une requête POST
    fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser, room: currentRoom, msg: message, key: defaultKey }),
    }).then(() => {
        document.getElementById("message").value = ""; // Effacer le champ de saisie
    });
});

// Récupérer les messages
function fetchMessages() {
    fetch(`/messages?room=${currentRoom}`)
        .then((response) => response.json())
        .then((data) => {
            const messagesDiv = document.getElementById("messages");
            messagesDiv.innerHTML = ""; // Effacer les messages précédents

            // Afficher les messages déchiffrés
            data.forEach((msg) => {
                const messageElement = document.createElement("div");
                const cle_dechiffree = dechiffrerCle(msg.key); // Déchiffrer la clé
                const messageClair = dechiffrerCesar(msg.msg, cle_dechiffree); // Déchiffrer le message
                messageElement.innerHTML = `<strong>${msg.user}:</strong> ${messageClair}`;
                messagesDiv.appendChild(messageElement);
            });

            // Faire défiler la zone de messages vers le bas
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });

    // Récupérer les messages toutes les secondes
    setTimeout(fetchMessages, 1000);
}

// Quitter une salle
document.getElementById("leave-btn").addEventListener("click", () => {
    // Réinitialiser les variables
    currentUser = null;
    currentRoom = null;

    // Masquer le chat et afficher le formulaire de connexion
    document.getElementById("login").style.display = "block";
    document.getElementById("chat").style.display = "none";
});