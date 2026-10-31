
import type { Task } from '../shared/types';

interface ViewState { q: string; status: 'all' | 'todo' | 'in_progress' | 'done'; order: string; }

const DEFAULT_STATUS: 'all' = 'all';
const DEFAULT_ORDER: 'original' = 'original';
const DEFAULT_Q: '' = '';

function parseViewState(params: URLSearchParams): ViewState {
  return {
    status: params.get('status') as 'any' ?? DEFAULT_STATUS,
    order: params.get('order') ?? DEFAULT_ORDER,
    q: params.get('q') ?? DEFAULT_Q,
  };
}

function isSame(a: ViewState, b: ViewState): boolean {
  return a.status === b.status && a.order === b.order && a.q === b.q;
}
