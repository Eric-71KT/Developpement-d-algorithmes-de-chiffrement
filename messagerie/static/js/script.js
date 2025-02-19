let currentUser = null;
let currentRoom = null;
let currentEncryption = "cesar"; // Type de chiffrement par défaut
const cleSecreteXOR = "1010"; // Clé secrète pour XOR (utilisée pour César)
const cleSecreteAES = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // Clé secrète AES (128 bits)

// Fonction pour normaliser les caractères accentués
function normaliserTexte(texte) {
    return texte.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

// Fonction de chiffrement César
function chiffrerCesar(message, decalage) {
    let resultat = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let shift = char === char.toUpperCase() ? 65 : 97;
            resultat += String.fromCharCode(((char.charCodeAt(0) - shift + decalage) % 26) + shift);
        } else {
            resultat += char;
        }
    }
    return resultat;
}

// Fonction de déchiffrement César
function dechiffrerCesar(message, decalage) {
    return chiffrerCesar(message, 26 - decalage); // Déchiffrer en utilisant l'inverse du décalage
}

// Fonction pour appliquer XOR entre deux chaînes binaires (utilisée pour César)
function xorBinaire(binaire1, binaire2) {
    let resultat = '';
    for (let i = 0; i < binaire1.length; i++) {
        resultat += (parseInt(binaire1[i]) ^ (parseInt(binaire2[i % binaire2.length])));
    }
    return resultat;
}

// Fonction pour chiffrer la clé avec XOR (utilisée pour César)
function chiffrerCleXor(cle, cleSecrete = "1010") {
    const cleBinaire = cle.toString(2).padStart(4, '0'); // Convertir en binaire sur 4 bits
    return xorBinaire(cleBinaire, cleSecrete);
}

// Fonction pour déchiffrer la clé avec XOR (utilisée pour César)
function dechiffrerCleXor(cleChiffree, cleSecrete = "1010") {
    const cleBinaire = xorBinaire(cleChiffree, cleSecrete);
    return parseInt(cleBinaire, 2); // Convertir en nombre
}

// Fonction pour appliquer XOR entre deux chaînes hexadécimales (utilisée pour AES)
function xorHex(hex1, hex2) {
    // Convertir les hex en tableaux de bytes
    const bytes1 = CryptoJS.enc.Hex.parse(hex1);
    const bytes2 = CryptoJS.enc.Hex.parse(hex2);
    
    // XOR byte par byte
    const resultat = [];
    for (let i = 0; i < bytes1.words.length; i++) {
        resultat.push(bytes1.words[i] ^ bytes2.words[i]);
    }
    
    return CryptoJS.lib.WordArray.create(resultat).toString(CryptoJS.enc.Hex);
}

// Fonction pour chiffrer la clé AES avec XOR
function chiffrerCleAESXor(cleHex, cleSecreteHex) {
    return xorHex(cleHex, cleSecreteHex);
}

// Fonction pour déchiffrer la clé AES avec XOR
function dechiffrerCleAESXor(cleChiffreeHex, cleSecreteHex) {
    return xorHex(cleChiffreeHex, cleSecreteHex);
}

// Fonction pour générer un vecteur d'initialisation aléatoire (AES)
function genererIV() {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

// Fonction pour générer une clé aléatoire (AES)
function genererCleAES() {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

// Fonction de chiffrement AES
function chiffrerAES(message, cle, iv) {
    return CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(cle), { iv: CryptoJS.enc.Hex.parse(iv) }).toString();
}

// Fonction de déchiffrement AES
function dechiffrerAES(messageChiffre, cle, iv) {
    const bytes = CryptoJS.AES.decrypt(messageChiffre, CryptoJS.enc.Hex.parse(cle), { iv: CryptoJS.enc.Hex.parse(iv) });
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Rejoindre une salle
document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    currentUser = document.getElementById("username").value;
    currentRoom = document.getElementById("room").value;
    currentEncryption = document.getElementById("encryption-type").value; // Récupérer le type de chiffrement

    // Masquer le formulaire de connexion et afficher le chat
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "block";

    // Afficher le pseudo et le nom de la salle
    updateChatHeader();

    // Commencer à récupérer les messages
    fetchMessages();
});

// Mettre à jour l'en-tête du chat
function updateChatHeader() {
    document.getElementById("chat-header").innerHTML = `
        <h4>Messagerie en temps réel - ${currentUser} (Salle: ${currentRoom}) - Chiffrement: ${currentEncryption}</h4>
    `;
}

// Changer le type de chiffrement
document.getElementById("encryption-type").addEventListener("change", (e) => {
    currentEncryption = e.target.value;
    updateChatHeader();
});

// Envoyer un message
document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = document.getElementById("message").value;
    const messageNormalise = normaliserTexte(message);

    let messageChiffre, keyChiffree, ivChiffree;

    if (currentEncryption === "cesar") {
        const key = Math.floor(Math.random() * 25) + 1; // Générer une clé aléatoire entre 1 et 25
        messageChiffre = chiffrerCesar(messageNormalise, key);
        keyChiffree = chiffrerCleXor(key);
    } else if (currentEncryption === "aes") {
        const key = genererCleAES(); // Générer une clé AES aléatoire
        const iv = genererIV(); // Générer un IV aléatoire
        messageChiffre = chiffrerAES(messageNormalise, key, iv);
        keyChiffree = chiffrerCleAESXor(key, cleSecreteAES); // Chiffrer la clé AES avec XOR
        ivChiffree = chiffrerCleAESXor(iv, cleSecreteAES); // Chiffrer l'IV avec XOR
    } else {
        messageChiffre = messageNormalise; // Pas de chiffrement
        keyChiffree = "NONE"; // Clé factice
        ivChiffree = "NONE"; // IV factice
    }

    // Envoyer le message au serveur via une requête POST
    fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            user: currentUser, 
            room: currentRoom, 
            msg: messageChiffre, 
            key: keyChiffree,
            iv: ivChiffree,
            encryption: currentEncryption // Envoyer le type de chiffrement
        }),
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
                let messageClair;

                if (msg.encryption === "cesar") {
                    const cleDechiffree = dechiffrerCleXor(msg.key); // Déchiffrer la clé avec XOR
                    messageClair = dechiffrerCesar(msg.msg, cleDechiffree); // Déchiffrer le message
                } else if (msg.encryption === "aes") {
                    const keyClair = dechiffrerCleAESXor(msg.key, cleSecreteAES); // Déchiffrer la clé AES
                    const ivClair = dechiffrerCleAESXor(msg.iv, cleSecreteAES); // Déchiffrer l'IV
                    messageClair = dechiffrerAES(msg.msg, keyClair, ivClair); // Déchiffrer le message
                } else {
                    messageClair = msg.msg; // Texte clair directement
                }

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