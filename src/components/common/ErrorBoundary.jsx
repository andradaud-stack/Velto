import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Velto ErrorBoundary Caught]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      this.setState({ hasError: false, error: null, errorInfo: null });
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F0F4FC] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-soft-card border border-slate-100 flex flex-col items-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mb-4 shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-xl font-extrabold text-[#1E1B2E] tracking-tight">
              Tampilan Sedang Dipulihkan
            </h2>
            <p className="text-xs text-[#7E7A9B] mt-2 leading-relaxed max-w-xs">
              Terjadi kendala saat merender komponen ini. Data keuangan Anda di database tetap aman dan tidak terpengaruh.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-6">
              <button
                type="button"
                onClick={this.handleResetState}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#F4F2FA] hover:bg-[#EAE4F7] text-[#1E1B2E] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Muat Ulang</span>
              </button>
            </div>

            {/* Collapsible Debug Info for Diagnostics */}
            {this.state.error && (
              <div className="mt-4 w-full text-left">
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[10px] font-bold text-[#7E7A9B] hover:text-[#1E1B2E] underline block mx-auto cursor-pointer"
                >
                  {this.state.showDetails ? 'Sembunyikan Detail Teknis' : 'Lihat Detail Teknis'}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 overflow-x-auto max-h-36 font-mono whitespace-pre-wrap">
                    {this.state.error?.toString()}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
