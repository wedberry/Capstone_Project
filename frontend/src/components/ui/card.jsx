export function Card({ children, className }) {
    return <div className={`border p-4 rounded-lg shadow ${className}`}>{children}</div>;
  }
  
  export function CardHeader({ children }) {
    return <div className="font-semibold text-lg mb-2">{children}</div>;
  }
  
  export function CardContent({ children }) {
    return <div className="text-gray-600">{children}</div>;
  }
  
  export function CardTitle({ children }) {
    return <h2 className="text-xl font-bold">{children}</h2>;
  }
  