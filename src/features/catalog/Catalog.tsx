import { GestureGrid } from './GestureGrid'
import { ComboList } from './ComboList'
import { ComboBuilder } from './ComboBuilder'

export function Catalog() {
  return (
    <main className="catalog">
      <header className="catalog-header">
        <h1 className="app-title">Validación Facial</h1>
        <p className="app-subtitle">
          Selecciona una combinación de gestos para verificar tu identidad
        </p>
      </header>
      <GestureGrid />
      <ComboList />
      <ComboBuilder />
    </main>
  )
}
