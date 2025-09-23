import { render, screen } from '@testing-library/react'
import { Welcome } from '../Welcome'

describe('Welcome Component', () => {
  const mockProps = {
    title: 'Bienvenue à Epytogo',
    description: 'Votre plateforme de voyage sécurisée pour l\'Égypte'
  }

  it('renders the title correctly', () => {
    render(<Welcome {...mockProps} />)

    const title = screen.getByRole('heading', { name: mockProps.title })
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('scroll-m-20', 'text-4xl', 'font-extrabold', 'tracking-tight', 'lg:text-5xl')
  })

  it('renders the description correctly', () => {
    render(<Welcome {...mockProps} />)

    const description = screen.getByText(mockProps.description)
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('mt-6', 'text-2xl', 'leading-7')
  })

  it('applies the correct container classes', () => {
    const { container } = render(<Welcome {...mockProps} />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'w-4/6', 'flex-col', 'gap-4', 'text-center', 'text-white')
  })

  it('handles empty strings gracefully', () => {
    render(<Welcome title="" description="" />)

    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByRole('heading')).toHaveTextContent('')
  })

  it('handles long content correctly', () => {
    const longProps = {
      title: 'Un très long titre pour tester la responsivité et l\'affichage',
      description: 'Une très longue description pour vérifier que le composant peut gérer du contenu étendu sans problème de mise en page'
    }

    render(<Welcome {...longProps} />)

    expect(screen.getByRole('heading', { name: longProps.title })).toBeInTheDocument()
    expect(screen.getByText(longProps.description)).toBeInTheDocument()
  })
})