# 🧪 Guide des Tests Epytogo

## Vue d'ensemble

Ce guide explique comment utiliser la suite de tests mise en place pour le projet Epytogo, plateforme de voyage sécurisée spécialisée sur l'Égypte.

## 🚀 Démarrage rapide

### Installation des dépendances
```bash
npm install
```

### Lancement des tests
```bash
# Tests unitaires
npm run test

# Tests avec surveillance
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests d'intégration
npm run test:integration

# Tous les tests
npm run test:all

# Tests de performance
npm run test:performance

# Tests Lighthouse
npm run test:lighthouse:local
```

## 📁 Structure des tests

```
src/
├── components/
│   └── __tests__/
│       ├── Welcome.test.tsx
│       └── Register.test.tsx
├── utils/
│   └── __tests__/
│       └── placeAdapter.test.ts
└── hooks/
    └── __tests__/
        └── (tests à venir)

tests/
├── integration/
│   └── auth-flow.test.tsx
└── performance/
    ├── lighthouse.config.js
    └── load-test.js
```

## 🔧 Types de tests

### 1. Tests unitaires

**Localisation**: `src/**/__tests__/`

**Objectif**: Tester des composants et fonctions individuellement

**Exemples**:
- Composant `Welcome`: Rendu et props
- Utilitaire `placeAdapter`: Transformation des données Google Places
- Validation des formulaires

**Commandes**:
```bash
npm run test                # Lancer tous les tests unitaires
npm run test:watch         # Mode surveillance
npm run test:coverage      # Avec rapport de couverture
```

### 2. Tests d'intégration

**Localisation**: `tests/integration/`

**Objectif**: Tester les interactions entre composants et services

**Exemples**:
- Flux complet d'authentification
- Intégration Google Places API
- Processus de réservation

**Commandes**:
```bash
npm run test:integration
```

### 3. Tests de performance

**Localisation**: `tests/performance/`

**Objectif**: Mesurer les performances et la scalabilité

#### Test de charge personnalisé
```bash
# Test local avec 5 utilisateurs pendant 30s
npm run test:performance

# Test personnalisé
node tests/performance/load-test.js http://localhost:3001 10 60
```

#### Tests Lighthouse
```bash
# Analyse performance locale
npm run test:lighthouse:local
```

## 📊 Configuration des seuils

### Couverture de code (jest.config.js)
- **Branches**: 70%
- **Fonctions**: 70%
- **Lignes**: 70%
- **Statements**: 70%

### Performance Lighthouse
- **Performance**: 80%
- **Accessibilité**: 90%
- **Bonnes pratiques**: 85%
- **SEO**: 90%
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s

## 🎯 Scénarios de tests spécifiques Epytogo

### Scénarios utilisateur
1. **Voyageur francophone** cherche hôtel au Caire
2. **Assistant Anubis** recommande des sites sécurisés
3. **Validation terrain** des établissements égyptiens
4. **Géolocalisation** des points d'intérêt

### APIs testées
- Google Places API (établissements Égypte)
- Google Gemini (Assistant Anubis)
- MongoDB Atlas (réservations)
- Authentification NextAuth

## 🔍 Débogage des tests

### Logs des tests
```bash
# Tests avec logs détaillés
npm run test -- --verbose

# Test d'un fichier spécifique
npm run test Welcome.test.tsx

# Tests avec pattern
npm run test -- --testNamePattern="register"
```

### Debugging en mode watch
```bash
npm run test:watch
# Appuyer sur 'a' pour lancer tous les tests
# Appuyer sur 'f' pour les tests qui ont échoué
# Appuyer sur 'p' pour filtrer par nom de fichier
```

## 🚨 Résolution des problèmes courants

### 1. Erreurs de mocks
Si les mocks Next.js ne fonctionnent pas:
```bash
# Vérifier jest.setup.js
# S'assurer que les mocks sont bien définis avant les imports
```

### 2. Tests de performance qui échouent
```bash
# Vérifier que le serveur dev tourne
npm run dev

# Puis dans un autre terminal
npm run test:performance
```

### 3. Timeout des tests
```bash
# Augmenter le timeout dans jest.config.js
testTimeout: 30000
```

## 📈 Métriques et rapports

### Couverture de code
Les rapports sont générés dans `coverage/`
```bash
npm run test:coverage
# Ouvrir coverage/lcov-report/index.html
```

### Performance
Les rapports Lighthouse sont dans `.lighthouseci/`

### Tests de charge
Les métriques incluent:
- Temps de réponse moyen
- P95 et P99 des temps de réponse
- Taux de succès/échec
- Débit (req/s)

## 🔄 Intégration CI/CD

### GitHub Actions (à configurer)
```yaml
- name: Run Tests
  run: |
    npm run test:all
    npm run test:coverage
    npm run test:lighthouse
```

### Vercel (automatique)
Les tests unitaires s'exécutent automatiquement à chaque déploiement.

## 🎨 Bonnes pratiques

### 1. Nommage des tests
```javascript
describe('Component Name', () => {
  it('should do something specific', () => {
    // Test
  })
})
```

### 2. Arrange-Act-Assert
```javascript
it('should format place data correctly', () => {
  // Arrange
  const mockPlace = { /* data */ }

  // Act
  const result = adaptPlaceForCard(mockPlace)

  // Assert
  expect(result.name).toBe('Expected Name')
})
```

### 3. Tests spécifiques à Epytogo
- Tester avec des données égyptiennes réalistes
- Inclure les cas d'usage francophones
- Valider la sécurité des données voyageurs
- Tester les scénarios de voyage typiques

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

*Guide créé pour le projet Epytogo - Plateforme de voyage sécurisée pour l'Égypte* 🏺