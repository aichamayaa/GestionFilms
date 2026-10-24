import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { config } from '../config.js';
import { COURRIEL_ADMIN } from '../constantes.js';

const boiteEnvoi = [];
const TAILLE_MAX_BOITE = 200;
let transport = null;

export function smtpActif() {
  return Boolean(config.smtp.hote);
}

function obtenirTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.smtp.hote,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.utilisateur
        ? { user: config.smtp.utilisateur, pass: config.smtp.motDePasse }
        : undefined,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
    });
  }
  return transport;
}

function memoriser(entree) {
  boiteEnvoi.unshift(entree);
  if (boiteEnvoi.length > TAILLE_MAX_BOITE) {
    boiteEnvoi.length = TAILLE_MAX_BOITE;
  }
}

export async function envoyerCourriel({ destinataires, sujet, corps, expediteur, repondreA }) {
  const entree = {
    id: randomUUID(),
    date: new Date().toISOString(),
    expediteur: expediteur ?? null,
    destinataires: destinataires.map((d) => ({ nom: d.nom, courriel: d.courriel })),
    sujet,
    corps,
    statut: 'simule',
  };

  if (destinataires.length === 0) {
    return null;
  }

  if (smtpActif()) {
    try {
      await obtenirTransport().sendMail({
        from: config.smtp.expediteur,
        to: config.smtp.expediteur,
        bcc: destinataires.map((d) => d.courriel),
        replyTo: repondreA || undefined,
        subject: sujet,
        text: corps,
      });
      entree.statut = 'envoye';
    } catch (erreur) {
      entree.statut = 'echec';
      entree.erreur = erreur.message;
      console.error('Échec de l’envoi du courriel :', erreur.message);
    }
  }

  memoriser(entree);
  return entree;
}

export async function aviser(preference, sujet, corps) {
  const destinataires = await User.find({
    [`preferences.${preference}`]: { $ne: false },
    courriel: { $ne: COURRIEL_ADMIN },
  }).select('nom courriel');

  if (destinataires.length === 0) {
    return null;
  }

  const envoi = envoyerCourriel({ destinataires, sujet, corps });
  if (smtpActif()) {
    envoi.catch((erreur) => console.error(erreur));
    return null;
  }
  return envoi;
}

export function lireBoite() {
  return boiteEnvoi;
}

export function viderBoite() {
  boiteEnvoi.length = 0;
}
