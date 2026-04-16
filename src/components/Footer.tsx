import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-3">
            <span className="text-orange-500">TAB</span> Developments
          </h3>
          <p className="text-sm leading-relaxed">
            Building the future across the globe. Premium real estate
            developments in Egypt, UAE, and the UK.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-orange-500 transition">Home</Link>
            <Link to="/projects" className="hover:text-orange-500 transition">Projects</Link>
            <Link to="/about" className="hover:text-orange-500 transition">About Us</Link>
            <Link to="/contact" className="hover:text-orange-500 transition">Contact</Link>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <div className="flex flex-col gap-2 text-sm">
            <p>info@tabdevelopments.com</p>
            <p>+20 123 456 7890</p>
            <p>Cairo, Egypt</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        &copy; 2026 TAB Developments. All rights reserved.
      </div>
    </footer>
  );
}
