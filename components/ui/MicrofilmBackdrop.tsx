/**
 * Film grain and a highlight band drifting down the page, as if the reel were
 * advancing past a scanner head. Pure CSS, so it costs no JavaScript and the
 * whole thing is decorative.
 */
export default function MicrofilmBackdrop({
  className,
}: {
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={"relative " + (className ?? "")}>
      <div className="microfilm-lines absolute inset-0" />
      <div className="microfilm-sweep absolute inset-x-0 h-[55%]" />
    </div>
  );
}
