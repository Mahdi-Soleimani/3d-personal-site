export const film = {
  yaw: 0,
};

type Listener = (locals: Record<string, number>, page: number) => void;

const listeners = new Set<Listener>();

export function subscribeFilm(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function publishFilm(locals: Record<string, number>, page: number) {
  listeners.forEach((fn) => fn(locals, page));
}
