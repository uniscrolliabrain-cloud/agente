interface Chip {
  id: string;
  label: string;
  prompt: string;
}

interface Props {
  chips: Chip[];
  onSelect: (prompt: string) => void;
}

export default function SuggestionChips({ chips, onSelect }: Props) {
  return (
    <div className="chips">
      {chips.map((chip) => (
        <button
          key={chip.id}
          className="chip"
          type="button"
          onClick={() => onSelect(chip.prompt)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
