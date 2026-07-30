import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col bg-canvas">{children}</div>
      <Footer />
    </>
  );
}
