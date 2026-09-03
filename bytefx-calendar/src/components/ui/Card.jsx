export function Card({ children, className = '', ...props }) {
  return (
    <section
      className={`rounded-xl border border-line bg-surface shadow-card ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, action, className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-line px-5 py-4 ${className}`}
    >
      <h2 className="text-md font-semibold text-ink">{title}</h2>
      {action ? <div className="shrink-0 text-sm text-ink-2">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export default Card;
