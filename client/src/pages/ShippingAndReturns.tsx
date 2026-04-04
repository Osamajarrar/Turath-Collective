import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const},
  }),
};

export default function ShippingAndReturns() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            className="font-serif text-5xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Shipping & Returns
          </motion.h1>

          <motion.p
            className="text-sm text-muted-foreground mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Last updated: April 2025
          </motion.p>

          <div className="space-y-12 text-muted-foreground font-light leading-relaxed">
            {/* Shipping */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mb-4">
                Shipping
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Where We Ship
                  </p>
                  <p>
                    Turath Collective currently ships within Canada only, to all
                    provinces and territories including remote areas. We are
                    working toward international shipping and will announce
                    availability when it is ready.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Processing Time
                  </p>
                  <p>
                    Orders are processed within 2–4 business days of payment
                    confirmation. During high-volume periods or around holidays,
                    processing may take slightly longer — we will communicate
                    any delays promptly. Processing time is separate from
                    shipping time.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-2">
                    Delivery Estimates
                  </p>
                  <div className="border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-3 font-medium text-foreground">
                            Service
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-foreground">
                            Estimated Delivery
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-4 py-3">Standard Shipping</td>
                          <td className="px-4 py-3">
                            5–10 business days from shipment
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Expedited Shipping</td>
                          <td className="px-4 py-3">
                            2–4 business days from shipment
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-sm">
                    Delivery estimates begin from the date of shipment
                    confirmation, not the order date. Remote areas (Nunavut,
                    Northwest Territories, Yukon, and some rural regions) may
                    experience longer delivery windows.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Shipping Rates
                  </p>
                  <p>
                    Shipping rates are calculated at checkout based on your
                    location, package weight, and selected service. Where a flat
                    rate applies, it will be clearly displayed at checkout
                    before payment.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Order Tracking
                  </p>
                  <p>
                    Once your order ships, you will receive a confirmation email
                    with a tracking number. Please allow up to 24 hours for
                    tracking information to become active.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Delays & Exceptions
                  </p>
                  <p>
                    Turath Collective is not responsible for delays caused by
                    carriers, severe weather, or circumstances beyond our
                    control. If your order appears significantly delayed, please
                    contact us at{" "}
                    <a
                      href="mailto:support@turathcollective.com"
                      className="text-foreground underline underline-offset-2"
                    >
                      support@turathcollective.com
                    </a>{" "}
                    and we will investigate on your behalf.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="border-t border-border" />

            {/* Returns */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="font-serif text-2xl text-foreground mb-4">
                Returns & Refunds
              </h2>

              <div className="space-y-6">
                <p>
                  We want you to love what you receive. If something is not
                  right, we are here to make it right.
                </p>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Return Window
                  </p>
                  <p>
                    You may request a return within{" "}
                    <span className="text-foreground">
                      14 days of the delivery date
                    </span>{" "}
                    as confirmed by your tracking information.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Eligibility Conditions
                  </p>
                  <p className="mb-2">
                    To be eligible for a return, items must be:
                  </p>
                  <ul className="space-y-1 pl-4">
                    <li className="before:content-['—'] before:mr-2 before:text-[#C9A96E]">
                      Unused and in their original condition
                    </li>
                    <li className="before:content-['—'] before:mr-2 before:text-[#C9A96E]">
                      In original packaging, with all tags and materials
                      included
                    </li>
                    <li className="before:content-['—'] before:mr-2 before:text-[#C9A96E]">
                      Free from damage caused after delivery
                    </li>
                  </ul>
                  <p className="mt-2">
                    Items that show signs of use, alteration, or damage incurred
                    after delivery are not eligible for return.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">Sale Items</p>
                  <p>
                    All items purchased at a discounted or sale price are{" "}
                    <span className="text-foreground">final sale</span> and are
                    not eligible for return or exchange, unless the item arrived
                    damaged or defective.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    How to Initiate a Return
                  </p>
                  <p className="mb-2">
                    Email us at{" "}
                    <a
                      href="mailto:support@turathcollective.com"
                      className="text-foreground underline underline-offset-2"
                    >
                      support@turathcollective.com
                    </a>{" "}
                    within your 14-day window with:
                  </p>
                  <ul className="space-y-1 pl-4">
                    <li className="before:content-['—'] before:mr-2 before:text-[#C9A96E]">
                      Your order number
                    </li>
                    <li className="before:content-['—'] before:mr-2 before:text-[#C9A96E]">
                      The item(s) you wish to return
                    </li>
                    <li className="before:content-['—'] before:mr-2 before:text-[#C9A96E]">
                      A brief reason for the return
                    </li>
                  </ul>
                  <p className="mt-2">
                    We will respond within 2 business days with return
                    instructions and a prepaid return shipping label. Return
                    shipping is covered by Turath Collective.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">
                    Refund Processing
                  </p>
                  <p>
                    Refunds are issued once the returned item has been received
                    and inspected by our team. Inspection typically takes 2–3
                    business days upon receipt. If the item passes inspection,
                    your refund will be issued to your original payment method
                    within 5–7 business days. You will receive an email
                    confirmation once processed.
                  </p>
                  <p className="mt-2">
                    If the item does not meet return eligibility conditions upon
                    inspection, we will notify you and return the item to you at
                    no additional cost.
                  </p>
                </div>

                <div className="border-l-2 border-[#C9A96E] pl-6">
                  <p className="font-medium text-foreground mb-1">
                    Damaged or Defective Items
                  </p>
                  <p>
                    If your order arrives damaged — whether from transit or a
                    product defect — please contact us at{" "}
                    <a
                      href="mailto:support@turathcollective.com"
                      className="text-foreground underline underline-offset-2"
                    >
                      support@turathcollective.com
                    </a>{" "}
                    within{" "}
                    <span className="text-foreground">
                      48 hours of delivery
                    </span>{" "}
                    with your order number and clear photographs of the damage
                    and packaging. We will arrange a replacement or full refund
                    at no cost to you. Do not discard the packaging before
                    contacting us, as it may be required for a carrier claim.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">Exchanges</p>
                  <p>
                    We do not offer direct exchanges at this time. If you would
                    like a different item, please return your original order and
                    place a new one.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </PageLayout>
  );
}