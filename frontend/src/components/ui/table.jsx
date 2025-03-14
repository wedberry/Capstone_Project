export function Table({ children, className = "" }) {
    return (
      <div className="overflow-x-auto">
        <table className={`${className}`}>
          {children}
        </table>
      </div>
    );
  }
  
  export function TableHead({ children, className = "" }) {
    return (
      <thead className={`${className}`}>
        {children}
      </thead>
    );
  }
  
  export function TableBody({ children, className = "" }) {
    return <tbody className={className}>{children}</tbody>;
  }
  
  export function TableRow({ children, className = "" }) {
    return (
      <tr className={`${className}`}>
        {children}
      </tr>
    );
  }
  
  export function TableCell({ children, header = false, className = "" }) {
    return header ? (
      <th className={`${className}`}>
        {children}
      </th>
    ) : (
      <td className={`${className}`}>{children}</td>
    );
  }