import { useEffect, type RefObject } from 'react';

/**
 * Calls `callback` when a mousedown/touchstart fires outside the given ref.
 * Adapted from Aceternity's use-outside-click — typed for strict mode and
 * narrowed to MouseEvent | TouchEvent (no `any`).
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!ref.current || !(target instanceof Node) || ref.current.contains(target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, callback]);
}
