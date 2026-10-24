import { useState } from 'react';
export function useMobileMenu() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggle = () => setMobileMenu(v => !v);
  const close = () => setMobileMenu(false);
  return { mobileMenu, toggle, close };
}
