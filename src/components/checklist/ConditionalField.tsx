import { ReactNode } from 'react';

interface ConditionalFieldProps {
  condition: boolean;
  children: ReactNode;
}

export const ConditionalField = ({ condition, children }: ConditionalFieldProps) => {
  if (!condition) return null;
  return <div className="ml-6 mt-2 p-4 border-l-2 border-primary/20 bg-muted/30">{children}</div>;
};
