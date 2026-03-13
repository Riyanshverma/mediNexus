import { useState, useEffect } from 'react';
import { useBookingStore } from '../store/bookingStore';

export const useBookingCountdown = () => {
  const { lockedUntil, clearBooking } = useBookingStore();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lockedUntil) {
      setSecondsRemaining(0);
      return;
    }

    // Initial check
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((lockedUntil - now) / 1000));
    setSecondsRemaining(remaining);

    if (remaining <= 0) {
      clearBooking();
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lockedUntil - now) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        clearBooking();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lockedUntil, clearBooking]);

  return { secondsRemaining };
};
