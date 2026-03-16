# TASKS — Outil de Gestion de Stocks E-commerce de Vêtements (StockFlow B2B)
> Stack : React (Frontend) · Laravel (Backend API REST) · MySQL (BDD) · Ollama (IA locale)
> Méthode : Agile par sprints

---

## CONTEXTE DU PROJET

Application de gestion de stocks pour un site e-commerce de vêtements.
- Gestion des produits avec déclinaisons (taille × couleur)
- Mouvements de stock (entrées, sorties, retours clients)
- Alertes de rupture automatiques
- Assistant IA local (LLM via Ollama) pour l'analyse métier
- Deux rôles : Admin (accès total) et Employé logistique (accès restreint)

---

## PHASE 1 — INITIALISATION & ARCHITECTURE

### TASK-001 — Initialisation du projet Laravel (Backend)
- Créer un nouveau projet Laravel
- Configurer le fichier `.env` pour la connexion MySQL
- Activer Laravel Sanctum pour l'authentification par token
- Configurer CORS pour autoriser les requêtes depuis React (localhost:3000)
- Mettre en place la structure de dossiers : `Controllers/`, `Models/`, `Migrations/`, `Seeders/`, `Middleware/`

### TASK-002 — Initialisation du projet React (Frontend)
- Créer un projet React (Vite recommandé)
- Installer les dépendances : `react-router-dom`, `axios`, `tailwindcss`, `shadcn/ui` ou équivalent
- Configurer le proxy vers l'API Laravel dans `vite.config.js`
- Mettre en place la structure de dossiers : `pages/`, `components/`, `hooks/`, `services/`, `context/`

### TASK-003 — Initialisation de la base de données MySQL
- Créer la base de données `stockflow_db`
- Vérifier la connexion depuis Laravel
- Configurer le charset UTF-8 (pour les accents, caractères spéciaux)

---

## PHASE 2 — BASE DE DONNÉES (MIGRATIONS)

### TASK-010 — Migration : table `utilisateurs`
Créer la migration pour la table `utilisateurs` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `nom` (string, 100)
- `email` (string, unique)
- `mot_de_passe_hash` (string)
- `role` (enum : 'admin', 'employe')
- `remember_token` (string, nullable)
- `created_at`, `updated_at` (timestamps)

### TASK-011 — Migration : table `categories`
Créer la migration pour la table `categories` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `nom` (string, 100)
- `collection` (string, 100, nullable) — ex : "Printemps/Été 2026", "Soldes"
- `parent_id` (bigint, FK nullable, self-reference pour arborescence) — ex : Homme > Hauts > Chemises
- `created_at`, `updated_at` (timestamps)

### TASK-012 — Migration : table `fournisseurs`
Créer la migration pour la table `fournisseurs` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `nom` (string, 150)
- `email` (string, nullable)
- `telephone` (string, 30, nullable)
- `created_at`, `updated_at` (timestamps)

### TASK-013 — Migration : table `produits`
Créer la migration pour la table `produits` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `nom` (string, 200)
- `description` (text, nullable)
- `categorie_id` (bigint, FK → categories.id, nullable)
- `marque` (string, 100, nullable)
- `prix_vente` (decimal 10,2)
- `created_at`, `updated_at` (timestamps)

### TASK-014 — Migration : table `variantes`
Créer la migration pour la table `variantes` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `produit_id` (bigint, FK → produits.id, onDelete cascade)
- `taille` (string, 10) — ex : "XS", "S", "M", "L", "XL", "42", etc.
- `couleur` (string, 50)
- `code_barre` (string, 100, unique, nullable)
- `quantite_actuelle` (int, default 0)
- `seuil_alerte` (int, default 5)
- `created_at`, `updated_at` (timestamps)

### TASK-015 — Migration : table `mouvements_stock`
Créer la migration pour la table `mouvements_stock` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `variante_id` (bigint, FK → variantes.id)
- `type` (enum : 'ENTREE', 'SORTIE', 'RETOUR_CLIENT')
- `quantite` (int)
- `date` (datetime, default now)
- `utilisateur_id` (bigint, FK → utilisateurs.id, nullable)
- `motif` (string, 255, nullable) — ex : "Livraison fournisseur", "Retour client conforme"
- `created_at`, `updated_at` (timestamps)

