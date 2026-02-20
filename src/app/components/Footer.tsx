import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const footerSections = {
    shop: [
      { name: 'Motorcycles', link: '#' },
      { name: 'Helmets', link: '#' },
      { name: 'Jackets', link: '#' },
      { name: 'Gloves', link: '#' },
      { name: 'Parts & Accessories', link: '#' },
    ],
    about: [
      { name: 'Our Story', link: '#' },
      { name: 'Careers', link: '#' },
      { name: 'Press', link: '#' },
      { name: 'Sustainability', link: '#' },
      { name: 'Affiliates', link: '#' },
    ],
    help: [
      { name: 'Contact Us', link: '#' },
      { name: 'Shipping Info', link: '#' },
      { name: 'Returns', link: '#' },
      { name: 'Size Guide', link: '#' },
      { name: 'FAQ', link: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, link: '#' },
    { icon: Twitter, link: '#' },
    { icon: Instagram, link: '#' },
    { icon: Youtube, link: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-bold text-xl">MotoRide</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted destination for premium motorcycles, gear, and accessories since 2011.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.link}
                    className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerSections.shop.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg mb-4">About</h3>
            <ul className="space-y-2">
              {footerSections.about.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              {footerSections.help.map((item, index) => (
                <li key={index}>
                  <a href={item.link} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center text-gray-400">
          <p>&copy; 2026 MotoRide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
