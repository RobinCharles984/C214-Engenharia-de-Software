// Utilizando o framework de testes Jest para Node.js
const axios = require('axios');

// Classe responsável por popular a página WEB (apenas a lógica de teste será implementada)
class HorarioAtendimentoPage {
  constructor(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
  }

  async carregarHorarios() {
    try {
      const response = await axios.get(this.apiEndpoint);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar horários:', error.message);
      throw error;
    }
  }

  formatarHorariosParaPagina(data) {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(item => {
      const predioIndex = Math.floor((parseInt(item.sala) - 1) / 5);
      const predio = item.predio && item.predio[predioIndex];
      return {
        nome: item.nomeDoProfessor,
        periodo: item.periodo,
        sala: item.sala,
        predio: predio || 'Prédio não encontrado'
      };
    });
  }
}

exports.HorarioAtendimentoPage = HorarioAtendimentoPage;