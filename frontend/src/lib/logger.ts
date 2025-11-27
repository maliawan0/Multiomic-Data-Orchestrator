import { useAuth } from '@/context/AuthContext';

// This is a simplified logger to simulate audit trails in the browser console.
const logEvent = (action: string, details: Record<string, any> = {}) => {
  const timestamp = new Date().toISOString();
  // In a real app, we'd get the user from a secure context.
  // Here we simulate it. A hook can't be used in a non-component function,
  // so we'll grab it from localStorage for this simulation.
  const user = localStorage.getItem('mdo-user');
  const userEmail = user ? JSON.parse(user).email : 'anonymous';

  console.log(
    `[AUDIT LOG] | Timestamp: ${timestamp} | User: ${userEmail} | Action: ${action}`,
    details
  );
};

export default logEvent;