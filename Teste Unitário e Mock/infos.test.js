const axios = require('axios')
let HorarioAtendimentoPage = require('./infos').HorarioAtendimentoPage


// --- Testes Unitários com Jest ---

describe('HorarioAtendimentoPage', () => {
    let page;
    let mockAxiosGet;
  
    beforeEach(() => {
      page = new HorarioAtendimentoPage('http://api.exemplo.com/horarios');
      // Cria um mock para a função axios.get antes de cada teste
      mockAxiosGet = jest.spyOn(axios, 'get');
    });
  
    afterEach(() => {
      // Restaura o mock após cada teste para evitar interferência entre eles
      mockAxiosGet.mockRestore();
    });
  
    // --- Testes de Sucesso ---
    describe('Testes de Sucesso', () => {
      it('Deve carregar e formatar horario', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor A',
            periodo: 'Manhã',
            sala: '3',
            predio: ['1', '2', '3', '4', '6']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios).toEqual([{
          nome: 'Professor A',
          periodo: 'Manhã',
          sala: '3',
          predio: '1'
        }]);
      });
  
      it('Deve assinalar o prédio 1 com as salas 1-5', async () => {
        const data = Array.from({
          length: 5
        }, (_, i) => ({
          nomeDoProfessor: `Professor ${i + 1}`,
          periodo: 'Tarde',
          sala: `${i + 1}`,
          predio: ['1', '2', '3', '4', '6']
        }));
        mockAxiosGet.mockResolvedValue({
          data
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        formattedHorarios.forEach(h => expect(h.predio).toBe('1'));
      });
  
      it('Deve assinalar o prédio 2 com as salas 6-10', async () => {
        const data = Array.from({
          length: 5
        }, (_, i) => ({
          nomeDoProfessor: `Professor ${i + 6}`,
          periodo: 'Noite',
          sala: `${i + 6}`,
          predio: ['1', '2', '3', '4', '6']
        }));
        mockAxiosGet.mockResolvedValue({
          data
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        formattedHorarios.forEach(h => expect(h.predio).toBe('2'));
      });
  
      it('Deve retornar um array vazio de horários', async () => {
        mockAxiosGet.mockResolvedValue({
          data: []
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios).toEqual([]);
      });
  
      it('Deve retornar um horário sem um array do prédio', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor B',
            periodo: 'Integral',
            sala: '8'
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar uma grade de horários com prédios diferentes', async () => {
        const data = [
          { nomeDoProfessor: 'P1', periodo: 'M', sala: '2', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P2', periodo: 'T', sala: '7', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P3', periodo: 'N', sala: '12', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P4', periodo: 'M', sala: '17', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P5', periodo: 'T', sala: '22', predio: ['1', '2', '3', '4', '6'] },
        ];
        mockAxiosGet.mockResolvedValue({
          data
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios).toEqual([
          { nome: 'P1', periodo: 'M', sala: '2', predio: '1' },
          { nome: 'P2', periodo: 'T', sala: '7', predio: '2' },
          { nome: 'P3', periodo: 'N', sala: '12', predio: '3' },
          { nome: 'P4', periodo: 'M', sala: '17', predio: '4' },
          { nome: 'P5', periodo: 'T', sala: '22', predio: '6' },
        ]);
      });
  
      it('should handle salas at the boundaries of predio assignments', async () => {
        const data = [
          { nomeDoProfessor: 'P1', periodo: 'M', sala: '5', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P2', periodo: 'T', sala: '6', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P3', periodo: 'N', sala: '10', predio: ['1', '2', '3', '4', '6'] },
          { nomeDoProfessor: 'P4', periodo: 'M', sala: '11', predio: ['1', '2', '3', '4', '6'] },
        ];
        mockAxiosGet.mockResolvedValue({
          data
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios).toEqual([
          { nome: 'P1', periodo: 'M', sala: '5', predio: '1' },
          { nome: 'P2', periodo: 'T', sala: '6', predio: '2' },
          { nome: 'P3', periodo: 'N', sala: '10', predio: '2' },
          { nome: 'P4', periodo: 'M', sala: '11', predio: '3' },
        ]);
      });
  
      it('Deve retornar um horário com campos extras no json', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor C',
            periodo: 'Manhã',
            sala: '4',
            predio: ['1', '2', '3', '4', '6'],
            email: 'prof.c@inatel.br'
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios).toEqual([{
          nome: 'Professor C',
          periodo: 'Manhã',
          sala: '4',
          predio: '1'
        }]);
        // Garante que campos extras não causam erro
        expect(formattedHorarios[0].email).toBeUndefined();
      });
  
      it('Deve retornar um array de prédios com menos elementos que o esperado', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor D',
            periodo: 'Tarde',
            sala: '23',
            predio: ['1', '2']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar um array de predios com diferentes tipos de elementos', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor E',
            periodo: 'Noite',
            sala: '9',
            predio: ['1', '2', 3, '4', 'seis']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios).toEqual([{
          nome: 'Professor E',
          periodo: 'Noite',
          sala: '9',
          predio: '2'
        }]);
      });
    });
  
    // --- Testes de Falha ---
    describe('Testes de Falha', () => {
      it('Deve retornar um erro se a API request falhar', async () => {
        mockAxiosGet.mockRejectedValue(new Error('Erro de rede'));
        await expect(page.carregarHorarios()).rejects.toThrow('Erro de rede');
      });
  
      it('Deve retornar uma resposta da api com o JSON inválido', async () => {
        mockAxiosGet.mockResolvedValue({
          data: 'invalid json'
        });
        await expect(page.carregarHorarios()).rejects.toThrow(SyntaxError);
      });
  
      it('Deve retornar um array vazio se formatarHorariosForPagina receber null', () => {
        const formattedHorarios = page.formatarHorariosParaPagina(null);
        expect(formattedHorarios).toEqual([]);
      });
  
      it('Deve retornar um array vazio se formatarHorariosForPagina receber undefined', () => {
        const formattedHorarios = page.formatarHorariosParaPagina(undefined);
        expect(formattedHorarios).toEqual([]);
      });
  
      it('Deve retornar um horário sem uma sala', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor F',
            periodo: 'Manhã',
            predio: ['1', '2', '3', '4', '6']
          }]
        });
        const horarios = await page.carregarHorarios();
        // formatarHorariosForPagina deve lidar com a falta de 'sala' sem quebrar
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar um horário com uma sala não numérica', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor G',
            periodo: 'Tarde',
            sala: 'abc',
            predio: ['1', '2', '3', '4', '6']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar um horario se a sala for 0 ou um número negativo', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor H',
            periodo: 'Noite',
            sala: '0',
            predio: ['1', '2', '3', '4', '6']
          }, {
            nomeDoProfessor: 'Professor I',
            periodo: 'Manhã',
            sala: '-1',
            predio: ['1', '2', '3', '4', '6']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
        expect(formattedHorarios[1].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar um horário com um valor alto de sala além do array', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor J',
            periodo: 'Tarde',
            sala: '100',
            predio: ['1', '2', '3', '4', '6']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar um horário quando o array de predios está vazio', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor K',
            periodo: 'Noite',
            sala: '3',
            predio: []
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
  
      it('Deve retornar um horario quando a sala é uma string que pode ser passada como nan', async () => {
        mockAxiosGet.mockResolvedValue({
          data: [{
            nomeDoProfessor: 'Professor L',
            periodo: 'Manhã',
            sala: 'texto',
            predio: ['1', '2', '3', '4', '6']
          }]
        });
        const horarios = await page.carregarHorarios();
        const formattedHorarios = page.formatarHorariosParaPagina(horarios);
        expect(formattedHorarios[0].predio).toBe('Prédio não encontrado');
      });
    });
  });