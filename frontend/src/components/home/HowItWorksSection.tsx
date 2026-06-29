import type { ReactNode } from 'react'
import ChatIcon from '../icons/ChatIcon'
import EnvelopeIcon from '../icons/EnvelopeIcon'
import FolderIcon from '../icons/FolderIcon'
import PackageIcon from '../icons/PackageIcon'
import './HowItWorksSection.css'

interface Step {
  number: string
  icon: ReactNode
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: <EnvelopeIcon />,
    title: 'Regístrate con tu correo',
    description:
      'Solo correos institucionales. La plataforma verifica que seas parte de una universidad suscrita.',
  },
  {
    number: '02',
    icon: <FolderIcon />,
    title: 'Publica o explora',
    description:
      'Sube los componentes que no usas o navega lo que otros tienen disponible este semestre.',
  },
  {
    number: '03',
    icon: <ChatIcon />,
    title: 'Coordina por chat',
    description:
      'Acuerda el encuentro dentro del campus con el vendedor o comprador directamente.',
  },
  {
    number: '04',
    icon: <PackageIcon />,
    title: 'Intercambia en campus',
    description:
      'Se encuentran en un punto acordado dentro de la universidad. Seguro y sin intermediarios.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="how-it-works" aria-labelledby="how-it-works-title">
      <div className="how-it-works__inner">
        <p className="how-it-works__label">Cómo funciona</p>
        <h2 id="how-it-works-title" className="how-it-works__title">
          Cuatro pasos para dar vida a tus materiales
        </h2>

        <div className="how-it-works__grid">
          {steps.map((step) => (
            <article key={step.number} className="how-it-works__card">
              <div className="how-it-works__card-header">
                <span className="how-it-works__number">{step.number}</span>
                <span className="how-it-works__icon">{step.icon}</span>
              </div>
              <h3 className="how-it-works__card-title">{step.title}</h3>
              <p className="how-it-works__card-description">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
