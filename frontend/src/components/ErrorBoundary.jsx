import { Component } from "react";

// Les error boundaries doivent etre des composants classe : React n'a pas
// d'equivalent hook pour getDerivedStateFromError / componentDidCatch.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary a intercepte une erreur :", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p className="error-boundary__title">Un probleme est survenu</p>
          <p className="error-boundary__text">
            Cette partie de la page a rencontre une erreur inattendue.
          </p>
          <button className="btn" onClick={() => window.location.reload()}>
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
