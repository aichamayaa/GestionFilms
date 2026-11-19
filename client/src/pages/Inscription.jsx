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
    setMessage(res.ok ? 'Account created! You can now sign in.' : data.message || 'Error');
  };

  return (
    <form onSubmit={envoyer}>
      <h2>Create an account</h2>
      <input placeholder="First name" value={nom} onChange={(e) => setNom(e.target.value)} required />
      <input type="email" placeholder="Email" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />
      <input type="password" placeholder="Password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
      <button type="submit">Sign up</button>
      <p>{message}</p>
    </form>
  );
}