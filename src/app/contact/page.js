export const metadata = {
  title: "Contact Us | Anime Like This",
  description:
    "Get in touch with the Anime Like This team. We would love to hear from you!",
  openGraph: {
    title: "Contact Us | Anime Like This",
    description:
      "Get in touch with the Anime Like This team. We would love to hear from you!",
    url: "https://animelikethis.com/contact",
    type: "article",
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className="bg-cover bg-center mb-8 p-8"
        style={{
          backgroundImage: "url('/path-to-your-custom-anime-background.jpg')",
        }}
      >
        <h1 className="text-4xl font-bold mb-4 text-white">Contact Us</h1>
        <p className="text-lg mb-4 text-white">
          We would love to hear from you! If you have any questions,
          suggestions, or just want to chat about anime, feel free to reach out
          to us.
        </p>
      </div>
      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
      <p className="text-lg mb-4">
        You can email us at{" "}
        <a
          href="mailto:contact@animelikethis.com"
          className="text-blue-500 hover:underline"
        >
          contact@animelikethis.com
        </a>
        .
      </p>
      <h2 className="text-2xl font-bold mb-4">Social Media</h2>
      <p className="text-lg mb-4">Connect with us on social media:</p>
      <div className="flex gap-4">
        <a
          href="https://facebook.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Facebook
        </a>
        <a
          href="https://twitter.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Twitter
        </a>
        <a
          href="https://youtube.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          YouTube
        </a>
      </div>
    </div>
  );
}
