import { describe, expect, it } from 'vitest';
import { tempoRelativo } from './andamento';

const agora = new Date('2026-10-07T15:00:00');

function antes(milissegundos: number) {
  return new Date(agora.getTime() - milissegundos).toISOString();
}

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

describe('tempoRelativo', () => {
  it('should say "agora" for less than a minute', () => {
    expect(tempoRelativo(antes(30 * 1000), agora)).toBe('agora');
  });

  it('should count minutes', () => {
    expect(tempoRelativo(antes(5 * MINUTO), agora)).toBe('há 5 min');
  });

  it('should count hours', () => {
    expect(tempoRelativo(antes(3 * HORA), agora)).toBe('há 3 h');
  });

  it('should say "ontem" for one day', () => {
    expect(tempoRelativo(antes(DIA + HORA), agora)).toBe('ontem');
  });

  it('should count days up to thirty', () => {
    expect(tempoRelativo(antes(4 * DIA), agora)).toBe('há 4 dias');
  });

  it('should show the date after thirty days', () => {
    expect(tempoRelativo('2026-03-12T10:00:00', agora)).toBe('em 12/03/2026');
  });
});
