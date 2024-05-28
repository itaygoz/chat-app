import { produce } from 'immer';
import { useEffect } from 'react';
import { create } from 'zustand';
import { socket } from '../../socket/config';

type ErrorStore = {
  errors: { [key: string]: { messages: string[]; status: number } };
  resetErrors: (path: string) => void;
  getErrors: (path: string) => { messages: string[]; status: number } | undefined;
  setErrors: (path: string, messages: string[], status: number) => void;
};

export const useErrorStore = create<ErrorStore>((set, get) => ({
  errors: {},
  getErrors: (path: string) => get().errors[path],
  resetErrors: (path: string) =>
    set(
      produce((state) => {
        void (state.errors[path] = undefined);
      })
    ),
  setErrors: (path, messages, status) =>
    set(produce((state) => void (state.errors[path] = { messages, status })))
}));

export const useErrorsState = (path: string) => {
  return useErrorStore((state) => ({
    errors: state.getErrors(path),
    resetErrors: () => state.resetErrors(path)
  }));
};

export const useErrors = () => {
  const { setErrors } = useErrorStore();

  useEffect(() => {
    socket.on(
      'error',
      ({ path, error, status }: { path: string; error: { message: string[] }; status: number }) => {
        console.log(`Error: path: ${path}, status: ${status}, error: ${error.message}`);
        setErrors(path, error.message, status);
      }
    );
    return () => {
      socket.off('error');
    };
  }, [setErrors]);
};
