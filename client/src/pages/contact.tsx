import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating API call as this is mockup mode
    // Real implementation would require backend graduation
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-20 text-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4 block"
            >
              Get in Touch
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl mb-6"
            >
              Connect with <br />
              <span className="italic font-light">The Collective</span>
            </motion.h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              <div>
                <h3 className="font-serif text-2xl mb-8">Visit our Montreal Studio</h3>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">Address</p>
                      <p className="text-muted-foreground font-light leading-relaxed">
                        1234 Heritage Way, Plateau Mont-Royal<br />
                        Montreal, QC H2X 3Y4, Canada
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="text-muted-foreground font-light">hello@turathcollective.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">Phone</p>
                      <p className="text-muted-foreground font-light">+1 (514) 555-0123</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-border/50">
                <h3 className="font-serif text-2xl mb-6">Wholesale & Press</h3>
                <p className="text-muted-foreground font-light leading-relaxed mb-6">
                  Interested in partnering with us or featuring our artisans? We'd love to hear from you.
                </p>
                <a href="mailto:partners@turathcollective.com" className="text-[10px] uppercase tracking-widest font-bold border-b border-primary/30 pb-1 hover:border-primary transition-colors">
                  partnerships@turathcollective.com →
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-10 md:p-12 border border-border/50 shadow-2xl relative"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Full Name</Label>
                  <Input required placeholder="Layla Sami" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email Address</Label>
                  <Input required type="email" placeholder="layla@example.com" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Subject</Label>
                  <Input placeholder="Inquiry about Ceramics" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Message</Label>
                  <Textarea required placeholder="How can we help you?" className="min-h-[150px] rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent resize-none" />
                </div>

                <Button 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-7 uppercase tracking-[0.2em] text-[10px] font-bold shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && <Send className="w-3.5 h-3.5 ml-2" />}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
