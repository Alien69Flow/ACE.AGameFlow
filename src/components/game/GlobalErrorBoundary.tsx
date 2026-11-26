import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('App crashed:', error);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black px-6 text-center">
          <div className="w-16 h-16 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin mb-4" />
          <h1 className="text-xl font-bold text-[#39FF14] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            ACE FLOW
          </h1>
          <p className="text-sm text-gray-400 mb-4">
            Algo salió mal al cargar la app. Tu dispositivo puede no soportar los gráficos 3D.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 rounded-xl border border-[#39FF14]/50 bg-[#39FF14]/10 text-[#39FF14] font-bold text-sm hover:bg-[#39FF14]/20 transition-colors"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            REINTENTAR
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
