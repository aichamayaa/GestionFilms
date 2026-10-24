export function Champ({ id, libelle, erreur, aide, requis = false, children }) {
  return (
    <div className={erreur ? 'champ champ-erreur' : 'champ'}>
      <label htmlFor={id}>
        {libelle}
        {requis && (
          <span className="requis" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {aide && !erreur && <small className="aide">{aide}</small>}
      {erreur && (
        <p className="message-erreur" id={`${id}-erreur`} role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}

export function Groupe({ libelle, erreur, aide, children }) {
  return (
    <fieldset className={erreur ? 'groupe champ-erreur' : 'groupe'}>
      <legend>{libelle}</legend>
      {children}
      {aide && !erreur && <small className="aide">{aide}</small>}
      {erreur && (
        <p className="message-erreur" role="alert">
          {erreur}
        </p>
      )}
    </fieldset>
  );
}

export function CaseACocher({ id, libelle, coche, onChange, desactive = false, aide }) {
  return (
    <label className="case" htmlFor={id} title={aide}>
      <input id={id} type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} disabled={desactive} />
      <span>{libelle}</span>
    </label>
  );
}
