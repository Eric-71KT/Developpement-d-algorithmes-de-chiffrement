# Fonction pour convertir un nombre en binaire (sous forme de chaîne)
def nombre_to_binaire(nombre):
    return bin(nombre)[2:]  # Retire le préfixe '0b'

# Fonction pour convertir une chaîne binaire en nombre
def binaire_to_nombre(binaire):
    return int(binaire, 2)

# Fonction pour appliquer XOR entre deux chaînes binaires
def xor_binaire(binaire1, binaire2):
    # Assurez-vous que les deux chaînes ont la même longueur
    max_len = max(len(binaire1), len(binaire2))
    binaire1 = binaire1.zfill(max_len)
    binaire2 = binaire2.zfill(max_len)
    # Appliquer XOR bit à bit
    resultat = ''.join(str(int(bit1) ^ int(bit2)) for bit1, bit2 in zip(binaire1, binaire2))
    return resultat

# Fonction pour chiffrer la clé avec XOR
def chiffrer_cle_xor(cle, cle_secrete="1010"):  # Clé secrète par défaut : "1010"
    # Convertir la clé en binaire
    cle_binaire = nombre_to_binaire(cle)
    # Appliquer XOR avec la clé secrète
    cle_chiffree = xor_binaire(cle_binaire, cle_secrete)
    return cle_chiffree

# Fonction pour déchiffrer la clé avec XOR
def dechiffrer_cle_xor(cle_chiffree, cle_secrete="1010"):
    # Appliquer XOR avec la clé secrète pour récupérer la clé binaire
    cle_binaire = xor_binaire(cle_chiffree, cle_secrete)
    # Convertir la clé binaire en nombre
    return binaire_to_nombre(cle_binaire)