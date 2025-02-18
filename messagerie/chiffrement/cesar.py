# Fonction de chiffrement César
def chiffrer_cesar(message, decalage=3):
    resultat = ""
    for char in message:
        if char.isalpha():
            shift = 65 if char.isupper() else 97
            resultat += chr((ord(char) - shift + decalage) % 26 + shift)
        else:
            resultat += char
    return resultat

# Fonction de déchiffrement César
def dechiffrer_cesar(message, decalage=3):
    return chiffrer_cesar(message, -decalage)

# Fonction pour convertir une clé numérique en lettre
def cle_to_lettre(cle):
    # Convertir la clé en une lettre (A=1, B=2, ..., Z=26)
    return chr(64 + cle)  # 64 + 1 = 'A', 64 + 2 = 'B', etc.

# Fonction pour convertir une lettre en clé numérique
def lettre_to_cle(lettre):
    # Convertir la lettre en clé numérique (A=1, B=2, ..., Z=26)
    return ord(lettre.upper()) - 64

# Fonction pour chiffrer la clé (sous forme de lettre)
def chiffrer_cle(cle):
    # Convertir la clé en lettre
    cle_lettre = cle_to_lettre(cle)
    # Chiffrer la lettre avec un décalage de 5 (par exemple)
    return chiffrer_cesar(cle_lettre, 5)

# Fonction pour déchiffrer la clé (sous forme de lettre)
def dechiffrer_cle(cle_chiffree):
    # Déchiffrer la lettre avec un décalage de 5
    cle_lettre = dechiffrer_cesar(cle_chiffree, 5)
    # Convertir la lettre en clé numérique
    return lettre_to_cle(cle_lettre)