### TASK-016 — Migration : table `approvisionnements`
Créer la migration pour la table `approvisionnements` avec les colonnes :
- `id` (bigint, auto-increment, PK)
- `produit_id` (bigint, FK → produits.id)
- `fournisseur_id` (bigint, FK → fournisseurs.id)
- `prix_achat` (decimal 10,2)
- `date_approvisionnement` (datetime)
- `created_at`, `updated_at` (timestamps)

### TASK-017 — Seeders de données de test
- Seeder `UtilisateurSeeder` : créer 1 admin et 1 employé avec mots de passe hashés
- Seeder `CategorieSeeder` : créer une arborescence (ex : Homme > Hauts > T-shirts, Femme > Robes)
- Seeder `FournisseurSeeder` : 3 fournisseurs fictifs
- Seeder `ProduitSeeder` : 5 produits avec leurs variantes (au moins 3 variantes chacun)
- Seeder `MouvementSeeder` : 20 mouvements de stock fictifs (mix ENTREE/SORTIE/RETOUR_CLIENT)

---

## PHASE 3 — MODÈLES ELOQUENT (Laravel)

### TASK-020 — Modèle `Utilisateur`
- Créer le modèle `User` (ou `Utilisateur`) avec fillable
- Implémenter `HasApiTokens` (Sanctum) et `Authenticatable`
- Définir la relation : `hasMany(MouvementStock::class)`

### TASK-021 — Modèle `Categorie`
- Créer le modèle avec fillable
- Définir la relation parent/enfants : `hasMany(self::class, 'parent_id')` et `belongsTo(self::class, 'parent_id')`
- Définir la relation : `hasMany(Produit::class)`

### TASK-022 — Modèle `Fournisseur`
- Créer le modèle avec fillable
- Définir la relation : `hasMany(Approvisionnement::class)`

### TASK-023 — Modèle `Produit`
- Créer le modèle avec fillable
- Définir les relations :
  - `belongsTo(Categorie::class)`
  - `hasMany(Variante::class)`
  - `hasMany(Approvisionnement::class)` via relation `receivedVia`

### TASK-024 — Modèle `Variante`
- Créer le modèle avec fillable
- Définir les relations :
  - `belongsTo(Produit::class)`
  - `hasMany(MouvementStock::class)`
- Ajouter un accessor `statut` calculant dynamiquement le statut ("In Stock", "Low Stock", "Out of Stock") en comparant `quantite_actuelle` et `seuil_alerte`

### TASK-025 — Modèle `MouvementStock`
- Créer le modèle avec fillable
- Définir les relations :
  - `belongsTo(Variante::class)`
  - `belongsTo(User::class, 'utilisateur_id')`

### TASK-026 — Modèle `Approvisionnement`
- Créer le modèle avec fillable
- Définir les relations :
  - `belongsTo(Produit::class)`
  - `belongsTo(Fournisseur::class)`

---

## PHASE 4 — AUTHENTIFICATION (Backend Laravel)

### TASK-030 — Endpoint POST `/api/auth/login`
- Valider les champs `email` et `password`
- Vérifier les identifiants avec `Hash::check()`
- Retourner un token Sanctum + données de l'utilisateur (id, nom, rôle)
- Retourner une erreur 401 si identifiants incorrects

### TASK-031 — Endpoint POST `/api/auth/logout`
- Middleware `auth:sanctum`
- Révoquer le token courant

### TASK-032 — Endpoint GET `/api/auth/me`
- Middleware `auth:sanctum`
- Retourner les infos de l'utilisateur connecté

### TASK-033 — Middleware de contrôle par rôle
- Créer un middleware `CheckRole` qui vérifie si l'utilisateur a le rôle requis
- Retourner 403 Forbidden si le rôle ne correspond pas
- Appliquer : les routes de type CRUD admin uniquement sont protégées par `role:admin`

---

## PHASE 5 — API REST PRODUITS & VARIANTES (Backend Laravel)

