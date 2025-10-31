#!/bin/bash
# Script de test direct de l'API Brevo via le backend

echo "🧪 Test d'envoi email Brevo via API..."
echo ""

curl -X POST https://www.equisaddles.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Direct API",
    "customerEmail": "test@example.com",
    "message": "Test envoyé depuis le script shell",
    "sessionId": "test-script-123"
  }' \
  | jq '.'

echo ""
echo "✅ Résultat ci-dessus"
echo ""
echo "Si succès: { \"success\": true, \"message\": \"Email sent successfully\" }"
echo "Si échec: { \"success\": false, \"message\": \"erreur...\" }"
