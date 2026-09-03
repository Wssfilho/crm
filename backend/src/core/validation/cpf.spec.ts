import { cpfEhValido, nbEhValido } from './cpf';

describe('cpfEhValido', () => {
  it('should accept a cpf with valid check digits', () => {
    expect(cpfEhValido('529.982.247-25')).toBe(true);
    expect(cpfEhValido('52998224725')).toBe(true);
  });

  it('should reject a cpf with wrong check digits', () => {
    expect(cpfEhValido('529.982.247-24')).toBe(false);
  });

  it('should reject repeated sequences', () => {
    expect(cpfEhValido('111.111.111-11')).toBe(false);
    expect(cpfEhValido('000.000.000-00')).toBe(false);
  });

  it('should reject anything that is not eleven digits', () => {
    expect(cpfEhValido('12123123')).toBe(false);
    expect(cpfEhValido('')).toBe(false);
    expect(cpfEhValido('529.982.247-255')).toBe(false);
  });
});

describe('nbEhValido', () => {
  it('should accept ten digits', () => {
    expect(nbEhValido('128.456.789-0')).toBe(true);
    expect(nbEhValido('1284567890')).toBe(true);
  });

  it('should reject any other length', () => {
    expect(nbEhValido('12')).toBe(false);
    expect(nbEhValido('12845678901')).toBe(false);
  });
});