### TASK-040 — CRUD Produits : GET `/api/produits`
- Lister tous les produits
- Inclure les relations : `categorie`, `variantes` (count ou liste)
- Pagination (20 par page)
- Filtres optionnels via query params : `?categorie_id=`, `?marque=`, `?search=`

### TASK-041 — CRUD Produits : GET `/api/produits/{id}`
- Retourner un produit avec toutes ses variantes et leur statut
- Inclure les informations de la catégorie et du fournisseur via approvisionnement

### TASK-042 — CRUD Produits : POST `/api/produits`
- Rôle requis : admin
- Valider les champs : `nom` (required), `prix_vente` (required, numeric), `categorie_id` (nullable), `marque` (nullable)
- Créer le produit en base

### TASK-043 — CRUD Produits : PUT `/api/produits/{id}`
- Rôle requis : admin
- Valider et mettre à jour les champs du produit

### TASK-044 — CRUD Produits : DELETE `/api/produits/{id}`
- Rôle requis : admin
- Supprimer le produit et ses variantes en cascade

### TASK-045 — CRUD Variantes : POST `/api/produits/{id}/variantes`
- Rôle requis : admin
- Valider : `taille` (required), `couleur` (required), `code_barre` (unique), `quantite_actuelle`, `seuil_alerte`
- Créer la variante liée au produit

