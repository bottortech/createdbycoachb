export default function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body { overflow: auto !important; height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
