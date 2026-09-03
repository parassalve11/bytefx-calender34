export default function PageHero({ title, description, aside, children }) {
  return (
    <div className="border-b border-line bg-app">
      <div className="mx-auto flex max-w-shell flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-12">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-3 text-md leading-relaxed text-ink-2">{description}</p>
          ) : null}
          {children}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </div>
  );
}
