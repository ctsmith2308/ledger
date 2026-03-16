// The Interface
import { useState } from 'react';
import { loginAction } from '../api';

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const execute = async (formData: FormData) => {
    setLoading(true);
    try {
      // This is the "Switch". Swap loginAction for fetch() to go SPA/Nuxt.
      const result = await loginAction(formData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}
