import { Link } from 'react-router-dom'
import bannerImage from '../assets/banner.png'
import HowItWorksSection from '../components/home/HowItWorksSection'
import ArrowRightIcon from '../components/icons/ArrowRightIcon'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-header__brand">
          Re-Pensa <span className="home-header__brand-accent">Tech</span>
        </Link>
        <nav className="home-header__nav" aria-label="Navegación principal">
          <Link to="/login" className="home-header__link">
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <section className="home-hero" aria-label="Banner principal">
        <div className="home-hero__content">
          <h2 className="home-hero__title">
            El hardware que sobró tiene
            <br />
            <span className="home-hero__title-accent">nuevo dueño</span>
          </h2>

          <p className="home-hero__description">
            Compra, vende o dona los componentes electrónicos que usaste este
            semestre. Arduino, sensores, memorias, pantallas LCD — todo dentro
            de tu universidad, con tu correo institucional.
          </p>

          <div className="home-hero__actions">
            <Link
              to="/register"
              className="home-hero__button home-hero__button--primary"
            >
              Regístrate gratis
              <ArrowRightIcon />
            </Link>
            <Link
              to="/login"
              className="home-hero__button home-hero__button--secondary"
            >
              Iniciar sesión
              <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <div className="home-hero__visual">
          <img
            src={bannerImage}
            alt="Componentes electrónicos universitarios: Arduino, sensores y pantallas LCD"
            className="home-hero__image"
          />
        </div>
      </section>

      <HowItWorksSection />
    </div>
  )
}
