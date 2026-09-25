/**
 * Carrega o mapa de ilustrações sob demanda (chunk próprio, fora do JS inicial). O Quiz chama
 * `carregarIlustracoes()` ao abrir a eleição; a cena usa `useIlustracoes()` e, enquanto o
 * módulo não chega (ou se falhar), simplesmente não mostra desenho: o espaço é o mesmo.
 */
import { useEffect, useState } from 'react'

type Mapa = typeof import('./index')

let modulo: Mapa | null = null
let promessa: Promise<Mapa> | null = null

export function carregarIlustracoes(): Promise<Mapa> {
  promessa ??= import('./index').then(
    (m) => (modulo = m),
    (e: unknown) => {
      promessa = null
      throw e
    },
  )
  return promessa
}

export function useIlustracoes(): Mapa | null {
  const [m, setM] = useState(modulo)
  useEffect(() => {
    if (m) return
    let vivo = true
    carregarIlustracoes().then(
      (x) => vivo && setM(x),
      () => {},
    )
    return () => {
      vivo = false
    }
  }, [m])
  return m
}
