const http = require('http')
const https = require('https')

class LoadTester {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl
    this.options = {
      concurrentUsers: options.concurrentUsers || 10,
      duration: options.duration || 60, // secondes
      rampUp: options.rampUp || 10, // secondes pour atteindre max users
      ...options
    }
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
      statusCodes: {},
      errors: []
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const url = new URL(endpoint, this.baseUrl)
      const isHttps = url.protocol === 'https:'
      const client = isHttps ? https : http

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'User-Agent': 'Epytogo-LoadTest/1.0',
          'Accept': 'text/html,application/json,*/*',
          'Connection': 'keep-alive'
        }
      }

      if (data && method === 'POST') {
        options.headers['Content-Type'] = 'application/json'
        options.headers['Content-Length'] = Buffer.byteLength(data)
      }

      const req = client.request(options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          const endTime = Date.now()
          const responseTime = endTime - startTime

          this.results.totalRequests++
          this.results.responseTimes.push(responseTime)

          // Mise à jour des métriques
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.results.successfulRequests++
          } else {
            this.results.failedRequests++
          }

          this.results.statusCodes[res.statusCode] =
            (this.results.statusCodes[res.statusCode] || 0) + 1

          this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime)
          this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime)

          resolve({
            statusCode: res.statusCode,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: responseData.substring(0, 100) // Limit data for memory
          })
        })
      })

      req.on('error', (error) => {
        this.results.totalRequests++
        this.results.failedRequests++
        this.results.errors.push(error.message)

        resolve({
          statusCode: 0,
          responseTime: Date.now() - startTime,
          success: false,
          error: error.message
        })
      })

      if (data && method === 'POST') {
        req.write(data)
      }

      req.end()
    })
  }

  async runScenario() {
    const scenarios = [
      // Scénario 1: Navigation basique
      async () => {
        return await this.makeRequest('/')
      },
      // Scénario 2: Recherche d'hôtels en Égypte
      async () => {
        return await this.makeRequest('/search?location=cairo&type=hotel')
      },
      // Scénario 3: Page de détails
      async () => {
        return await this.makeRequest('/place/sample-hotel-cairo')
      },
      // Scénario 4: API de géolocalisation
      async () => {
        return await this.makeRequest('/api/places/nearby?lat=30.0444&lng=31.2357')
      },
      // Scénario 5: Assistant Anubis
      async () => {
        const data = JSON.stringify({
          message: "Recommande-moi un hôtel au Caire",
          context: "egypt_travel"
        })
        return await this.makeRequest('/api/chat/anubis', 'POST', data)
      }
    ]

    // Choisir un scénario aléatoire
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    return await randomScenario()
  }

  async simulateUser(userId, duration) {
    const endTime = Date.now() + (duration * 1000)
    const userResults = []

    console.log(`👤 Utilisateur ${userId} démarré`)

    while (Date.now() < endTime) {
      try {
        const result = await this.runScenario()
        userResults.push(result)

        // Pause entre les requêtes (simulation comportement utilisateur)
        const pauseDuration = Math.random() * 3000 + 1000 // 1-4 secondes
        await new Promise(resolve => setTimeout(resolve, pauseDuration))

      } catch (error) {
        this.results.errors.push(`User ${userId}: ${error.message}`)
      }
    }

    console.log(`✅ Utilisateur ${userId} terminé (${userResults.length} requêtes)`)
    return userResults
  }

  async run() {
    console.log('🚀 Démarrage du test de charge Epytogo')
    console.log(`📊 Configuration:`)
    console.log(`   - URL: ${this.baseUrl}`)
    console.log(`   - Utilisateurs simultanés: ${this.options.concurrentUsers}`)
    console.log(`   - Durée: ${this.options.duration}s`)
    console.log(`   - Montée en charge: ${this.options.rampUp}s`)

    const startTime = Date.now()
    const userPromises = []

    // Montée en charge progressive
    for (let i = 0; i < this.options.concurrentUsers; i++) {
      const delay = (i * this.options.rampUp * 1000) / this.options.concurrentUsers

      setTimeout(() => {
        const userPromise = this.simulateUser(i + 1, this.options.duration)
        userPromises.push(userPromise)
      }, delay)
    }

    // Attendre que tous les utilisateurs terminent
    setTimeout(async () => {
      await Promise.all(userPromises)
      this.generateReport(startTime)
    }, (this.options.rampUp + this.options.duration) * 1000)
  }

  generateReport(startTime) {
    const totalDuration = (Date.now() - startTime) / 1000

    // Calcul des métriques
    this.results.averageResponseTime =
      this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length || 0

    const sortedTimes = this.results.responseTimes.sort((a, b) => a - b)
    const p95Index = Math.ceil(0.95 * sortedTimes.length) - 1
    const p99Index = Math.ceil(0.99 * sortedTimes.length) - 1

    console.log('\n📈 RAPPORT DE PERFORMANCE EPYTOGO')
    console.log('='.repeat(50))
    console.log(`🕒 Durée totale: ${totalDuration.toFixed(2)}s`)
    console.log(`📨 Total requêtes: ${this.results.totalRequests}`)
    console.log(`✅ Succès: ${this.results.successfulRequests} (${(this.results.successfulRequests / this.results.totalRequests * 100).toFixed(1)}%)`)
    console.log(`❌ Échecs: ${this.results.failedRequests} (${(this.results.failedRequests / this.results.totalRequests * 100).toFixed(1)}%)`)
    console.log(`⚡ Débit: ${(this.results.totalRequests / totalDuration).toFixed(2)} req/s`)

    console.log('\n⏱️  TEMPS DE RÉPONSE')
    console.log(`   Moyenne: ${this.results.averageResponseTime.toFixed(0)}ms`)
    console.log(`   Minimum: ${this.results.minResponseTime}ms`)
    console.log(`   Maximum: ${this.results.maxResponseTime}ms`)
    if (sortedTimes.length > 0) {
      console.log(`   P95: ${sortedTimes[p95Index] || 0}ms`)
      console.log(`   P99: ${sortedTimes[p99Index] || 0}ms`)
    }

    console.log('\n📊 CODES DE STATUT')
    Object.entries(this.results.statusCodes).forEach(([code, count]) => {
      console.log(`   ${code}: ${count}`)
    })

    if (this.results.errors.length > 0) {
      console.log('\n❗ ERREURS')
      const uniqueErrors = [...new Set(this.results.errors.slice(0, 10))]
      uniqueErrors.forEach(error => console.log(`   - ${error}`))
      if (this.results.errors.length > 10) {
        console.log(`   ... et ${this.results.errors.length - 10} autres erreurs`)
      }
    }

    // Évaluation de la performance
    console.log('\n🎯 ÉVALUATION')
    const avgResponseTime = this.results.averageResponseTime
    const successRate = this.results.successfulRequests / this.results.totalRequests

    if (avgResponseTime < 2000 && successRate > 0.95) {
      console.log('🟢 EXCELLENT: Performance optimale pour Epytogo')
    } else if (avgResponseTime < 3000 && successRate > 0.90) {
      console.log('🟡 BON: Performance acceptable')
    } else {
      console.log('🔴 ATTENTION: Optimisations nécessaires')
    }

    console.log('\n💡 RECOMMANDATIONS EPYTOGO')
    if (avgResponseTime > 2000) {
      console.log('   - Optimiser les requêtes Google Places API')
      console.log('   - Implémenter la mise en cache pour les données Égypte')
      console.log('   - Configurer le CDN Cloudflare')
    }
    if (successRate < 0.95) {
      console.log('   - Vérifier la stabilité de MongoDB Atlas')
      console.log('   - Implémenter la gestion des timeouts')
      console.log('   - Ajouter des retry mechanisms')
    }
  }
}

// Utilisation
if (require.main === module) {
  const args = process.argv.slice(2)
  const baseUrl = args[0] || 'http://localhost:3001'
  const concurrentUsers = parseInt(args[1]) || 5
  const duration = parseInt(args[2]) || 30

  const tester = new LoadTester(baseUrl, {
    concurrentUsers,
    duration,
    rampUp: 5
  })

  tester.run().catch(console.error)
}

module.exports = LoadTester