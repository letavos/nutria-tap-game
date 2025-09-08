// Script para testar todos os endpoints da API
// Execute no console do navegador para verificar se todos os endpoints funcionam

class ApiTester {
  constructor() {
    this.results = [];
    this.supabase = window.supabase;
  }

  async testEndpoint(name, testFunction) {
    try {
      console.log(`🧪 Testando: ${name}`);
      const result = await testFunction();
      this.results.push({ name, status: '✅ SUCESSO', result });
      console.log(`✅ ${name}: OK`);
      return result;
    } catch (error) {
      this.results.push({ name, status: '❌ ERRO', error: error.message });
      console.error(`❌ ${name}:`, error);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando testes de API...');
    
    // Teste 1: Conexão Supabase
    await this.testEndpoint('Conexão Supabase', async () => {
      const { data, error } = await this.supabase.from('users').select('count').limit(1);
      if (error) throw error;
      return data;
    });

    // Teste 2: Autenticação
    await this.testEndpoint('Auth Service', async () => {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user ? 'Usuário logado' : 'Usuário não logado';
    });

    // Teste 3: Ranking
    await this.testEndpoint('Ranking', async () => {
      const { data, error } = await this.supabase.from('ranking_view').select('*').limit(5);
      if (error) throw error;
      return data;
    });

    // Teste 4: Game Stats
    await this.testEndpoint('Game Stats', async () => {
      const { data, error } = await this.supabase.from('game_stats').select('*').limit(1);
      if (error) throw error;
      return data;
    });

    // Teste 5: User Achievements
    await this.testEndpoint('User Achievements', async () => {
      const { data, error } = await this.supabase.from('user_achievements').select('*').limit(1);
      if (error) throw error;
      return data;
    });

    // Teste 6: IndexedDB
    await this.testEndpoint('IndexedDB', async () => {
      const { default: indexedDBManager } = await import('./src/utils/IndexedDBManager.js');
      await indexedDBManager.init();
      return 'IndexedDB inicializado';
    });

    this.printResults();
  }

  printResults() {
    console.log('\n📊 RESULTADOS DOS TESTES:');
    console.log('========================');
    this.results.forEach(result => {
      console.log(`${result.status} ${result.name}`);
      if (result.error) {
        console.log(`   Erro: ${result.error}`);
      }
    });
    
    const successCount = this.results.filter(r => r.status.includes('✅')).length;
    const totalCount = this.results.length;
    
    console.log(`\n🎯 Resumo: ${successCount}/${totalCount} testes passaram`);
  }
}

// Executar testes
const tester = new ApiTester();
tester.runAllTests();
