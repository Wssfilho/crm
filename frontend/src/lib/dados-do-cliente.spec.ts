import { describe, expect, it } from 'vitest';
import { paraDadosDoCliente, paraFormulario } from './dados-do-cliente';

describe('paraFormulario', () => {
  it('should format the stored cliente for the form fields', () => {
    expect(
      paraFormulario({
        name: 'Maria Aparecida de Souza',
        cpf: '51720493391',
        nascimento: '1958-03-12T00:00:00.000Z',
        telefone: '73988880000',
        municipio: 'Itabuna-BA',
        nb: '1428870015',
        especie: '41',
        rendaEmCentavos: 151800,
      }),
    ).toEqual({
      nome: 'Maria Aparecida de Souza',
      cpf: '517.204.933-91',
      nascimento: '12/03/1958',
      telefone: '(73) 98888-0000',
      municipio: 'Itabuna-BA',
      nb: '142.887.001-5',
      especie: '41',
      renda: 'R$ 1.518,00',
    });
  });

  it('should leave missing optional fields empty', () => {
    expect(
      paraFormulario({
        name: 'João Batista',
        cpf: '219.770.334-07',
        nascimento: null,
        telefone: null,
        municipio: null,
        nb: '149.221.885-3',
        especie: null,
        rendaEmCentavos: null,
      }),
    ).toEqual(
      expect.objectContaining({
        nascimento: '',
        telefone: '',
        municipio: '',
        especie: '',
        renda: '',
      }),
    );
  });
});

describe('paraDadosDoCliente', () => {
  it('should convert the form into the API payload, with null for empty fields', () => {
    expect(
      paraDadosDoCliente({
        nome: '  Maria Aparecida de Souza ',
        cpf: '517.204.933-91',
        nascimento: '12/03/1958',
        telefone: '',
        municipio: 'Itabuna-BA',
        nb: '142.887.001-5',
        especie: '',
        renda: 'R$ 1.518,00',
      }),
    ).toEqual({
      name: 'Maria Aparecida de Souza',
      cpf: '517.204.933-91',
      nascimento: '1958-03-12',
      telefone: null,
      municipio: 'Itabuna-BA',
      nb: '142.887.001-5',
      especie: null,
      rendaEmCentavos: 151800,
    });
  });
});
