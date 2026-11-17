export function SectionBack({ onBack }: { onBack: () => void }) {
  return (
    <button className="back-button" type="button" onClick={onBack} aria-label="Voltar ao menu principal">
      <span aria-hidden="true">←</span> Voltar ao menu
    </button>
  );
}
