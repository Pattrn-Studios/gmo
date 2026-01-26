'use client'

import { motion } from 'framer-motion'

interface FooterProps {
  reportTitle?: string
}

export function Footer({ reportTitle }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* Main Footer */}
      <footer className="bg-bg-secondary py-16 mt-20 border-t border-line-default">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Report Info / Disclaimer */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {reportTitle || 'Financial Report'}
              </h3>
              <p className="text-sm text-text-secondary">
                This report is provided for informational purposes only and does not constitute investment advice.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Contact
              </h4>
              <p className="text-sm text-text-secondary">
                For more information about this report, please contact your relationship manager.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Dark Footer Bar */}
      <div className="bg-[#1A1A1A] py-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">BNP PARIBAS</span>
            <span className="text-white/60 text-sm">The bank for a changing world</span>
          </div>
          <p className="text-white/40 text-sm">
            © {currentYear} BNP Paribas. All rights reserved.
          </p>
        </div>
      </div>
    </>
  )
}
