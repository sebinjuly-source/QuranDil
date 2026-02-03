/**
 * Tajweed Colors - Standard Tajweed color mapping
 */

export interface TajweedRule {
  name: string;
  color: string;
  description: string;
}

export const tajweedColors: Record<string, TajweedRule> = {
  ghunnah: {
    name: 'Ghunnah',
    color: '#b39ddb',
    description: 'Nasalization'
  },
  idgham: {
    name: 'Idgham',
    color: '#ffb74d',
    description: 'Merging'
  },
  ikhfa: {
    name: 'Ikhfa',
    color: '#90caf9',
    description: 'Concealing'
  },
  iqlab: {
    name: 'Iqlab',
    color: '#a5d6a7',
    description: 'Converting'
  },
  madd: {
    name: 'Madd',
    color: '#ef5350',
    description: 'Prolongation'
  },
  qalqalah: {
    name: 'Qalqalah',
    color: '#26c6da',
    description: 'Echoing'
  },
  slnt: {
    name: 'Silent',
    color: '#bdbdbd',
    description: 'Silent letter'
  }
};

export function getTajweedColor(ruleName: string): string {
  return tajweedColors[ruleName]?.color || '#000000';
}
