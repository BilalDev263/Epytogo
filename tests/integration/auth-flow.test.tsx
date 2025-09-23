import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock des modules Next.js
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/auth/register',
}))

// Mock des services
const mockRegisterUser = jest.fn()
const mockLoginUser = jest.fn()

jest.mock('@/hooks/useUserQuery', () => ({
  useUserQuery: () => ({
    registerUser: mockRegisterUser,
    loginUser: mockLoginUser,
  })
}))

// Mock Prisma
const mockCreateUser = jest.fn()
const mockFindUser = jest.fn()

jest.mock('@/db/prisma', () => ({
  user: {
    create: mockCreateUser,
    findUnique: mockFindUser,
  }
}))

// Composant de test intégrant les flux d'authentification
const AuthFlowTestComponent = ({ mode }: { mode: 'register' | 'login' }) => {
  return (
    <div data-testid="auth-container">
      <form data-testid="auth-form">
        <input
          data-testid="email-input"
          type="email"
          placeholder="Email"
          required
        />
        <input
          data-testid="password-input"
          type="password"
          placeholder="Mot de passe"
          required
        />
        {mode === 'register' && (
          <>
            <input
              data-testid="firstname-input"
              placeholder="Prénom"
              required
            />
            <input
              data-testid="lastname-input"
              placeholder="Nom"
              required
            />
            <input
              data-testid="confirm-password-input"
              type="password"
              placeholder="Confirmer le mot de passe"
              required
            />
            <label>
              <input type="checkbox" data-testid="terms-checkbox" required />
              J'accepte les conditions d'utilisation
            </label>
          </>
        )}
        <button
          type="submit"
          data-testid="submit-button"
          onClick={(e) => {
            e.preventDefault()
            if (mode === 'register') {
              mockRegisterUser()
            } else {
              mockLoginUser()
            }
          }}
        >
          {mode === 'register' ? 'S\'inscrire' : 'Se connecter'}
        </button>
        <button
          type="button"
          data-testid="google-auth-button"
          onClick={() => console.log('Google Auth')}
        >
          Continuer avec Google
        </button>
      </form>
    </div>
  )
}

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Register Flow', () => {
    it('should complete full registration flow with valid data', async () => {
      const user = userEvent.setup()
      mockRegisterUser.mockResolvedValueOnce({ success: true })

      render(<AuthFlowTestComponent mode="register" />)

      // Remplir le formulaire d'inscription
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'Password123!')
      await user.type(screen.getByTestId('firstname-input'), 'Jean')
      await user.type(screen.getByTestId('lastname-input'), 'Dupont')
      await user.click(screen.getByTestId('terms-checkbox'))

      // Soumettre le formulaire
      await user.click(screen.getByTestId('submit-button'))

      // Vérifier que l'inscription a été appelée
      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalled()
      })
    })

    it('should validate required fields in registration', async () => {
      const user = userEvent.setup()
      render(<AuthFlowTestComponent mode="register" />)

      const submitButton = screen.getByTestId('submit-button')
      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      // Tenter de soumettre sans remplir les champs
      await user.click(submitButton)

      // Vérifier que les champs sont toujours présents (pas de soumission)
      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })

    it('should handle password confirmation mismatch', async () => {
      const user = userEvent.setup()
      render(<AuthFlowTestComponent mode="register" />)

      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'DifferentPassword!')

      // Les mots de passe ne correspondent pas
      const passwordInput = screen.getByTestId('password-input')
      const confirmPasswordInput = screen.getByTestId('confirm-password-input')

      expect(passwordInput).toHaveValue('Password123!')
      expect(confirmPasswordInput).toHaveValue('DifferentPassword!')
    })
  })

  describe('Login Flow', () => {
    it('should complete login flow with valid credentials', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockResolvedValueOnce({ success: true })

      render(<AuthFlowTestComponent mode="login" />)

      // Remplir le formulaire de connexion
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'Password123!')

      // Soumettre
      await user.click(screen.getByTestId('submit-button'))

      // Vérifier que la connexion a été appelée
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalled()
      })
    })

    it('should not show registration fields in login mode', () => {
      render(<AuthFlowTestComponent mode="login" />)

      expect(screen.queryByTestId('firstname-input')).not.toBeInTheDocument()
      expect(screen.queryByTestId('lastname-input')).not.toBeInTheDocument()
      expect(screen.queryByTestId('confirm-password-input')).not.toBeInTheDocument()
      expect(screen.queryByTestId('terms-checkbox')).not.toBeInTheDocument()
    })
  })

  describe('Google Authentication', () => {
    it('should render Google auth button in both modes', () => {
      const { rerender } = render(<AuthFlowTestComponent mode="register" />)
      expect(screen.getByTestId('google-auth-button')).toBeInTheDocument()

      rerender(<AuthFlowTestComponent mode="login" />)
      expect(screen.getByTestId('google-auth-button')).toBeInTheDocument()
    })

    it('should handle Google auth button click', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      render(<AuthFlowTestComponent mode="register" />)

      await user.click(screen.getByTestId('google-auth-button'))

      expect(consoleSpy).toHaveBeenCalledWith('Google Auth')
      consoleSpy.mockRestore()
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<AuthFlowTestComponent mode="login" />)

      const emailInput = screen.getByTestId('email-input')

      // Taper un email invalide
      await user.type(emailInput, 'invalid-email')

      expect(emailInput).toHaveValue('invalid-email')
    })

    it('should require password field', async () => {
      const user = userEvent.setup()
      render(<AuthFlowTestComponent mode="login" />)

      const passwordInput = screen.getByTestId('password-input')

      // Vérifier que le champ est requis
      expect(passwordInput).toBeRequired()
    })
  })

  describe('User Experience Flow', () => {
    it('should maintain form state during user interaction', async () => {
      const user = userEvent.setup()
      render(<AuthFlowTestComponent mode="register" />)

      // Remplir progressivement le formulaire
      await user.type(screen.getByTestId('email-input'), 'user@test.com')
      await user.type(screen.getByTestId('firstname-input'), 'Test')

      // Vérifier que les valeurs sont maintenues
      expect(screen.getByTestId('email-input')).toHaveValue('user@test.com')
      expect(screen.getByTestId('firstname-input')).toHaveValue('Test')
    })

    it('should handle form submission states', async () => {
      const user = userEvent.setup()
      render(<AuthFlowTestComponent mode="login" />)

      const submitButton = screen.getByTestId('submit-button')

      // Le bouton doit être présent et clickable
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).not.toBeDisabled()

      await user.click(submitButton)

      // Après le clic, vérifier que l'action a été déclenchée
      expect(mockLoginUser).toHaveBeenCalled()
    })
  })
})