import { Component, type ReactNode } from 'react'
import { esquecerCarregamentos } from '../data'

interface Props {
  children: ReactNode
}

/** Rede do celular falha: em vez de tela branca, "Tentar de novo". */
export class Falha extends Component<Props, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="app">
        <div className="comparando">
          <div role="alert">
            <p className="grande">Não deu para carregar.</p>
            <p className="sub">Confira a internet e tente de novo. Nada do que você respondeu se perdeu.</p>
            <button
              type="button"
              className="btn btn-pri w-full"
              onClick={() => {
                esquecerCarregamentos()
                this.setState({ erro: false })
              }}
            >
              Tentar de novo
            </button>
          </div>
        </div>
      </div>
    )
  }
}
