export function Carregando({ texto = 'Carregando…', detalhe }: { texto?: string; detalhe?: string }) {
  return (
    <div className="comparando" role="status">
      <div>
        <p className="grande">{texto}</p>
        {detalhe && <p className="sub">{detalhe}</p>}
      </div>
    </div>
  )
}
