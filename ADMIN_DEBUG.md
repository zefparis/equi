# 🔍 Diagnostic Admin - Page vide

## Problèmes identifiés dans les screenshots

1. **Page admin vide** : Aucun produit affiché
2. **Message d'erreur** : "admin.error.Title" (clé de traduction non résolue)

---

## 🧪 Tests à effectuer

### 1. Vérifier que les tables existent

Ouvrez la console développeur (F12) et exécutez :

```javascript
fetch('https://www.equisaddles.com/api/admin/db-status')
  .then(r => r.json())
  .then(console.log)
```

**Attendu** :
```json
{
  "success": true,
  "message": "Database connection OK",
  "hasProducts": true/false
}
```

### 2. Vérifier l'API products

```javascript
fetch('https://www.equisaddles.com/api/products')
  .then(r => r.json())
  .then(console.log)
```

**Attendu** :
- Si succès : Array de produits `[{id: 1, name: "...", ...}]`
- Si erreur : Message d'erreur

### 3. Ajouter des données d'exemple

Si `hasProducts: false`, exécutez :

```javascript
fetch('https://www.equisaddles.com/api/admin/run-seed', {
  method: 'POST'
}).then(r => r.json()).then(console.log)
```

---

## 🐛 Causes possibles

### Page admin vide

**Cause 1** : Aucun produit en base de données
- **Solution** : Exécuter le seed (voir ci-dessus)

**Cause 2** : Erreur API `/api/products`
- **Diagnostic** : Ouvrir F12 → Network → Regarder la requête `/api/products`
- **Solution** : Vérifier les logs Railway

**Cause 3** : Base de données non initialisée
- **Diagnostic** : Vérifier `/api/admin/db-status`
- **Solution** : Exécuter `npm run db:push` sur Railway

### Message "admin.error.Title"

**Cause** : Clé de traduction incorrecte ou manquante

**Où cela apparaît** :
- Upload d'image échoue
- Création de produit échoue

**Solution temporaire** : Les messages sont en dur dans les composants

---

## ✅ Solution rapide

### Si la page est vide :

1. **Vérifiez la connexion DB** :
   ```javascript
   fetch('/api/admin/db-status').then(r => r.json()).then(console.log)
   ```

2. **Si DB OK mais pas de produits** :
   ```javascript
   fetch('/api/admin/run-seed', {method: 'POST'}).then(r => r.json()).then(console.log)
   ```

3. **Rafraîchissez la page admin**

### Si les produits apparaissent mais images manquantes :

C'est normal ! Les images sont stockées localement et ont été perdues au redéploiement.

**Solutions** :
1. **Court terme** : Re-uploader les images via `/admin`
2. **Long terme** : Configurer Cloudinary (voir `CLOUDINARY_SETUP.md`)

---

## 📋 Checklist de vérification

- [ ] `/api/admin/db-status` retourne `success: true`
- [ ] `/api/products` retourne un array (vide ou avec produits)
- [ ] Aucune erreur 500 dans la console F12 → Network
- [ ] Les logs Railway montrent "PostgreSQL connection established"
- [ ] Si pas de produits : Exécuter `run-seed`
- [ ] Rafraîchir `/admin` après seed

---

## 🆘 Si rien ne fonctionne

**Copier et partager** :
1. Le résultat de `/api/admin/db-status`
2. Le résultat de `/api/products`
3. Les erreurs dans la console F12
4. Les logs Railway (dernières 50 lignes)

---

**Date** : 26 Janvier 2025
