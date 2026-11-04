import { useState } from 'react';

export default function Inscription() {
  const [nom, setNom] = useState('');
  const [courriel, setCourriel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  const envoyer = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, courriel, motDePasse }),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Compte créé! Vous pouvez vous connecter.' : data.message || 'Erreur');
  };

  return (
    <form onSubmit={envoyer}>
      <h2>Créer un compte</h2>
      <input placeholder="Prénom" value={nom} onChange={(e) => setNom(e.target.value)} required />
      <input type="email" placeholder="Courriel" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />
      <input type="password" placeholder="Mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
      <button type="submit">S'inscrire</button>
      <p>{message}</p>
    </form>
  );
}