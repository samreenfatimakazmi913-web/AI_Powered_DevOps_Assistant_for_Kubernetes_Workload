// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  const sections = [
    {
      title: "Resources",
      links: [
        "Pricing",
        "Blog",
        "Guides",
        "Knowledge",
        "Comparisons",
        "Integrations",
        "Documentation",
        "Glossary",
        "OTelBin.io",
        "Sitemap",
      ],
    },
    {
      title: "Company",
      links: ["Our Team", "Careers", "Trust Center", "Security"],
    },
    {
      title: "Compare",
      links: ["Datadog", "Grafana", "Dynatrace", "New Relic", "Elastic", "Honeycomb", "Sentry"],
    },
    {
      title: "Contact",
      links: ["Contact us", "GitHub", "LinkedIn", "X", "YouTube", "Dash0 Newsletter"],
    },
  ];

  const bottomLinks = [
    "Terms and Conditions",
    "Privacy Policy",
    "Data Processing Agreement",
    "Vulnerability Disclosure",
  ];

  return (
    <footer className="bg-neutral-900 text-white mt-12">
      <div className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold uppercase text-white/70 mb-4">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link} className="text-base font-medium hover:text-blue-500 cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/20 mt-6 pt-4 pb-6 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-400 space-y-2 md:space-y-0">
        <div>©2025 Dash0 Inc.</div>
        <div className="flex flex-wrap gap-4">
          {bottomLinks.map((link) => (
            <span key={link} className="hover:text-white cursor-pointer">
              {link}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
