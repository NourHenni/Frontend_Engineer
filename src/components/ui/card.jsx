// src/components/ui/card.jsx
export const Card = ({ children }) => (
  <div className="border rounded-lg p-4 shadow-sm bg-background">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);