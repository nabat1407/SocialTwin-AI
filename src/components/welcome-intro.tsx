'use client';

import { ArrowRight, FileCheck2, Fingerprint, Play, Search, ShieldCheck } from 'lucide-react';
import { PilotMark } from './pilot-mark';

export function WelcomeIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="welcome-intro no-print" aria-labelledby="welcome-title">
      <div className="welcome-grid" aria-hidden="true" />
      <div className="welcome-copy">
        <span className="welcome-overline">
          <span /> SƏNİN NÖVBƏTİ ADDIMIN
        </span>
        <div className="welcome-brand">
          <PilotMark size={38} />
          <span>SocialTwin AI</span>
        </div>
        <h1 id="welcome-title">
          Smart Life,
          <br />
          <em>Smart Opportunities.</em>
        </h1>
        <p>
          Təcrübən bir başlanğıcdır. Onu güclü profilə, uyğun imkanlara və peşəkar müraciətə çevir.
        </p>
        <button className="button welcome-cta" onClick={onStart}>
          Öz yolunu başlat <ArrowRight size={20} />
        </button>
        <span className="welcome-promise">
          <ShieldCheck size={16} /> Hər addımda söz səndədir.
        </span>
      </div>
      <div className="welcome-story" aria-label="Profil, imkan və sənəd hazırlığının təqdimatı">
        <div className="story-caption">
          <Play size={12} fill="currentColor" /> BİR FİKİRDƏN MÜRACİƏTƏ
        </div>
        <div className="intro-orbit" aria-hidden="true">
          <span />
          <span />
          <div>
            <PilotMark size={60} />
          </div>
        </div>
        <div className="intro-scene scene-profile">
          <span className="scene-icon">
            <Fingerprint size={24} />
          </span>
          <div>
            <small>01 · TANIT</small>
            <strong>Sənin hekayən</strong>
            <p>Biliklərin. Layihələrin. Hədəfin.</p>
          </div>
          <span className="scene-line" />
        </div>
        <div className="intro-scene scene-opportunity">
          <span className="scene-icon">
            <Search size={24} />
          </span>
          <div>
            <small>02 · KƏŞF ET</small>
            <strong>Yeni bir imkan</strong>
            <p>Doğrulanmış elanlar, aydın tələblər.</p>
          </div>
          <span className="scene-line" />
        </div>
        <div className="intro-scene scene-document">
          <span className="scene-icon">
            <FileCheck2 size={24} />
          </span>
          <div>
            <small>03 · HAZIRLA</small>
            <strong>İlk təəssüratın</strong>
            <p>CV, məktub və konkret hazırlıq planı.</p>
          </div>
          <span className="scene-line" />
        </div>
        <span className="story-footnote">Təcrübədən imkanlara. Addım-addım.</span>
      </div>
      <div className="welcome-bottom">
        <span>Özünü tanı</span>
        <span>İmkanını seç</span>
        <span>Hazır müraciət et</span>
      </div>
    </section>
  );
}
