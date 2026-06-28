"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui";
import { containerVariants, riseVariants, EASE_EXPO, sectionTitle, leadParagraph, kicker, formStyles, buttonStyles } from "@/lib/design";

export function ContactSection() {
  return (
    <Section id="contact-form" className="bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 px-5 sm:px-6 lg:px-10">
        
        {/* Contact Information */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col"
        >
          <motion.p variants={riseVariants} className={kicker}>
            <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
            Get in Touch
          </motion.p>
          <motion.h2 variants={riseVariants} className={`mt-6 ${sectionTitle}`}>
            We would <span className="italic text-[#74876B]">love to hear</span> from you.
          </motion.h2>
          <motion.p variants={riseVariants} className={`mt-6 ${leadParagraph}`}>
            Whether you have a question about our journeys, want to partner with us, or just want to say hello, our team is ready to listen.
          </motion.p>

          <div className="mt-12 flex flex-col gap-8">
            <motion.div variants={riseVariants}>
              <h3 className="font-display text-xl text-[#33332F] mb-2">General Inquiries</h3>
              <p className="text-[#504F4A]">hello@wayheld.com</p>
            </motion.div>
            
            <motion.div variants={riseVariants}>
              <h3 className="font-display text-xl text-[#33332F] mb-2">Press & Media</h3>
              <p className="text-[#504F4A]">press@wayheld.com</p>
            </motion.div>
            
            <motion.div variants={riseVariants}>
              <h3 className="font-display text-xl text-[#33332F] mb-2">Support</h3>
              <p className="text-[#504F4A]">Visit our Help Centre or email support@wayheld.com</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.2 }}
          className="rounded-[2.5rem] bg-[#F4EFE6] p-8 sm:p-12 shadow-[0_20px_40px_-10px_rgba(51,51,47,0.1)] border border-[#D8D2C8]"
        >
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-[#33332F] ml-1">Full Name</label>
              <input
                type="text"
                id="name"
                className={formStyles.input}
                placeholder="Jane Doe"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[#33332F] ml-1">Email Address</label>
              <input
                type="email"
                id="email"
                className={formStyles.input}
                placeholder="jane@example.com"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-medium text-[#33332F] ml-1">Subject</label>
              <select
                id="subject"
                className={`${formStyles.input} appearance-none bg-white`}
              >
                <option value="">Select a topic</option>
                <option value="journey">Planning a Journey</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="press">Press & Media</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium text-[#33332F] ml-1">Message</label>
              <textarea
                id="message"
                rows={5}
                className={`${formStyles.input} resize-none py-4`}
                placeholder="How can we help you?"
              />
            </div>
            
            <button
              type="submit"
              className={`${buttonStyles.primary} mt-2 w-full justify-center`}
            >
              Send Message
            </button>
            <p className="mt-4 text-center text-xs text-[#504F4A]">
              We aim to respond to all inquiries within 48 hours.
            </p>
          </form>
        </motion.div>

      </div>
    </Section>
  );
}
