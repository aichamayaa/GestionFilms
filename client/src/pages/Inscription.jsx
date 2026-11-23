import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import SelecteurLangue from '../components/SelecteurLangue.jsx';
import { langueCourante } from '../i18n/index.js';

export default function Inscription() {
  const { t } = useTranslation();
  const [nom, setNom] = useState('');
  const [courriel, setCourriel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  const envoyer = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': langueCourante() },
      body: JSON.stringify({ nom, courriel, motDePasse }),
    });
    const data = await res.json();
    setMessage(res.ok ? t('register.success') : data.message || t('register.error'));
  };

  return (
    <form onSubmit={envoyer}>
      <SelecteurLangue />
      <h2>{t('register.title')}</h2>
      <input placeholder={t('register.firstName')} value={nom} onChange={(e) => setNom(e.target.value)} required />
      <input type="email" placeholder={t('register.email')} value={courriel} onChange={(e) => setCourriel(e.target.value)} required />
      <input type="password" placeholder={t('register.password')} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
      <button type="submit">{t('register.submit')}</button>
      <p>{message}</p>
      <p>
        {t('register.haveAccount')} <Link to="/connexion">{t('login.signIn')}</Link>
      </p>
    </form>
  );
}
