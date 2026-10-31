export default function Panel({ titulo, descripcion, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panelCabecera">
        <h2>{titulo}</h2>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}
