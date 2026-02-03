export default function Newsletter() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
          Join the Next Kiln Firing
        </h2>
        <p className="text-muted-foreground mb-10 font-light">
          Be the first to know about our limited drops and studio stories.
        </p>
        
        <form className="flex flex-col md:flex-row gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-1 bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-primary transition-colors rounded-none placeholder:text-muted-foreground/50 font-sans"
          />
          <button className="bg-foreground text-background px-8 py-3 uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors duration-300">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
