import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center text-center">
                    <h1 className="text-3xl font-bold mb-4">Ops! Ocorreu um erro.</h1>
                    <p className="text-white mb-2">Por favor, envie a mensagem abaixo para o suporte:</p>
                    <div className="bg-gray-900 p-4 rounded text-left overflow-auto max-w-2xl w-full border border-red-900">
                        <code className="block mb-2 font-mono text-sm">{this.state.error && this.state.error.toString()}</code>
                        <details className="whitespace-pre-wrap text-xs text-gray-500">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
