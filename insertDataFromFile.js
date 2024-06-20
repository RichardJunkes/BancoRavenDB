const fs = require('fs');
const { performance } = require('perf_hooks');
const { DocumentStore } = require('ravendb');
const readline = require('readline');

// Definindo a conexão com o RavenDB
const store = new DocumentStore('http://localhost:8080', 'dados2');
store.initialize();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para inserir dados
async function insertDataFromFile() {
  const data = JSON.parse(fs.readFileSync('MOCK_DATA.json', 'utf8'));
  const session = store.openSession();
  const startTime = performance.now();

  try {
    for (const item of data) {
      await session.store(item);
    }
    await session.saveChanges();
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    console.log(`Dados inseridos com sucesso em ${timeTaken.toFixed(2)} ms!`);
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  } finally {
    session.dispose();
    showMenu();
  }
}

// Função para atualizar dados
async function updateData(id, updatedData) {
  const session = store.openSession();
  const startTime = performance.now();

  try {
    const item = await session.load(id);
    if (item) {
      // Atualiza os campos existentes em vez de adicionar novos
      for (const key in updatedData) {
        if (updatedData.hasOwnProperty(key)) {
          item[key] = updatedData[key];
        }
      }
      await session.saveChanges();
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      console.log(`Dados do item com id ${id} atualizados com sucesso em ${timeTaken.toFixed(2)} ms!`);
    } else {
      console.log(`Item com id ${id} não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
  } finally {
    session.dispose();
    showMenu();
  }
}

// Função para deletar dados
async function deleteData(id) {
  const session = store.openSession();
  const startTime = performance.now();

  try {
    const item = await session.load(id);
    if (item) {
      session.delete(item);
      await session.saveChanges();
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      console.log(`Item com id ${id} deletado com sucesso em ${timeTaken.toFixed(2)} ms!`);
    } else {
      console.log(`Item com id ${id} não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao deletar dados:', error);
  } finally {
    session.dispose();
    showMenu();
  }
}

// Função para consultar dados por ID
async function queryDataById(id) {
  const session = store.openSession();
  const startTime = performance.now();

  try {
    const item = await session.load(id);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    if (item) {
      console.log(`Resultados da consulta em ${timeTaken.toFixed(2)} ms:`, item);
    } else {
      console.log(`Item com id ${id} não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao consultar dados:', error);
  } finally {
    session.dispose();
    showMenu();
  }
}



function showMenu() {
  console.log('\nEscolha uma opção:');
  console.log('1. Inserir dados');
  console.log('2. Consultar dados por ID');
  console.log('3. Atualizar dados');
  console.log('4. Deletar dados');
  console.log('5. Sair');

  rl.question('Opção: ', (option) => {
    switch (option) {
      case '1':
        insertDataFromFile();
        break;
      case '2':
        rl.question('ID do item para consulta: ', (id) => {
          queryDataById(id);
        });
        break;
      case '3':
        rl.question('ID do item para atualizar: ', (id) => {
          rl.question('Dados atualizados (formato JSON): ', (updatedData) => {
            updateData(id, JSON.parse(updatedData));
          });
        });
        break;
      case '4':
        rl.question('ID do item para deletar: ', (id) => {
          deleteData(id);
        });
        break;
      case '5':
        rl.close();
        break;
      default:
        console.log('Opção inválida!');
        showMenu();
        break;
    }
  });
}

showMenu();
