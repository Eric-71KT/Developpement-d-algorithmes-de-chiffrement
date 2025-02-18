let currentUser = null;
let currentRoom = null;
const cleSecrete = "1010"; // Clé secrète pour XOR

// Fonction pour normaliser les caractères accentués
function normaliserTexte(texte) {
    return texte.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

// Fonction de déchiffrement César côté client
function dechiffrerCesar(message, decalage) {
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

// Fonction pour appliquer XOR entre deux chaînes binaires
function xorBinaire(binaire1, binaire2) {
    // Assurez-vous que les deux chaînes ont la même longueur
    const maxLen = Math.max(binaire1.length, binaire2.length);
    binaire1 = binaire1.padStart(maxLen, '0');
    binaire2 = binaire2.padStart(maxLen, '0');
    // Appliquer XOR bit à bit
    let resultat = '';
    for (let i = 0; i < maxLen; i++) {
        resultat += (parseInt(binaire1[i]) ^ parseInt(binaire2[i]));
    }
    return resultat;
}

// Fonction pour déchiffrer la clé avec XOR
function dechiffrerCleXor(cle_chiffree) {
    // Appliquer XOR avec la clé secrète pour récupérer la clé binaire
    const cle_binaire = xorBinaire(cle_chiffree, cleSecrete);
    // Convertir la clé binaire en nombre
    return parseInt(cle_binaire, 2);
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
        body: JSON.stringify({ user: currentUser, room: currentRoom, msg: message }),
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
                const cle_dechiffree = dechiffrerCleXor(msg.key); // Déchiffrer la clé avec XOR
                const messageClair = dechiffrerCesar(msg.msg, cle_dechiffree); // Déchiffrer le message
                const messageNormalise = normaliserTexte(messageClair); // Normaliser le message
                messageElement.innerHTML = `<strong>${msg.user}:</strong> ${messageNormalise}`;
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