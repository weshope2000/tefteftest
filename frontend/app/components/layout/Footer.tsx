export default function Footer() {
  return (
    <footer className="bg-black text-white px-8 py-16">
      <div className="grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <h4 className="font-semibold mb-4">For Clients</h4>
          <ul className="space-y-2">
            <li>How to hire</li>
            <li>Enterprise</li>
            <li>Business Plus</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">For Talent</h4>
          <ul className="space-y-2">
            <li>Find work</li>
            <li>Freelancer Plus</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li>About us</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>Terms</li>
            <li>Privacy</li>
            <li>Accessibility</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-400 text-xs">
        © 2026 Teftef. All rights reserved. Developed by Minaa
      </div>
    </footer>
  );
}