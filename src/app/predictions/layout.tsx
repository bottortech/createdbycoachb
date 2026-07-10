import SiteFooter from "@/components/SiteFooter";

export default function PredictionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body { overflow: auto !important; height: auto !important; }
      `}</style>
      {children}
      <SiteFooter />
    </>
  );
}
