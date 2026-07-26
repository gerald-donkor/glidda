// A wash is only ever seen with --ink text on it, so the swatch shows exactly that.
export function WashSwatch({ token, fill }: { token: string; fill: string }) {
  return (
    <div className={`flex flex-col gap-2 rounded-panel p-6 ${fill}`}>
      <p className="type-utility text-ink">{token}</p>
      <p className="text-small text-ink">Ink on the wash, at 4.5:1 or better.</p>
    </div>
  );
}
