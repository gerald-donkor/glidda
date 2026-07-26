type SwatchProps = {
  token: string;
  fill: string;
  contrast?: string;
  note?: string;
};

export function Swatch({ token, fill, contrast, note }: SwatchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-20 w-full rounded-card hairline ${fill}`} />
      <p className="type-utility text-ink">{token}</p>
      {contrast ? <p className="text-small text-rail-muted">{contrast}</p> : null}
      {note ? <p className="text-small text-rail-muted">{note}</p> : null}
    </div>
  );
}
