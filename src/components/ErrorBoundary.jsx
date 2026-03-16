import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Log externo em produção (preparado para Sentry/DataDog)
    if (import.meta.env.PROD) {
      // Exemplo: Sentry.captureException(error, { extra: errorInfo });
      // Exemplo: DataDog.logger.error('Dashboard Error', { error: error.message, stack: error.stack });
      console.error('[PROD] Erro capturado - pronto para envio ao serviço de logging:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-bg gap-5">
          <div className="text-[24px] font-extrabold text-text-1">
            Supermercados <em className="not-italic text-primary">Araújo</em>
          </div>

          <div className="bg-card border border-b1 rounded-2xl p-8 max-w-[440px] w-full mx-4 text-center">
            <div className="w-[48px] h-[48px] rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 className="text-[18px] font-bold text-text-1 mb-2">Algo deu errado</h2>
            <p className="text-[13px] text-text-2 mb-5 leading-relaxed">
              Ocorreu um erro inesperado no dashboard. Tente recarregar a página.
            </p>

            {this.state.error && (
              <div className="font-mono text-[11px] text-text-3 bg-bg rounded-lg p-3 mb-5 text-left break-all">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[13px] cursor-pointer border-none hover:bg-primary-hover transition-colors duration-200"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-card border border-b2 text-text-2 rounded-xl font-bold text-[13px] cursor-pointer hover:border-b3 hover:text-text-1 transition-all duration-200"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