### TASK-046 — CRUD Variantes : PUT `/api/variantes/{id}`
- Rôle requis : admin
- Mettre à jour une variante (taille, couleur, seuil d'alerte)

### TASK-047 — CRUD Variantes : DELETE `/api/variantes/{id}`
- Rôle requis : admin
- Supprimer la variante et ses mouvements en cascade

---

## PHASE 6 — API REST CATÉGORIES & FOURNISSEURS (Backend Laravel)

### TASK-050 — CRUD Catégories : GET `/api/categories`
- Lister toutes les catégories avec leur arborescence (parent → enfants)

### TASK-051 — CRUD Catégories : POST `/api/categories`
- Rôle requis : admin
- Valider : `nom` (required), `collection` (nullable), `parent_id` (nullable, FK valide)

### TASK-052 — CRUD Catégories : PUT `/api/categories/{id}` et DELETE `/api/categories/{id}`
- Rôle requis : admin
- Empêcher la suppression d'une catégorie qui a des produits (retourner erreur 422)

### TASK-053 — CRUD Fournisseurs : GET `/api/fournisseurs`
- Lister tous les fournisseurs

### TASK-054 — CRUD Fournisseurs : POST, PUT, DELETE `/api/fournisseurs`
- Rôle requis : admin
- Valider : `nom` (required), `email` (email, nullable), `telephone` (nullable)

---

## PHASE 7 — API REST MOUVEMENTS DE STOCK (Backend Laravel)

### TASK-060 — Endpoint POST `/api/mouvements`
- Accessible aux deux rôles (admin et employé)
- Valider les champs :
  - `variante_id` (required, existe en base)
  - `type` (required, enum : ENTREE / SORTIE / RETOUR_CLIENT)
  - `quantite` (required, int, > 0)
  - `motif` (string, nullable)
- **Logique métier** :
  - Si type = ENTREE ou RETOUR_CLIENT : incrémenter `quantite_actuelle` de la variante
  - Si type = SORTIE : décrémenter `quantite_actuelle` (vérifier que le stock ne passe pas négatif, sinon erreur 422)
- Enregistrer le mouvement avec `utilisateur_id` du token courant
- Tout faire dans une **transaction SQL** (BEGIN / COMMIT / ROLLBACK en cas d'erreur)

### TASK-061 — Endpoint GET `/api/mouvements`
- Lister les mouvements avec filtres : `?variante_id=`, `?type=`, `?date_debut=`, `?date_fin=`
- Inclure les données de la variante (SKU, produit nom, taille, couleur) et de l'utilisateur
- Tri par date décroissante par défaut
- Pagination (50 par page)

### TASK-062 — Endpoint GET `/api/mouvements/retours`
- Raccourci pour lister uniquement les RETOUR_CLIENT
- Tri par date décroissante

---

## PHASE 8 — API ALERTES (Backend Laravel)

### TASK-070 — Endpoint GET `/api/alertes`
- Requête SQL : `SELECT * FROM variantes WHERE quantite_actuelle <= seuil_alerte`
- Inclure les infos du produit parent (nom, marque) et de la catégorie
- Trier par (quantite_actuelle / seuil_alerte) croissant (le plus critique en premier)
- Retourner aussi les variantes à `quantite_actuelle = 0` (Out of Stock) séparément

### TASK-071 — Endpoint GET `/api/alertes/count`
- Retourner simplement le nombre d'alertes actives (pour le badge sur le dashboard)

---

## PHASE 9 — ASSISTANT IA (Backend Laravel + Ollama)

### TASK-080 — Installer et configurer Ollama
- Installer Ollama localement
- Télécharger un modèle instruct léger (ex : `llama3.2:3b` ou `mistral:7b-instruct`)
- Vérifier que l'API Ollama tourne sur `http://localhost:11434`

### TASK-081 — Service Laravel `OllamaService`
- Créer `app/Services/OllamaService.php`
- Méthode `ask(string $systemPrompt, string $userQuestion): string`
- Appel HTTP vers `http://localhost:11434/api/generate` avec `model`, `prompt`, `stream: false`
- Gérer les erreurs de connexion (Ollama non démarré)

### TASK-082 — Endpoint POST `/api/ia/question`
- Recevoir `{ "question": "Quels sont les t-shirts en surstock ?" }`
- **Construire le contexte SQL dynamiquement** :
  - Récupérer les données pertinentes depuis MySQL selon le type de question (stocks bas, retours, produits par catégorie, etc.)
  - Formater ces données en tableau texte
- **System prompt** : "Tu es un assistant de gestion de stock pour une boutique de vêtements. Tu as accès aux données suivantes : [données SQL]. Réponds de façon concise et propose une action concrète si pertinent."
- Envoyer la question + contexte à Ollama
- Retourner la réponse

### TASK-083 — Exemples de questions précâblées (suggestions dans l'UI)
- "Quels manteaux ont eu le plus de retours ce mois-ci ?"
- "Quels articles d'hiver sont en surstock ?"
- "Quelles tailles sont en rupture pour les t-shirts ?"
- "Résume l'activité de stock de cette semaine"

---

## PHASE 10 — FRONTEND REACT : AUTHENTIFICATION

### TASK-090 — Page de connexion `/login`
- Formulaire avec champs email et mot de passe
- Appel API POST `/api/auth/login` via Axios
- Stocker le token dans `localStorage` et les infos utilisateur dans un contexte React (`AuthContext`)
- Redirection vers `/dashboard` après succès
- Afficher les erreurs (identifiants incorrects)

### TASK-091 — AuthContext et gestion des routes protégées
- Créer `AuthContext` avec les states : `user`, `token`, `isAuthenticated`, `role`
- HOC ou composant `ProtectedRoute` qui redirige vers `/login` si non authentifié
- HOC `AdminRoute` qui affiche une page 403 si le rôle n'est pas admin
- Intercepteur Axios pour injecter automatiquement le header `Authorization: Bearer {token}`
- Intercepteur Axios pour rediriger vers `/login` si 401 reçu

### TASK-092 — Bouton déconnexion
- Appel API POST `/api/auth/logout`
- Vider le localStorage et l'AuthContext
- Redirection vers `/login`

---

## PHASE 11 — FRONTEND REACT : LAYOUT & NAVIGATION

### TASK-100 — Layout principal (sidebar + topbar)
Reproduire la maquette "StockFlow B2B" avec :
- Sidebar gauche avec liens : Dashboard, Inventory, Orders, Suppliers, Reports
- Topbar avec barre de recherche, icône notifications (badge alertes), icône paramètres, avatar utilisateur
- Indicateur de "Storage Limit" en bas de sidebar
- Layout responsive (sidebar rétractable sur mobile)

### TASK-101 — Composant `StatusBadge`
- Composant réutilisable pour afficher le statut d'une variante
- "In Stock" → badge vert
- "Low Stock" → badge orange
- "Near Threshold" → badge jaune
- "Out of Stock" → badge rouge

---

## PHASE 12 — FRONTEND REACT : DASHBOARD

### TASK-110 — Page Dashboard `/dashboard`
Reproduire la maquette avec :
- 3 KPI cards en haut : "Total Items", "Low Stock Alerts" (avec compteur), "Monthly Movement"
- Tableau "Inventory Overview" : colonnes PRODUCT NAME, SIZE/COLOR, CURRENT STOCK, THRESHOLD, STATUS + icône actions (⋮)
- Bouton "+ New Item" → ouvre modal de création produit
- Bouton "Filter" → dropdown de filtres

### TASK-111 — Section "Priority Alerts" (sidebar droite du dashboard)
- Récupérer les alertes via GET `/api/alertes`
- Afficher les alertes critiques avec nom produit, taille/couleur, stock actuel
- Pour chaque alerte : bouton "Order Now" et bouton "Dismiss"
- Badge "4 New" sur le titre (compteur dynamique)

### TASK-112 — Chargement des données du dashboard
- Appels API parallèles au chargement : `/api/produits`, `/api/alertes/count`, mouvements du mois
- Skeleton loading pendant le chargement
- Actualisation automatique toutes les 60 secondes (polling ou WebSocket si possible)

---

## PHASE 13 — FRONTEND REACT : PAGE PRODUIT

### TASK-120 — Page liste des produits `/inventory`
- Tableau paginé de tous les produits
- Colonnes : Nom, Catégorie, Marque, Variantes (count), Prix, Actions
- Barre de recherche et filtres (catégorie, marque)
- Bouton "+ New Item"

### TASK-121 — Page détail produit `/inventory/:id`
Reproduire la maquette "Product Details & Variant Management" avec :
- En-tête : Nom produit (ex: "Winter Parka"), SKU parent, Collection, Prix de base
- 3 KPI cards : Total Stock, Active Variants (nb de combinaisons), Monthly Sales
- Bouton "Edit Product" → modal d'édition
- Bouton "Stock Movement" (dropdown : ENTREE / SORTIE / RETOUR_CLIENT) → ouvre modal mouvement
- Tableau des variantes : colonnes SKU, COLOR (pastille colorée), SIZE, STATUS (badge), STOCK LEVEL, COMMITMENT (en attente), ACTIONS (⋯)
- Pagination du tableau des variantes
- Section "Material & Care" (données textuelles)
- Section "Supplier Information" avec bouton "Contact Supplier"

### TASK-122 — Modal "Add Variant"
- Champs : Taille, Couleur (color picker ou input), Code-barres (auto-généré ou manuel), Quantité initiale, Seuil d'alerte
- Validation front + appel POST `/api/produits/{id}/variantes`
- Afficher un toast de succès et rafraîchir le tableau des variantes

### TASK-123 — Modal "Stock Movement"
- Sélecteur type : ENTREE / SORTIE / RETOUR_CLIENT
- Champ quantité (int, > 0)
- Champ motif (texte libre, facultatif)
- Pour SORTIE : afficher le stock actuel et avertir si quantité > stock disponible
- Appel POST `/api/mouvements`
- Mettre à jour le stock affiché en temps réel après confirmation

### TASK-124 — Modal "Edit Product"
- Champs préremplis : nom, description, marque, prix, catégorie (select), fournisseur (select)
- Appel PUT `/api/produits/{id}`

---

## PHASE 14 — FRONTEND REACT : CATÉGORIES & FOURNISSEURS

### TASK-130 — Page Fournisseurs `/suppliers`
- Tableau listant tous les fournisseurs (nom, email, téléphone)
- Bouton "Add Supplier" → modal création
- Actions sur chaque ligne : Edit, Delete (avec confirmation)

### TASK-131 — Page Catégories (intégrée dans les paramètres ou dans la sidebar)
- Affichage en arborescence (tree view)
- Possibilité d'ajouter une catégorie racine ou une sous-catégorie
- Actions : renommer, supprimer (avec vérification si produits liés)

---

## PHASE 15 — FRONTEND REACT : ASSISTANT IA

### TASK-140 — Page Assistant IA `/ai-assistant`
Reproduire la maquette "AI Local Assistant Panel" avec :
- Header : "AI Inventory Assistant" + badge "ONLINE" (ou "OFFLINE" si Ollama non dispo)
- Zone de chat scrollable (messages utilisateur à droite, réponses IA à gauche)
- Champ de saisie en bas avec bouton d'envoi
- Boutons de suggestions rapides (ex : "Restock analysis", "Track shipments", "Overdue orders")
- Bouton "New Analysis"
- Bouton "History" (liste des questions précédentes)

### TASK-141 — Logique de chat IA
- Appel POST `/api/ia/question` à l'envoi du message
- Afficher un indicateur de chargement ("IA réfléchit...")
- Afficher la réponse IA avec formatage markdown basique
- Si la réponse contient une liste de produits, afficher des cards produits cliquables
- Bouton "Generate Purchase Order" si l'IA détecte des articles à réapprovisionner

---

## PHASE 16 — FRONTEND REACT : HISTORIQUE DES MOUVEMENTS

### TASK-150 — Page historique des mouvements `/orders`
- Tableau paginé des mouvements de stock
- Colonnes : Date, Produit/Variante (SKU, taille, couleur), Type (badge coloré), Quantité, Motif, Utilisateur
- Filtres : Type (ENTREE/SORTIE/RETOUR_CLIENT), Date début/fin, Produit
- Export CSV (bonus)

---

## PHASE 17 — SÉCURITÉ & QUALITÉ

### TASK-160 — Hashage des mots de passe
- Vérifier que tous les mots de passe sont hashés avec `bcrypt` via `Hash::make()` dans Laravel
- Ne jamais stocker ou retourner les mots de passe en clair

### TASK-161 — Validation des inputs (Backend)
- Utiliser les `FormRequest` Laravel pour chaque endpoint
- Valider les types, longueurs, unicité (code_barre), existence FK
- Retourner des erreurs 422 avec messages de validation structurés

### TASK-162 — Transactions SQL pour les mouvements
- Encapsuler chaque mouvement de stock dans une transaction :
  ```php
  DB::transaction(function () { ... });
  ```
- En cas d'erreur, rollback automatique pour éviter incohérence stock

### TASK-163 — Contrôle d'accès par rôle
- Routes admin uniquement : création/modification/suppression produits, catégories, fournisseurs
- Routes employé : consultation stocks, enregistrement mouvements
- Tester les deux rôles avec les seeders

### TASK-164 — Gestion des erreurs Front
- Page 404 pour les routes inconnues
- Page 403 pour les accès non autorisés
- Toast notifications pour succès/erreurs des appels API

---

## PHASE 18 — TESTS

### TASK-170 — Tests des endpoints critiques (PHPUnit / Laravel)
- Test POST `/api/auth/login` : succès, mauvais mot de passe, email inexistant
- Test POST `/api/mouvements` : ENTREE, SORTIE, RETOUR_CLIENT, SORTIE avec stock insuffisant
- Test GET `/api/alertes` : vérifier que seules les variantes sous seuil apparaissent
- Test contrôle des rôles : un employé ne peut pas créer un produit (doit recevoir 403)

### TASK-171 — Tests des transactions SQL
- Simuler une erreur pendant un mouvement de stock et vérifier que le stock n'a pas été modifié

---

## PHASE 19 — REQUÊTES SQL MÉTIER (À IMPLÉMENTER DANS LES SERVICES)

### TASK-180 — Requête : Variantes en rupture imminente
```sql
SELECT v.*, p.nom as produit_nom, p.marque
FROM variantes v
JOIN produits p ON p.id = v.produit_id
WHERE v.quantite_actuelle <= v.seuil_alerte
ORDER BY (v.quantite_actuelle / v.seuil_alerte) ASC;
```

### TASK-181 — Requête : Historique des retours clients (trié par date)
```sql
SELECT m.*, v.taille, v.couleur, v.code_barre, p.nom as produit_nom
FROM mouvements_stock m
JOIN variantes v ON v.id = m.variante_id
JOIN produits p ON p.id = v.produit_id
WHERE m.type = 'RETOUR_CLIENT'
ORDER BY m.date DESC;
```

### TASK-182 — Requête : Produits en surstock (pour l'IA)
```sql
SELECT v.*, p.nom as produit_nom
FROM variantes v
JOIN produits p ON p.id = v.produit_id
WHERE v.quantite_actuelle > (v.seuil_alerte * 3)
ORDER BY v.quantite_actuelle DESC;
```

### TASK-183 — Requête : Mouvements du mois courant (pour KPI dashboard)
```sql
SELECT SUM(quantite) as total_entrees
FROM mouvements_stock
WHERE type = 'ENTREE'
AND MONTH(date) = MONTH(NOW())
AND YEAR(date) = YEAR(NOW());
```

---

## RÉCAPITULATIF DES FICHIERS À CRÉER

### Backend Laravel
```
app/
  Http/
    Controllers/
      AuthController.php
      ProduitController.php
      VarianteController.php
      CategorieController.php
      FournisseurController.php
      MouvementStockController.php
      AlerteController.php
      IaController.php
    Middleware/
      CheckRole.php
    Requests/
      LoginRequest.php
      ProduitRequest.php
      VarianteRequest.php
      MouvementRequest.php
  Models/
    User.php (Utilisateur)
    Produit.php
    Variante.php
    Categorie.php
    Fournisseur.php
    MouvementStock.php
    Approvisionnement.php
  Services/
    OllamaService.php
    StockService.php
database/
  migrations/
    create_utilisateurs_table.php
    create_categories_table.php
    create_fournisseurs_table.php
    create_produits_table.php
    create_variantes_table.php
    create_mouvements_stock_table.php
    create_approvisionnements_table.php
  seeders/
    DatabaseSeeder.php
    UtilisateurSeeder.php
    CategorieSeeder.php
    FournisseurSeeder.php
    ProduitSeeder.php
    MouvementSeeder.php
routes/
  api.php
```

### Frontend React
```
src/
  context/
    AuthContext.jsx
  services/
    api.js (instance Axios configurée)
    authService.js
    produitService.js
    mouvementService.js
    alerteService.js
    iaService.js
  components/
    Layout/
      Sidebar.jsx
      Topbar.jsx
    UI/
      StatusBadge.jsx
      SkeletonLoader.jsx
      Toast.jsx
      Modal.jsx
    Dashboard/
      KpiCard.jsx
      InventoryTable.jsx
      PriorityAlerts.jsx
    Produit/
      VariantTable.jsx
      AddVariantModal.jsx
      StockMovementModal.jsx
      EditProductModal.jsx
    IA/
      ChatMessage.jsx
      SuggestionChips.jsx
  pages/
    Login.jsx
    Dashboard.jsx
    Inventory.jsx
    ProductDetail.jsx
    Suppliers.jsx
    Categories.jsx
    Orders.jsx
    AiAssistant.jsx
    NotFound.jsx
    Forbidden.jsx
  App.jsx (routes React Router)
  main.jsx
```

---

## ORDRE DE DÉVELOPPEMENT RECOMMANDÉ (SPRINTS AGILES)

**Sprint 1 (fondations)**
TASK-001 → TASK-003 → TASK-010 à TASK-016 → TASK-017 → TASK-020 à TASK-026

**Sprint 2 (authentification + produits)**
TASK-030 à TASK-033 → TASK-040 à TASK-047 → TASK-090 à TASK-092 → TASK-100 → TASK-110 à TASK-112

**Sprint 3 (mouvements + alertes + page produit)**
TASK-050 à TASK-054 → TASK-060 à TASK-062 → TASK-070 à TASK-071 → TASK-120 à TASK-124 → TASK-150

**Sprint 4 (IA + finitions)**
TASK-080 à TASK-083 → TASK-140 à TASK-141 → TASK-130 à TASK-131 → TASK-160 à TASK-164 → TASK-170 à TASK-171
