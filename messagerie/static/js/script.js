let currentUser = null;
let currentRoom = null;
let currentEncryption = "cesar"; // Type de chiffrement par défaut
const cleSecreteXOR = "1010"; // Clé secrète pour XOR (utilisée pour César et Vigenère)
let cleSecreteAES = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // Clé secrète AES (128 bits)
let ivAES = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // IV AES (128 bits)

// Fonction pour normaliser les caractères accentués
function normaliserTexte(texte) {
    return texte.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

// Fonction pour convertir un texte en binaire
function texteToBinaire(texte) {
    return texte.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

// Fonction pour convertir un binaire en texte
function binaireToTexte(binaire) {
    return binaire.match(/.{1,8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
}

// Fonction pour appliquer XOR entre deux chaînes binaires
function xorBinaire(binaire1, binaire2) {
    let resultat = '';
    for (let i = 0; i < binaire1.length; i++) {
        resultat += (parseInt(binaire1[i]) ^ (parseInt(binaire2[i % binaire2.length])));
    }
    return resultat;
}

// Fonction de chiffrement XOR
function chiffrerXOR(texte, cle) {
    const texteBinaire = texteToBinaire(texte);
    const cleBinaire = texteToBinaire(cle);
    return xorBinaire(texteBinaire, cleBinaire);
}

// Fonction de déchiffrement XOR
function dechiffrerXOR(texteChiffre, cle) {
    const cleBinaire = texteToBinaire(cle);
    const texteBinaire = xorBinaire(texteChiffre, cleBinaire);
    return binaireToTexte(texteBinaire);
}

// Fonction de chiffrement César
function chiffrerCesar(message, decalage) {
    let resultat = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let shift = char === char.toUpperCase() ? 65 : 97;
            resultat += String.fromCharCode(((char.charCodeAt(0) - shift + decalage) % 26 + shift));
        } else {
            resultat += char;
        }
    }
    return resultat;
}

// Fonction de déchiffrement César
function dechiffrerCesar(message, decalage) {
    return chiffrerCesar(message, 26 - decalage);
}

// Fonction de chiffrement Vigenère
function chiffrerVigenere(message, cle) {
    let resultat = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let shift = char === char.toUpperCase() ? 65 : 97;
            let decalage = cle.charCodeAt(i % cle.length) - 97; // Décalage basé sur la clé
            resultat += String.fromCharCode(((char.charCodeAt(0) - shift + decalage) % 26 + shift));
        } else {
            resultat += char;
        }
    }
    return resultat;
}

// Fonction de déchiffrement Vigenère
function dechiffrerVigenere(message, cle) {
    let resultat = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let shift = char === char.toUpperCase() ? 65 : 97;
            let decalage = cle.charCodeAt(i % cle.length) - 97; // Décalage basé sur la clé
            resultat += String.fromCharCode(((char.charCodeAt(0) - shift - decalage + 26) % 26 + shift));
        } else {
            resultat += char;
        }
    }
    return resultat;
}

// Fonction pour générer une clé aléatoire pour Vigenère (entre 3 et 10 caractères)
function genererCleVigenere() {
    const longueur = Math.floor(Math.random() * 8) + 3; // Entre 3 et 10 caractères
    let cle = "";
    for (let i = 0; i < longueur; i++) {
        cle += String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Lettres minuscules
    }
    return cle;
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
        keyChiffree = chiffrerXOR(key.toString(), cleSecreteXOR); // Chiffrer la clé César avec XOR
    } else if (currentEncryption === "aes") {
        messageChiffre = chiffrerAES(messageNormalise, cleSecreteAES, ivAES);
        keyChiffree = chiffrerXOR(cleSecreteAES, cleSecreteXOR); // Chiffrer la clé AES avec XOR
        ivChiffree = chiffrerXOR(ivAES, cleSecreteXOR); // Chiffrer l'IV avec XOR
    } else if (currentEncryption === "vigenere") {
        const key = genererCleVigenere(); // Générer une clé Vigenère aléatoire
        messageChiffre = chiffrerVigenere(messageNormalise, key);
        keyChiffree = chiffrerXOR(key, cleSecreteXOR); // Chiffrer la clé Vigenère avec XOR
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
                    const cleDechiffree = dechiffrerXOR(msg.key, cleSecreteXOR); // Déchiffrer la clé César
                    messageClair = dechiffrerCesar(msg.msg, parseInt(cleDechiffree)); // Déchiffrer le message
                } else if (msg.encryption === "aes") {
                    const keyClair = dechiffrerXOR(msg.key, cleSecreteXOR); // Déchiffrer la clé AES
                    const ivClair = dechiffrerXOR(msg.iv, cleSecreteXOR); // Déchiffrer l'IV
                    messageClair = dechiffrerAES(msg.msg, keyClair, ivClair); // Déchiffrer le message
                } else if (msg.encryption === "vigenere") {
                    const cleDechiffree = dechiffrerXOR(msg.key, cleSecreteXOR); // Déchiffrer la clé Vigenère
                    messageClair = dechiffrerVigenere(msg.msg, cleDechiffree); // Déchiffrer le message
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