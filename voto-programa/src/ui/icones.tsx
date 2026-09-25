export function SetaEsquerda() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/** Símbolo da marca Combina?: o seu balão (petróleo) e o da proposta (goiaba). */
export function Simbolo({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" width={tamanho} height={tamanho}>
      <circle cx="25" cy="30" r="19" fill="#0F6E8C" />
      <path fill="#0F6E8C" d="M12 42 7 57l17-9z" />
      <circle cx="39" cy="30" r="19" fill="#F07AA0" />
      <path fill="#F07AA0" d="M52 42l5 15-17-9z" />
      <path fill="#16213A" d="M32 12.34A19 19 0 0 1 32 47.66A19 19 0 0 1 32 12.34z" />
    </svg>
  )
}

export function Marca() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-extrabold">
      <Simbolo />
      <span>
        Combina<span className="text-destaque-texto">?</span>
      </span>
    </span>
  )
}
