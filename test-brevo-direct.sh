#!/bin/bash

# ==============================================================
# 🧪 TEST DIRECT DE L'API BREVO
# ==============================================================
# Remplacez VOTRE_CLE_BREVO par votre vraie clé API
# La clé doit commencer par "xkeysib-"
# ==============================================================

# ⚠️ REMPLACEZ ICI PAR VOTRE VRAIE CLÉ BREVO
BREVO_API_KEY="VOTRE_CLE_BREVO"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST DIRECT API BREVO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 Tentative d'envoi d'email de test..."
echo ""

# Vérifier que la clé a été remplacée
if [ "$BREVO_API_KEY" = "VOTRE_CLE_BREVO" ]; then
    echo "❌ ERREUR: Vous devez d'abord remplacer VOTRE_CLE_BREVO par votre vraie clé API Brevo !"
    echo ""
    echo "Ouvrez le fichier test-brevo-direct.sh et modifiez la ligne :"
    echo 'BREVO_API_KEY="VOTRE_CLE_BREVO"'
    echo ""
    exit 1
fi

# Appel API Brevo
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST https://api.brevo.com/v3/smtp/email \
  -H "Content-Type: application/json" \
  -H "api-key: $BREVO_API_KEY" \
  -d '{
    "sender": {
      "name": "Test Equi Saddles",
      "email": "equisaddles@gmail.com"
    },
    "to": [
      {
        "email": "equisaddles@gmail.com",
        "name": "Destinataire Test"
      }
    ],
    "subject": "🧪 Test API Brevo Direct",
    "htmlContent": "<html><body><h1>Test réussi !</h1><p>Si vous recevez cet email, l'\''API Brevo fonctionne correctement.</p></body></html>",
    "textContent": "Test réussi ! Si vous recevez cet email, l API Brevo fonctionne correctement."
  }')

# Extraire le code HTTP
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSULTAT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔢 Code HTTP: $HTTP_CODE"
echo ""
echo "📄 Réponse Brevo:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Interpréter le résultat
case $HTTP_CODE in
  201)
    echo "✅ SUCCÈS ! Email envoyé avec succès !"
    echo ""
    echo "👉 L'email devrait arriver dans quelques secondes à: equisaddles@gmail.com"
    echo "👉 Vérifiez aussi le dossier SPAM"
    echo ""
    echo "🎉 Votre clé API Brevo fonctionne parfaitement !"
    echo "   Vous pouvez maintenant l'utiliser dans Railway."
    ;;
  401)
    echo "❌ ERREUR 401 - Unauthorized"
    echo ""
    echo "🔍 Causes possibles:"
    echo "   • La clé API est invalide ou expirée"
    echo "   • La clé API n'existe pas dans votre compte Brevo"
    echo "   • Vous avez copié la clé avec des espaces ou caractères en trop"
    echo ""
    echo "👉 Solution:"
    echo "   1. Connectez-vous à https://app.brevo.com"
    echo "   2. Settings → SMTP & API → API Keys"
    echo "   3. Générez une NOUVELLE clé API"
    echo "   4. Copiez-la correctement (commence par xkeysib-)"
    echo "   5. Relancez ce script avec la nouvelle clé"
    ;;
  400)
    echo "❌ ERREUR 400 - Bad Request"
    echo ""
    echo "🔍 Causes possibles:"
    echo "   • L'email expéditeur (equisaddles@gmail.com) n'est pas vérifié dans Brevo"
    echo "   • Format de l'email invalide"
    echo ""
    echo "👉 Solution:"
    echo "   1. Connectez-vous à https://app.brevo.com"
    echo "   2. Menu Senders & IP"
    echo "   3. Vérifiez que equisaddles@gmail.com est présent"
    echo "   4. Si statut rouge, cliquez pour vérifier via email"
    ;;
  403)
    echo "❌ ERREUR 403 - Forbidden"
    echo ""
    echo "🔍 Causes possibles:"
    echo "   • Votre compte Brevo est suspendu"
    echo "   • Vous avez dépassé votre quota d'envoi"
    echo ""
    echo "👉 Solution: Vérifiez votre compte Brevo"
    ;;
  *)
    echo "❌ ERREUR INATTENDUE"
    echo ""
    echo "Code HTTP: $HTTP_CODE"
    echo "Vérifiez la réponse ci-dessus pour plus de détails"
    ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
