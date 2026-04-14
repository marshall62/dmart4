import ContactForm from "@/components/ContactForm";

function about() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">David Marshall</h1>
      <p className="text-lg mb-8">Much of the work on this site is available.  You can copy a link to a work and send me a message about it.  Thanks for looking!</p>

      <ContactForm />
    </div>
  );
}
export default about;
