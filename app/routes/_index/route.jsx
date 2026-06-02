import { redirect, Form, useLoaderData, Link } from "react-router";
import { login } from "../../shopify.server";
import { LayoutTemplate, Zap, Smartphone, Sparkles } from "lucide-react";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-hero-glow pointer-events-none opacity-60"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary-light" />
          </div>
          PremiumHero
        </div>
        <div>
          <a href="#login" className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 font-medium text-sm">
            Log in
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 pt-20 pb-32 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>The #1 Hero Builder for Shopify</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
          Create Premium Shopify Hero Sections
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Design stunning animated hero sections for your Shopify store in minutes. Boost conversions with professional, responsive layouts.
        </p>

        {showForm && (
          <div id="login" className="w-full max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Form className="relative glass-card rounded-2xl p-6 flex flex-col gap-4 text-left" method="post" action="/auth/login" target="_top">
              <div>
                <label htmlFor="shop-domain" className="block text-sm font-medium text-gray-300 mb-2">Shop domain</label>
                <div className="relative">
                  <input 
                    id="shop-domain"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all" 
                    type="text" 
                    name="shop" 
                    placeholder="my-shop-domain.myshopify.com"
                    required
                  />
                </div>
              </div>
              <button 
                className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2" 
                type="submit"
              >
                Log in to Dashboard
              </button>
            </Form>
          </div>
        )}
      </main>

      {/* Feature Cards */}
      <section className="relative z-10 py-24 bg-black/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-400">Built for modern Shopify stores.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <LayoutTemplate className="w-6 h-6 text-primary-light" />
              </div>
              <h3 className="text-xl font-bold mb-3">Drag &amp; Drop Builder</h3>
              <p className="text-gray-400 leading-relaxed">
                Create beautiful layouts effortlessly without writing a single line of code. Visually build exactly what you imagine.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Shopify Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Instantly syncs with your Shopify store themes. No complex setup or manual theme editing required.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Mobile Responsive</h3>
              <p className="text-gray-400 leading-relaxed">
                Designs that look perfect on every device. Ensure your customers have a flawless experience anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-gray-500 text-sm bg-black flex flex-col sm:flex-row items-center justify-center gap-4">
        <p>&copy; {new Date().getFullYear()} PremiumHero. Built for Shopify.</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-white transition duration-300">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
