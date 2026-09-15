import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "turath-collective";

export function FAQ() {
  return (
    <div className="w-[420px] max-w-full">
      <Accordion type="single" collapsible defaultValue="care">
        <AccordionItem value="care">
          <AccordionTrigger>How do I care for my ceramics?</AccordionTrigger>
          <AccordionContent>
            Our pieces are dishwasher safe, but we recommend hand washing to
            preserve the glaze and keep each piece beautiful for generations.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger>Where do you ship from?</AccordionTrigger>
          <AccordionContent>
            Every order ships from our studio in Montreal, carefully wrapped by
            hand within 2–3 business days.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="materials">
          <AccordionTrigger>What clay do you use?</AccordionTrigger>
          <AccordionContent>
            We work exclusively with locally sourced Hebron clay, fired in small
            batches to honour traditional technique.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
